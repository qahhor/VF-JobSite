import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PublicApiService, PublicCompany, PublicVacancy } from '../../core/services/public-api.service';

@Component({
  selector: 'vjw-public-company-detail',
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

    @if (loading()) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="animate-pulse space-y-4">
          <div class="h-32 bg-gray-200 rounded-xl"></div>
          <div class="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    } @else if (company()) {
      <div class="bg-[#FFFFFF] min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- Breadcrumbs -->
          <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <a routerLink="/" class="hover:text-[#000000]">Bosh sahifa</a>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <a routerLink="/companies" class="hover:text-[#000000]">Kompaniyalar</a>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <span class="text-gray-800 font-medium">{{ company()!.name }}</span>
          </nav>

          <!-- Company Header -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
            <div class="flex flex-col sm:flex-row items-start gap-6">
              <div class="w-20 h-20 bg-[#000000]/10 rounded-2xl flex items-center justify-center text-[#000000] font-bold text-3xl shrink-0">
                @if (company()!.logo) {
                  <img [src]="company()!.logo" [alt]="company()!.name" class="w-full h-full object-cover rounded-2xl" />
                } @else {
                  {{ company()!.name.charAt(0) }}
                }
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ company()!.name }}</h1>
                  @if (company()!.isVerified) {
                    <span class="inline-flex items-center gap-1 bg-[#000000]/10 text-[#000000] text-xs font-medium px-2.5 py-1 rounded-full">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Tasdiqlangan
                    </span>
                  }
                </div>
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    {{ company()!.industry }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ company()!.city }}
                  </span>
                  @if (company()!.size) {
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ company()!.size }} xodim
                    </span>
                  }
                  @if (company()!.foundedYear) {
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {{ company()!.foundedYear }}-yildan beri
                    </span>
                  }
                </div>
                @if (company()!.website) {
                  <a [href]="company()!.website" target="_blank" rel="noopener"
                     class="inline-flex items-center gap-1 text-[#000000] text-sm font-medium hover:underline mt-3">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    {{ company()!.website }}
                  </a>
                }
              </div>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Main content -->
            <div class="flex-1 space-y-6">
              <!-- About -->
              @if (company()!.about) {
                <div class="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 class="text-lg font-semibold text-gray-800 mb-3">Kompaniya haqida</h2>
                  <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{{ company()!.about }}</p>
                </div>
              }

              <!-- Open vacancies -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-semibold text-gray-800">Ochiq vakansiyalar ({{ companyVacancies().length }})</h2>
                </div>
                @if (loadingVacancies()) {
                  <div class="space-y-4">
                    @for (i of [1,2,3]; track i) {
                      <div class="bg-white border border-gray-200 rounded-xl h-28 animate-pulse"></div>
                    }
                  </div>
                } @else if (companyVacancies().length === 0) {
                  <div class="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <p class="text-gray-500 text-sm">Hozircha ochiq vakansiya yo'q</p>
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (v of companyVacancies(); track v.id) {
                      <a [routerLink]="['/jobs', v.slug || v.id]"
                         class="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#000000]/20 transition-all">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 class="font-semibold text-gray-800 hover:text-[#000000] text-sm">{{ v.title }}</h3>
                            <div class="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                              <span class="inline-flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {{ v.city }}
                              </span>
                              <span class="inline-flex items-center gap-1">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {{ getEmploymentLabel(v.employmentType) }}
                              </span>
                            </div>
                          </div>
                          <div class="text-right shrink-0">
                            @if (v.salaryFrom || v.salaryTo) {
                              <div class="text-[#333333] font-semibold text-sm">
                                @if (v.salaryFrom && v.salaryTo) {
                                  {{ formatSalary(v.salaryFrom) }} - {{ formatSalary(v.salaryTo) }} {{ v.currency || 'UZS' }}
                                } @else if (v.salaryFrom) {
                                  {{ formatSalary(v.salaryFrom) }}+ {{ v.currency || 'UZS' }}
                                } @else {
                                  {{ formatSalary(v.salaryTo!) }} gacha {{ v.currency || 'UZS' }}
                                }
                              </div>
                            } @else {
                              <div class="text-gray-400 text-sm">Kelishiladi</div>
                            }
                          </div>
                        </div>
                      </a>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:w-80 shrink-0 space-y-6">
              <!-- Quick info card -->
              <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-800 mb-4">Tezkor ma'lumot</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Soha</span>
                    <span class="text-gray-800 font-medium">{{ company()!.industry }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Shahar</span>
                    <span class="text-gray-800 font-medium">{{ company()!.city }}</span>
                  </div>
                  @if (company()!.size) {
                    <div class="flex justify-between">
                      <span class="text-gray-500">Xodimlar soni</span>
                      <span class="text-gray-800 font-medium">{{ company()!.size }}</span>
                    </div>
                  }
                  <div class="flex justify-between">
                    <span class="text-gray-500">Ochiq vakansiyalar</span>
                    <span class="text-[#333333] font-medium">{{ company()!.vacancyCount }}</span>
                  </div>
                </div>
              </div>

              <!-- Map placeholder -->
              <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="font-semibold text-gray-800 mb-4">Joylashuv</h3>
                <div class="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
                  <div class="text-center">
                    <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="text-xs text-gray-400">{{ company()!.city }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Kompaniya topilmadi</h2>
        <a routerLink="/companies" class="text-[#000000] hover:underline">Barcha kompaniyalarga qaytish</a>
      </div>
    }
  `,
})
export class PublicCompanyDetailComponent implements OnInit {
  company = signal<PublicCompany | null>(null);
  companyVacancies = signal<PublicVacancy[]>([]);
  loading = signal(true);
  loadingVacancies = signal(true);

  constructor(
    private publicApi: PublicApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadCompany(slug);
        this.loadVacancies(slug);
      }
    });
  }

  private loadCompany(slug: string) {
    this.loading.set(true);
    this.publicApi.getCompany(slug).subscribe({
      next: (c) => {
        this.company.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.company.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadVacancies(slug: string) {
    this.loadingVacancies.set(true);
    this.publicApi.getCompanyVacancies(slug).subscribe({
      next: (res) => {
        this.companyVacancies.set(res.content);
        this.loadingVacancies.set(false);
      },
      error: () => this.loadingVacancies.set(false),
    });
  }

  formatSalary(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' mln';
    return amount.toLocaleString('uz');
  }

  getEmploymentLabel(type: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'To\'liq stavka', PART_TIME: 'Yarim stavka',
      SHIFT: 'Smenali', TEMPORARY: 'Vaqtinchalik',
    };
    return map[type] || type;
  }
}
