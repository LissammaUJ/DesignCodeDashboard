import { Component, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { KpiMetric } from '../../core/models/design.models';
import { SparklineComponent } from '../sparkline/sparkline.component';

@Component({
  selector: 'app-kpi-summary',
  standalone: true,
  imports: [SkeletonModule, SparklineComponent, TooltipModule],
  templateUrl: './kpi-summary.component.html',
  styleUrl: './kpi-summary.component.scss',
})
export class KpiSummaryComponent {
  readonly metrics = input<KpiMetric[]>([]);
  readonly loading = input(false);

  formatValue(metric: KpiMetric): string {
    if (metric.format === 'currency') {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(metric.value));
    }
    if (metric.format === 'datetime') return String(metric.value);
    return new Intl.NumberFormat('en-IN').format(Number(metric.value));
  }
}
