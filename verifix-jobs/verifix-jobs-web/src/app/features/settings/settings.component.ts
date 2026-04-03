import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { EmployerProfile } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ i18n.t('settings.title') }}</h1>

      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-semibold text-gray-800">{{ i18n.t('settings.profile') }}</h3>
        @if (profile(); as p) {
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('settings.company_name') }}</label>
                <input type="text" [(ngModel)]="p.name" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20">
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('settings.legal_name') }}</label>
                <input type="text" [(ngModel)]="p.legalName" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20">
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('auth.inn') }}</label>
                <input type="text" [value]="p.inn" disabled class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('settings.city') }}</label>
                <input type="text" [(ngModel)]="p.city" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20">
              </div>
            </div>
            <div class="flex items-center gap-4">
              @if (p.isVerified) {
                <span class="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">{{ i18n.t('settings.verified') }}</span>
              } @else {
                <span class="rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-600">{{ i18n.t('settings.unverified') }}</span>
              }
              <div class="text-xs text-gray-400">{{ i18n.t('settings.status') }}: {{ p.status }}</div>
            </div>
            @if (saveMsg()) {
              <div class="text-sm text-green-600">{{ saveMsg() }}</div>
            }
            <div class="flex justify-end border-t border-gray-100 pt-4">
              <button (click)="saveProfile()" [disabled]="saving()"
                      class="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50">
                {{ saving() ? i18n.t('settings.saving') : i18n.t('settings.save') }}
              </button>
            </div>
          </div>
        } @else {
          <div class="py-8 text-center text-gray-400">{{ i18n.t('settings.loading') }}</div>
        }
      </div>

      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-semibold text-gray-800">{{ i18n.t('settings.notifications') }}</h3>
        <div class="space-y-3">
          @for (n of notifications; track n.key) {
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm font-medium text-gray-700">{{ n.label }}</div>
                <div class="text-xs text-gray-400">{{ n.description }}</div>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" [(ngModel)]="n.enabled" (ngModelChange)="saveNotifications()" class="peer sr-only">
                <div class="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-black after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          }
        </div>
      </div>

      <div class="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
        <h3 class="mb-2 font-semibold text-red-600">{{ i18n.t('settings.danger_zone') }}</h3>
        <p class="mb-4 text-sm text-gray-500">{{ i18n.t('settings.irreversible') }}</p>
        @if (!confirmDelete()) {
          <button (click)="confirmDelete.set(true)" class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50">
            {{ i18n.t('settings.delete_account') }}
          </button>
        } @else {
          <div class="rounded-lg border border-red-200 bg-red-50 p-4">
            <p class="mb-3 text-sm text-red-700">{{ i18n.t('settings.confirm_delete_text') }}</p>
            <div class="flex gap-2">
              <button (click)="deleteAccount()" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">{{ i18n.t('settings.confirm_delete') }}</button>
              <button (click)="confirmDelete.set(false)" class="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50">{{ i18n.t('common.cancel') }}</button>
            </div>
            @if (deleteMsg()) {
              <div class="mt-3 text-sm text-red-600">{{ deleteMsg() }}</div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  profile = signal<EmployerProfile | null>(null);
  saving = signal(false);
  saveMsg = signal('');
  confirmDelete = signal(false);
  deleteMsg = signal('');

  notifications: { key: string; label: string; description: string; enabled: boolean }[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: profile => this.profile.set(profile as any),
      error: () => {}
    });
    this.loadNotifications();
  }

  saveProfile() {
    const profile = this.profile();
    if (!profile) return;

    this.saving.set(true);
    this.saveMsg.set('');
    this.api.updateProfile(profile).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveMsg.set(this.i18n.t('settings.saved'));
        setTimeout(() => this.saveMsg.set(''), 3000);
      },
      error: () => this.saving.set(false),
    });
  }

  loadNotifications() {
    const defaults = [
      { key: 'new_application', label: this.i18n.t('settings.notification.new_application'), description: this.i18n.t('settings.notification.new_application_desc'), enabled: true },
      { key: 'application_hired', label: this.i18n.t('settings.notification.hired'), description: this.i18n.t('settings.notification.hired_desc'), enabled: true },
      { key: 'vacancy_expired', label: this.i18n.t('settings.notification.expired'), description: this.i18n.t('settings.notification.expired_desc'), enabled: true },
      { key: 'weekly_digest', label: this.i18n.t('settings.notification.digest'), description: this.i18n.t('settings.notification.digest_desc'), enabled: false },
    ];

    try {
      const saved = JSON.parse(localStorage.getItem('vjw_notification_prefs') || 'null');
      this.notifications = saved
        ? defaults.map(item => ({ ...item, enabled: saved[item.key] ?? item.enabled }))
        : defaults;
    } catch {
      this.notifications = defaults;
    }
  }

  saveNotifications() {
    const prefs: Record<string, boolean> = {};
    this.notifications.forEach(notification => {
      prefs[notification.key] = notification.enabled;
    });
    localStorage.setItem('vjw_notification_prefs', JSON.stringify(prefs));
  }

  deleteAccount() {
    this.deleteMsg.set('');
    this.http.delete(`${environment.apiUrl}/employer/profile`).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/']);
      },
      error: () => this.deleteMsg.set(this.i18n.t('settings.delete_failed'))
    });
  }
}
