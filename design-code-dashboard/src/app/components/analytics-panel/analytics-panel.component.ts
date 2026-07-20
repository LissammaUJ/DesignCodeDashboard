import { Component, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardAnalytics } from '../../core/models/design.models';

@Component({
  selector: 'app-analytics-panel',
  standalone: true,
  imports: [ChartModule, SkeletonModule],
  templateUrl: './analytics-panel.component.html',
  styleUrl: './analytics-panel.component.scss',
})
export class AnalyticsPanelComponent {
  readonly analytics = input<DashboardAnalytics | null>(null);
  readonly loading = input(false);

  readonly lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } },
  };

  readonly barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { display: false } } },
  };

  toChart(data: { label: string; value: number }[] | undefined) {
    if (!data) return null;
    return {
      labels: data.map((d) => d.label),
      datasets: [{
        data: data.map((d) => d.value),
        backgroundColor: ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#dc2626', '#64748b'],
        borderRadius: 6,
        barThickness: 12,
      }],
    };
  }

  toLineChart(data: { label: string; value: number }[] | undefined) {
    if (!data) return null;
    return {
      labels: data.map((d) => d.label),
      datasets: [{
        data: data.map((d) => d.value),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2563eb',
        borderWidth: 2,
      }],
    };
  }
}
