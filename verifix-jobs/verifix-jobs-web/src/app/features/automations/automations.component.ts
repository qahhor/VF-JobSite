import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-automations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">{{ i18n.t('automations.title') }}</h1>
        <button (click)="showCreate.set(true)" class="h-10 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + {{ i18n.t('automations.new_rule') }}
        </button>
      </div>

      <!-- Preset templates -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        @for (t of templates; track t.nameKey) {
          <button (click)="useTemplate(t)" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:border-gray-300 transition">
            <div class="text-2xl mb-2">{{ t.icon }}</div>
            <div class="text-sm font-semibold text-gray-800">{{ i18n.t(t.nameKey) }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ i18n.t(t.descriptionKey) }}</div>
          </button>
        }
      </div>

      <!-- Rules list -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-semibold text-gray-800">{{ i18n.t('automations.active_rules') }}</h3></div>
        @if (rules().length) {
          <div class="divide-y divide-gray-50">
            @for (r of rules(); track r.id) {
              <div class="px-5 py-4 flex items-center gap-4">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-800">{{ r.name }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ triggerLabel(r.triggerEvent) }} → {{ actionLabel(r.actionType) }}
                    · {{ r.executionCount }} {{ i18n.t('automations.used_count') }}
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [checked]="r.isActive" (change)="toggle(r)" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-checked:bg-black rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            }
          </div>
        } @else {
          <div class="px-5 py-12 text-center text-gray-400 text-sm">{{ i18n.t('automations.empty') }}</div>
        }
      </div>

      <!-- Create modal -->
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showCreate.set(false)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ i18n.t('automations.new_rule') }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.name') }}</label>
                <input type="text" [(ngModel)]="newRule.name" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('automations.trigger') }}</label>
                <select [(ngModel)]="newRule.triggerEvent" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="application.new">{{ i18n.t('automations.trigger.new_app') }}</option>
                  <option value="application.status_changed">{{ i18n.t('automations.trigger.status_changed') }}</option>
                  <option value="vacancy.expired">{{ i18n.t('automations.trigger.expired') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('automations.action') }}</label>
                <select [(ngModel)]="newRule.actionType" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="AUTO_VIEW">{{ i18n.t('automations.action.view') }}</option>
                  <option value="AUTO_MESSAGE">{{ i18n.t('automations.action.message') }}</option>
                  <option value="AUTO_REJECT">{{ i18n.t('automations.action.reject') }}</option>
                </select>
              </div>
              <div class="flex gap-2 justify-end pt-2">
                <button (click)="showCreate.set(false)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">{{ i18n.t('common.cancel') }}</button>
                <button (click)="create()" [disabled]="!newRule.name" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">{{ i18n.t('common.create') }}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AutomationsComponent implements OnInit {
  rules = signal<any[]>([]);
  showCreate = signal(false);
  newRule = { name: '', triggerEvent: 'application.new', actionType: 'AUTO_VIEW', conditions: {}, actionConfig: {} };

  templates = [
    { nameKey: 'automations.template.auto_view', icon: '👁', descriptionKey: 'automations.template.auto_view_desc', triggerEvent: 'application.new', actionType: 'AUTO_VIEW' },
    { nameKey: 'automations.template.message', icon: '💬', descriptionKey: 'automations.template.message_desc', triggerEvent: 'application.new', actionType: 'AUTO_MESSAGE' },
    { nameKey: 'automations.template.expired', icon: '⏰', descriptionKey: 'automations.template.expired_desc', triggerEvent: 'vacancy.expired', actionType: 'AUTO_REJECT' },
  ];

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${environment.apiUrl}/employer/automations`).subscribe({
      next: (r: any) => this.rules.set(r || []),
      error: () => {}
    });
  }

  useTemplate(t: any) {
    this.newRule = { name: this.i18n.t(t.nameKey), triggerEvent: t.triggerEvent, actionType: t.actionType, conditions: {}, actionConfig: {} };
    this.showCreate.set(true);
  }

  create() {
    this.http.post<any>(`${environment.apiUrl}/employer/automations`, this.newRule).subscribe({
      next: () => { this.showCreate.set(false); this.load(); this.newRule = { name: '', triggerEvent: 'application.new', actionType: 'AUTO_VIEW', conditions: {}, actionConfig: {} }; },
      error: () => {}
    });
  }

  toggle(rule: any) {
    this.http.patch<any>(`${environment.apiUrl}/employer/automations/${rule.id}/toggle`, null, { params: { active: (!rule.isActive).toString() } }).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }

  triggerLabel(t: string): string {
    return ({
      'application.new': this.i18n.t('automations.trigger.new_app_short'),
      'application.status_changed': this.i18n.t('automations.trigger.status_changed_short'),
      'vacancy.expired': this.i18n.t('automations.trigger.expired_short')
    } as Record<string, string>)[t] || t;
  }
  actionLabel(a: string): string {
    return ({
      AUTO_VIEW: this.i18n.t('automations.action.view'),
      AUTO_MESSAGE: this.i18n.t('automations.action.message'),
      AUTO_REJECT: this.i18n.t('automations.action.reject')
    } as Record<string, string>)[a] || a;
  }
}
