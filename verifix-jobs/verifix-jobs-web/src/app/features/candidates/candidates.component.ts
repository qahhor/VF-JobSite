import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
            <div class="flex items-center gap-2 mb-3">
              @if (c.myidStatus === 'VERIFIED') {
                <span class="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Tasdiqlangan</span>
              }
              @if (c.educationLevel) {
                <span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{{ c.educationLevel }}</span>
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
              <button class="text-sm text-black hover:underline">Taklif qilish</button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-16 text-center text-gray-400">
            @if (searched()) { Nomzodlar topilmadi } @else { Qidiruv so'rovini kiriting }
          </div>
        }
      </div>
    </div>
  `,
})
export class CandidatesComponent {
  query = '';
  candidates = signal<Candidate[]>([]);
  searched = signal(false);

  constructor(private api: ApiService) {}

  search() {
    if (!this.query.trim()) return;
    this.searched.set(true);
    this.api.searchCandidates(this.query).subscribe(r => this.candidates.set(r.content));
  }
}
