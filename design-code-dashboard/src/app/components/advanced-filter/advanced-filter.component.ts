import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SelectOption } from '../../core/models/design.models';

@Component({
  selector: 'app-advanced-filter',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, DatePickerModule, ButtonModule],
  templateUrl: './advanced-filter.component.html',
  styleUrl: './advanced-filter.component.scss',
})
export class AdvancedFilterComponent {
  readonly filterForm = input.required<FormGroup>();
  readonly options = input.required<Record<string, SelectOption[]>>();
  readonly loading = input(false);
  readonly collapsed = input(false);

  readonly search = output<void>();
  readonly reset = output<void>();
  readonly toggleCollapse = output<void>();

  onSearch(): void {
    const form = this.filterForm();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.search.emit();
  }

  onReset(): void {
    this.reset.emit();
  }
}
