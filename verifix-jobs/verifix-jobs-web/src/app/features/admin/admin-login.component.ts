import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div class="text-sm uppercase tracking-[0.24em] text-slate-500">Verifix Jobs</div>
          <h1 class="mt-4 text-4xl font-semibold text-slate-950">{{ i18n.t('admin.panel') }}</h1>
          <p class="mt-3 text-sm leading-6 text-slate-500">{{ i18n.t('admin.subtitle') }}</p>
        </div>

        <div class="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          @if (error()) {
            <div class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error() }}</div>
          }

          <form (ngSubmit)="onLogin()" class="space-y-4">
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.email') }}</span>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
                class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                placeholder="admin@verifix.uz" />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.password') }}</span>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
                class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                placeholder="••••••••" />
            </label>

            <label class="block">
              <div class="mb-2 flex items-center justify-between gap-2">
                <span class="text-sm font-medium text-slate-700">{{ i18n.t('admin.totp_code') }}</span>
                <span class="text-xs text-slate-500">{{ i18n.t('admin.totp_optional') }}</span>
              </div>
              <input
                type="text"
                [(ngModel)]="totpCode"
                name="totpCode"
                inputmode="numeric"
                maxlength="6"
                class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
                placeholder="123456" />
            </label>

            <button
              type="submit"
              [disabled]="loading()"
              class="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {{ loading() ? i18n.t('admin.logging_in') : i18n.t('auth.login') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  email = '';
  password = '';
  totpCode = '';
  loading = signal(false);
  error = signal('');

  constructor(private adminApi: AdminApiService, private router: Router, public i18n: I18nService) {}

  onLogin() {
    this.loading.set(true);
    this.error.set('');

    this.adminApi.login(this.email, this.password, this.totpCode || undefined).subscribe({
      next: (res) => {
        localStorage.setItem('vjw_admin_token', res.accessToken);
        localStorage.setItem('vjw_admin_role', res.role || 'ADMIN');
        localStorage.setItem('vjw_admin_must_change_password', res.mustChangePassword ? 'true' : 'false');
        this.router.navigate([res.mustChangePassword ? '/admin/access' : '/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.i18n.t('admin.login_error'));
      }
    });
  }
}
