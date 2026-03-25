import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicApiService, PublicVacancy } from '../../core/services/public-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'vjw-public-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- NAVBAR -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-9 h-9 bg-[#000000] rounded-lg flex items-center justify-center text-white font-bold text-lg">V</div>
            <span class="font-bold text-xl text-gray-800">Verifix <span class="text-[#000000]">Jobs</span></span>
          </a>
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/jobs" class="text-sm font-medium text-gray-600 hover:text-[#000000]">Vakansiyalar</a>
            <a routerLink="/companies" class="text-sm font-medium text-gray-600 hover:text-[#000000]">Kompaniyalar</a>
            <a routerLink="/login" class="text-sm font-medium text-white bg-[#000000] px-4 py-2 rounded-lg hover:bg-[#154a6e]">Kirish</a>
          </div>
        </div>
      </div>
    </nav>

    <div class="bg-[#FFFFFF] min-h-screen">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Saqlangan vakansiyalar</h1>
            <p class="text-sm text-gray-500 mt-1">{{ vacancies().length }} ta vakansiya saqlangan</p>
          </div>
          @if (vacancies().length > 0) {
            <button (click)="clearAll()"
                    class="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
              Barchasini o'chirish
            </button>
          }
        </div>

        @if (loading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="bg-white border border-gray-200 rounded-xl h-28 animate-pulse"></div>
            }
          </div>
        } @else if (vacancies().length === 0) {
          <div class="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Saqlangan vakansiya yo'q</h3>
            <p class="text-gray-500 text-sm mb-4">Vakansiyalarni saqlash uchun yurak belgisini bosing</p>
            <a routerLink="/jobs" class="inline-flex items-center gap-2 text-[#000000] font-medium text-sm hover:underline">
              Vakansiyalarni ko'rish
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (v of vacancies(); track v.id) {
              <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/jobs', v.slug || v.id]"
                       class="font-semibold text-gray-800 hover:text-[#000000] transition-colors text-sm">
                      {{ v.title }}
                    </a>
                    <p class="text-xs text-gray-500 mt-1">{{ v.employerName }}</p>
                    <div class="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span class="inline-flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {{ v.city }}
                      </span>
                      @if (v.salaryFrom || v.salaryTo) {
                        <span class="text-[#333333] font-medium">
                          @if (v.salaryFrom && v.salaryTo) {
                            {{ formatSalary(v.salaryFrom) }} - {{ formatSalary(v.salaryTo) }} {{ v.currency || 'UZS' }}
                          } @else if (v.salaryFrom) {
                            {{ formatSalary(v.salaryFrom) }}+ {{ v.currency || 'UZS' }}
                          } @else {
                            {{ formatSalary(v.salaryTo!) }} gacha {{ v.currency || 'UZS' }}
                          }
                        </span>
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-3 shrink-0">
                    <a [routerLink]="['/jobs', v.slug || v.id]"
                       class="bg-[#000000] hover:bg-[#154a6e] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      Ko'rish
                    </a>
                    <button (click)="removeFromFavorites(v.id)"
                            class="text-gray-400 hover:text-red-500 transition-colors" title="O'chirish">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class PublicFavoritesComponent implements OnInit {
  vacancies = signal<PublicVacancy[]>([]);
  loading = signal(true);

  constructor(private publicApi: PublicApiService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.loading.set(true);
    try {
      const raw = localStorage.getItem('vjw_favorites');
      if (!raw) {
        this.loading.set(false);
        return;
      }
      const ids: string[] = JSON.parse(raw);
      if (ids.length === 0) {
        this.loading.set(false);
        return;
      }
      // Load each vacancy individually
      const requests = ids.map(id => this.publicApi.getVacancy(id));
      forkJoin(requests).subscribe({
        next: (results) => {
          this.vacancies.set(results);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } catch {
      this.loading.set(false);
    }
  }

  removeFromFavorites(id: string) {
    try {
      const raw = localStorage.getItem('vjw_favorites');
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const updated = ids.filter(fid => fid !== id);
      localStorage.setItem('vjw_favorites', JSON.stringify(updated));
    } catch {}
    this.vacancies.set(this.vacancies().filter(v => v.id !== id));
  }

  clearAll() {
    localStorage.setItem('vjw_favorites', JSON.stringify([]));
    this.vacancies.set([]);
  }

  formatSalary(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' mln';
    return amount.toLocaleString('uz');
  }
}
