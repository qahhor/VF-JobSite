import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-ai-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ i18n.t('ai.title') }}</h1>
        <p class="mt-1 text-sm text-gray-400">{{ i18n.t('ai.subtitle') }}</p>
      </div>

      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-semibold text-gray-800">{{ i18n.t('ai.modules') }}</h3>
        <div class="space-y-4">
          @for (mod of agentModules; track mod.key) {
            <div class="flex flex-col gap-3 border-b border-gray-50 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-3">
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-[11px] font-semibold text-gray-700">
                  {{ mod.badge }}
                </span>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ i18n.t(mod.nameKey) }}</div>
                  <div class="text-xs text-gray-400">{{ i18n.t(mod.descriptionKey) }}</div>
                </div>
              </div>
              <div class="flex items-center justify-end gap-3">
                @if (mod.key === 'human_review') {
                  <span class="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">{{ i18n.t('ai.always_on') }}</span>
                } @else {
                  <label class="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" [(ngModel)]="mod.enabled" (ngModelChange)="saveModules()" class="peer sr-only">
                    <div class="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full"></div>
                  </label>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        @for (stat of agentStats(); track stat.label) {
          <div class="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="mt-1 text-xs text-gray-400">{{ stat.label }}</div>
          </div>
        }
      </div>

      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-semibold text-gray-800">{{ i18n.t('ai.create_vacancy') }}</h3>
        <div class="space-y-3">
          <textarea
            [(ngModel)]="aiInput"
            rows="3"
            [placeholder]="i18n.t('ai.prompt_placeholder')"
            class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"></textarea>
          <div class="flex gap-2">
            <button
              (click)="generateVacancy()"
              [disabled]="!aiInput.trim() || generating()"
              class="h-10 rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50">
              {{ generating() ? i18n.t('ai.generating') : i18n.t('ai.generate') }}
            </button>
          </div>
        </div>

        @if (generatedResult()) {
          <div class="mt-4 rounded-xl bg-gray-50 p-4">
            <h4 class="mb-2 text-sm font-semibold text-gray-800">{{ i18n.t('ai.result') }}</h4>
            <pre class="whitespace-pre-wrap text-xs text-gray-600">{{ generatedResult() | json }}</pre>
            <a
              routerLink="/employer/vacancies/new"
              class="mt-3 inline-flex h-9 items-center rounded-lg bg-black px-4 text-xs font-medium text-white hover:bg-gray-800">
              {{ i18n.t('ai.open_vacancy') }}
            </a>
          </div>
        }
      </div>

      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-semibold text-gray-800">{{ i18n.t('ai.log') }}</h3>
        @if (aiLog().length) {
          <div class="space-y-2">
            @for (entry of aiLog(); track entry.id) {
              <div class="flex items-center gap-3 border-b border-gray-50 py-2 last:border-0">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-semibold text-gray-600">
                  {{ actionBadge(entry.action) }}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="text-sm text-gray-800">{{ entry.description }}</div>
                  <div class="text-xs text-gray-400">{{ entry.timestamp | date:'dd.MM HH:mm' }}</div>
                </div>
                <span class="rounded-full px-2 py-0.5 text-xs"
                      [class]="entry.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'">
                  {{ entry.status }}
                </span>
              </div>
            }
          </div>
        } @else {
          <div class="py-4 text-sm text-gray-400">{{ i18n.t('ai.empty_log') }}</div>
        }
      </div>
    </div>
  `,
})
export class AiAgentComponent implements OnInit {
  aiInput = '';
  generating = signal(false);
  generatedResult = signal<any>(null);
  agentStats = signal<{value: string | number; label: string}[]>([]);
  aiLog = signal<any[]>([]);

  agentModules = [
    { key: 'ai_search', badge: 'AS', nameKey: 'ai.module.search', descriptionKey: 'ai.module.search_desc', enabled: true },
    { key: 'ai_invite', badge: 'IV', nameKey: 'ai.module.invite', descriptionKey: 'ai.module.invite_desc', enabled: false },
    { key: 'ai_screen', badge: 'SC', nameKey: 'ai.module.screen', descriptionKey: 'ai.module.screen_desc', enabled: false },
    { key: 'ai_shortlist', badge: 'SL', nameKey: 'ai.module.shortlist', descriptionKey: 'ai.module.shortlist_desc', enabled: true },
    { key: 'human_review', badge: 'HR', nameKey: 'ai.module.review', descriptionKey: 'ai.module.review_desc', enabled: true },
  ];

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    this.loadStats();
    this.loadLog();
    const saved = localStorage.getItem('vjw_ai_modules');
    if (saved) {
      const prefs = JSON.parse(saved);
      this.agentModules.forEach(module => {
        if (prefs[module.key] !== undefined) {
          module.enabled = prefs[module.key];
        }
      });
    }
  }

  saveModules() {
    const prefs: Record<string, boolean> = {};
    this.agentModules.forEach(module => prefs[module.key] = module.enabled);
    localStorage.setItem('vjw_ai_modules', JSON.stringify(prefs));
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/analytics/overview`).subscribe({
      next: (data: any) => {
        this.agentStats.set([
          { value: data.totalApplications || 0, label: this.i18n.t('ai.stats.analyzed') },
          { value: data.hiredCount || 0, label: this.i18n.t('ai.stats.hired') },
          { value: data.newApplications || 0, label: this.i18n.t('ai.stats.new_apps') },
          { value: data.activeVacancies || 0, label: this.i18n.t('ai.stats.active_vacancies') },
        ]);
      },
      error: () => {}
    });
  }

  loadLog() {
    this.http.get<any>(`${environment.apiUrl}/employer/dashboard/feed?size=10`).subscribe({
      next: (response: any) => {
        const items = (response?.content || []).map((entry: any, index: number) => ({
          id: entry.id || index,
          action: entry.eventType,
          description: entry.title + (entry.description ? ' - ' + entry.description : ''),
          timestamp: entry.createdAt,
          status: 'SUCCESS'
        }));
        this.aiLog.set(items);
      },
      error: () => {}
    });
  }

  generateVacancy() {
    if (!this.aiInput.trim()) {
      return;
    }

    this.generating.set(true);
    this.generatedResult.set(null);
    this.http.post<any>(`${environment.apiUrl}/ai/intake/generate`, {
      description: this.aiInput,
      city: this.extractCity(this.aiInput)
    }).subscribe({
      next: (result: any) => {
        this.generating.set(false);
        this.generatedResult.set(result);
      },
      error: () => {
        this.generating.set(false);
        this.generatedResult.set({
          title: this.aiInput.split(',')[0]?.trim() || this.i18n.t('ai.fallback_title'),
          note: this.i18n.t('ai.fallback_note'),
          status: 'FALLBACK'
        });
      }
    });
  }

  private extractCity(text: string): string | null {
    const cities = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg\'ona', 'Nukus', 'Navoiy', 'Qarshi', 'Jizzax', 'Termiz', 'Urganch'];
    const matched = cities.find(city => text.toLowerCase().includes(city.toLowerCase()));
    return matched || null;
  }

  actionBadge(action: string): string {
    return ({
      APPLICATION_NEW: 'NEW',
      APPLICATION_HIRED: 'HIR',
      VACANCY_APPROVED: 'VAC',
      AI_SEARCH: 'AS',
      AI_INVITE: 'IV',
      AI_SCREEN: 'SC',
      AI_SHORTLIST: 'SL'
    } as Record<string, string>)[action] || 'LOG';
  }
}
