import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { KpiMetric } from '../../core/models/design.models';

@Component({
  selector: 'app-kpi-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonModule, TooltipModule],
  templateUrl: './kpi-summary.component.html',
  styleUrl: './kpi-summary.component.scss',
})
export class KpiSummaryComponent {
  readonly metrics = input<KpiMetric[]>([]);
  readonly loading = input(false);
  /** When set (and not loading), show a visible error instead of an empty invisible grid. */
  readonly error = input<string | null>(null);

  formatValue(metric: KpiMetric): string {
    if (metric.format === 'currency') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(Number(metric.value));
    }
    if (metric.format === 'datetime') {
      return String(metric.value);
    }
    return new Intl.NumberFormat('en-IN').format(Number(metric.value));
  }
}
