import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { DesignDetail, DesignFilter, DesignProductionRow } from '../../core/models/design.models';
import { DesignProductionDto } from '../../models/api.models';
import { DesignApiService } from '../../services/design-api.service';
import { DesignTabsApiService } from '../../services/design-tabs-api.service';
import { mapDesignDetail } from '../../shared/design-api.mapper';

@Component({
  selector: 'app-design-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    ChartModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    TableModule,
    TooltipModule,
    SkeletonModule,
    ProgressSpinnerModule,
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
  private readonly destroyRef = inject(DestroyRef);

  readonly orderTable = viewChild<Table>('orderTable');

  readonly detail = signal<DesignDetail | null>(null);
  /** Reactive table source — avoids stale `@if (...; as d)` / lazy tab bindings. */
  readonly orderRows = computed(() => this.detail()?.orders ?? []);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly activeImageIndex = signal(0);
  readonly zoomed = signal(false);
  readonly activeTab = signal('0');
  readonly productionLoading = signal(false);
  readonly productionLoaded = signal(false);

  private designId = 0;

  readonly barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => {
            const value = Number(ctx.parsed?.y) || 0;
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { maxRotation: 45, minRotation: 0, font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          callback: (value: string | number) =>
            new Intl.NumberFormat('en-IN', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(Number(value)),
        },
        grid: { color: 'rgba(148, 163, 184, 0.25)' },
      },
    },
  };

  ngOnInit(): void {
    this.designId = this.config.data?.designID as number;
    const filter = this.config.data?.filter as DesignFilter | undefined;

    if (!this.designId) {
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

    // Fast popup: load detail only. Production loads when its tab is opened.
    this.loading.set(true);
    this.loadError.set(null);
    this.designApi
      .getDesignById(this.designId, apiFilter)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (detail) => {
          const mapped = mapDesignDetail(detail);
          const orders = mapped.orders ?? [];
          const inv = detail.inventory?.[0];
          const invRaw = inv != null ? Number(inv.currentStock) : Number.NaN;
          const hasInventory = Number.isFinite(invRaw);

          this.detail.set({
            ...mapped,
            orders,
            // GetInventory only — do not overwrite mapped stock with a fabricated 0.
            ...(hasInventory
              ? {
                  inventory: { currentStock: invRaw },
                  currentStock: invRaw,
                }
              : {}),
            // Production loads when its tab opens (SP rows only; never fabricate here).
            production: [],
          });
        },
        error: (err) => {
          this.loadError.set(err?.message ?? 'Failed to load design details.');
          this.messageService.add({
            severity: 'error',
            summary: 'Load failed',
            detail: err?.message ?? 'Unable to load design from API.',
          });
        },
      });
  }

  onTabChange(value: string | number | undefined): void {
    const tab = String(value ?? '0');
    this.activeTab.set(tab);
    // Re-bind a fresh array when Order Details opens (PrimeNG lazy tabpanel + OnPush).
    if (tab === '2') {
      this.detail.update((d) =>
        d ? { ...d, orders: [...(d.orders ?? [])] } : d
      );
    }
    if (tab === '3') {
      this.loadProductionOnce();
    }
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

  formatProductionDate(value: string | null | undefined): string {
    if (value == null || value === '') return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .replace(/ /g, '-');
  }

  hasNetWeight(): boolean {
    const d = this.detail();
    return d != null && d.general.netWeight > 0;
  }

  monthlyChart() {
    const rows = this.detail()?.sales.monthlySales ?? [];
    if (!rows.length) return null;
    return {
      labels: rows.map((m) => m.month),
      datasets: [
        {
          label: 'Sales Value',
          data: rows.map((m) => m.value),
          backgroundColor: 'rgba(37, 99, 235, 0.75)',
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    };
  }

  yearlyChart() {
    const rows = this.detail()?.sales.yearlySales ?? [];
    if (!rows.length) return null;
    return {
      labels: rows.map((y) => y.year),
      datasets: [
        {
          label: 'Sales Value',
          data: rows.map((y) => y.value),
          backgroundColor: 'rgba(124, 58, 237, 0.75)',
          borderColor: '#7c3aed',
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 42,
        },
      ],
    };
  }

  onOrderSearch(value: string): void {
    this.orderTable()?.filterGlobal(value, 'contains');
  }

  exportOrdersExcel(): void {
    this.orderTable()?.exportCSV();
    this.messageService.add({
      severity: 'success',
      summary: 'Export',
      detail: 'Orders exported to Excel.',
    });
  }

  downloadImage(): void {
    const src = this.currentImage();
    const d = this.detail();
    if (!src || !d) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Download',
        detail: 'No image available to download.',
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `${d.designCode || 'design'}.jpg`;
      if (src.startsWith('data:')) {
        const blob = this.dataUrlToBlob(src);
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
      } else {
        link.href = src;
        link.target = '_blank';
        link.rel = 'noopener';
        link.click();
      }
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Download',
        detail: 'Unable to download image.',
      });
    }
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mime = /data:(.*?);/.exec(header)?.[1] || 'image/jpeg';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  printDetail(): void {
    window.print();
  }

  private loadProductionOnce(): void {
    if (this.productionLoaded() || this.productionLoading() || !this.designId) {
      return;
    }

    this.productionLoading.set(true);
    this.designTabsApi
      .getProduction(this.designId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.productionLoading.set(false);
          this.productionLoaded.set(true);
        })
      )
      .subscribe({
        next: (rows) => {
          const mapped = this.mapProductionRows(this.designId, rows);
          this.detail.update((d) => (d ? { ...d, production: mapped } : d));
        },
        error: (err) => {
          this.detail.update((d) => (d ? { ...d, production: [] } : d));
          this.messageService.add({
            severity: 'warn',
            summary: 'Production',
            detail: err?.message ?? 'Failed to load production records.',
          });
        },
      });
  }

  private mapProductionRows(
    designId: number,
    rows: DesignProductionDto[]
  ): DesignProductionRow[] {
    const list = (rows ?? [])
      .filter((row) => {
        const loc = row.location?.trim() ?? '';
        const produced = Number(row.producedQuantity) || 0;
        const required = Number(row.requiredQuantity) || 0;
        const isPlaceholder =
          (row.productionDate == null || row.productionDate === '') &&
          (loc === '' || loc === '-' || loc === '—') &&
          produced === 0 &&
          required === 0;
        return !isPlaceholder;
      })
      .map((row, index) => ({
        productionDate: row.productionDate ?? null,
        location: row.location?.trim() || '',
        producedQuantity: Number(row.producedQuantity) || 0,
        requiredQuantity: Number(row.requiredQuantity) || 0,
        rowKey: `${designId}-${index}-${row.productionDate ?? ''}-${row.producedQuantity}`,
      }));

    if (list.length === 0) {
      return [];
    }

    return list;
  }
}
