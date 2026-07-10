import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Design, DesignStatus } from '../../core/models/models';

@Component({
  selector: 'app-design-table',
  standalone: true,
  imports: [TableModule, TagModule, ButtonModule, TooltipModule],
  templateUrl: './design-table.component.html',
  styleUrl: './design-table.component.scss',
})
export class DesignTableComponent {
  readonly designs = input.required<Design[]>();

  readonly view = output<Design>();
  readonly edit = output<Design>();
  readonly download = output<Design>();
  readonly print = output<Design>();

  getStatusSeverity(status: DesignStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<DesignStatus, 'success' | 'warn' | 'danger' | 'secondary'> = {
      Approved: 'success',
      Pending: 'warn',
      Rejected: 'danger',
      Inactive: 'secondary',
    };
    return map[status];
  }
}
