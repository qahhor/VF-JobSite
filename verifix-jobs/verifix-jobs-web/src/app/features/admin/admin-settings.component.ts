import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">{{ i18n.t('admin.settings.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ i18n.t('admin.settings.hint') }}</p>
      </div>

      @if (loading()) {
        <div class="py-12 text-center text-sm text-slate-400">{{ i18n.t('admin.logging_in') }}</div>
      } @else {
        <!-- Feature toggles -->
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <h3 class="text-sm font-semibold">{{ i18n.t('admin.settings.services') }}</h3>
          <p class="mt-1 text-xs text-slate-500">{{ i18n.t('admin.settings.services_hint') }}</p>
          <div class="mt-4 space-y-3">
            @for (toggle of featureToggles; track toggle.key) {
              <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div class="text-sm font-medium">{{ i18n.t(toggle.labelKey) }}</div>
                  <div class="text-xs text-slate-400">{{ i18n.t(toggle.descKey) }}</div>
                </div>
                <button
                  (click)="toggle.enabled = !toggle.enabled"
                  class="relative h-6 w-11 rounded-full transition"
                  [class]="toggle.enabled ? 'bg-slate-950' : 'bg-slate-300'">
                  <span class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                    [class.translate-x-5]="toggle.enabled"></span>
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Rate limits -->
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <h3 class="text-sm font-semibold">{{ i18n.t('admin.settings.rate_limits') }}</h3>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs text-slate-500">{{ i18n.t('admin.settings.general_rate') }}</span>
              <input type="number" [(ngModel)]="rateLimits.general" class="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950" />
            </label>
            <label class="block">
              <span class="mb-1 block text-xs text-slate-500">{{ i18n.t('admin.settings.employer_rate') }}</span>
              <input type="number" [(ngModel)]="rateLimits.employer" class="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950" />
            </label>
          </div>
        </div>

        <!-- Moderation rules -->
        <div class="rounded-[28px] border border-slate-200 bg-white p-5">
          <h3 class="text-sm font-semibold">{{ i18n.t('admin.settings.moderation_rules') }}</h3>
          <div class="mt-4 space-y-3">
            <label class="block">
              <span class="mb-1 block text-xs text-slate-500">{{ i18n.t('admin.settings.minimum_wage') }}</span>
              <input type="number" [(ngModel)]="moderation.minimumWage" class="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950" />
            </label>
            <label class="block">
              <span class="mb-1 block text-xs text-slate-500">{{ i18n.t('admin.settings.banned_words') }}</span>
              <textarea [(ngModel)]="moderation.bannedWords" rows="3" [placeholder]="i18n.t('admin.settings.banned_placeholder')" class="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"></textarea>
            </label>
          </div>
        </div>

        <!-- Save -->
        <div class="flex justify-end">
          <button
            (click)="save()"
            [disabled]="saving()"
            class="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
            {{ saving() ? i18n.t('admin.saving_password') : i18n.t('admin.settings.save') }}
          </button>
        </div>
      }
    </div>
  `,
})
export class AdminSettingsComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);

  featureToggles = [
    { key: 'kafka', labelKey: 'admin.service.kafka', descKey: 'admin.settings.kafka_desc', enabled: false },
    { key: 'elasticsearch', labelKey: 'admin.service.elasticsearch', descKey: 'admin.settings.search_desc', enabled: false },
    { key: 'minio', labelKey: 'admin.service.minio', descKey: 'admin.settings.storage_desc', enabled: false },
    { key: 'ml', labelKey: 'admin.service.ml', descKey: 'admin.settings.ml_desc', enabled: false },
    { key: 'govSync', labelKey: 'admin.service.gov_sync', descKey: 'admin.settings.gov_desc', enabled: false },
  ];

  rateLimits = { general: 60, employer: 30 };
  moderation = { minimumWage: 0, bannedWords: '' };

  constructor(
    private api: AdminApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.api.getSystemConfig().subscribe({
      next: (config: any) => {
        if (config?.featureToggles) {
          for (const ft of config.featureToggles) {
            const found = this.featureToggles.find(t => t.key === ft.key);
            if (found) found.enabled = ft.enabled;
          }
        }
        if (config?.rateLimits) {
          this.rateLimits = { ...this.rateLimits, ...config.rateLimits };
        }
        if (config?.moderation) {
          this.moderation = { ...this.moderation, ...config.moderation };
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  save() {
    this.saving.set(true);
    const payload = {
      featureToggles: this.featureToggles.map(t => ({ key: t.key, enabled: t.enabled })),
      rateLimits: this.rateLimits,
      moderation: this.moderation,
    };
    this.api.saveSystemConfig(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.i18n.t('admin.settings.save_success'));
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(this.i18n.t('admin.action_failed'));
      },
    });
  }
}
