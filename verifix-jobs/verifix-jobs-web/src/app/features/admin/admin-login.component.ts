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
    <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-1">{{ i18n.t('admin.panel') }}</h1>
          <p class="text-gray-500 text-sm">{{ i18n.t('admin.subtitle') }}</p>
        </div>

        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          @if (error()) {
            <div class="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg">{{ error() }}</div>
          }

          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">{{ i18n.t('admin.email') }}</label>
              <input type="email" [(ngModel)]="email" name="email" required autocomplete="email"
                     class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white outline-none"
                     placeholder="admin&#64;verifix.uz">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">{{ i18n.t('admin.password') }}</label>
              <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password"
                     class="w-full h-11 px-4 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white outline-none"
                     placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;">
            </div>
            <button type="submit" [disabled]="loading()"
                    class="w-full h-11 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50">
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
  loading = signal(false);
  error = signal('');

  constructor(private adminApi: AdminApiService, private router: Router, public i18n: I18nService) {}

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.adminApi.login(this.email, this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('vjw_admin_token', res.accessToken);
        localStorage.setItem('vjw_admin_role', res.role || 'ADMIN');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || this.i18n.t('admin.login_error'));
      }
    });
  }
}
