import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { PublicApiService } from '../../core/services/public-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'vjw-public-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />
    <div class="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <h1 class="text-xl font-bold text-gray-900 mb-4">{{ i18n.t('favorites.title') }}</h1>

      @if (!candidateId) {
        <div class="text-center py-16 text-gray-400">
          <div class="text-4xl mb-3">&#9825;</div>
          <p class="text-sm mb-2">Saqlangan vakansiyalarni ko'rish uchun avval ariza topshiring</p>
          <p class="text-xs text-gray-400 mb-4">Ariza topshirganingizda profilingiz avtomatik yaratiladi</p>
          <a routerLink="/jobs" class="text-sm text-black hover:underline">{{ i18n.t('vacancies.view_all') }} &rarr;</a>
        </div>
      } @else if (vacancies().length) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (v of vacancies(); track v.id) {
            <div class="bg-white rounded-xl border border-gray-100 p-4 group relative">
              <button (click)="removeFavorite(v.id)" class="absolute top-3 right-3 text-red-400 hover:text-red-600 text-lg">&#9829;</button>
              <a [routerLink]="['/jobs', v.slug || v.id]">
                @if (v.salaryFrom) {
                  <div class="text-lg font-bold text-gray-900 mb-1">
                    {{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }}
                    <span class="text-xs font-normal text-gray-400">UZS</span>
                  </div>
                }
                <h3 class="text-sm font-semibold text-gray-800 group-hover:text-black truncate">{{ v.title }}</h3>
                <div class="text-xs text-gray-400 mt-0.5">{{ v.employerName }}</div>
                <div class="text-xs text-gray-400 mt-2">{{ v.city }}</div>
              </a>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-16 text-gray-400">
          <div class="text-4xl mb-3">&#9825;</div>
          <p class="text-sm mb-4">{{ i18n.t('favorites.empty') }}</p>
          <a routerLink="/jobs" class="text-sm text-black hover:underline">{{ i18n.t('vacancies.view_all') }} &rarr;</a>
        </div>
      }
    </div>
    <vjw-public-footer />
  `,
})
export class PublicFavoritesComponent implements OnInit {
  vacancies = signal<any[]>([]);
  candidateId: string | null = null;

  constructor(private api: PublicApiService, private seo: SeoService, public i18n: I18nService) {}

  ngOnInit() {
    this.seo.setPage({
      title: 'Saved vacancies',
      description: 'Private saved vacancies for the current candidate profile on Verifix Jobs.',
      path: '/favorites',
      noindex: true
    });
    this.candidateId = localStorage.getItem('vjw_candidate_id');
    if (!this.candidateId) {
      return;
    }
    this.loadFavorites();
  }

  loadFavorites() {
    if (!this.candidateId) {
      return;
    }
    this.api.getFavorites(this.candidateId).subscribe({
      next: (response: any) => this.vacancies.set(response.content || []),
      error: () => {}
    });
  }

  removeFavorite(vacancyId: string) {
    if (!this.candidateId) {
      return;
    }
    this.api.removeFavorite(this.candidateId, vacancyId).subscribe({
      next: () => this.vacancies.update(list => list.filter(v => v.id !== vacancyId)),
      error: () => {}
    });
  }

  fmt(n: number): string {
    return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`;
  }
}
