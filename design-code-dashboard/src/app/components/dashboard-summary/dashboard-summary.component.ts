import { Component, input } from '@angular/core';
import { DesignSummary } from '../../core/models/models';

interface SummaryCard {
  label: string;
  key: keyof DesignSummary;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-summary.component.html',
  styleUrl: './dashboard-summary.component.scss',
})
export class DashboardSummaryComponent {
  readonly summary = input.required<DesignSummary>();

  readonly cards: SummaryCard[] = [
    { label: 'Total Designs', key: 'totalDesigns', icon: 'pi pi-box', colorClass: 'summary-card--blue' },
    { label: 'Approved Designs', key: 'approved', icon: 'pi pi-check-circle', colorClass: 'summary-card--green' },
    { label: 'Pending Designs', key: 'pending', icon: 'pi pi-clock', colorClass: 'summary-card--orange' },
    { label: 'Rejected Designs', key: 'rejected', icon: 'pi pi-times-circle', colorClass: 'summary-card--red' },
    { label: 'Inactive Designs', key: 'inactive', icon: 'pi pi-ban', colorClass: 'summary-card--purple' },
  ];
}
