import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vjw-ai-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">🤖 Verifix Hiring Agent</h1>
        <p class="text-sm text-gray-400 mt-1">AI-yordamchi — nomzodlarni qidirish, tahlil qilish va taklif qilish</p>
      </div>

      <!-- Agent modules toggle -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Agent modullari</h3>
        <div class="space-y-4">
          @for (mod of agentModules; track mod.key) {
            <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ mod.icon }}</span>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ mod.name }}</div>
                  <div class="text-xs text-gray-400">{{ mod.description }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                @if (mod.key === 'human_review') {
                  <span class="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">Har doim ON</span>
                } @else {
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" [(ngModel)]="mod.enabled" (ngModelChange)="saveModules()" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-checked:bg-black rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Agent stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of agentStats(); track stat.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ stat.label }}</div>
          </div>
        }
      </div>

      <!-- AI Vacancy Generator -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">✨ AI bilan vakansiya yaratish</h3>
        <div class="space-y-3">
          <textarea [(ngModel)]="aiInput" rows="3"
                    placeholder="Vakansiyani tavsiflab bering, masalan: Toshkentda tajribali oshpaz kerak, maosh 5 mln, ovqat va transport bilan..."
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-black outline-none"></textarea>
          <div class="flex gap-2">
            <button (click)="generateVacancy()" [disabled]="!aiInput.trim() || generating()"
                    class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
              {{ generating() ? '⏳ Yaratilmoqda...' : '✨ AI yaratsin' }}
            </button>
          </div>
        </div>

        @if (generatedResult()) {
          <div class="mt-4 bg-gray-50 rounded-xl p-4">
            <h4 class="text-sm font-semibold text-gray-800 mb-2">Natija:</h4>
            <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ generatedResult() | json }}</pre>
            <a routerLink="/employer/vacancies/new" class="inline-flex mt-3 h-9 px-4 bg-black text-white rounded-lg text-xs font-medium items-center hover:bg-gray-800">
              Vakansiya yaratish →
            </a>
          </div>
        }
      </div>

      <!-- Recent AI actions log -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">📋 AI faoliyat jurnali</h3>
        @if (aiLog().length) {
          <div class="space-y-2">
            @for (entry of aiLog(); track entry.id) {
              <div class="flex items-center gap-3 py-2 border-b border-gray-50">
                <span class="text-lg">{{ actionIcon(entry.action) }}</span>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-800">{{ entry.description }}</div>
                  <div class="text-xs text-gray-400">{{ entry.timestamp | date:'dd.MM HH:mm' }}</div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [class]="entry.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'">
                  {{ entry.status }}
                </span>
              </div>
            }
          </div>
        } @else {
          <div class="text-sm text-gray-400 py-4">AI agent hali ishlamagan. Modullarni yoqing va vakansiya yarating.</div>
        }
      </div>
    </div>
  `,
})
export class AiAgentComponent implements OnInit {
  aiInput = '';
  generating = signal(false);
  generatedResult = signal<any>(null);
  agentStats = signal<{value: string|number; label: string}[]>([]);
  aiLog = signal<any[]>([]);

  agentModules = [
    { key: 'ai_search', icon: '🔍', name: 'AI Search', description: 'Bazada nomzodlarni avtomatik qidirish', enabled: true },
    { key: 'ai_invite', icon: '📨', name: 'AI Invite', description: 'Telegram/SMS orqali taklif yuborish', enabled: false },
    { key: 'ai_screen', icon: '🤖', name: 'AI Screen', description: 'Chatbot orqali skoring savollar', enabled: false },
    { key: 'ai_shortlist', icon: '⭐', name: 'AI Shortlist', description: 'Shortlist avtomatik yaratish', enabled: true },
    { key: 'human_review', icon: '👤', name: 'Human Review', description: 'HR tasdiqlashi (har doim kerak)', enabled: true },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
    this.loadLog();
    const saved = localStorage.getItem('vjw_ai_modules');
    if (saved) {
      const prefs = JSON.parse(saved);
      this.agentModules.forEach(m => { if (prefs[m.key] !== undefined) m.enabled = prefs[m.key]; });
    }
  }

  saveModules() {
    const prefs: Record<string, boolean> = {};
    this.agentModules.forEach(m => prefs[m.key] = m.enabled);
    localStorage.setItem('vjw_ai_modules', JSON.stringify(prefs));
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/analytics/overview`).subscribe({
      next: (d: any) => {
        this.agentStats.set([
          { value: d.totalApplications || 0, label: 'Tahlil qilingan' },
          { value: d.hiredCount || 0, label: 'Yollangan' },
          { value: d.newApplications || 0, label: 'Yangi arizalar' },
          { value: d.activeVacancies || 0, label: 'Faol vakansiyalar' },
        ]);
      },
      error: () => {}
    });
  }

  loadLog() {
    // Load from activity feed
    this.http.get<any>(`${environment.apiUrl}/employer/dashboard/feed?size=10`).subscribe({
      next: (r: any) => {
        const items = (r?.content || []).map((e: any, i: number) => ({
          id: e.id || i, action: e.eventType, description: e.title + (e.description ? ' — ' + e.description : ''),
          timestamp: e.createdAt, status: 'SUCCESS'
        }));
        this.aiLog.set(items);
      },
      error: () => {}
    });
  }

  generateVacancy() {
    if (!this.aiInput.trim()) return;
    this.generating.set(true);
    this.generatedResult.set(null);
    this.http.post<any>(`${environment.apiUrl}/ai/intake/generate`, {
      description: this.aiInput,
      city: this.extractCity(this.aiInput)
    }).subscribe({
      next: (r: any) => { this.generating.set(false); this.generatedResult.set(r); },
      error: () => {
        this.generating.set(false);
        // Fallback: basic parsing
        this.generatedResult.set({
          title: this.aiInput.split(',')[0]?.trim() || 'Vakansiya',
          note: 'AI xizmati hozircha ishlamayapti. Vakansiyani qo\'lda yarating.',
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

  actionIcon(action: string): string {
    return ({
      APPLICATION_NEW: '📨', APPLICATION_HIRED: '✅', VACANCY_APPROVED: '📋',
      AI_SEARCH: '🔍', AI_INVITE: '📨', AI_SCREEN: '🤖', AI_SHORTLIST: '⭐'
    } as Record<string, string>)[action] || '📌';
  }
}
