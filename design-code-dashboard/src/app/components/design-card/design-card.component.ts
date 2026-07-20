import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ApprovalStatus, CardKpiItem, DesignListItem } from '../../core/models/design.models';

@Component({
  selector: 'app-design-card',
  standalone: true,
  imports: [CardModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './design-card.component.html',
  styleUrl: './design-card.component.scss',
})
export class DesignCardComponent {
  readonly design = input.required<DesignListItem>();
  readonly index = input(0);

  readonly cardClick = output<DesignListItem>();
  readonly action = output<{ action: string; design: DesignListItem }>();

  readonly kpiItems = computed<CardKpiItem[]>(() => {
    const d = this.design();
    return [
      {
        label: 'Sales Qty',
        value: this.fmtNum(d.salesQuantity),
        icon: 'pi pi-box',
        colorClass: 'kpi-tile--blue',
        tooltip: `Total Sales Quantity: ${this.fmtNum(d.salesQuantity)} units`,
      },
      {
        label: 'Sales Value',
        value: this.fmtCompactCurrency(d.totalSalesValue),
        icon: 'pi pi-wallet',
        colorClass: 'kpi-tile--purple',
        tooltip: `Total Sales Value: ${this.fmtCurrency(d.totalSalesValue)}`,
      },
      {
        label: 'Pending Orders',
        value: this.fmtNum(d.pendingOrderQuantity),
        icon: 'pi pi-clipboard',
        colorClass: 'kpi-tile--orange',
        tooltip: `Pending Orders: ${this.fmtNum(d.pendingOrderQuantity)}`,
      },
      {
        label: 'In Processing',
        value: this.fmtNum(d.inProcessingQuantity),
        icon: 'pi pi-cog',
        colorClass: 'kpi-tile--green',
        tooltip: `In Processing Quantity: ${this.fmtNum(d.inProcessingQuantity)}`,
      },
    ];
  });

  getApprovalSeverity(status: ApprovalStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    return { Approved: 'success', Pending: 'warn', Rejected: 'danger', Inactive: 'secondary' }[status] as
      | 'success'
      | 'warn'
      | 'danger'
      | 'secondary';
  }

  onCardClick(): void {
    this.cardClick.emit(this.design());
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.action.emit({ action: 'View Details', design: this.design() });
  }

  private fmtNum(n: number): string {
    return new Intl.NumberFormat('en-IN').format(n);
  }

  private fmtCurrency(n: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
  }

  private fmtCompactCurrency(n: number): string {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)} K`;
    return this.fmtCurrency(n);
  }
}
