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
import {
  DesignDetail,
  DesignFilter,
  DesignInventoryInfo,
  DesignProductionInfo,
  TimelineEvent,
} from '../../core/models/design.models';
import { DesignApiService } from '../../services/design-api.service';
import { DesignTabsApiService } from '../../services/design-tabs-api.service';
import { mapDesignDetail } from '../../shared/design-api.mapper';
import { forkJoin } from 'rxjs';

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
  private readonly designTabsApi = inject(DesignTabsApiService);
  private readonly messageService = inject(MessageService);

  readonly orderTable = viewChild<Table>('orderTable');

  readonly detail = signal<DesignDetail | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly activeImageIndex = signal(0);
  readonly zoomed = signal(false);
  readonly orderSearch = signal('');

  /** True after tab APIs resolve (grid shows real SQL values, including zeros). */
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

    forkJoin({
      detail: this.designApi.getDesignById(designID, apiFilter),
      production: this.designTabsApi.getProduction(designID),
      inventory: this.designTabsApi.getInventory(designID),
      timeline: this.designTabsApi.getActivityTimeline(designID),
    }).subscribe({
      next: ({ detail, production, inventory, timeline }) => {
        const mapped = mapDesignDetail(detail);
        const productionInfo: DesignProductionInfo = {
          productionQuantity: Number(production.productionQuantity) || 0,
          completedQuantity: Number(production.completedQuantity) || 0,
          pendingQuantity: Number(production.pendingQuantity) || 0,
          rejectedQuantity: Number(production.rejectedQuantity) || 0,
          machine: production.machine?.trim() ?? '',
          department: production.department?.trim() ?? '',
          supervisor: production.supervisor?.trim() ?? '',
        };
        const inventoryInfo: DesignInventoryInfo = {
          currentStock: Number(inventory.currentStock) || 0,
          reservedStock: Number(inventory.reservedStock) || 0,
          availableStock: Number(inventory.availableStock) || 0,
          pendingStock: Number(inventory.pendingStock) || 0,
          warehouse: inventory.warehouse?.trim() ?? '',
          rack: inventory.rack?.trim() ?? '',
          location: inventory.location?.trim() ?? '',
          batchNumber: inventory.batchNumber?.trim() ?? '',
        };
        const timelineEvents: TimelineEvent[] = (timeline ?? []).map((e) =>
          this.toTimelineEvent(e.title, e.description, e.activityDate, e.icon, e.color)
        );

        this.detail.set({
          ...mapped,
          production: productionInfo,
          inventory: inventoryInfo,
          timeline: timelineEvents,
        });
        this.hasProductionData.set(true);
        this.hasInventoryData.set(true);
        this.hasTimelineData.set(timelineEvents.length > 0);
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

  /** Maps API activity items onto the existing demo TimelineEvent shape (icons/colors unchanged). */
  private toTimelineEvent(
    title?: string | null,
    description?: string | null,
    activityDate?: string | null,
    icon?: string | null,
    color?: string | null
  ): TimelineEvent {
    const t = (title ?? '').trim();
    const key = t.toLowerCase();
    const demoIcon =
      key.includes('created') ? 'pi pi-plus-circle'
      : key.includes('updated') ? 'pi pi-pencil'
      : key.includes('production completed') || key.includes('approved') ? 'pi pi-check-circle'
      : key.includes('production started') ? 'pi pi-play'
      : key.includes('printed') ? 'pi pi-print'
      : key.includes('downloaded') ? 'pi pi-download'
      : key.includes('sold') ? 'pi pi-shopping-bag'
      : key.includes('returned') ? 'pi pi-replay'
      : (icon?.trim() || 'pi pi-circle');
    const demoColor =
      key.includes('created') || key.includes('production started') ? '#2563eb'
      : key.includes('updated') ? '#7c3aed'
      : key.includes('production completed') || key.includes('approved') ? '#16a34a'
      : key.includes('printed') ? '#64748b'
      : key.includes('downloaded') ? '#0891b2'
      : key.includes('sold') ? '#059669'
      : key.includes('returned') ? '#dc2626'
      : (color?.trim() || '#64748b');

    return {
      type: key || 'activity',
      title: t,
      description: (description ?? '').trim(),
      date: (activityDate ?? '').trim(),
      icon: demoIcon,
      color: demoColor,
    };
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
