import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'vja-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-6">
      <h1 class="text-xl font-bold text-gray-800">{{ i18n.t('system.title') }}</h1>

      <!-- Feature toggles -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">{{ i18n.t('system.services') }}</h3>
        <div role="main" class="space-y-3">
          @for (toggle of featureToggles; track toggle.key) {
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm font-medium text-gray-700">{{ toggle.label }}</div>
                <div class="text-xs text-gray-400">{{ i18n.t(toggle.description) }}</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="toggle.enabled" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          }
        </div>
      </div>

      <!-- Rate limits -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">{{ i18n.t('system.rate_limits') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ i18n.t('system.general_rate') }}</label>
            <input type="number" [(ngModel)]="rateLimits.general" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ i18n.t('system.employer_rate') }}</label>
            <input type="number" [(ngModel)]="rateLimits.employer" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
        </div>
      </div>

      <!-- Moderation rules -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">{{ i18n.t('system.moderation_rules') }}</h3>
        <div role="main" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ i18n.t('system.minimum_wage') }}</label>
            <input type="number" [(ngModel)]="moderation.minimumWage" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">{{ i18n.t('system.banned_words') }}</label>
            <textarea [(ngModel)]="moderation.bannedWords" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" [placeholder]="i18n.t('system.banned_placeholder')"></textarea>
          </div>
        </div>
      </div>

      <!-- SMS provider status -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">{{ i18n.t('system.sms_status') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">Eskiz ({{ i18n.t('system.primary') }})</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full"></span><span class="text-xs text-green-600">{{ i18n.t('system.active') }}</span></span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">PlayMobile ({{ i18n.t('system.backup') }})</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full"></span><span class="text-xs text-green-600">{{ i18n.t('system.active') }}</span></span>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button (click)="save()" class="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">{{ i18n.t('common.save') }}</button>
      </div>
      @if (saveMessage) {
        <div class="text-sm text-green-600">{{ saveMessage }}</div>
      }
    </div>
  `,
})
export class SystemConfigComponent implements OnInit {
  featureToggles = [
    { key: 'kafka', label: 'Kafka', description: 'system.kafka_desc', enabled: false },
    { key: 'elasticsearch', label: 'Elasticsearch', description: 'system.search_desc', enabled: false },
    { key: 'minio', label: 'MinIO', description: 'system.storage_desc', enabled: false },
    { key: 'ml', label: 'ML Service', description: 'system.ml_desc', enabled: false },
    { key: 'govSync', label: 'Gov Sync', description: 'system.gov_desc', enabled: false },
  ];

  rateLimits = { general: 100, employer: 30 };
  moderation = { minimumWage: 1155000, bannedWords: 'mlm, piramida, depozit, lotereya' };
  saveMessage = '';
  saving = false;

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getSystemConfig().subscribe({
      next: (config: any) => {
        if (config.featureToggles) {
          for (const toggle of this.featureToggles) {
            const remote = config.featureToggles.find((t: any) => t.key === toggle.key);
            if (remote) toggle.enabled = remote.enabled;
          }
        }
        if (config.rateLimits) this.rateLimits = config.rateLimits;
        if (config.moderation) this.moderation = config.moderation;
      }
    });
  }

  save() {
    this.saving = true;
    const payload = {
      featureToggles: this.featureToggles,
      rateLimits: this.rateLimits,
      moderation: this.moderation
    };
    this.api.saveSystemConfig(payload).subscribe({
      next: () => {
        this.saving = false;
        this.saveMessage = this.i18n.t('system.save_success');
        setTimeout(() => this.saveMessage = '', 3000);
      },
      error: () => {
        this.saving = false;
        this.saveMessage = this.i18n.t('admin.error');
        setTimeout(() => this.saveMessage = '', 3000);
      }
    });
  }
}
