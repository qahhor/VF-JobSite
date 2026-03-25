import { Component, OnInit, signal, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PublicApiService, PublicVacancy } from '../../core/services/public-api.service';
import { PublicApplyModalComponent } from './public-apply-modal.component';

@Component({
  selector: 'vjw-public-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicApplyModalComponent],
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

    @if (loading()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-8 bg-gray-200 rounded w-2/3"></div>
          <div class="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    } @else if (vacancy()) {
      <div class="bg-[#FFFFFF] min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- Breadcrumbs -->
          <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a routerLink="/" class="hover:text-[#000000]">Bosh sahifa</a>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <a routerLink="/jobs" class="hover:text-[#000000]">Vakansiyalar</a>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <span class="text-gray-800 font-medium truncate max-w-[200px]">{{ vacancy()!.title }}</span>
          </nav>

          <div class="flex flex-col lg:flex-row gap-6">
            <!-- MAIN CONTENT -->
            <div class="flex-1 space-y-6">
              <!-- Header card -->
              <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ vacancy()!.title }}</h1>
                    <a [routerLink]="['/companies', vacancy()!.employerId]" class="text-[#000000] font-medium hover:underline mt-1 inline-block">
                      {{ vacancy()!.employerName }}
                    </a>
                  </div>
                  @if (vacancy()!.isMassHiring) {
                    <span class="shrink-0 bg-[#666666]/10 text-[#666666] text-sm font-medium px-3 py-1 rounded-full">
                      Ommaviy yollash
                    </span>
                  }
                </div>

                <div class="flex flex-wrap gap-3 mb-6">
                  <span class="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ vacancy()!.city }}{{ vacancy()!.region ? ', ' + vacancy()!.region : '' }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ getEmploymentLabel(vacancy()!.employmentType) }}
                  </span>
                  @if (vacancy()!.shiftSchedule) {
                    <span class="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {{ vacancy()!.shiftSchedule }}
                    </span>
                  }
                  <span class="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ vacancy()!.positionsCount }} o'rin
                  </span>
                </div>

                <!-- Salary -->
                <div class="bg-[#333333]/5 border border-[#333333]/20 rounded-xl p-4 mb-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="text-sm text-gray-500 mb-1">Maosh</div>
                      @if (vacancy()!.salaryFrom || vacancy()!.salaryTo) {
                        <div class="text-xl font-bold text-[#333333]">
                          @if (vacancy()!.salaryFrom && vacancy()!.salaryTo) {
                            {{ formatSalary(vacancy()!.salaryFrom!) }} - {{ formatSalary(vacancy()!.salaryTo!) }} {{ vacancy()!.currency || 'UZS' }}
                          } @else if (vacancy()!.salaryFrom) {
                            {{ formatSalary(vacancy()!.salaryFrom!) }}+ {{ vacancy()!.currency || 'UZS' }}
                          } @else {
                            {{ formatSalary(vacancy()!.salaryTo!) }} gacha {{ vacancy()!.currency || 'UZS' }}
                          }
                        </div>
                      } @else {
                        <div class="text-xl font-bold text-gray-500">Kelishiladi</div>
                      }
                    </div>
                    <!-- Market comparison indicator -->
                    @if (vacancy()!.salaryFrom) {
                      <div class="hidden sm:block text-right">
                        <div class="text-xs text-gray-400 mb-1">Bozor o'rtachasi</div>
                        <div class="flex items-center gap-1">
                          <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-[#333333] rounded-full" style="width: 65%"></div>
                          </div>
                          <span class="text-xs text-gray-500">O'rtacha</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <h2 class="text-lg font-semibold text-gray-800 mb-3">Vakansiya haqida</h2>
                  <div class="prose prose-sm max-w-none text-gray-600 whitespace-pre-line leading-relaxed">{{ vacancy()!.description }}</div>
                </div>
              </div>

              <!-- Benefits -->
              @if (vacancy()!.benefits && vacancy()!.benefits.length > 0) {
                <div class="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 class="text-lg font-semibold text-gray-800 mb-4">Imtiyozlar</h2>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (b of vacancy()!.benefits; track b) {
                      <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div class="w-8 h-8 bg-[#333333]/10 rounded-lg flex items-center justify-center shrink-0">
                          <svg class="w-4 h-4 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <span class="text-sm text-gray-700">{{ b }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Share -->
              <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Ulashish</h2>
                <div class="flex gap-3">
                  <button (click)="shareToTelegram()"
                          class="inline-flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0088cc]/20 transition-colors">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </button>
                  <button (click)="copyLink()"
                          class="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                    </svg>
                    {{ linkCopied() ? 'Nusxalandi!' : 'Havolani nusxalash' }}
                  </button>
                </div>
              </div>

              <!-- Similar vacancies -->
              @if (similarVacancies().length > 0) {
                <div>
                  <h2 class="text-lg font-semibold text-gray-800 mb-4">O'xshash vakansiyalar</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @for (sv of similarVacancies(); track sv.id) {
                      <a [routerLink]="['/jobs', sv.slug || sv.id]"
                         class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-[#000000]/20 transition-all">
                        <h3 class="font-semibold text-gray-800 text-sm">{{ sv.title }}</h3>
                        <p class="text-xs text-gray-500 mt-1">{{ sv.employerName }}</p>
                        <div class="flex items-center gap-3 mt-2">
                          <span class="text-xs text-gray-500">{{ sv.city }}</span>
                          @if (sv.salaryFrom) {
                            <span class="text-xs font-medium text-[#333333]">{{ formatSalary(sv.salaryFrom) }}+ {{ sv.currency || 'UZS' }}</span>
                          }
                        </div>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- SIDEBAR -->
            <div class="lg:w-80 shrink-0 space-y-6">
              <!-- Apply button -->
              <div class="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <button (click)="openApplyModal()"
                        class="w-full bg-[#333333] hover:bg-[#27ae60] text-white font-semibold py-3 rounded-xl transition-colors text-base mb-3">
                  Ariza topshirish
                </button>
                <button (click)="toggleFavorite()"
                        class="w-full border border-gray-200 text-gray-600 hover:border-[#666666] hover:text-[#666666] font-medium py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" [attr.fill]="isFavorite() ? '#666666' : 'none'" [attr.stroke]="isFavorite() ? '#666666' : 'currentColor'" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ isFavorite() ? 'Saqlanganlarda' : 'Saqlash' }}
                </button>

                <div class="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">E'lon sanasi</span>
                    <span class="text-gray-800 font-medium">{{ formatDate(vacancy()!.createdAt) }}</span>
                  </div>
                  @if (vacancy()!.expiresAt) {
                    <div class="flex justify-between">
                      <span class="text-gray-500">Muddati</span>
                      <span class="text-gray-800 font-medium">{{ formatDate(vacancy()!.expiresAt) }}</span>
                    </div>
                  }
                  <div class="flex justify-between">
                    <span class="text-gray-500">Holati</span>
                    <span class="text-[#333333] font-medium">Faol</span>
                  </div>
                </div>
              </div>

              <!-- Company card -->
              <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-800 mb-4">Kompaniya haqida</h3>
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-[#000000]/10 rounded-xl flex items-center justify-center text-[#000000] font-bold text-lg">
                    {{ vacancy()!.employerName.charAt(0) }}
                  </div>
                  <div>
                    <a [routerLink]="['/companies', vacancy()!.employerId]" class="font-semibold text-gray-800 hover:text-[#000000] text-sm">
                      {{ vacancy()!.employerName }}
                    </a>
                    @if (vacancy()?.employerVerified) {
                      <div class="flex items-center gap-1 text-xs text-[#000000]">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Tasdiqlangan
                      </div>
                    }
                  </div>
                </div>
                @if (vacancy()?.employerIndustry) {
                  <div class="text-sm text-gray-500 mb-2">
                    <span class="font-medium text-gray-600">Soha:</span> {{ $any(vacancy())?.employerIndustry }}
                  </div>
                }
                @if (vacancy()?.employerSize) {
                  <div class="text-sm text-gray-500 mb-4">
                    <span class="font-medium text-gray-600">Hajmi:</span> {{ $any(vacancy())?.employerSize }}
                  </div>
                }
                <a [routerLink]="['/companies', vacancy()!.employerId]"
                   class="block w-full text-center border border-[#000000] text-[#000000] text-sm font-medium py-2 rounded-lg hover:bg-[#000000]/5 transition-colors">
                  Kompaniya sahifasi
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Vakansiya topilmadi</h2>
        <a routerLink="/jobs" class="text-[#000000] hover:underline">Barcha vakansiyalarga qaytish</a>
      </div>
    }

    <!-- APPLY MODAL -->
    @if (showApplyModal()) {
      <vjw-public-apply-modal
        [vacancyId]="vacancy()?.id || ''"
        [vacancyTitle]="vacancy()?.title || ''"
        (closed)="closeApplyModal()" />
    }
  `,
})
export class PublicVacancyDetailComponent implements OnInit {
  vacancy = signal<PublicVacancy | null>(null);
  similarVacancies = signal<PublicVacancy[]>([]);
  loading = signal(true);
  showApplyModal = signal(false);

  closeApplyModal() { this.showApplyModal.set(false); }
  openApplyModal() { this.showApplyModal.set(true); }
  linkCopied = signal(false);
  private favoriteIds = signal<Set<string>>(new Set());

  constructor(
    private publicApi: PublicApiService,
    private route: ActivatedRoute,
    
    
  ) {}

  ngOnInit() {
    this.loadFavorites();
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) this.loadVacancy(slug);
    });
  }

  private loadVacancy(slug: string) {
    this.loading.set(true);
    this.publicApi.getVacancy(slug).subscribe({
      next: (v) => {
        this.vacancy.set(v);
        this.loading.set(false);
        this.injectJsonLd(v);
        this.loadSimilar(slug);
      },
      error: () => {
        this.vacancy.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadSimilar(slug: string) {
    this.publicApi.getSimilarVacancies(slug).subscribe({
      next: (list) => this.similarVacancies.set(list),
      error: () => {},
    });
  }

  private injectJsonLd(v: PublicVacancy) {
    
    const existing = document.getElementById('vjw-jsonld');
    if (existing) existing.remove();

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: v.title,
      description: v.description,
      datePosted: v.createdAt,
      validThrough: v.expiresAt || undefined,
      employmentType: v.employmentType === 'FULL_TIME' ? 'FULL_TIME' : v.employmentType === 'PART_TIME' ? 'PART_TIME' : 'OTHER',
      hiringOrganization: {
        '@type': 'Organization',
        name: v.employerName,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: v.city,
          addressCountry: 'UZ',
        },
      },
      baseSalary: (v.salaryFrom || v.salaryTo) ? {
        '@type': 'MonetaryAmount',
        currency: v.currency || 'UZS',
        value: {
          '@type': 'QuantitativeValue',
          minValue: v.salaryFrom || undefined,
          maxValue: v.salaryTo || undefined,
          unitText: 'MONTH',
        },
      } : undefined,
    };

    const script = document.createElement('script');
    script.id = 'vjw-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }

  shareToTelegram() {
    
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.vacancy()?.title || '');
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }

  copyLink() {
    
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    });
  }

  toggleFavorite() {
    const v = this.vacancy();
    if (!v) return;
    const favs = new Set(this.favoriteIds());
    if (favs.has(v.id)) favs.delete(v.id);
    else favs.add(v.id);
    this.favoriteIds.set(favs);
    localStorage.setItem('vjw_favorites', JSON.stringify([...favs]));
  }

  isFavorite(): boolean {
    const v = this.vacancy();
    return v ? this.favoriteIds().has(v.id) : false;
  }

  private loadFavorites() {
    try {
      const raw = localStorage.getItem('vjw_favorites');
      if (raw) this.favoriteIds.set(new Set(JSON.parse(raw)));
    } catch {}
  }

  formatSalary(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' mln';
    return amount.toLocaleString('uz');
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('uz-Latn', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  getEmploymentLabel(type: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'To\'liq stavka', PART_TIME: 'Yarim stavka',
      SHIFT: 'Smenali', TEMPORARY: 'Vaqtinchalik',
    };
    return map[type] || type;
  }
}
