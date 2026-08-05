import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { CompanyOption } from '../../models/auth.models';

const THEME_KEY = 'login_theme_mode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PasswordModule,
    ProgressSpinnerModule,
    SelectModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly companiesLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly companies = signal<CompanyOption[]>([]);
  readonly theme = signal<'dark' | 'light'>('dark');
  readonly isDarkTheme = computed(() => this.theme() === 'dark');
  readonly isLightTheme = computed(() => this.theme() === 'light');

  readonly form = this.fb.nonNullable.group({
    companyId: [null as number | null, [Validators.required]],
    emplCode: ['', [Validators.required, Validators.maxLength(10)]],
    password: ['', [Validators.required, Validators.maxLength(200)]],
    rememberMe: [true],
  });

  ngOnInit(): void {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      this.theme.set(saved);
    }

    const remembered = this.auth.getRememberedUsername();
    if (remembered) {
      this.form.patchValue({ emplCode: remembered.toUpperCase(), rememberMe: true });
    }

    // Keep Employee Code uppercase in the reactive form (password is unchanged).
    this.form.controls.emplCode.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const upper = (value ?? '').toUpperCase();
        if (value !== upper) {
          this.form.controls.emplCode.setValue(upper, { emitEvent: false });
        }
      });

    this.loadCompanies();
  }

  /** Forces uppercase as the user types (letters only change; digits/symbols stay as-is). */
  onEmplCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const upper = (input.value ?? '').toUpperCase();

    if (input.value !== upper) {
      input.value = upper;
    }

    this.form.controls.emplCode.setValue(upper, { emitEvent: false });

    if (start != null && end != null) {
      input.setSelectionRange(start, end);
    }
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(THEME_KEY, next);
  }

  onSubmit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { companyId, emplCode, password, rememberMe } = this.form.getRawValue();
    const company = this.companies().find((c) => c.coId === companyId);

    this.auth
      .login(
        {
          emplCode: emplCode.trim().toUpperCase(),
          password,
          companyId: Number(companyId),
          companyName: company?.coName ?? '',
        },
        rememberMe
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          void this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          this.loading.set(false);
          const detail =
            err?.status === 403
              ? 'You do not have permission to access this company.'
              : err?.status === 401
                ? 'Invalid employee code, password, or company.'
                : (err?.message ?? 'Unable to sign in.');
          this.error.set(detail);
          this.messages.add({ severity: 'error', summary: 'Login failed', detail });
        },
      });
  }

  private loadCompanies(): void {
    this.companiesLoading.set(true);
    this.auth.getCompanies().subscribe({
      next: (list) => {
        this.companies.set(Array.isArray(list) ? list : []);
        this.companiesLoading.set(false);
        if (list.length === 1) {
          this.form.patchValue({ companyId: list[0].coId });
        }
      },
      error: (err) => {
        this.companiesLoading.set(false);
        this.companies.set([]);
        this.error.set(err?.message ?? 'Unable to load companies.');
      },
    });
  }
}
