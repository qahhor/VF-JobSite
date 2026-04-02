import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { Candidate } from '../../core/models';

@Component({
  selector: 'vjw-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold text-gray-800">Nomzodlar bazasi</h1>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
        <input type="text" [(ngModel)]="query" (keyup.enter)="search()" placeholder="Ism, kasb, shahar bo'yicha qidirish..."
               class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-primary outline-none">
        <button (click)="search()" class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">Qidirish</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (c of candidates(); track c.id) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-black text-lg font-bold">
                {{ c.firstName?.charAt(0) || '?' }}
              </div>
              <div>
                <div class="font-medium text-gray-800">{{ c.firstName }} {{ c.lastName }}</div>
                <div class="text-xs text-gray-400">{{ c.city || 'Shahar noma\\'lum' }}</div>
              </div>
              @if (c.matchScore) {
                <div class="ml-auto text-right">
                  <div class="text-lg font-bold" [class]="c.matchScore >= 0.7 ? 'text-green-600' : c.matchScore >= 0.4 ? 'text-yellow-600' : 'text-gray-400'">
                    {{ (c.matchScore * 100).toFixed(0) }}%
                  </div>
                  <div class="text-xs text-gray-400">mos</div>
                </div>
              }
            </div>
            <!-- Activity badges -->
            <div class="flex flex-wrap items-center gap-1.5 mb-3">
              @if (c.myidStatus === 'VERIFIED') {
                <span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">✅ MyID</span>
              }
              @if (c.lastActiveAt && isRecentlyActive(c.lastActiveAt)) {
                <span class="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">🟢 Faol</span>
              }
              @if (c.matchScore && c.matchScore >= 0.8) {
                <span class="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">⭐ Ajoyib moslik</span>
              } @else if (c.matchScore && c.matchScore >= 0.6) {
                <span class="text-[10px] px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full font-medium">👍 Yaxshi moslik</span>
              }
              @if (c.educationLevel) {
                <span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">🎓 {{ c.educationLevel }}</span>
              }
            </div>
            @if (c.skills?.length) {
              <div class="flex flex-wrap gap-1 mb-3">
                @for (s of c.skills.slice(0, 4); track s) {
                  <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{{ s }}</span>
                }
                @if (c.skills.length > 4) {
                  <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded">+{{ c.skills.length - 4 }}</span>
                }
              </div>
            }
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <span class="text-xs text-gray-400">{{ c.phone }}</span>
              <button (click)="invite(c)" class="text-sm text-black hover:underline">Taklif qilish</button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-16 text-center text-gray-400">
            @if (searched()) { Nomzodlar topilmadi } @else { Qidiruv so'rovini kiriting }
          </div>
        }
      </div>

      <!-- Invite modal -->
      @if (inviteCandidate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="inviteCandidate.set(null)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ inviteCandidate()!.firstName }} ga taklif</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vakansiya</label>
                <select [(ngModel)]="inviteVacancyId" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm">
                  <option value="">Vakansiyani tanlang</option>
                  @for (v of vacancyOptions(); track v.id) {
                    <option [value]="v.id">{{ v.title }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Xabar</label>
                <textarea [(ngModel)]="inviteMessage" rows="3" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Qo'shimcha xabar..."></textarea>
              </div>
              @if (inviteError()) {
                <div class="text-sm text-red-600">{{ inviteError() }}</div>
              }
              <div class="flex gap-2 justify-end">
                <button (click)="inviteCandidate.set(null)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">Bekor</button>
                <button (click)="sendInvite()" [disabled]="!inviteVacancyId" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">Yuborish</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CandidatesComponent implements OnInit {
  query = '';
  candidates = signal<Candidate[]>([]);
  searched = signal(false);
  inviteCandidate = signal<Candidate | null>(null);
  inviteError = signal('');
  inviteVacancyId = '';
  inviteMessage = '';
  vacancyOptions = signal<any[]>([]);

  constructor(private api: ApiService, private http: HttpClient) {}

  ngOnInit() {
    this.api.getVacancies(0, 100).subscribe({
      next: (r: any) => this.vacancyOptions.set(r.content || []),
      error: () => {}
    });
  }

  search() {
    if (!this.query.trim()) return;
    this.searched.set(true);
    this.api.searchCandidates(this.query).subscribe({
      next: (r: any) => this.candidates.set(r.content || []),
      error: () => {}
    });
  }

  invite(c: Candidate) {
    this.inviteCandidate.set(c);
    this.inviteError.set('');
    this.inviteVacancyId = '';
    this.inviteMessage = '';
  }

  sendInvite() {
    const c = this.inviteCandidate();
    if (!c || !this.inviteVacancyId) return;
    this.inviteError.set('');
    this.http.post<any>(`${environment.apiUrl}/applications/invite`, {
      candidateId: c.id,
      vacancyId: this.inviteVacancyId,
      note: this.inviteMessage
    }).subscribe({
      next: () => { this.inviteCandidate.set(null); },
      error: () => { this.inviteError.set('Taklif yuborilmadi. Vakansiya va nomzod maʼlumotlarini tekshiring.'); }
    });
  }

  isRecentlyActive(dateStr: string): boolean {
    if (!dateStr) return false;
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // 7 days
  }
}
