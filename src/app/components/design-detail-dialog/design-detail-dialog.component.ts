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
import { DesignDetail } from '../../core/models/design.models';
import { DesignService } from '../../services/design.service';

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
  private readonly designService = inject(DesignService);
  private readonly messageService = inject(MessageService);

  readonly orderTable = viewChild<Table>('orderTable');

  readonly detail = signal<DesignDetail | null>(null);
  readonly loading = signal(true);
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
    this.designService.getDesignDetail(designID).subscribe({
      next: (d) => { this.detail.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
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

  monthlyChart() {
    const d = this.detail();
    if (!d) return null;
    return {
      labels: d.sales.monthlySales.map((m) => m.month),
      datasets: [{ data: d.sales.monthlySales.map((m) => m.quantity), backgroundColor: '#2563eb', borderRadius: 4 }],
    };
  }

  yearlyChart() {
    const d = this.detail();
    if (!d) return null;
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
