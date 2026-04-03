import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-org-memory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">{{ i18n.t('org.title') }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ i18n.t('org.subtitle') }}</p>
      </div>

      <!-- Auto-generated facts -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">📋 {{ i18n.t('org.company_profile') }}</h3>
        @if (profile()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">{{ i18n.t('common.name') }}:</span> <span class="font-medium text-gray-800">{{ profile().name }}</span></div>
            <div><span class="text-gray-400">{{ i18n.t('common.industry') }}:</span> <span class="font-medium text-gray-800">{{ profile().industry || i18n.t('common.not_set') }}</span></div>
            <div><span class="text-gray-400">{{ i18n.t('common.city') }}:</span> <span class="font-medium text-gray-800">{{ profile().city || i18n.t('common.not_set') }}</span></div>
            <div><span class="text-gray-400">{{ i18n.t('settings.status') }}:</span> <span class="font-medium text-gray-800">{{ profile().status }}</span></div>
          </div>
        }
      </div>

      <!-- Memory facts (manual + AI) -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-800">🧠 {{ i18n.t('org.memory_facts') }}</h3>
          <button (click)="showAdd.set(true)" class="text-sm text-black hover:underline">+ {{ i18n.t('org.add_fact') }}</button>
        </div>

        <div class="space-y-2">
          @for (fact of facts(); track fact.id || $index) {
            <div class="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <span class="text-lg mt-0.5">{{ factIcon(fact.category) }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-800">{{ fact.content }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ factCategoryLabel(fact.category) }} · {{ fact.source || i18n.t('org.source.manual') }}</div>
              </div>
              <button (click)="removeFact(fact.id)" class="text-gray-300 hover:text-red-500 text-sm shrink-0">✕</button>
            </div>
          } @empty {
            <div class="text-sm text-gray-400 py-4">{{ i18n.t('org.no_facts') }}</div>
          }
        </div>
      </div>

      <!-- Preset categories -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">📊 {{ i18n.t('org.patterns') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          @for (p of presets; track p.key) {
            <button (click)="addPreset(p)" class="text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition">
              <div class="text-lg mb-1">{{ p.icon }}</div>
              <div class="text-sm font-medium text-gray-800">{{ i18n.t(p.labelKey) }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ i18n.t(p.hintKey) }}</div>
            </button>
          }
        </div>
      </div>

      <!-- Add fact modal -->
      @if (showAdd()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showAdd.set(false)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ i18n.t('org.add_fact') }}</h3>
            <div class="space-y-3">
              <select [(ngModel)]="newFact.category" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="HIRING_PATTERN">{{ i18n.t('org.category.hiring_pattern') }}</option>
                <option value="EVP">{{ i18n.t('org.category.evp_full') }}</option>
                <option value="PREFERENCE">{{ i18n.t('org.category.preference') }}</option>
                <option value="POLICY">{{ i18n.t('org.category.policy') }}</option>
                <option value="NOTE">{{ i18n.t('org.category.note') }}</option>
              </select>
              <textarea [(ngModel)]="newFact.content" rows="3" [placeholder]="i18n.t('org.fact_placeholder')" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"></textarea>
              <div class="flex gap-2 justify-end">
                <button (click)="showAdd.set(false)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">{{ i18n.t('common.cancel') }}</button>
                <button (click)="addFact()" [disabled]="!newFact.content" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">{{ i18n.t('org.add_fact') }}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrgMemoryComponent implements OnInit {
  profile = signal<any>(null);
  facts = signal<any[]>([]);
  showAdd = signal(false);
  newFact = { category: 'HIRING_PATTERN', content: '' };

  presets = [
    { key: 'evp', icon: '💎', labelKey: 'org.preset.evp', hintKey: 'org.preset.evp_hint' },
    { key: 'ideal', icon: '👤', labelKey: 'org.preset.ideal', hintKey: 'org.preset.ideal_hint' },
    { key: 'process', icon: '📋', labelKey: 'org.preset.process', hintKey: 'org.preset.process_hint' },
  ];

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/employer/profile`).subscribe({
      next: (p: any) => this.profile.set(p), error: () => {}
    });
    this.loadFacts();
  }

  loadFacts() {
    this.http.get<any[]>(`${environment.apiUrl}/employer/org-memory`).subscribe({
      next: (facts: any[]) => this.facts.set(facts || []),
      error: () => {}
    });
  }

  addFact() {
    this.http.post<any>(`${environment.apiUrl}/employer/org-memory`, this.newFact).subscribe({
      next: () => { this.showAdd.set(false); this.newFact = { category: 'HIRING_PATTERN', content: '' }; this.loadFacts(); },
      error: () => {}
    });
  }

  addPreset(p: any) {
    this.newFact.category = p.key === 'evp' ? 'EVP' : p.key === 'ideal' ? 'PREFERENCE' : 'POLICY';
    this.newFact.content = '';
    this.showAdd.set(true);
  }

  removeFact(id: string) {
    this.http.delete(`${environment.apiUrl}/employer/org-memory/${id}`).subscribe({
      next: () => this.loadFacts(),
      error: () => {}
    });
  }

  factIcon(cat: string): string {
    return ({ HIRING_PATTERN: '📊', EVP: '💎', PREFERENCE: '👤', POLICY: '📋', NOTE: '📝' } as Record<string, string>)[cat] || '📌';
  }

  factCategoryLabel(cat: string): string {
    return ({
      HIRING_PATTERN: this.i18n.t('org.category.hiring_pattern'),
      EVP: this.i18n.t('org.category.evp'),
      PREFERENCE: this.i18n.t('org.category.preference'),
      POLICY: this.i18n.t('org.category.policy'),
      NOTE: this.i18n.t('org.category.note'),
    } as Record<string, string>)[cat] || cat;
  }
}
