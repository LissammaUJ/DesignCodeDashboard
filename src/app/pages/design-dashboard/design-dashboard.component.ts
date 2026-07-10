import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PAGE_SIZE_OPTIONS } from '../../core/constants/design.constants';
import {
  DashboardAnalytics,
  DashboardKpiSummary,
  DesignFilter,
  DesignListItem,
  DesignQuery,
  SortField,
  SortOrder,
} from '../../core/models/design.models';
import { AdvancedFilterComponent } from '../../components/advanced-filter/advanced-filter.component';
import { AnalyticsPanelComponent } from '../../components/analytics-panel/analytics-panel.component';
import { DesignCardComponent } from '../../components/design-card/design-card.component';
import { DesignDetailDialogComponent } from '../../components/design-detail-dialog/design-detail-dialog.component';
import { KpiSummaryComponent } from '../../components/kpi-summary/kpi-summary.component';
import { DesignService } from '../../services/design.service';

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
  private readonly designService = inject(DesignService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly scrollSentinel = viewChild<ElementRef>('scrollSentinel');

  readonly filterForm: FormGroup = this.fb.group({
    customerAccount: [null],
    branch: [null],
    category: [null],
    subCategory: [null],
    material: [null],
    purity: [null],
    designer: [null],
    status: [null],
    createdFrom: [null],
    createdTo: [null],
    globalSearch: [''],
  });

  readonly filterOptions = this.designService.getFilterOptions();
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS.map((v) => ({ label: String(v), value: v }));

  readonly kpiSummary = signal<DashboardKpiSummary | null>(null);
  readonly analytics = signal<DashboardAnalytics | null>(null);
  readonly designs = signal<DesignListItem[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly kpiLoading = signal(false);
  readonly analyticsLoading = signal(false);
  readonly loadingMore = signal(false);
  readonly filterCollapsed = signal(false);
  readonly showAnalytics = signal(true);

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

  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.loadDashboard();
    this.setupDebouncedSearch();
    this.setupInfiniteScroll();
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.designs.set([]);
    this.loadDashboard();
  }

  onReset(): void {
    this.filterForm.reset({ globalSearch: '' });
    this.currentPage.set(1);
    this.designs.set([]);
    this.designService.clearCache();
    this.loadDashboard();
    this.messageService.add({ severity: 'secondary', summary: 'Reset', detail: 'Filters cleared.' });
  }

  onExportExcel(): void {
    this.messageService.add({ severity: 'success', summary: 'Export', detail: 'Excel export started.' });
  }

  onExportPdf(): void {
    this.messageService.add({ severity: 'success', summary: 'Export', detail: 'PDF export started.' });
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage.set((event.page ?? 0) + 1);
    this.pageSize.set(event.rows ?? 12);
    this.fetchDesigns(false);
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
      data: { designID: design.designID },
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

  private loadDashboard(): void {
    const filter = this.buildFilter();
    this.fetchKpis(filter);
    this.fetchAnalytics(filter);
    this.fetchDesigns(false);
  }

  private fetchKpis(filter: DesignFilter): void {
    this.kpiLoading.set(true);
    this.designService.getKpiSummary(filter).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.kpiSummary.set(data); this.kpiLoading.set(false); },
      error: () => this.kpiLoading.set(false),
    });
  }

  private fetchAnalytics(filter: DesignFilter): void {
    this.analyticsLoading.set(true);
    this.designService.getAnalytics(filter).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => { this.analytics.set(data); this.analyticsLoading.set(false); },
      error: () => this.analyticsLoading.set(false),
    });
  }

  private fetchDesigns(append: boolean): void {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
    }

    const query: DesignQuery = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };

    this.designService
      .searchDesigns(this.buildFilter(), query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.totalRecords.set(res.totalRecords);
          this.designs.update((current) => append ? [...current, ...res.data] : res.data);
          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadingMore.set(false);
        },
      });
  }

  private setupDebouncedSearch(): void {
    this.filterForm
      .get('globalSearch')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage.set(1);
        this.designs.set([]);
        this.fetchDesigns(false);
      });
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
          this.currentPage.update((p) => p + 1);
          this.fetchDesigns(true);
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
      customerAccount: v.customerAccount || undefined,
      branch: v.branch || undefined,
      category: v.category || undefined,
      subCategory: v.subCategory || undefined,
      material: v.material || undefined,
      purity: v.purity || undefined,
      designer: v.designer || undefined,
      status: v.status || undefined,
      createdFrom: v.createdFrom ? this.formatDate(v.createdFrom) : undefined,
      createdTo: v.createdTo ? this.formatDate(v.createdTo) : undefined,
      globalSearch: v.globalSearch || undefined,
    };
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
