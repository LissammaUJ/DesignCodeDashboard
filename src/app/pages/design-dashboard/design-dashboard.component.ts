import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
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
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { PAGE_SIZE_OPTIONS } from '../../core/constants/design.constants';
import {
  DashboardAnalytics,
  DashboardKpiSummary,
  DesignFilter,
  DesignListItem,
  SelectOption,
  SortField,
  SortOrder,
} from '../../core/models/design.models';
import { DesignFilterRequest } from '../../models/api.models';
import { AdvancedFilterComponent } from '../../components/advanced-filter/advanced-filter.component';
import { AnalyticsPanelComponent } from '../../components/analytics-panel/analytics-panel.component';
import { DesignCardComponent } from '../../components/design-card/design-card.component';
import { DesignDetailDialogComponent } from '../../components/design-detail-dialog/design-detail-dialog.component';
import { KpiSummaryComponent } from '../../components/kpi-summary/kpi-summary.component';
import { CustomerApiService } from '../../services/customer-api.service';
import { CustomerSalesApiService } from '../../services/customer-sales-api.service';
import { DashboardApiService } from '../../services/dashboard-api.service';
import {
  mapCustomerSalesToListItem,
  mapCustomersToOptions,
  mapDashboardCharts,
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
    AnalyticsPanelComponent,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './design-dashboard.component.html',
  styleUrl: './design-dashboard.component.scss',
})
export class DesignDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
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
  readonly analytics = signal<DashboardAnalytics | null>(null);
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
  readonly analyticsLoading = signal(false);
  readonly loadingMore = signal(false);
  readonly filterCollapsed = signal(false);
  readonly showAnalytics = signal(true);
  readonly currentDateTime = signal(this.formatDateTime(new Date()));

  readonly currentPage = signal(1);
  readonly pageSize = signal(12);
  readonly sortBy = signal<SortField>('createdDate');
  readonly sortOrder = signal<SortOrder>('desc');

  readonly sortByOptions = [
    { label: 'Design Code', value: 'designCode' },
    { label: 'Created Date', value: 'createdDate' },
    { label: 'Category', value: 'category' },
    { label: 'Status', value: 'status' },
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

  ngOnInit(): void {
    // Wide default range so Search matches existing Bill_mas sales data.
    this.filterForm.patchValue({
      startDate: new Date(2024, 0, 1),
      endDate: new Date(),
    });
    this.loadCustomers();
    this.setupInfiniteScroll();
    this.startClock();
  }

  onSearch(): void {
    console.info('[Search] Search clicked');

    if (this.filterForm.invalid) {
      console.info('[Search] stopped — filterForm.invalid', this.filterForm.errors, this.filterForm.value);
      this.filterForm.markAllAsTouched();
      return;
    }

    const request = this.buildApiFilter();
    console.info('[Search] Selected AccountId', request?.customerAccountId);
    console.info('[Search] Selected StartDate', request?.startDate);
    console.info('[Search] Selected EndDate', request?.endDate);

    if (!request) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid filter',
        detail: `AccountId/dates could not be sent. Raw customer=${JSON.stringify(this.filterForm.value.customerAccountId)}`,
      });
      return;
    }

    this.currentPage.set(1);
    this.designs.set([]);
    this.hasSearched.set(true);
    this.designsError.set(null);
    this.fetchKpis(request);
    this.fetchAnalytics(request);
    this.fetchDesigns(request);
  }

  onRefresh(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Filters required',
        detail: 'Select customer and date range before refreshing.',
      });
      return;
    }
    this.currentPage.set(1);
    this.designs.set([]);
    this.loadDashboard();
    this.currentDateTime.set(this.formatDateTime(new Date()));
    this.messageService.add({
      severity: 'info',
      summary: 'Refreshed',
      detail: 'Dashboard data updated.',
    });
  }

  onReset(): void {
    this.filterForm.reset({
      customerAccountId: null,
      startDate: new Date(2024, 0, 1),
      endDate: new Date(),
    });
    this.currentPage.set(1);
    this.allDesigns = [];
    this.designs.set([]);
    this.totalRecords.set(0);
    this.hasSearched.set(false);
    this.designsError.set(null);
    this.kpiSummary.set(null);
    this.analytics.set(null);
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

  toggleAnalytics(): void {
    this.showAnalytics.update((v) => !v);
  }

  toggleFilterCollapse(): void {
    this.filterCollapsed.update((v) => !v);
  }

  private loadCustomers(): void {
    this.customersLoading.set(true);
    // One-shot HTTP: do not use takeUntilDestroyed here — HMR/recreate was aborting the
    // long customer request and caused TaskCanceledException on the API.
    this.customerApi.getCustomers().subscribe({
      next: (customers) => {
        this.filterOptions.set({ customers: mapCustomersToOptions(customers ?? []) });
        this.customersLoading.set(false);
        if (!customers?.length) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Customers',
            detail: 'API returned no active customers.',
          });
        }
      },
      error: (err) => {
        this.customersLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Customers',
          detail: err?.message ?? 'Failed to load customers from API.',
        });
      },
    });
  }

  private loadDashboard(): void {
    const request = this.buildApiFilter();
    if (!request) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filters required',
        detail: 'Select customer and date range, then Search.',
      });
      return;
    }

    this.fetchKpis(request);
    this.fetchAnalytics(request);
    this.fetchDesigns(request);
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

  private fetchAnalytics(filter: DesignFilterRequest): void {
    this.analyticsLoading.set(true);
    this.dashboardApi.getCharts(filter).subscribe({
      next: (dto) => {
        this.analytics.set(mapDashboardCharts(dto));
        this.analyticsLoading.set(false);
      },
      error: (err) => {
        this.analyticsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Analytics',
          detail: err?.message ?? 'Failed to load dashboard charts.',
        });
      },
    });
  }

  private fetchDesigns(filter: DesignFilterRequest): void {
    this.loading.set(true);
    console.info('[Designs] GET /api/customer-sales', filter);

    const customerAccount =
      this.filterOptions().customers.find((c) => c.value === String(filter.customerAccountId))
        ?.label ?? '';

    this.customerSalesApi.getCustomerSales(filter).subscribe({
      next: (dtos) => {
        const list = Array.isArray(dtos) ? dtos : [];
        console.info('[Designs] API Response', list.length, list[0] ?? null);
        this.designsError.set(null);
        this.allDesigns = list.map((dto) => mapCustomerSalesToListItem(dto, customerAccount));
        this.totalRecords.set(this.allDesigns.length);
        this.currentPage.set(1);
        this.applyPage(false);
        this.loading.set(false);

        console.info('[Designs] allDesigns.length', this.allDesigns.length);
        console.info('[Designs] designs() template length', this.designs().length);
        console.info('[Designs] totalRecords', this.totalRecords());

        if (list.length === 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'No designs',
            detail: `No bill sales for AccountId=${filter.customerAccountId} between ${filter.startDate} and ${filter.endDate}. Try customer 10 MERCH, LLC (1686) with 2024-01-01 to today.`,
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
            ? 'Cannot reach API at http://localhost:5000. Start DesignDashboard.Api then Search again.'
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
