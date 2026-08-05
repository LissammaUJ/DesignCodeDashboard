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
import { debounceTime, merge, startWith } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem, MessageService } from 'primeng/api';
import { PAGE_SIZE_OPTIONS } from '../../core/constants/design.constants';
import {
  DashboardKpiSummary,
  DesignFilter,
  DesignListItem,
  SelectOption,
  SortField,
  SortOrder,
} from '../../core/models/design.models';
import { DesignFilterRequest } from '../../models/api.models';
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

  readonly authUsername = computed(() => this.auth.getUsername()?.trim() || 'User');

  userMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    const user = this.auth.getUsername()?.trim() || 'User';
    this.userMenuItems = [
      {
        label: 'Account',
        items: [
          {
            label: user,
            icon: 'pi pi-id-card',
            disabled: true,
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
        designID: design.designID,
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

  private loadCustomers(): void {
    const startDate = resolveFilterDate(this.filterForm.value.startDate);
    const endDate = resolveFilterDate(this.filterForm.value.endDate);

    // Never call GET /api/customer without query params.
    if (!startDate || !endDate) {
      this.filterOptions.set({ customers: [] });
      this.customersLoading.set(false);
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      this.filterOptions.set({ customers: [] });
      this.customersLoading.set(false);
      return;
    }

    this.customersLoading.set(true);
    this.customerApi.getCustomers(startDate, endDate).subscribe({
      next: (customers) => {
        const options = mapCustomersToOptions(customers ?? []);
        this.filterOptions.set({ customers: options });
        this.customersLoading.set(false);

        const selected = this.filterForm.value.customerAccountId;
        if (
          selected != null &&
          !options.some((o) => o.value === String(selected) || o.value === selected)
        ) {
          this.filterForm.patchValue({ customerAccountId: null }, { emitEvent: false });
        }

        if (!customers?.length) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Customers',
            detail: 'No customers with bills in the selected date range.',
          });
        }
      },
      error: (err) => {
        this.customersLoading.set(false);
        this.filterOptions.set({ customers: [] });
        this.messageService.add({
          severity: 'error',
          summary: 'Customers',
          detail: err?.message ?? 'Failed to load customers from API.',
        });
      },
    });
  }

  private fetchKpis(filter: DesignFilterRequest): void {
    this.kpiLoading.set(true);
    this.dashboardApi.getSummary(filter).subscribe({
      next: (dto) => {
        this.kpiSummary.set(mapDashboardSummary(dto));
        this.kpiLoading.set(false);
      },
      error: (err) => {
        this.kpiLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'KPI summary',
          detail: err?.message ?? 'Failed to load dashboard summary.',
        });
      },
    });
  }

  private fetchDesigns(filter: DesignFilterRequest): void {
    this.loading.set(true);

    this.customerSalesApi.getCustomerSales(filter).subscribe({
      next: (dtos) => {
        const list = Array.isArray(dtos) ? dtos : [];
        const api257 = list.find((d) => Number(d.productId) === 257);
        console.log('[customer-sales API product 257]', {
          found: !!api257,
          pendingOrder: api257?.pendingOrder,
          pendingProcess: api257?.pendingProcess,
          pendingProcessEquals1190: api257 != null && Number(api257.pendingProcess) === 1190,
          raw: api257,
        });

        this.designsError.set(null);
        this.allDesigns = list.map((dto) => mapCustomerSalesToListItem(dto));

        const mapped257 = this.allDesigns.find((c) => c.productId === 257);
        console.log('[customer-sales mapped product 257]', {
          found: !!mapped257,
          pendingOrder: mapped257?.pendingOrder,
          pendingOrderQuantity: mapped257?.pendingOrderQuantity,
          inProcess: mapped257?.inProcess,
          inProcessingQuantity: mapped257?.inProcessingQuantity,
          inProcessEquals1190: mapped257?.inProcess === 1190,
        });

        this.totalRecords.set(this.allDesigns.length);
        this.currentPage.set(1);
        this.applyPage(false);

        const render257 = this.designs().find((c) => c.productId === 257);
        console.log('[dashboard list before render product 257]', {
          found: !!render257,
          pendingOrder: render257?.pendingOrder,
          pendingOrderQuantity: render257?.pendingOrderQuantity,
          inProcess: render257?.inProcess,
          inProcessingQuantity: render257?.inProcessingQuantity,
          inProcessEquals1190: render257?.inProcess === 1190,
          bundleHint: typeof document !== 'undefined'
            ? Array.from(document.scripts)
                .map((s) => s.src)
                .filter((src) => /main[^/]*\.js/i.test(src))
            : [],
        });

        this.loading.set(false);

        if (list.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'No designs',
            detail: `No bill sales for the selected customer between ${filter.startDate} and ${filter.endDate}.`,
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.allDesigns = [];
        this.designs.set([]);
        this.totalRecords.set(0);
        const msg =
          err?.status === 0
            ? `Cannot reach API at ${environment.apiUrl}. Start DesignDashboard.Api then Search again.`
            : (err?.message ?? 'Failed to load designs from API.');
        this.designsError.set(msg);
        this.messageService.add({
          severity: 'error',
          summary: 'Designs',
          detail: msg,
        });
      },
    });
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
