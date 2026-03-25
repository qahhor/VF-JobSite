import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'vja-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-6">
      <h1 class="text-xl font-bold text-gray-800">Tizim sozlamalari</h1>

      <!-- Feature toggles -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Xizmatlar</h3>
        <div role="main" class="space-y-3">
          @for (toggle of featureToggles; track toggle.key) {
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm font-medium text-gray-700">{{ toggle.label }}</div>
                <div class="text-xs text-gray-400">{{ toggle.description }}</div>
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
        <h3 class="font-semibold text-gray-800 mb-4">Rate limitlar</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Umumiy (req/min)</label>
            <input type="number" [(ngModel)]="rateLimits.general" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Ish beruvchi (req/min)</label>
            <input type="number" [(ngModel)]="rateLimits.employer" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
        </div>
      </div>

      <!-- Moderation rules -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Moderatsiya qoidalari</h3>
        <div role="main" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Minimal maosh (UZS)</label>
            <input type="number" [(ngModel)]="moderation.minimumWage" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Taqiqlangan so'zlar (vergul bilan)</label>
            <textarea [(ngModel)]="moderation.bannedWords" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="mlm, piramida, depozit..."></textarea>
          </div>
        </div>
      </div>

      <!-- SMS provider status -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">SMS provayder holati</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">Eskiz (asosiy)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full"></span><span class="text-xs text-green-600">Faol</span></span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">PlayMobile (zaxira)</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full"></span><span class="text-xs text-green-600">Faol</span></span>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="px-6 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">Saqlash</button>
      </div>
    </div>
  `,
})
export class SystemConfigComponent {
  featureToggles = [
    { key: 'kafka', label: 'Kafka', description: 'Xabar brokeri', enabled: false },
    { key: 'elasticsearch', label: 'Elasticsearch', description: 'Qidiruv tizimi', enabled: false },
    { key: 'minio', label: 'MinIO', description: 'Fayl saqlash', enabled: false },
    { key: 'ml', label: 'ML Service', description: 'Mashinali o\'rganish', enabled: false },
    { key: 'govSync', label: 'Gov Sync', description: 'Davlat sinxronizatsiyasi', enabled: false },
  ];

  rateLimits = { general: 100, employer: 30 };
  moderation = { minimumWage: 1155000, bannedWords: 'mlm, piramida, depozit, lotereya' };
}
