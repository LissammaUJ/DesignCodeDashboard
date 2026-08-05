import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

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

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  /** 'dark' | 'light' — visual theme for the login shell only. */
  readonly theme = signal<'dark' | 'light'>('dark');
  readonly isDarkTheme = computed(() => this.theme() === 'dark');
  readonly isLightTheme = computed(() => this.theme() === 'light');

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100)]],
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
      this.form.patchValue({ username: remembered, rememberMe: true });
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
      this.messages.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Enter username and password to continue.',
      });
      return;
    }

    this.loading.set(true);
    const { username, password, rememberMe } = this.form.getRawValue();

    this.auth.login({ username: username.trim(), password }, rememberMe).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.messages.add({
          severity: 'success',
          summary: 'Access granted',
          detail: `Signed in as ${res.username}`,
          life: 2200,
        });
        void this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        const detail =
          err?.status === 401
            ? 'Invalid username or password.'
            : (err?.message ?? 'Unable to sign in. Verify the API is running.');
        this.error.set(detail);
        this.messages.add({
          severity: 'error',
          summary: 'Login failed',
          detail,
        });
      },
    });
  }
}
