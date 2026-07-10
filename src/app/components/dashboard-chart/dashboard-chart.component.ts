import { Component, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChartAnalytics } from '../../core/models/models';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.scss',
})
export class DashboardChartComponent {
  readonly analytics = input<ChartAnalytics | null>(null);
  readonly loading = input(false);

  readonly donutData = computed(() => {
    const data = this.analytics()?.statusDistribution;
    if (!data) return null;

    return {
      labels: ['Approved', 'Pending', 'Rejected', 'Inactive'],
      datasets: [
        {
          data: [data.approved, data.pending, data.rejected, data.inactive],
          backgroundColor: ['#16a34a', '#ea580c', '#dc2626', '#94a3b8'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  });

  readonly categoryBarData = computed(() => {
    const items = this.analytics()?.topCategories ?? [];
    return {
      labels: items.map((i) => i.category),
      datasets: [
        {
          label: 'Designs',
          data: items.map((i) => i.count),
          backgroundColor: '#2563eb',
          borderRadius: 6,
          barThickness: 20,
        },
      ],
    };
  });

  readonly customerBarData = computed(() => {
    const items = this.analytics()?.topCustomers ?? [];
    return {
      labels: items.map((i) => i.customer),
      datasets: [
        {
          label: 'Designs',
          data: items.map((i) => i.count),
          backgroundColor: '#7c3aed',
          borderRadius: 6,
          barThickness: 20,
        },
      ],
    };
  });

  readonly createdBarData = computed(() => {
    const items = this.analytics()?.mostCreatedDesigns ?? [];
    return {
      labels: items.map((i) => i.category),
      datasets: [
        {
          label: 'Created',
          data: items.map((i) => i.count),
          backgroundColor: '#0891b2',
          borderRadius: 6,
          barThickness: 20,
        },
      ],
    };
  });

  readonly donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12, family: 'Inter' },
        },
      },
    },
  };

  readonly barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };
}
