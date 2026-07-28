import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { DesignDetail, DesignFilter } from '../../core/models/design.models';
import { DesignApiService } from '../../services/design-api.service';
import { DesignTabsApiService } from '../../services/design-tabs-api.service';
import { mapDesignDetail } from '../../shared/design-api.mapper';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-design-detail-dialog',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    ChartModule,
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
      inventory: this.designTabsApi.getInventory(designID).pipe(
        catchError(() => of({ currentStock: 0 }))
      ),
    }).subscribe({
      next: ({ detail, inventory }) => {
        const mapped = mapDesignDetail(detail);
        const currentQuantity = Number(inventory.currentStock) || 0;
        this.detail.set({
          ...mapped,
          general: { ...mapped.general, currentQuantity },
          inventory: { currentStock: currentQuantity },
          currentStock: currentQuantity,
        });
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

  /** Avoid showing fake 0 g when Product.NetWt is missing. */
  hasNetWeight(): boolean {
    const d = this.detail();
    return d != null && d.general.netWeight > 0;
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
