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
import { LucideAngularModule, Settings, Bell, Shield, Briefcase, Globe, Trash2, Save } from 'lucide-angular';

@Component({
  selector: 'vjw-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-3xl space-y-5">
      <h1 class="text-title font-semibold text-gray-900">{{ i18n.t('settings.title') }}</h1>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-border overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab.set(tab.id)"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px whitespace-nowrap"
            [class]="activeTab() === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'">
            <lucide-icon [img]="tab.icon" [size]="16"></lucide-icon>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab: General -->
      @if (activeTab() === 'general') {
        <div class="rounded-2xl border border-border bg-white p-6 shadow-card">
          <h3 class="text-heading font-semibold text-gray-900 mb-5">{{ i18n.t('settings.profile') }}</h3>
          @if (profile(); as p) {
            <div class="space-y-4">
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('settings.company_name') }}</label>
                  <input type="text" [(ngModel)]="p.name" class="h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('settings.legal_name') }}</label>
                  <input type="text" [(ngModel)]="p.legalName" class="h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary">
                </div>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('auth.inn') }}</label>
                  <input type="text" [value]="p.inn" disabled class="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-muted font-mono">
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('settings.city') }}</label>
                  <input type="text" [(ngModel)]="p.city" class="h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary">
                </div>
              </div>
              <div class="flex items-center gap-3">
                @if (p.isVerified) {
                  <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">{{ i18n.t('settings.verified') }}</span>
                } @else {
                  <span class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">{{ i18n.t('settings.unverified') }}</span>
                }
                <span class="text-xs text-muted">{{ i18n.t('settings.status') }}: {{ p.status }}</span>
              </div>
              @if (saveMsg()) {
                <div class="text-sm text-accent font-medium">{{ saveMsg() }}</div>
              }
              <div class="flex justify-end border-t border-border pt-4">
                <button (click)="saveProfile()" [disabled]="saving()"
                  class="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-40 transition">
                  <lucide-icon [img]="SaveIcon" [size]="16"></lucide-icon>
                  {{ saving() ? i18n.t('settings.saving') : i18n.t('settings.save') }}
                </button>
              </div>
            </div>
          } @else {
            <div class="py-8 text-center text-muted">{{ i18n.t('settings.loading') }}</div>
          }
        </div>
      }

      <!-- Tab: Recruitment -->
      @if (activeTab() === 'recruitment') {
        <div class="rounded-2xl border border-border bg-white p-6 shadow-card">
          <h3 class="text-heading font-semibold text-gray-900 mb-4">Pipeline Configuration</h3>
          <p class="text-sm text-muted mb-4">Default stages for new vacancies. Customize per vacancy in the vacancy editor.</p>
          <div class="space-y-2">
            @for (stage of pipelineStages; track stage) {
              <div class="flex items-center gap-3 rounded-xl border border-border p-3 bg-surface">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{{ $index + 1 }}</div>
                <span class="text-sm font-medium text-gray-700">{{ stage }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab: Notifications -->
      @if (activeTab() === 'notifications') {
        <div class="rounded-2xl border border-border bg-white p-6 shadow-card">
          <h3 class="text-heading font-semibold text-gray-900 mb-5">{{ i18n.t('settings.notifications') }}</h3>
          <div class="space-y-1">
            @for (n of notifications; track n.key) {
              <div class="flex items-center justify-between rounded-xl p-3 hover:bg-surface transition">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ n.label }}</div>
                  <div class="text-[11px] text-muted">{{ n.description }}</div>
                </div>
                <label class="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" [(ngModel)]="n.enabled" (ngModelChange)="saveNotifications()" class="peer sr-only">
                  <div class="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-primary after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab: Integrations -->
      @if (activeTab() === 'integrations') {
        <div class="rounded-2xl border border-border bg-white p-6 shadow-card text-center">
          <div class="text-3xl mb-3">🔌</div>
          <h3 class="text-heading font-semibold text-gray-900">Integrations</h3>
          <p class="mt-2 text-sm text-muted">Google Calendar, WhatsApp Business, Telegram Bot, ARGOS, ENST, Mehnat</p>
          <a href="/employer/integrations" class="mt-3 inline-block text-sm font-medium text-primary hover:underline">Go to Integrations page →</a>
        </div>
      }

      <!-- Tab: Data & Privacy -->
      @if (activeTab() === 'privacy') {
        <div class="space-y-5">
          <div class="rounded-2xl border border-border bg-white p-6 shadow-card">
            <h3 class="text-heading font-semibold text-gray-900 mb-3">Data Retention</h3>
            <p class="text-sm text-muted">Candidate data is retained for 12 months after application. Configure auto-deletion policies here.</p>
            <div class="mt-4 flex items-center gap-3">
              <select class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
                <option>12 months</option>
                <option>6 months</option>
                <option>24 months</option>
              </select>
              <span class="text-xs text-muted">after last activity</span>
            </div>
          </div>

          <div class="rounded-2xl border border-error/20 bg-white p-6 shadow-card">
            <h3 class="text-heading font-semibold text-error mb-2">{{ i18n.t('settings.danger_zone') }}</h3>
            <p class="text-sm text-muted mb-4">{{ i18n.t('settings.irreversible') }}</p>
            @if (!confirmDelete()) {
              <button (click)="confirmDelete.set(true)"
                class="flex items-center gap-2 rounded-xl border border-error/30 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/5 transition">
                <lucide-icon [img]="TrashIcon" [size]="16"></lucide-icon>
                {{ i18n.t('settings.delete_account') }}
              </button>
            } @else {
              <div class="rounded-xl border border-error/20 bg-error/5 p-4">
                <p class="text-sm text-error mb-3">{{ i18n.t('settings.confirm_delete_text') }}</p>
                <div class="flex gap-2">
                  <button (click)="deleteAccount()" class="rounded-xl bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition">
                    {{ i18n.t('settings.confirm_delete') }}
                  </button>
                  <button (click)="confirmDelete.set(false)" class="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition">
                    {{ i18n.t('common.cancel') }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  SaveIcon = Save;
  TrashIcon = Trash2;

  activeTab = signal<'general' | 'recruitment' | 'notifications' | 'integrations' | 'privacy'>('general');
  profile = signal<EmployerProfile | null>(null);
  saving = signal(false);
  saveMsg = signal('');
  confirmDelete = signal(false);
  deleteMsg = signal('');

  tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'recruitment' as const, label: 'Recruitment', icon: Briefcase },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'integrations' as const, label: 'Integrations', icon: Globe },
    { id: 'privacy' as const, label: 'Data & Privacy', icon: Shield },
  ];

  pipelineStages = ['Applied', 'Phone Screen', 'Technical Test', 'Team Interview', 'Offer', 'Hired'];

  notifications: { key: string; label: string; description: string; enabled: boolean }[] = [];

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getProfile().subscribe({ next: p => this.profile.set(p as any), error: () => {} });
    this.loadNotifications();
  }

  saveProfile() {
    const profile = this.profile();
    if (!profile) return;
    this.saving.set(true);
    this.saveMsg.set('');
    this.api.updateProfile(profile).subscribe({
      next: () => { this.saving.set(false); this.saveMsg.set(this.i18n.t('settings.saved')); setTimeout(() => this.saveMsg.set(''), 3000); },
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
      this.notifications = saved ? defaults.map(d => ({ ...d, enabled: saved[d.key] ?? d.enabled })) : defaults;
    } catch { this.notifications = defaults; }
  }

  saveNotifications() {
    const prefs: Record<string, boolean> = {};
    this.notifications.forEach(n => prefs[n.key] = n.enabled);
    localStorage.setItem('vjw_notification_prefs', JSON.stringify(prefs));
  }

  deleteAccount() {
    this.http.delete(`${environment.apiUrl}/employer/profile`).subscribe({
      next: () => { this.auth.logout(); this.router.navigate(['/']); },
      error: () => this.deleteMsg.set(this.i18n.t('settings.delete_failed'))
    });
  }
}
