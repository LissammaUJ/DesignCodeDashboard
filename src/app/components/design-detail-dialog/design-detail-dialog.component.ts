import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { DesignDetail, DesignFilter } from '../../core/models/design.models';
import { DesignApiService } from '../../services/design-api.service';
import { mapDesignDetail } from '../../shared/design-api.mapper';

@Component({
  selector: 'app-design-detail-dialog',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    ChartModule,
    TagModule,
    TimelineModule,
    TooltipModule,
    SkeletonModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  providers: [MessageService],
  templateUrl: './design-detail-dialog.component.html',
  styleUrl: './design-detail-dialog.component.scss',
})
export class DesignDetailDialogComponent implements OnInit {
  private readonly config = inject(DynamicDialogConfig);
  private readonly ref = inject(DynamicDialogRef);
  private readonly designApi = inject(DesignApiService);
  private readonly messageService = inject(MessageService);

  readonly orderTable = viewChild<Table>('orderTable');

  readonly detail = signal<DesignDetail | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly activeImageIndex = signal(0);
  readonly zoomed = signal(false);
  readonly orderSearch = signal('');

  /** Backend has no production / warehouse inventory / timeline payloads. */
  readonly hasProductionData = signal(false);
  readonly hasInventoryData = signal(false);
  readonly hasTimelineData = signal(false);

  readonly barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  ngOnInit(): void {
    const designID = this.config.data?.designID as number;
    const filter = this.config.data?.filter as DesignFilter | undefined;

    if (!designID) {
      this.loading.set(false);
      this.loadError.set('Design ID is missing.');
      return;
    }

    const apiFilter =
      filter?.customerAccountId != null && filter.startDate && filter.endDate
        ? {
            customerAccountId: filter.customerAccountId,
            startDate: filter.startDate,
            endDate: filter.endDate,
          }
        : undefined;

    this.designApi.getDesignById(designID, apiFilter).subscribe({
      next: (dto) => {
        const mapped = mapDesignDetail(dto);
        this.detail.set(mapped);
        this.hasTimelineData.set(mapped.timeline.length > 0);
        // Production & warehouse inventory are not on DesignDetailDto
        this.hasProductionData.set(false);
        this.hasInventoryData.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(err?.message ?? 'Failed to load design details.');
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: err?.message ?? 'Unable to load design from API.',
        });
      },
    });
  }

  close(): void {
    this.ref.close();
  }

  prevImage(): void {
    const d = this.detail();
    if (!d?.images.length) return;
    this.activeImageIndex.update((i) => (i - 1 + d.images.length) % d.images.length);
  }

  nextImage(): void {
    const d = this.detail();
    if (!d?.images.length) return;
    this.activeImageIndex.update((i) => (i + 1) % d.images.length);
  }

  toggleZoom(): void {
    this.zoomed.update((z) => !z);
  }

  currentImage(): string {
    const d = this.detail();
    if (!d) return '';
    return d.images[this.activeImageIndex()] || d.imageUrl || '';
  }

  hasMonthlySales(): boolean {
    return (this.detail()?.sales.monthlySales.length ?? 0) > 0;
  }

  hasYearlySales(): boolean {
    return (this.detail()?.sales.yearlySales.length ?? 0) > 0;
  }

  hasOrders(): boolean {
    return (this.detail()?.orders.length ?? 0) > 0;
  }

  /** Weight fields not on API — avoid showing fake 0 g. */
  hasNetWeight(): boolean {
    const d = this.detail();
    return d != null && d.general.netWeight > 0;
  }

  hasGrossWeight(): boolean {
    return false;
  }

  monthlyChart() {
    const d = this.detail();
    if (!d?.sales.monthlySales.length) return null;
    return {
      labels: d.sales.monthlySales.map((m) => m.month),
      datasets: [{ data: d.sales.monthlySales.map((m) => m.value), backgroundColor: '#2563eb', borderRadius: 4 }],
    };
  }

  yearlyChart() {
    const d = this.detail();
    if (!d?.sales.yearlySales.length) return null;
    return {
      labels: d.sales.yearlySales.map((y) => y.year),
      datasets: [{ data: d.sales.yearlySales.map((y) => y.value), backgroundColor: '#7c3aed', borderRadius: 4 }],
    };
  }

  onOrderSearch(value: string): void {
    this.orderTable()?.filterGlobal(value, 'contains');
  }

  exportOrdersExcel(): void {
    this.orderTable()?.exportCSV();
    this.messageService.add({ severity: 'success', summary: 'Export', detail: 'Orders exported to Excel.' });
  }

  smartAction(action: string): void {
    const d = this.detail();
    if (!d) return;
    if (action === 'Copy') navigator.clipboard?.writeText(d.designCode);
    this.messageService.add({ severity: 'info', summary: action, detail: `${action} — ${d.designCode}` });
  }
}
