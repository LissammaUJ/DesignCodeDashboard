import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DesignListItem } from '../../core/models/design.models';

@Component({
  selector: 'app-design-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CardModule, ButtonModule, TooltipModule],
  templateUrl: './design-card.component.html',
  styleUrl: './design-card.component.scss',
})
export class DesignCardComponent {
  /** Card model (mapped from CustomerSalesDto). */
  readonly design = input.required<DesignListItem>();
  readonly index = input(0);

  readonly cardClick = output<DesignListItem>();
  readonly action = output<{ action: string; design: DesignListItem }>();

  /** Alias for template clarity: card === design input. */
  readonly card = computed(() => this.design());

  readonly designCode = computed(() => this.card().designCode?.trim() || '—');

  readonly productLabel = computed(() => {
    const d = this.card();
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

  /**
   * Prefer explicit aliases; fall back when a field is null/undefined only.
   * Values are already normalized numbers from the mapper (pendingProcess → inProcess).
   */
  readonly pendingOrderDisplay = computed(() => {
    const c = this.card();
    const value = Number(c.pendingOrder ?? c.pendingOrderQuantity ?? 0);
    return Number.isFinite(value) ? value : 0;
  });

  readonly inProcessDisplay = computed(() => {
    const c = this.card();
    const value = Number(c.inProcess ?? c.inProcessingQuantity ?? 0);
    if (c.productId === 257) {
      console.log('[design-card product 257]', {
        productId: c.productId,
        pendingOrder: c.pendingOrder,
        pendingOrderQuantity: c.pendingOrderQuantity,
        inProcess: c.inProcess,
        inProcessingQuantity: c.inProcessingQuantity,
        displayInProcess: Number.isFinite(value) ? value : 0,
      });
    }
    return Number.isFinite(value) ? value : 0;
  });

  readonly salesQtyDisplay = computed(() => {
    const value = Number(this.card().salesQuantity ?? 0);
    return Number.isFinite(value) ? value : 0;
  });

  readonly salesValueDisplay = computed(() => {
    const value = Number(this.card().totalSalesValue ?? 0);
    return Number.isFinite(value) ? value : 0;
  });

  onCardClick(): void {
    this.cardClick.emit(this.card());
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.action.emit({ action: 'View Details', design: this.card() });
  }

  formatCompactCurrency(n: number): string {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} L`;
    if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)} K`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);
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
      if (result.toLowerCase() === token.toLowerCase()) {
        return '';
      }
      result = result
        .replace(new RegExp(`\\s*[\\-–—|/]?\\s*${escaped}\\s*$`, 'i'), '')
        .replace(new RegExp(`^\\s*${escaped}\\s*[\\-–—|/:]?\\s*`, 'i'), '')
        .replace(new RegExp(`\\s*[\\-–—|/]\\s*${escaped}\\s*`, 'gi'), ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    return result;
  }
}
