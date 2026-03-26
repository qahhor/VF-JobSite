import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vjw-org-memory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Organization Memory</h1>
        <p class="text-sm text-gray-400 mt-1">AI kompaniya haqida bilgan ma'lumotlar — yollash sifatini oshiradi</p>
      </div>

      <!-- Auto-generated facts -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">📋 Kompaniya profili</h3>
        @if (profile()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">Nomi:</span> <span class="font-medium text-gray-800">{{ profile().name }}</span></div>
            <div><span class="text-gray-400">Soha:</span> <span class="font-medium text-gray-800">{{ profile().industry || '—' }}</span></div>
            <div><span class="text-gray-400">Shahar:</span> <span class="font-medium text-gray-800">{{ profile().city || '—' }}</span></div>
            <div><span class="text-gray-400">Status:</span> <span class="font-medium text-gray-800">{{ profile().status }}</span></div>
          </div>
        }
      </div>

      <!-- Memory facts (manual + AI) -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-800">🧠 Xotira faktlari</h3>
          <button (click)="showAdd.set(true)" class="text-sm text-black hover:underline">+ Fakt qo'shish</button>
        </div>

        <div class="space-y-2">
          @for (fact of facts(); track fact.id || $index) {
            <div class="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <span class="text-lg mt-0.5">{{ factIcon(fact.category) }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-800">{{ fact.content }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ fact.category }} · {{ fact.source || 'Manual' }}</div>
              </div>
              <button (click)="removeFact(fact.id)" class="text-gray-300 hover:text-red-500 text-sm shrink-0">✕</button>
            </div>
          } @empty {
            <div class="text-sm text-gray-400 py-4">Hali faktlar yo'q. Kompaniya haqida ma'lumot qo'shing — AI yollashda ishlatadi.</div>
          }
        </div>
      </div>

      <!-- Preset categories -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">📊 Yollash naqshlari</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          @for (p of presets; track p.key) {
            <button (click)="addPreset(p)" class="text-left p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition">
              <div class="text-lg mb-1">{{ p.icon }}</div>
              <div class="text-sm font-medium text-gray-800">{{ p.label }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ p.hint }}</div>
            </button>
          }
        </div>
      </div>

      <!-- Add fact modal -->
      @if (showAdd()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showAdd.set(false)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Fakt qo'shish</h3>
            <div class="space-y-3">
              <select [(ngModel)]="newFact.category" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="HIRING_PATTERN">Yollash naqshi</option>
                <option value="EVP">Ishga olinish qiymati (EVP)</option>
                <option value="PREFERENCE">Afzallik</option>
                <option value="POLICY">Siyosat</option>
                <option value="NOTE">Izoh</option>
              </select>
              <textarea [(ngModel)]="newFact.content" rows="3" placeholder="Masalan: Biz tajribasiz xodimlarni ham qabul qilamiz, 2 hafta stajdan o'tadi" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"></textarea>
              <div class="flex gap-2 justify-end">
                <button (click)="showAdd.set(false)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">Bekor</button>
                <button (click)="addFact()" [disabled]="!newFact.content" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">Qo'shish</button>
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
    { key: 'evp', icon: '💎', label: 'EVP — nima uchun bizda ishlash yaxshi', hint: 'Kompaniya afzalliklari' },
    { key: 'ideal', icon: '👤', label: 'Ideal nomzod profili', hint: 'Qanday odam kerak' },
    { key: 'process', icon: '📋', label: 'Yollash jarayoni', hint: 'Qadamlar va muddatlar' },
  ];

  constructor(private http: HttpClient) {}

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
}
