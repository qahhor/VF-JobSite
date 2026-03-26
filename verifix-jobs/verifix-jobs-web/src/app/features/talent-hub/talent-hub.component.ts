import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'vjw-talent-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Talent Hub</h1>
        <p class="text-sm text-gray-400 mt-1">Qayta foydalanish uchun nomzodlar bazasi — barcha vakansiyalar bo'ylab</p>
      </div>

      <!-- Search -->
      <div class="flex gap-2">
        <input type="text" [(ngModel)]="query" placeholder="Nomzod qidirish (ism, kasb, shahar)..."
               class="flex-1 h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-black outline-none"
               (keyup.enter)="search()">
        <button (click)="search()" class="h-11 px-6 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Qidirish</button>
      </div>

      <!-- Talent lists -->
      <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button (click)="activeList.set('all')" class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
                [class]="activeList() === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'">
          Barchasi ({{ candidates().length }})
        </button>
        <button (click)="activeList.set('shortlisted')" class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
                [class]="activeList() === 'shortlisted' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'">
          ⭐ Tanlangan ({{ shortlisted().length }})
        </button>
        <button (click)="activeList.set('hired')" class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
                [class]="activeList() === 'hired' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'">
          ✅ Yollangan ({{ hired().length }})
        </button>
      </div>

      <!-- Candidate cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        @for (c of filteredCandidates(); track c.id) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold">
                {{ (c.firstName || '?').charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-gray-800 truncate">{{ c.firstName }} {{ c.lastName }}</div>
                <div class="text-xs text-gray-400">{{ c.city || '' }} @if (c.phone) { · {{ c.phone }} }</div>
              </div>
              @if (c.matchScore) {
                <div class="text-sm font-bold" [class]="c.matchScore >= 70 ? 'text-green-600' : c.matchScore >= 40 ? 'text-yellow-600' : 'text-gray-400'">
                  {{ c.matchScore }}%
                </div>
              }
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-1 mb-3">
              @if (c.myidStatus === 'VERIFIED') { <span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full">✅ MyID</span> }
              @if (c.skills?.length) {
                @for (s of c.skills.slice(0, 3); track s) {
                  <span class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{{ s }}</span>
                }
              }
            </div>

            <div class="flex gap-2 pt-3 border-t border-gray-100">
              <button (click)="toggleShortlist(c)" class="flex-1 h-8 text-xs font-medium rounded-lg border transition"
                      [class]="isShortlisted(c.id) ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'text-gray-600 border-gray-200 hover:bg-gray-50'">
                {{ isShortlisted(c.id) ? '⭐ Tanlangan' : '☆ Tanlash' }}
              </button>
              <button (click)="inviteToVacancy(c)" class="flex-1 h-8 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition">
                📨 Taklif
              </button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12 text-gray-400 text-sm">
            @if (searched()) { Nomzodlar topilmadi } @else { Qidiruv so'rovini kiriting }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`]
})
export class TalentHubComponent implements OnInit {
  candidates = signal<any[]>([]);
  shortlisted = signal<any[]>([]);
  hired = signal<any[]>([]);
  activeList = signal('all');
  query = '';
  searched = signal(false);
  private shortlistIds = new Set<string>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    const saved = localStorage.getItem('vjw_talent_shortlist');
    if (saved) { this.shortlistIds = new Set(JSON.parse(saved)); }
  }

  search() {
    if (!this.query.trim()) return;
    this.searched.set(true);
    this.api.searchCandidates(this.query).subscribe({
      next: (r: any) => {
        const all = r.content || [];
        this.candidates.set(all);
        this.shortlisted.set(all.filter((c: any) => this.shortlistIds.has(c.id)));
      },
      error: () => {}
    });
  }

  filteredCandidates(): any[] {
    const list = this.activeList();
    if (list === 'shortlisted') return this.candidates().filter(c => this.shortlistIds.has(c.id));
    if (list === 'hired') return []; // TODO: from applications with HIRED status
    return this.candidates();
  }

  isShortlisted(id: string): boolean { return this.shortlistIds.has(id); }

  toggleShortlist(c: any) {
    if (this.shortlistIds.has(c.id)) { this.shortlistIds.delete(c.id); }
    else { this.shortlistIds.add(c.id); }
    localStorage.setItem('vjw_talent_shortlist', JSON.stringify([...this.shortlistIds]));
    this.shortlisted.set(this.candidates().filter(x => this.shortlistIds.has(x.id)));
  }

  inviteToVacancy(c: any) {
    // TODO: open invite modal with vacancy selection
  }
}
