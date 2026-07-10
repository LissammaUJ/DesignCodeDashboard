import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CustomerAccount } from '../../core/models/models';

@Component({
  selector: 'app-dashboard-filter',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, DatePickerModule, ButtonModule],
  templateUrl: './dashboard-filter.component.html',
  styleUrl: './dashboard-filter.component.scss',
})
export class DashboardFilterComponent {
  readonly filterForm = input.required<FormGroup>();
  readonly customerAccounts = input.required<CustomerAccount[]>();
  readonly loading = input(false);

  readonly search = output<void>();
  readonly reset = output<void>();

  onSearch(): void {
    this.search.emit();
  }

  onReset(): void {
    this.reset.emit();
  }
}
