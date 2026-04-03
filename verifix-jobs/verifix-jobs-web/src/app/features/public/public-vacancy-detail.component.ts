import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { PublicApplyModalComponent } from './public-apply-modal.component';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'vjw-public-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent, PublicApplyModalComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-8">
      @if (vacancy(); as v) {
        <a routerLink="/jobs" class="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-black mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          {{ i18n.t('public.vacancy.back') }}
        </a>

        @if (v.salaryFrom) {
          <div class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }}
            <span class="text-base font-normal text-gray-400">UZS{{ i18n.t('billing.per_month') }}</span>
          </div>
        }

        <h1 class="text-xl md:text-2xl font-bold text-gray-900 mt-2">{{ v.title }}</h1>
        <a [routerLink]="['/companies', v.employer?.slug || v.employerId]"
           class="text-sm text-gray-500 hover:text-black transition mt-1 inline-block">
          {{ v.employer?.name || v.employerName }}
          @if (v.employerVerified) { <span class="text-green-500 ml-1">&#10003;</span> }
        </a>

        <div class="flex flex-wrap gap-2 mt-4">
          @if (v.city) {
            <span class="inline-flex items-center gap-1 h-8 px-3 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
              {{ v.city }}
            </span>
          }
          @if (v.employmentType) {
            <span class="h-8 px-3 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">{{ empType(v.employmentType) }}</span>
          }
          @if (v.shiftSchedule) {
            <span class="h-8 px-3 bg-amber-50 text-amber-700 rounded-full text-xs font-medium flex items-center">{{ shiftLabel(v.shiftSchedule) }}</span>
          }
          @if (v.positionsCount > 1) {
            <span class="h-8 px-3 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center">{{ v.positionsCount }} {{ i18n.t('public.vacancy.positions_open') }}</span>
          }
        </div>

        @if (salaryInsight(); as insight) {
          <div class="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div class="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">{{ i18n.t('public.vacancy.salary_intelligence') }}</div>
            <div class="text-sm text-emerald-900 font-medium">
              {{ i18n.t('public.vacancy.market_average') }}: {{ fmt(insight.p25 || 0) }} - {{ fmt(insight.p75 || 0) }} {{ insight.currency }}
            </div>
            <div class="text-xs text-emerald-700 mt-1">
              {{ marketPosition(v) }}
              @if (insight.sampleSize) {
                <span> | {{ insight.sampleSize }} {{ i18n.t('public.vacancy.based_on') }}</span>
              }
            </div>
          </div>
        }

        @if (v.description) {
          <div class="mt-6">
            <h2 class="text-base font-semibold text-gray-900 mb-2">{{ i18n.t('jobs.description') }}</h2>
            <div class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ v.description }}</div>
          </div>
        }

        @if (v.branchName || v.branchAddress || v.district) {
          <div class="mt-6">
            <h2 class="text-base font-semibold text-gray-900 mb-2">{{ i18n.t('public.vacancy.branch_location') }}</h2>
            <div class="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 space-y-1">
              @if (v.branchName) { <div><span class="font-medium text-gray-900">{{ i18n.t('public.vacancy.branch') }}:</span> {{ v.branchName }}</div> }
              @if (v.branchAddress) { <div><span class="font-medium text-gray-900">{{ i18n.t('public.vacancy.address') }}:</span> {{ v.branchAddress }}</div> }
              @if (v.district) { <div><span class="font-medium text-gray-900">{{ i18n.t('public.vacancy.district') }}:</span> {{ v.district }}</div> }
            </div>
          </div>
        }

        @if (v.benefits?.length) {
          <div class="mt-6">
            <h2 class="text-base font-semibold text-gray-900 mb-2">{{ i18n.t('jobs.benefits') }}</h2>
            <div class="flex flex-wrap gap-2">
              @for (b of v.benefits; track b) {
                <span class="h-8 px-3 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium flex items-center">&#10003; {{ b }}</span>
              }
            </div>
          </div>
        }

        <a [routerLink]="['/companies', v.employer?.slug || v.employerId]"
           class="block mt-8 bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-lg font-bold shrink-0">
              {{ ((v.employer?.name || v.employerName) || '?').charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-900">{{ v.employer?.name || v.employerName }}</div>
              @if (v.employerIndustry) { <div class="text-xs text-gray-400">{{ v.employerIndustry }}</div> }
              <div class="flex flex-wrap gap-1.5 mt-2">
                @if (v.employerVerified || v.employer?.isVerified) {
                  <span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">{{ i18n.t('public.vacancy.verified') }}</span>
                }
                @if (v.applicationCount != null && v.applicationCount > 20) {
                  <span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{{ v.applicationCount }}+ {{ i18n.t('public.vacancy.applications_count') }}</span>
                }
                @if (v.employer?.activeVacancies > 3) {
                  <span class="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">{{ v.employer.activeVacancies }} {{ i18n.t('common.vacancies') }}</span>
                }
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </a>

        @if (similarVacancies().length) {
          <div class="mt-8">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-semibold text-gray-900">{{ i18n.t('public.vacancy.similar') }}</h2>
              <a routerLink="/jobs" class="text-xs text-gray-500 hover:text-black">{{ i18n.t('jobs.view_all') }}</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (item of similarVacancies(); track item.id) {
                <a [routerLink]="['/jobs', item.slug || item.id]"
                   class="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition">
                  <div class="text-base font-semibold text-gray-900">{{ item.title }}</div>
                  <div class="text-sm text-gray-500 mt-1">{{ item.employer?.name || item.employerName }}</div>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-3">
                    @if (item.salaryFrom) {
                      <span class="text-gray-800 font-medium">{{ fmt(item.salaryFrom) }}{{ item.salaryTo ? ' - ' + fmt(item.salaryTo) : '+' }} UZS</span>
                    }
                    @if (item.city) { <span>{{ item.city }}</span> }
                    @if (item.shiftSchedule) { <span>{{ shiftLabel(item.shiftSchedule) }}</span> }
                  </div>
                </a>
              }
            </div>
          </div>
        }

        <div class="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-3 z-40 safe-bottom md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
          <div class="max-w-4xl mx-auto flex gap-2 md:max-w-none">
            <button (click)="showApplyModal.set(true)"
                    class="flex-1 h-12 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
              {{ i18n.t('public.vacancy.apply') }}
            </button>
            <button (click)="toggleFavorite()" class="h-12 w-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition shrink-0"
                    [class.text-red-500]="isFavorited()" [class.text-gray-300]="!isFavorited()">
              <span class="text-xl">{{ isFavorited() ? '&#9829;' : '&#9825;' }}</span>
            </button>
            <a href="https://t.me/VerifixJobBot" target="_blank"
               class="h-12 w-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition shrink-0">
              <svg class="w-5 h-5 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-2.01 9.47c-.15.68-.54.84-1.1.53l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.06 5.56-5.02c.24-.22-.05-.34-.38-.13L8.6 14.27l-2.98-.93c-.65-.2-.66-.65.14-.96l11.65-4.49c.54-.2 1.01.13.84.96l-.3 1.28z"/></svg>
            </a>
          </div>
        </div>
      } @else {
        @if (notFound()) {
          <div class="text-center py-20">
            <div class="text-4xl mb-3">404</div>
            <div class="text-lg font-semibold text-gray-800">{{ i18n.t('public.vacancy.not_found') }}</div>
            <div class="text-sm text-gray-400 mt-2">{{ i18n.t('public.vacancy.not_found_desc') }}</div>
            <a routerLink="/jobs" class="inline-flex mt-4 h-10 px-6 bg-black text-white rounded-lg text-sm font-medium items-center hover:bg-gray-800">{{ i18n.t('public.vacancy.back_to_jobs') }}</a>
          </div>
        } @else {
          <div class="text-center py-20 text-gray-400 text-sm">{{ i18n.t('common.loading') }}</div>
        }
      }
    </div>

    @if (showApplyModal()) {
      <vjw-public-apply-modal
        [vacancyId]="vacancy()?.id || vacancy()?.slug || ''"
        [vacancyTitle]="vacancy()?.title || ''"
        (closed)="showApplyModal.set(false)" />
    }

    <vjw-public-footer />
  `,
  styles: [`.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }`]
})
export class PublicVacancyDetailComponent implements OnInit {
  vacancy = signal<any>(null);
  salaryInsight = signal<any>(null);
  similarVacancies = signal<any[]>([]);
  showApplyModal = signal(false);
  isFavorited = signal(false);
  notFound = signal(false);

  constructor(private api: PublicApiService, private route: ActivatedRoute, private seo: SeoService, public i18n: I18nService) {}

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.api.getVacancy(slug).subscribe({
      next: (v: any) => {
        this.vacancy.set(v);
        this.updateSeo(v);
        this.checkFavorite(v.id);
        if (v.category) {
          this.api.getSalaryMarket(v.category, v.city).subscribe({
            next: (insight: any) => this.salaryInsight.set(insight),
            error: () => {}
          });
        }
        this.api.getSimilarVacancies(v.slug || v.id, 4).subscribe({
          next: (items: any[]) => this.similarVacancies.set(items || []),
          error: () => {}
        });
      },
      error: () => {
        this.notFound.set(true);
        this.seo.setPage({
          title: this.i18n.t('public.vacancy.not_found'),
          description: this.i18n.t('public.vacancy.not_found_desc'),
          path: `/jobs/${slug}`,
          noindex: true
        });
      }
    });
  }

  private checkFavorite(vacancyId: string) {
    const candidateId = localStorage.getItem('vjw_candidate_id');
    if (!candidateId) {
      return;
    }
    this.api.getFavorites(candidateId).subscribe({
      next: (response: any) => {
        const ids = (response.content || []).map((item: any) => item.id);
        this.isFavorited.set(ids.includes(vacancyId));
      },
      error: () => {}
    });
  }

  toggleFavorite() {
    const candidateId = localStorage.getItem('vjw_candidate_id');
    const currentVacancy = this.vacancy();
    if (!candidateId || !currentVacancy) {
      return;
    }
    if (this.isFavorited()) {
      this.api.removeFavorite(candidateId, currentVacancy.id).subscribe({ next: () => this.isFavorited.set(false), error: () => {} });
    } else {
      this.api.addFavorite(candidateId, currentVacancy.id).subscribe({ next: () => this.isFavorited.set(true), error: () => {} });
    }
  }

  marketPosition(v: any): string {
    const insight = this.salaryInsight();
    if (!v?.salaryFrom || !insight?.median) {
      return '';
    }
    if (v.salaryFrom >= insight.p75) {
      return this.i18n.t('public.vacancy.market_above');
    }
    if (v.salaryFrom >= insight.median) {
      return this.i18n.t('public.vacancy.market_mid');
    }
    return this.i18n.t('public.vacancy.market_below');
  }

  shiftLabel(value: string): string {
    return ({
      MORNING: this.i18n.t('shift.morning_full'),
      EVENING: this.i18n.t('shift.evening_full'),
      NIGHT: this.i18n.t('shift.night_full'),
      FLEXIBLE: this.i18n.t('shift.flexible_full')
    } as Record<string, string>)[value] || value;
  }

  fmt(n: number): string {
    return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n;
  }

  empType(t: string): string {
    return ({
      FULL_TIME: this.i18n.t('employment.full_time'),
      PART_TIME: this.i18n.t('employment.part_time'),
      CONTRACT: this.i18n.t('employment.contract'),
      TEMPORARY: this.i18n.t('employment.temporary')
    } as Record<string, string>)[t] || t;
  }

  private updateSeo(v: any) {
    const companyName = v.employer?.name || v.employerName || 'Employer';
    const companyPath = `/companies/${v.employer?.slug || v.employerId}`;
    const salary = v.salaryFrom
      ? `${this.fmt(v.salaryFrom)}${v.salaryTo ? ' - ' + this.fmt(v.salaryTo) : '+'} ${v.currency || 'UZS'}`
      : '';
    const description = [
      `${v.title}${v.city ? ` in ${v.city}` : ''}`,
      companyName,
      salary ? `Salary: ${salary}` : '',
      v.description || ''
    ].filter(Boolean).join('. ');
    const vacancyPath = `/jobs/${v.slug || v.id}`;
    const jobPosting: any = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: v.title,
      description,
      datePosted: v.createdAt,
      validThrough: v.expiresAt,
      employmentType: v.employmentType,
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: v.city,
          streetAddress: v.branchAddress || undefined,
          addressCountry: 'UZ'
        }
      },
      hiringOrganization: {
        '@type': 'Organization',
        name: companyName,
        url: this.seo.absoluteUrl(companyPath)
      },
      url: this.seo.absoluteUrl(vacancyPath)
    };
    if (v.salaryFrom) {
      jobPosting.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: v.currency || 'UZS',
        value: {
          '@type': 'QuantitativeValue',
          minValue: v.salaryFrom,
          maxValue: v.salaryTo || v.salaryFrom,
          unitText: 'MONTH'
        }
      };
    }

    this.seo.setPage({
      title: [v.title, v.city].filter(Boolean).join(' in '),
      description,
      path: vacancyPath,
      type: 'article',
      keywords: [v.title, v.category, v.city, companyName].filter(Boolean),
      schema: [
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Jobs', path: '/jobs' },
          ...(v.city ? [{ name: v.city, path: `/vacancies/${encodeURIComponent(v.city)}` }] : []),
          { name: v.title, path: vacancyPath }
        ]),
        jobPosting,
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: companyName,
          url: this.seo.absoluteUrl(companyPath)
        }
      ]
    });
  }
}
