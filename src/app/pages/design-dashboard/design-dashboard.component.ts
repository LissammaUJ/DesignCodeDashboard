import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  finalize,
  forkJoin,
  map,
  merge,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem, MessageService } from 'primeng/api';
import { CompanyOption } from '../../models/auth.models';
import { PAGE_SIZE_OPTIONS } from '../../core/constants/design.constants';
import {
  DashboardKpiSummary,
  DesignFilter,
  DesignListItem,
  SelectOption,
  SortField,
  SortOrder,
} from '../../core/models/design.models';
import {
  CustomerDto,
  CustomerSalesDto,
  DashboardSummaryDto,
  DesignFilterRequest,
} from '../../models/api.models';
import { AdvancedFilterComponent } from '../../components/advanced-filter/advanced-filter.component';
import { DesignCardComponent } from '../../components/design-card/design-card.component';
import { DesignDetailDialogComponent } from '../../components/design-detail-dialog/design-detail-dialog.component';
import { KpiSummaryComponent } from '../../components/kpi-summary/kpi-summary.component';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { CustomerApiService } from '../../services/customer-api.service';
import { CustomerSalesApiService } from '../../services/customer-sales-api.service';
import { DashboardApiService } from '../../services/dashboard-api.service';
import {
  mapCustomerSalesToListItem,
  mapCustomersToOptions,
  mapDashboardSummary,
  paginateDesignListItems,
  sortDesignListItems,
} from '../../shared/design-api.mapper';
import { resolveAccountId, resolveFilterDate } from '../../shared/api.utils';

function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value as Date | null;
    const endCtrl = group.get('endDate');
    const end = endCtrl?.value as Date | null;

    if (!endCtrl) return null;

    if (start && end && end < start) {
      endCtrl.setErrors({ ...(endCtrl.errors ?? {}), dateRange: true });
      return { dateRange: true };
    }

    if (endCtrl.hasError('dateRange')) {
      const { dateRange: _, ...rest } = endCtrl.errors ?? {};
      endCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}

@Component({
  selector: 'app-design-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    MenuModule,
    SelectModule,
    PaginatorModule,
    ProgressSpinnerModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    DynamicDialogModule,
    KpiSummaryComponent,
    AdvancedFilterComponent,
    DesignCardComponent,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './design-dashboard.component.html',
  styleUrl: './design-dashboard.component.scss',
})
export class DesignDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly customerSalesApi = inject(CustomerSalesApiService);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly scrollSentinel = viewChild<ElementRef>('scrollSentinel');

  readonly filterForm: FormGroup = this.fb.group(
    {
      customerAccountId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    },
    { validators: dateRangeValidator() }
  );

  /** Customer options from GET /api/customer. Starts empty until HTTP succeeds. */
  readonly filterOptions = signal<Record<string, SelectOption[]>>({
    customers: [],
  });

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS.map((v) => ({ label: String(v), value: v }));

  readonly kpiSummary = signal<DashboardKpiSummary | null>(null);
  /** Set when GET /api/dashboard/summary fails (keeps KPI section visible). */
  readonly kpiError = signal<string | null>(null);
  readonly designs = signal<DesignListItem[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  /** True after user clicks Search at least once. */
  readonly hasSearched = signal(false);
  /** Last designs API error message (null when OK). */
  readonly designsError = signal<string | null>(null);
  /** True until GET /api/customer completes (success or error). */
  readonly customersLoading = signal(true);
  readonly kpiLoading = signal(false);
  readonly loadingMore = signal(false);
  readonly filterCollapsed = signal(false);
  readonly currentDateTime = signal(this.formatDateTime(new Date()));

  readonly currentPage = signal(1);
  readonly pageSize = signal(12);
  readonly sortBy = signal<SortField>('createdDate');
  readonly sortOrder = signal<SortOrder>('desc');

  readonly sortByOptions = [
    { label: 'Design Code', value: 'designCode' },
    { label: 'Created Date', value: 'createdDate' },
    { label: 'Category', value: 'category' },
    { label: 'Sales Quantity', value: 'salesQuantity' },
  ];

  readonly sortOrderOptions = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];

  /** Full result set from last successful GET /api/customer-sales (client-side page/sort). */
  private allDesigns: DesignListItem[] = [];

  private observer: IntersectionObserver | null = null;
  private clockTimer: ReturnType<typeof setInterval> | null = null;

  /** Triggers — switchMap cancels the previous in-flight HTTP call. */
  private readonly customersTrigger$ = new Subject<void>();
  private readonly kpisTrigger$ = new Subject<DesignFilterRequest>();
  private readonly designsTrigger$ = new Subject<DesignFilterRequest>();
  private readonly companiesTrigger$ = new Subject<void>();
  private readonly companyChangeRequest$ = new Subject<{
    companyId: number;
    companyName: string;
  }>();
  /** Completes in-flight customer/KPI/design HTTP when company changes. */
  private readonly cancelLoads$ = new Subject<void>();

  private readonly customerAccountIdValue = toSignal(
    this.filterForm.get('customerAccountId')!.valueChanges.pipe(
      startWith(this.filterForm.get('customerAccountId')!.value)
    ),
    { initialValue: null as unknown }
  );

  /** Selected customer label shown in the page hero. */
  readonly selectedCustomerName = computed(() => {
    const selected = this.customerAccountIdValue();
    const id = resolveAccountId(selected);
    if (id == null) return '';
    const match = (this.filterOptions()['customers'] ?? []).find(
      (o) => String(o.value) === String(id) || String(o.value) === String(selected)
    );
    return match?.label?.trim() || '';
  });

  readonly authUsername = computed(() => {
    this.auth.sessionVersion();
    const emp = this.auth.getEmployee();
    return emp?.emplName?.trim() || this.auth.getUsername()?.trim() || 'User';
  });

  readonly authCompanyName = computed(() => {
    this.auth.sessionVersion();
    return this.auth.getCompanyName()?.trim() || '';
  });

  readonly profileEmployee = computed(() => {
    this.auth.sessionVersion();
    return this.auth.getEmployee();
  });

  readonly profileVisible = signal(false);
  readonly changeCompanyVisible = signal(false);
  readonly changeCompanyLoading = signal(false);
  readonly companiesLoading = signal(false);
  readonly companies = signal<CompanyOption[]>([]);
  readonly selectedChangeCompanyId = signal<number | null>(null);

  userMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.userMenuItems = [
      {
        label: 'Account',
        items: [
          {
            label: 'My Profile',
            icon: 'pi pi-user',
            command: () => this.openProfile(),
          },
          {
            label: 'Change Company',
            icon: 'pi pi-building',
            command: () => this.openChangeCompany(),
          },
          { separator: true },
          {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => this.onLogout(),
          },
        ],
      },
    ];

    // Default date range so the customer dropdown can load after dates exist.
    this.filterForm.patchValue(
      {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
      },
      { emitEvent: false }
    );

    this.setupCancellableDataPipelines();
    // Do not call /api/customer without dates — loadCustomers() guards and sends params.
    this.loadCustomers();
    this.setupCustomerReloadOnDateChange();
    this.setupInfiniteScroll();
    this.startClock();
  }

  onSearch(): void {
    try {
      if (this.filterForm.invalid) {
        this.filterForm.markAllAsTouched();
        this.messageService.add({
          severity: 'warn',
          summary: 'Filters required',
          detail: 'Select customer, start date, and end date before searching.',
        });
        return;
      }

      const request = this.buildApiFilter();
      if (!request) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid filter',
          detail: 'Select a customer and a valid date range before searching.',
        });
        return;
      }

      this.currentPage.set(1);
      this.designs.set([]);
      this.hasSearched.set(true);
      this.designsError.set(null);
      // KPIs + product cards only — never call /api/dashboard/charts (removed).
      this.fetchKpis(request);
      this.fetchDesigns(request);
    } catch (err) {
      console.error('[onSearch]', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Search failed',
        detail: err instanceof Error ? err.message : 'Unexpected search error.',
      });
    }
  }

  onRefresh(): void {
    try {
      if (this.filterForm.invalid) {
        this.filterForm.markAllAsTouched();
        this.messageService.add({
          severity: 'warn',
          summary: 'Filters required',
          detail: 'Select customer and date range before refreshing.',
        });
        return;
      }

      const request = this.buildApiFilter();
      if (!request) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Filters required',
          detail: 'Select customer and date range, then Search.',
        });
        return;
      }

      this.currentPage.set(1);
      this.designs.set([]);
      this.hasSearched.set(true);
      this.designsError.set(null);
      this.currentDateTime.set(this.formatDateTime(new Date()));
      // KPIs + product cards only — never call /api/dashboard/charts (removed).
      this.fetchKpis(request);
      this.fetchDesigns(request);
      this.messageService.add({
        severity: 'info',
        summary: 'Refreshed',
        detail: 'Dashboard data updated.',
      });
    } catch (err) {
      console.error('[onRefresh]', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Refresh failed',
        detail: err instanceof Error ? err.message : 'Unexpected refresh error.',
      });
    }
  }

  onReset(): void {
    this.filterForm.reset(
      {
        customerAccountId: null,
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
      },
      { emitEvent: false }
    );
    this.currentPage.set(1);
    this.allDesigns = [];
    this.designs.set([]);
    this.totalRecords.set(0);
    this.hasSearched.set(false);
    this.designsError.set(null);
    this.kpiSummary.set(null);
    this.kpiError.set(null);
    this.loadCustomers();
    this.messageService.add({ severity: 'secondary', summary: 'Reset', detail: 'Filters cleared.' });
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage.set((event.page ?? 0) + 1);
    this.pageSize.set(event.rows ?? 12);
    this.applyPage(false);
  }

  /** Client-side sort only — do not clear cards or re-call /api/customer-sales. */
  onSortByChange(value: SortField): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
    this.applyPage(false);
  }

  onSortOrderChange(value: SortOrder): void {
    this.sortOrder.set(value);
    this.currentPage.set(1);
    this.applyPage(false);
  }

  onCardClick(design: DesignListItem): void {
    this.dialogService.open(DesignDetailDialogComponent, {
      header: ' ',
      width: '95vw',
      height: '90vh',
      modal: true,
      closable: false,
      maximizable: true,
      styleClass: 'design-detail-dialog-wrapper',
      data: {
        // API detail/production expect ProductId (Usp_DesignDashboard_New product Actions).
        designID: design.productId,
        filter: this.buildFilter(),
      },
    });
  }

  onCardAction(event: { action: string; design: DesignListItem }): void {
    if (event.action === 'View Details') {
      this.onCardClick(event.design);
    }
  }

  toggleFilterCollapse(): void {
    this.filterCollapsed.update((v) => !v);
  }

  openProfile(): void {
    this.profileVisible.set(true);
  }

  openChangeCompany(): void {
    this.selectedChangeCompanyId.set(this.auth.getCompanyId());
    this.changeCompanyVisible.set(true);
    this.companiesTrigger$.next();
  }

  confirmChangeCompany(): void {
    const companyId = this.selectedChangeCompanyId();
    if (!companyId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Company',
        detail: 'Select a company to continue.',
      });
      return;
    }

    if (companyId === this.auth.getCompanyId()) {
      this.changeCompanyVisible.set(false);
      return;
    }

    const company = this.companies().find((c) => c.coId === companyId);
    this.companyChangeRequest$.next({
      companyId,
      companyName: company?.coName ?? '',
    });
  }

  onLogout(): void {
    this.auth.logout(true);
  }

  /** Reload customer dropdown whenever Start/End dates change. */
  private setupCustomerReloadOnDateChange(): void {
    const startCtrl = this.filterForm.get('startDate');
    const endCtrl = this.filterForm.get('endDate');
    if (!startCtrl || !endCtrl) return;

    merge(startCtrl.valueChanges, endCtrl.valueChanges)
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadCustomers());
  }

  /**
   * Single-flight pipelines: each new trigger cancels the previous HTTP call (switchMap).
   * Company change clears state, reloads customers, then KPIs/designs when a filter exists.
   */
  private setupCancellableDataPipelines(): void {
    this.customersTrigger$
      .pipe(
        tap(() => this.customersLoading.set(true)),
        switchMap(() =>
          this.customersRequest$().pipe(
            takeUntil(this.cancelLoads$),
            catchError((err) => {
              this.filterOptions.set({ customers: [] });
              this.messageService.add({
                severity: 'error',
                summary: 'Customers',
                detail: err?.message ?? 'Failed to load customers from API.',
              });
              return of([] as CustomerDto[]);
            }),
            finalize(() => this.customersLoading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((customers) => this.applyCustomersResult(customers, { warnIfEmpty: true }));

    this.kpisTrigger$
      .pipe(
        tap(() => {
          this.kpiLoading.set(true);
          this.kpiError.set(null);
          // Clear previous filter's KPIs so Search never shows stale TotalProducts.
          this.kpiSummary.set(null);
        }),
        switchMap((filter) =>
          this.dashboardApi.getSummary(filter).pipe(
            takeUntil(this.cancelLoads$),
            catchError((err) => {
              const message =
                err?.message ?? 'Failed to load dashboard summary.';
              console.error('[KPI summary] GET /api/dashboard/summary failed', {
                status: err?.status,
                message,
                details: err?.details,
                filter,
              });
              this.kpiError.set(message);
              // Do not leave metrics as a silent empty array — clear summary and surface error.
              this.kpiSummary.set(null);
              this.messageService.add({
                severity: 'error',
                summary: 'KPI summary',
                detail: message,
              });
              return of(null);
            }),
            finalize(() => this.kpiLoading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((dto) => {
        if (!dto) {
          return;
        }
        // Replace signal value (OnPush) — never mutate a previous metrics array in place.
        this.kpiError.set(null);
        this.kpiSummary.set(mapDashboardSummary(dto));
      });

    this.designsTrigger$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.designsError.set(null);
        }),
        switchMap((filter) =>
          this.customerSalesApi.getCustomerSales(filter).pipe(
            takeUntil(this.cancelLoads$),
            map((dtos) => ({ filter, dtos: Array.isArray(dtos) ? dtos : [] })),
            catchError((err) => {
              const msg =
                err?.status === 0
                  ? `Cannot reach API at ${environment.apiUrl}. Start DesignDashboard.Api then Search again.`
                  : (err?.message ?? 'Failed to load designs from API.');
              this.designsError.set(msg);
              this.allDesigns = [];
              this.designs.set([]);
              this.totalRecords.set(0);
              this.messageService.add({
                severity: 'error',
                summary: 'Designs',
                detail: msg,
              });
              return of({ filter, dtos: [] as CustomerSalesDto[] });
            }),
            finalize(() => this.loading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ filter, dtos }) => this.applyDesignsResult(filter, dtos));

    this.companiesTrigger$
      .pipe(
        tap(() => this.companiesLoading.set(true)),
        switchMap(() =>
          this.auth.getCompanies().pipe(
            catchError((err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Companies',
                detail: err?.message ?? 'Unable to load companies.',
              });
              return of([] as CompanyOption[]);
            }),
            finalize(() => this.companiesLoading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((list) => this.companies.set(Array.isArray(list) ? list : []));

    this.companyChangeRequest$
      .pipe(
        tap(() => this.changeCompanyLoading.set(true)),
        switchMap(({ companyId, companyName }) =>
          this.auth.changeCompany({ companyId, companyName }).pipe(
            switchMap((res) => {
              // Drop in-flight Search/customer calls so they cannot repaint old company data.
              this.cancelLoads$.next();
              this.clearDashboardStateForCompanyChange();
              this.resetFiltersForCompanyChange();
              return this.reloadDashboardData$().pipe(map(() => res));
            }),
            catchError((err) => {
              const detail =
                err?.status === 403
                  ? 'You do not have permission to access this company.'
                  : (err?.message ?? 'Unable to change company.');
              this.messageService.add({
                severity: 'error',
                summary: 'Change company',
                detail,
              });
              return EMPTY;
            }),
            finalize(() => this.changeCompanyLoading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.changeCompanyVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Company changed',
          detail:
            res.message ||
            `Switched to ${res.company?.coName ?? 'selected company'}. Select a customer and Search.`,
          life: 3000,
        });
      });
  }

  private loadCustomers(): void {
    this.customersTrigger$.next();
  }

  private fetchKpis(filter: DesignFilterRequest): void {
    this.kpisTrigger$.next(filter);
  }

  private fetchDesigns(filter: DesignFilterRequest): void {
    this.designsTrigger$.next(filter);
  }

  /** Clears customers, selection, KPIs, designs, pagination, and search flags. */
  private clearDashboardStateForCompanyChange(): void {
    this.filterOptions.set({ customers: [] });
    this.kpiSummary.set(null);
    this.kpiError.set(null);
    this.allDesigns = [];
    this.designs.set([]);
    this.totalRecords.set(0);
    this.currentPage.set(1);
    this.pageSize.set(12);
    this.hasSearched.set(false);
    this.designsError.set(null);
    this.kpiLoading.set(false);
    this.loading.set(false);
    this.loadingMore.set(false);
    this.customersLoading.set(true);
  }

  /** Reset filter form (customer + dates) without emitting date-change reloads mid-switch. */
  private resetFiltersForCompanyChange(): void {
    this.filterForm.reset(
      {
        customerAccountId: null,
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
      },
      { emitEvent: false }
    );
  }

  /**
   * After company JWT update: reload customers, then KPIs + designs if a customer filter exists.
   * (Selection is cleared on company change, so KPIs/designs stay empty until the user Searches.)
   */
  private reloadDashboardData$() {
    return this.customersRequest$().pipe(
      tap((customers) => this.applyCustomersResult(customers, { warnIfEmpty: true })),
      tap(() => this.customersLoading.set(false)),
      switchMap(() => {
        const request = this.buildApiFilter();
        if (!request) {
          return of(void 0);
        }

        this.hasSearched.set(true);
        this.kpiLoading.set(true);
        this.kpiError.set(null);
        this.kpiSummary.set(null);
        this.loading.set(true);

        return forkJoin({
          summary: this.dashboardApi.getSummary(request).pipe(
            catchError((err) => {
              const message =
                err?.message ?? 'Failed to load dashboard summary.';
              console.error('[KPI summary] GET /api/dashboard/summary failed', {
                status: err?.status,
                message,
                details: err?.details,
                request,
              });
              this.kpiError.set(message);
              this.messageService.add({
                severity: 'error',
                summary: 'KPI summary',
                detail: message,
              });
              return of(null as DashboardSummaryDto | null);
            })
          ),
          designs: this.customerSalesApi.getCustomerSales(request).pipe(
            catchError((err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Designs',
                detail: err?.message ?? 'Failed to load designs from API.',
              });
              return of([] as CustomerSalesDto[]);
            })
          ),
        }).pipe(
          tap(({ summary, designs }) => {
            if (summary) {
              this.kpiError.set(null);
              this.kpiSummary.set(mapDashboardSummary(summary));
            } else {
              // Keep section visible via kpiError; do not leave a silent empty metrics grid.
              this.kpiSummary.set(null);
            }
            this.applyDesignsResult(request, designs);
          }),
          finalize(() => {
            this.kpiLoading.set(false);
            this.loading.set(false);
          }),
          map(() => void 0)
        );
      })
    );
  }

  private customersRequest$() {
    const startDate = resolveFilterDate(this.filterForm.value.startDate);
    const endDate = resolveFilterDate(this.filterForm.value.endDate);

    // Never call GET /api/customer without query params.
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      this.filterOptions.set({ customers: [] });
      return of([] as CustomerDto[]);
    }

    return this.customerApi.getCustomers(startDate, endDate);
  }

  private applyCustomersResult(
    customers: CustomerDto[],
    options?: { warnIfEmpty?: boolean }
  ): void {
    const list = customers ?? [];
    const mapped = mapCustomersToOptions(list);
    this.filterOptions.set({ customers: mapped });

    const selected = this.filterForm.value.customerAccountId;
    if (
      selected != null &&
      !mapped.some((o) => o.value === String(selected) || o.value === selected)
    ) {
      this.filterForm.patchValue({ customerAccountId: null }, { emitEvent: false });
    }

    if (options?.warnIfEmpty && !list.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Customers',
        detail: 'No customers with bills in the selected date range.',
      });
    }
  }

  private applyDesignsResult(filter: DesignFilterRequest, dtos: CustomerSalesDto[]): void {
    const list = Array.isArray(dtos) ? dtos : [];

    this.designsError.set(null);
    this.allDesigns = list.map((dto) => mapCustomerSalesToListItem(dto));

    this.totalRecords.set(this.allDesigns.length);
    this.currentPage.set(1);
    this.applyPage(false);

    if (list.length === 0 && this.hasSearched()) {
      this.messageService.add({
        severity: 'info',
        summary: 'No designs',
        detail: `No bill sales for the selected customer between ${filter.startDate} and ${filter.endDate}.`,
      });
    }
  }

  /** Client-side sort + page slice (API returns full filtered list). */
  private applyPage(append: boolean): void {
    const sorted = sortDesignListItems(this.allDesigns, this.sortBy(), this.sortOrder());
    const pageItems = paginateDesignListItems(sorted, this.currentPage(), this.pageSize());

    if (append) {
      this.designs.update((current) => [...current, ...pageItems]);
      this.loadingMore.set(false);
    } else {
      this.designs.set(pageItems);
    }
  }

  private setupInfiniteScroll(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !this.loading() &&
          !this.loadingMore() &&
          this.designs().length < this.totalRecords()
        ) {
          this.loadingMore.set(true);
          this.currentPage.update((p) => p + 1);
          this.applyPage(true);
        }
      },
      { rootMargin: '200px' }
    );

    setTimeout(() => {
      const el = this.scrollSentinel()?.nativeElement;
      if (el) this.observer?.observe(el);
    }, 500);
  }

  private buildFilter(): DesignFilter {
    const v = this.filterForm.value;
    return {
      customerAccountId: resolveAccountId(v.customerAccountId),
      startDate: resolveFilterDate(v.startDate),
      endDate: resolveFilterDate(v.endDate),
    };
  }

  private buildApiFilter(): DesignFilterRequest | null {
    const filter = this.buildFilter();
    if (
      filter.customerAccountId == null ||
      !filter.startDate ||
      !filter.endDate
    ) {
      return null;
    }
    return {
      customerAccountId: filter.customerAccountId,
      startDate: filter.startDate,
      endDate: filter.endDate,
    };
  }

  private formatDateTime(d: Date): string {
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private startClock(): void {
    this.clockTimer = setInterval(() => {
      this.currentDateTime.set(this.formatDateTime(new Date()));
    }, 30_000);

    this.destroyRef.onDestroy(() => {
      if (this.clockTimer) clearInterval(this.clockTimer);
      this.observer?.disconnect();
    });
  }
}
