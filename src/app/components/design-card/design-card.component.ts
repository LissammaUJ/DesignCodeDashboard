import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ApprovalStatus, CardKpiItem, DesignListItem } from '../../core/models/design.models';

@Component({
  selector: 'app-design-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './design-card.component.html',
  styleUrl: './design-card.component.scss',
})
export class DesignCardComponent {
  readonly design = input.required<DesignListItem>();
  readonly index = input(0);

  readonly cardClick = output<DesignListItem>();
  readonly action = output<{ action: string; design: DesignListItem }>();

  /** Primary identifier — shown once. */
  readonly designCode = computed(() => this.design().designCode?.trim() || '—');

  /**
   * Secondary description: Product Name preferred.
   * Strips any repeated Design Code / Design Name so the code is never shown twice.
   */
  readonly productLabel = computed(() => {
    const d = this.design();
    const code = d.designCode?.trim() ?? '';
    const name = d.designName?.trim() ?? '';
    const product = d.productName?.trim() ?? '';

    const candidates = [product, name].filter(Boolean);
    for (const raw of candidates) {
      const cleaned = this.stripRepeatedIdentifier(raw, code, name);
      if (cleaned) return cleaned;
    }
    return 'No Data Available';
  });

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
        label: 'In Process',
        value: this.fmtNum(d.inProcessingQuantity),
        icon: 'pi pi-cog',
        colorClass: 'kpi-tile--green',
        tooltip: `In Process Quantity: ${this.fmtNum(d.inProcessingQuantity)}`,
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

  private stripRepeatedIdentifier(text: string, code: string, name: string): string {
    let result = text.trim();
    if (!result) return '';

    const tokens = [code, name]
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .filter((t, i, arr) => arr.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i)
      .sort((a, b) => b.length - a.length);

    for (const token of tokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Exact duplicate of code/name → drop entirely
      if (result.toLowerCase() === token.toLowerCase()) {
        return '';
      }
      // Remove trailing / leading / mid occurrences of the design code (e.g. "... FG 08739")
      result = result
        .replace(new RegExp(`\\s*[\\-–—|/]?\\s*${escaped}\\s*$`, 'i'), '')
        .replace(new RegExp(`^\\s*${escaped}\\s*[\\-–—|/:]?\\s*`, 'i'), '')
        .replace(new RegExp(`\\s*[\\-–—|/]\\s*${escaped}\\s*`, 'gi'), ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    return result;
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
