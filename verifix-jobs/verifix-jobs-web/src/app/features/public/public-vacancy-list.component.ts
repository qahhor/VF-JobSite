import { CommonModule } from '@angular/common';
import { Component, DoCheck, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'vjw-public-vacancy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-7xl mx-auto px-4 pt-4 pb-20 md:pb-8">
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ pageTitle() }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ pageSubtitle() }}</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-2 mb-4">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="query"
            [placeholder]="i18n.t('filter.search_placeholder')"
            class="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
            (keyup.enter)="search()">
        </div>
        <button
          (click)="search()"
          class="h-12 px-6 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
          {{ i18n.t('filter.find') }}
        </button>
      </div>

      <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-2">
          <input
            type="number"
            [(ngModel)]="salaryMin"
            [placeholder]="i18n.t('filter.min_salary')"
            class="h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none">
          <input
            type="number"
            [(ngModel)]="salaryMax"
            [placeholder]="i18n.t('filter.max_salary')"
            class="h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none">
          <select
            [(ngModel)]="employmentType"
            class="h-11 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none">
            <option value="">{{ i18n.t('filter.employment_type') }}</option>
            <option value="FULL_TIME">{{ i18n.t('filter.full_time') }}</option>
            <option value="PART_TIME">{{ i18n.t('filter.part_time') }}</option>
            <option value="CONTRACT">{{ i18n.t('filter.contract') }}</option>
            <option value="TEMPORARY">{{ i18n.t('filter.temporary') }}</option>
          </select>
          <select
            [(ngModel)]="shiftSchedule"
            class="h-11 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none">
            <option value="">{{ i18n.t('filter.shift') }}</option>
            <option value="MORNING">{{ i18n.t('filter.morning') }}</option>
            <option value="EVENING">{{ i18n.t('filter.evening') }}</option>
            <option value="NIGHT">{{ i18n.t('filter.night') }}</option>
            <option value="FLEXIBLE">{{ i18n.t('filter.flexible') }}</option>
          </select>
          <select
            [(ngModel)]="sort"
            class="h-11 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:border-black focus:ring-1 focus:ring-black outline-none">
            <option value="date_desc">{{ i18n.t('filter.sort_newest') }}</option>
            <option value="date_asc">{{ i18n.t('filter.sort_oldest') }}</option>
            <option value="salary_desc">{{ i18n.t('filter.sort_salary_high') }}</option>
            <option value="salary_asc">{{ i18n.t('filter.sort_salary_low') }}</option>
            <option value="relevance">{{ i18n.t('filter.sort_relevance') }}</option>
          </select>
          <label class="h-11 px-3 border border-gray-200 rounded-xl bg-white flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" [(ngModel)]="verifiedOnly" class="rounded border-gray-300 text-black focus:ring-black">
            {{ i18n.t('filter.verified') }}
          </label>
        </div>

        <div class="flex gap-2 overflow-x-auto pt-3 no-scrollbar">
          @for (benefit of benefitList; track benefit.key) {
            <button
              (click)="toggleBenefit(benefit.key)"
              class="shrink-0 h-9 px-4 rounded-full text-xs font-medium border transition"
              [class]="selectedBenefits.includes(benefit.key) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
              {{ benefitLabel(benefit.key) }}
            </button>
          }
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3">
          <div class="text-[11px] text-gray-400">
            @if (candidateId()) {
              {{ i18n.t('filter.save_hint') }}
            } @else {
              {{ i18n.t('filter.save_hint_guest') }}
            }
          </div>
          <div class="flex items-center gap-2">
            @if (searchSaveState()) {
              <span class="text-xs text-gray-500">{{ searchSaveState() }}</span>
            }
            <button
              (click)="saveCurrentSearch()"
              [disabled]="!candidateId()"
              class="h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed">
              {{ i18n.t('filter.save_search') }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        @for (c of countryList; track c.code) {
          <button
            (click)="setCountry(c.code)"
            class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
            [class]="country === c.code ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
            {{ c.name }}
          </button>
        }
      </div>

      <div class="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar">
        <button
          (click)="setCity('')"
          class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
          [class]="!city ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
          {{ i18n.t('filter.all') }}
        </button>
        @for (c of cities; track c) {
          <button
            (click)="setCity(c)"
            class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
            [class]="city === c ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
            {{ c }}
          </button>
        }
      </div>

      <div class="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        <button
          (click)="setCategory('')"
          class="shrink-0 h-8 px-3 rounded-full text-xs font-medium border transition"
          [class]="!category ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'">
          {{ i18n.t('filter.all_categories') }}
        </button>
        @for (cat of categoryList; track cat.key) {
          <button
            (click)="setCategory(cat.key)"
            class="shrink-0 h-8 px-3 rounded-full text-xs font-medium border transition"
            [class]="category === cat.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'">
            {{ i18n.t('category.' + cat.key) }}
          </button>
        }
      </div>

      <div class="xl:grid xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_360px_300px] xl:gap-6 items-start">
        <div>
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="text-xs text-gray-400">{{ total() }} {{ i18n.t('jobs.found') }}</div>
            <div class="hidden xl:block text-[11px] text-gray-400">{{ i18n.t('jobs.split_view') }}</div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
            @for (v of vacancies(); track v.id) {
              <article
                (click)="openVacancy(v)"
                (keydown.enter)="openVacancy(v)"
                tabindex="0"
                role="button"
                class="rounded-xl border p-4 transition group cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/10"
                [ngClass]="selectedVacancySlug() === (v.slug || v.id)
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                  : 'bg-white border-gray-100 hover:shadow-md'">
                @if (v.salaryFrom) {
                  <div class="text-lg font-bold text-gray-900 mb-1">
                    {{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }}
                    <span class="text-xs font-normal text-gray-400">{{ v.currency || 'UZS' }}</span>
                  </div>
                } @else {
                  <div class="text-sm font-medium text-gray-400 mb-1">{{ i18n.t('jobs.negotiable') }}</div>
                }

                @if (selectedVacancySlug() === (v.slug || v.id)) {
                  <div class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 mb-1">{{ i18n.t('jobs.selected') }}</div>
                }

                <h3 class="text-sm font-semibold text-gray-800 group-hover:text-black truncate">{{ v.title }}</h3>
                <div class="text-xs text-gray-400 mt-0.5 truncate">{{ v.employer?.name || v.employerName }}</div>

                <div class="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ v.city || 'Toshkent' }}
                  </span>
                  @if (v.employmentType) {
                    <span class="px-2 py-0.5 bg-gray-100 rounded-full">{{ empType(v.employmentType) }}</span>
                  }
                  @if (v.positionsCount > 1) {
                    <span class="px-2 py-0.5 bg-green-50 text-green-600 rounded-full">{{ v.positionsCount }} {{ i18n.t('jobs.positions') }}</span>
                  }
                </div>

                <div class="mt-4 flex items-center justify-between gap-3">
                  <div class="text-[11px] text-gray-400 truncate">
                    @if (selectedVacancySlug() === (v.slug || v.id)) {
                      {{ i18n.t('jobs.selected') }}
                    } @else if (v.employerVerified) {
                      Verified employer
                    } @else {
                      Open preview
                    }
                  </div>
                  <a
                    [routerLink]="['/jobs', v.slug || v.id]"
                    (click)="$event.stopPropagation()"
                    class="h-9 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition inline-flex items-center justify-center shrink-0">
                    {{ i18n.t('jobs.detail') }}
                  </a>
                </div>
              </article>
            } @empty {
              <div class="col-span-full text-center py-16 text-gray-400 text-sm">
                @if (loading()) { {{ i18n.t('jobs.loading') }} } @else { {{ i18n.t('jobs.not_found') }} }
              </div>
            }
          </div>

          @if (totalPages() > 1) {
            <div class="flex justify-center gap-1 mt-6">
              @for (p of pages(); track p) {
                <button
                  (click)="goToPage(p)"
                  class="w-10 h-10 rounded-lg text-sm font-medium transition"
                  [class]="p === page ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
                  {{ p + 1 }}
                </button>
              }
            </div>
          }
        </div>

        <aside class="hidden xl:block sticky top-20">
          <div class="rounded-2xl border border-gray-100 bg-white p-5">
            @if (selectedVacancy(); as selected) {
              <div class="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Split View</div>

              <div class="text-xl font-bold text-gray-900">
                @if (selected.salaryFrom) {
                  {{ fmt(selected.salaryFrom) }}{{ selected.salaryTo ? ' - ' + fmt(selected.salaryTo) : '+' }}
                  <span class="text-xs font-normal text-gray-400">{{ selected.currency || 'UZS' }}</span>
                } @else {
                  {{ i18n.t('jobs.negotiable') }}
                }
              </div>

              <div class="text-lg font-semibold text-gray-900 mt-3">{{ selected.title }}</div>
              <a
                [routerLink]="['/companies', selected.employer?.slug || selected.employerId]"
                class="text-sm text-gray-500 hover:text-black mt-1 inline-block">
                {{ selected.employer?.name || selected.employerName }}
              </a>

              <div class="flex flex-wrap gap-2 mt-4">
                @if (selected.city) {
                  <span class="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">{{ selected.city }}</span>
                }
                @if (selected.employmentType) {
                  <span class="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">{{ empType(selected.employmentType) }}</span>
                }
                @if (selected.shiftSchedule) {
                  <span class="px-3 py-1 rounded-full bg-amber-50 text-xs text-amber-700">{{ shiftLabel(selected.shiftSchedule) }}</span>
                }
              </div>

              @if (selectedSalaryInsight()) {
                <div class="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <div class="text-[10px] uppercase tracking-wide text-emerald-700 mb-2">Salary Intelligence</div>
                  <div class="text-sm font-semibold text-emerald-900">{{ marketRange() }}</div>
                  <div class="text-xs text-emerald-700 mt-1">{{ i18n.t('jobs.market_range') }}</div>
                </div>
              }

              @if (selected.description) {
                <div class="mt-5">
                  <div class="text-sm font-semibold text-gray-900 mb-2">{{ i18n.t('jobs.description') }}</div>
                  <div class="text-sm text-gray-600 leading-relaxed line-clamp-6">{{ selected.description }}</div>
                </div>
              }

              @if (selected.benefits?.length) {
                <div class="mt-5">
                  <div class="text-sm font-semibold text-gray-900 mb-2">{{ i18n.t('jobs.benefits') }}</div>
                  <div class="flex flex-wrap gap-2">
                    @for (benefit of selected.benefits; track benefit) {
                      <span class="px-3 py-1 rounded-full bg-emerald-50 text-xs text-emerald-700">{{ benefit }}</span>
                    }
                  </div>
                </div>
              }

              <div class="grid grid-cols-2 gap-2 mt-6">
                <a
                  [routerLink]="['/jobs', selected.slug || selected.id]"
                  class="h-11 rounded-xl bg-black text-white text-sm font-medium flex items-center justify-center hover:bg-gray-800 transition">
                  {{ i18n.t('jobs.detail') }}
                </a>
                <button
                  type="button"
                  disabled
                  class="h-11 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 inline-flex items-center justify-center gap-2 cursor-default">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ i18n.t('jobs.selected') }}
                </button>
              </div>
            } @else {
              <div class="text-sm text-gray-400">{{ i18n.t('jobs.select_to_view') }}</div>
            }
          </div>
        </aside>

        <aside class="hidden 2xl:block sticky top-20">
          <div class="space-y-4">
            <div class="rounded-2xl bg-black text-white p-5">
              <div class="text-xs uppercase tracking-wide text-gray-400 mb-3">{{ i18n.t('jobs.stats_title') }}</div>
              <div class="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div class="text-xl font-bold">{{ stats().vacancies }}</div>
                  <div class="text-[10px] text-gray-400 mt-1">Vakansiya</div>
                </div>
                <div>
                  <div class="text-xl font-bold">{{ stats().employers }}</div>
                  <div class="text-[10px] text-gray-400 mt-1">Kompaniya</div>
                </div>
                <div>
                  <div class="text-xl font-bold">{{ stats().hired }}</div>
                  <div class="text-[10px] text-gray-400 mt-1">Hired</div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-100 bg-white p-5">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm font-semibold text-gray-900">{{ i18n.t('jobs.top_companies') }}</div>
                <a routerLink="/companies" class="text-xs text-gray-400 hover:text-black">{{ i18n.t('jobs.view_all') }}</a>
              </div>
              <div class="grid grid-cols-3 gap-2">
                @for (company of topCompanies(); track company.id) {
                  <a
                    [routerLink]="['/companies', company.slug || company.id]"
                    class="aspect-square rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition p-2 flex flex-col items-center justify-center text-center">
                    <div class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {{ (company.name || '?').charAt(0) }}
                    </div>
                    <div class="text-[10px] text-gray-600 mt-2 line-clamp-2">{{ company.name }}</div>
                  </a>
                }
              </div>
            </div>

            <div class="rounded-2xl border border-gray-100 bg-white p-5">
              <div class="text-sm font-semibold text-gray-900 mb-3">{{ i18n.t('jobs.mobile_telegram') }}</div>
              <div class="space-y-2">
                <a
                  href="https://t.me/VerifixJobBot"
                  target="_blank"
                  class="h-11 px-4 rounded-xl bg-[#2AABEE] text-white text-sm font-medium flex items-center justify-center hover:bg-[#229ED9] transition">
                  Telegram bot
                </a>
                <a
                  routerLink="/favorites"
                  class="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center hover:bg-gray-50 transition">
                  {{ i18n.t('jobs.saved_vacancies') }}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <vjw-public-footer />
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`]
})
export class PublicVacancyListComponent implements OnInit, DoCheck {
  query = '';
  city = '';
  category = '';
  salaryMin: number | null = null;
  salaryMax: number | null = null;
  employmentType = '';
  shiftSchedule = '';
  sort = 'date_desc';
  verifiedOnly = false;
  selectedBenefits: string[] = [];
  page = 0;
  country = '';

  vacancies = signal<any[]>([]);
  selectedVacancy = signal<any>(null);
  selectedVacancySlug = signal('');
  selectedSalaryInsight = signal<any>(null);
  total = signal(0);
  totalPages = signal(0);
  loading = signal(true);
  stats = signal({ vacancies: 0, employers: 0, hired: 0 });
  topCompanies = signal<any[]>([]);
  searchSaveState = signal('');
  candidateId = signal<string | null>(null);
  pages = signal<number[]>([]);

  countryList = [
    { code: '', name: "Barcha", flag: '' },
    { code: 'UZ', name: "O'zbekiston", flag: '' },
    { code: 'KZ', name: "Qozog'iston", flag: '' },
    { code: 'KG', name: "Qirg'iziston", flag: '' },
    { code: 'TJ', name: "Tojikiston", flag: '' },
  ];
  citiesByCountry: Record<string, string[]> = {
    '': ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona", 'Nukus', 'Navoiy', 'Qarshi'],
    'UZ': ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona", 'Nukus', 'Navoiy', 'Qarshi'],
    'KZ': ['Almaty', 'Astana', 'Shymkent', 'Aktobe', 'Karaganda', 'Taraz', 'Atyrau'],
    'KG': ['Bishkek', 'Osh', 'Jalal-Abad', 'Karakol', 'Tokmok'],
    'TJ': ['Dushanbe', 'Khujand', 'Kulob', 'Bokhtar', 'Istaravshan'],
  };
  get cities(): string[] {
    return this.citiesByCountry[this.country] || this.citiesByCountry[''];
  }
  categoryList = [
    { key: 'COOK', label: 'Oshpaz' },
    { key: 'DRIVER', label: 'Haydovchi' },
    { key: 'SALES', label: 'Sotuvchi' },
    { key: 'BUILDER', label: 'Qurilishchi' },
    { key: 'WAITER', label: 'Ofitsiant' },
    { key: 'SECURITY', label: 'Qo\'riqchi' },
    { key: 'WAREHOUSE', label: 'Omborchi' },
    { key: 'COURIER', label: 'Kuryer' },
    { key: 'ELECTRICIAN', label: 'Elektrik' },
    { key: 'TAILOR', label: 'Tikuvchi' },
    { key: 'CASHIER', label: 'Kassir' },
    { key: 'LOADER', label: 'Yukchi' },
  ];
  benefitList = [
    { key: 'ovqat', label: 'Ovqat' },
    { key: 'transport', label: 'Transport' },
    { key: 'turar-joy', label: 'Turar joy' },
    { key: 'forma', label: 'Forma' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'oqitish', label: "O'qitish" },
  ];

  constructor(
    private api: PublicApiService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService,
    public i18n: I18nService
  ) {}

  pageTitle(): string {
    if (this.category && this.city) {
      return `${this.i18n.t('category.' + this.category)} - ${this.city}`;
    }
    if (this.category) {
      return this.i18n.t('category.' + this.category);
    }
    if (this.city) {
      return `${this.city} bo'yicha vakansiyalar`;
    }
    return 'Vakansiyalar';
  }

  pageSubtitle(): string {
    if (this.query) {
      return `"${this.query}" bo'yicha mos ishlarni toping.`;
    }
    return "Filtrlar orqali ishlarni tez solishtiring va to'g'ri variantni tanlang.";
  }

  ngOnInit() {
    this.candidateId.set(localStorage.getItem('vjw_candidate_id'));
    this.loadSidebarData();
    this.route.paramMap.subscribe(() => this.applyRouteState(this.route.snapshot.queryParams));
    this.route.queryParams.subscribe(params => this.applyRouteState(params));
  }

  ngDoCheck() {
    const totalPages = this.totalPages();
    const visiblePages: number[] = [];
    for (let index = Math.max(0, this.page - 2); index < Math.min(totalPages, this.page + 5); index++) {
      visiblePages.push(index);
    }
    this.pages.set(visiblePages);
  }

  applyRouteState(params: any) {
    const routeParams = this.route.snapshot.params;
    this.query = params['q'] || '';
    this.city = this.displayCity(routeParams['city'] || params['city'] || '');
    this.country = params['country'] || '';
    this.category = routeParams['category'] || params['category'] || '';
    this.salaryMin = params['salaryMin'] ? Number(params['salaryMin']) : null;
    this.salaryMax = params['salaryMax'] ? Number(params['salaryMax']) : null;
    this.employmentType = params['employmentType'] || '';
    this.shiftSchedule = params['shiftSchedule'] || '';
    this.sort = params['sort'] || 'date_desc';
    this.verifiedOnly = params['verifiedOnly'] === 'true';
    this.selectedBenefits = params['benefits'] ? String(params['benefits']).split(',').filter(Boolean) : [];
    this.selectedVacancySlug.set(params['selected'] || '');
    this.page = Number(params['page'] || 0);
    this.updateSeo();
    this.loadVacancies();
  }

  loadSidebarData() {
    this.api.getStats().subscribe({
      next: (stats: any) => this.stats.set({
        vacancies: stats.totalVacancies || 0,
        employers: stats.totalEmployers || 0,
        hired: stats.totalHired || 0
      }),
      error: () => {}
    });

    this.api.getCompanies({ size: 9 }).subscribe({
      next: (response: any) => this.topCompanies.set(response.content || []),
      error: () => {}
    });
  }

  loadVacancies() {
    this.loading.set(true);
    this.api.getVacancies({
      q: this.query || undefined,
      city: this.city ? this.normalizeCity(this.city) : undefined,
      country: this.country || undefined,
      category: this.category || undefined,
      salaryMin: this.salaryMin ?? undefined,
      salaryMax: this.salaryMax ?? undefined,
      employmentType: this.employmentType || undefined,
      shiftSchedule: this.shiftSchedule || undefined,
      benefits: this.selectedBenefits.length ? this.selectedBenefits : undefined,
      verifiedOnly: this.verifiedOnly,
      sort: this.sort,
      page: this.page,
      size: 12
    }).subscribe({
      next: (response: any) => {
        const content = response.content || [];
        this.vacancies.set(content);
        this.total.set(response.totalElements || 0);
        this.totalPages.set(response.totalPages || 0);
        this.syncSelectedVacancy(content);
        this.updateSeo();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  search() {
    this.page = 0;
    this.updateUrl();
  }

  setCity(city: string) {
    this.city = city;
    this.page = 0;
    this.updateUrl();
  }

  setCountry(code: string) {
    this.country = code;
    this.city = '';
    this.page = 0;
    this.updateUrl();
  }

  setCategory(category: string) {
    this.category = category;
    this.page = 0;
    this.updateUrl();
  }

  goToPage(page: number) {
    this.page = page;
    this.updateUrl();
  }

  toggleBenefit(benefit: string) {
    this.selectedBenefits = this.selectedBenefits.includes(benefit)
      ? this.selectedBenefits.filter(item => item !== benefit)
      : [...this.selectedBenefits, benefit];
    this.page = 0;
    this.updateUrl();
  }

  updateUrl() {
    const queryParams: any = {};
    if (this.query) queryParams['q'] = this.query;
    if (this.country) queryParams['country'] = this.country;
    if (this.city && !this.usesSeoRoute()) queryParams['city'] = this.city;
    if (this.category && !this.city) queryParams['category'] = this.category;
    if (this.salaryMin != null) queryParams['salaryMin'] = this.salaryMin;
    if (this.salaryMax != null) queryParams['salaryMax'] = this.salaryMax;
    if (this.employmentType) queryParams['employmentType'] = this.employmentType;
    if (this.shiftSchedule) queryParams['shiftSchedule'] = this.shiftSchedule;
    if (this.selectedBenefits.length) queryParams['benefits'] = this.selectedBenefits.join(',');
    if (this.verifiedOnly) queryParams['verifiedOnly'] = true;
    if (this.sort && this.sort !== 'date_desc') queryParams['sort'] = this.sort;
    if (this.selectedVacancySlug()) queryParams['selected'] = this.selectedVacancySlug();
    if (this.page) queryParams['page'] = this.page;

    this.router.navigate(this.routeCommands(), { queryParams });
  }

  openVacancy(vacancy: any) {
    if (window.innerWidth < 1280) {
      this.router.navigate(['/jobs', vacancy.slug || vacancy.id]);
      return;
    }
    this.setSelectedVacancy(vacancy.slug || vacancy.id);
  }

  setSelectedVacancy(slug: string) {
    this.selectedVacancySlug.set(slug);
    this.updateUrl();
  }

  syncSelectedVacancy(vacancies: any[]) {
    const selectedSlug = this.selectedVacancySlug();
    const hasSelectedInList = selectedSlug
      ? vacancies.some(item => (item.slug || item.id) === selectedSlug)
      : false;
    const fallbackSlug = window.innerWidth >= 1280 && vacancies.length ? (vacancies[0].slug || vacancies[0].id) : '';
    const desired = hasSelectedInList ? selectedSlug : fallbackSlug;

    if (!desired) {
      this.selectedVacancy.set(null);
      this.selectedSalaryInsight.set(null);
      return;
    }

    const loaded = this.selectedVacancy();
    if (loaded && (loaded.slug || loaded.id) === desired) {
      return;
    }

    this.selectedVacancySlug.set(desired);
    this.api.getVacancy(desired).subscribe({
      next: (vacancy: any) => {
        this.selectedVacancy.set(vacancy);
        if (vacancy?.category) {
          this.api.getSalaryMarket(vacancy.category, vacancy.city).subscribe({
            next: (insight: any) => this.selectedSalaryInsight.set(insight),
            error: () => this.selectedSalaryInsight.set(null)
          });
        } else {
          this.selectedSalaryInsight.set(null);
        }
      },
      error: () => {
        this.selectedVacancy.set(null);
        this.selectedSalaryInsight.set(null);
      }
    });
  }

  saveCurrentSearch() {
    const candidateId = this.candidateId();
    if (!candidateId) {
      this.searchSaveState.set(this.i18n.t('filter.save_hint_guest'));
      return;
    }

    this.api.savePublicSearch({
      candidateId,
      name: this.buildSearchName(),
      query: this.query || undefined,
      city: this.city || undefined,
      category: this.category || undefined,
      minSalary: this.salaryMin ?? undefined,
      maxSalary: this.salaryMax ?? undefined,
      employmentType: this.employmentType || undefined,
      shiftSchedule: this.shiftSchedule || undefined,
      benefits: this.selectedBenefits.length ? this.selectedBenefits : undefined,
      verifiedOnly: this.verifiedOnly,
      notifyEnabled: true
    }).subscribe({
      next: () => this.searchSaveState.set(this.i18n.t('filter.search_saved')),
      error: () => this.searchSaveState.set(this.i18n.t('filter.search_save_fail'))
    });
  }

  buildSearchName(): string {
    const categoryLabel = this.category ? this.i18n.t('category.' + this.category) : '';
    const parts = [categoryLabel, this.city, this.query].filter(Boolean);
    if (parts.length) {
      return parts.join(' / ');
    }
    if (this.salaryMin != null) {
      return `Maosh ${this.salaryMin}+`;
    }
    return 'Saqlangan qidiruv';
  }

  marketRange(): string {
    const insight = this.selectedSalaryInsight();
    if (!insight?.p25 || !insight?.p75) {
      return '';
    }
    return `${this.fmt(insight.p25)} - ${this.fmt(insight.p75)} ${insight.currency}`;
  }

  shiftLabel(value: string): string {
    const map: Record<string, string> = {
      MORNING: 'filter.morning',
      EVENING: 'filter.evening',
      NIGHT: 'filter.night',
      FLEXIBLE: 'filter.flexible'
    };
    return map[value] ? this.i18n.t(map[value]) : value;
  }

  fmt(value: number): string {
    return value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value >= 1e3 ? `${Math.round(value / 1e3)}K` : `${value}`;
  }

  benefitLabel(key: string): string {
    return this.i18n.t('benefit.' + key.replace('-', '_'));
  }

  empType(value: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'filter.full_time',
      PART_TIME: 'filter.part_time',
      CONTRACT: 'filter.contract',
      TEMPORARY: 'filter.temporary'
    };
    return map[value] ? this.i18n.t(map[value]) : value;
  }

  private routeCommands(): string[] {
    if (this.city && this.category) {
      return ['/vacancies', this.city, this.category];
    }
    if (this.category) {
      return ['/vacancies/category', this.category];
    }
    if (this.city) {
      return ['/vacancies', this.city];
    }
    return ['/jobs'];
  }

  private usesSeoRoute(): boolean {
    return Boolean(this.city || this.category);
  }

  private updateSeo() {
    const categoryLabel = this.category ? this.i18n.t('category.' + this.category) : '';
    const titleCore = [categoryLabel, this.city, 'Jobs'].filter(Boolean).join(' ');
    const description = this.buildSeoDescription(categoryLabel);
    const vacancies = this.vacancies().slice(0, 10).map(vacancy => ({
      name: vacancy.title,
      path: `/jobs/${vacancy.slug || vacancy.id}`,
      description: [vacancy.city, vacancy.employer?.name || vacancy.employerName].filter(Boolean).join(' | ')
    }));
    const breadcrumbItems = [
      { name: 'Home', path: '/' },
      { name: 'Jobs', path: '/jobs' }
    ];
    if (this.city) {
      breadcrumbItems.push({ name: this.city, path: `/vacancies/${this.segment(this.city)}` });
    }
    if (this.category) {
      breadcrumbItems.push({
        name: categoryLabel || this.category,
        path: this.city
          ? `/vacancies/${this.segment(this.city)}/${this.segment(this.category)}`
          : `/vacancies/category/${this.segment(this.category)}`
      });
    }

    this.seo.setPage({
      title: titleCore || 'Jobs',
      description,
      path: this.buildCanonicalPath(),
      keywords: ['vacancies', this.city, categoryLabel, 'jobs in uzbekistan'].filter(Boolean) as string[],
      noindex: this.shouldNoIndex(),
      schema: [
        this.seo.buildCollectionPageSchema(titleCore || 'Jobs', description, this.buildCanonicalPath()),
        this.seo.buildBreadcrumbSchema(breadcrumbItems),
        this.seo.buildItemListSchema(titleCore || 'Jobs', vacancies)
      ]
    });
  }

  private buildCanonicalPath(): string {
    if (this.city && this.category) {
      return `/vacancies/${this.segment(this.city)}/${this.segment(this.category)}`;
    }
    if (this.category) {
      return `/vacancies/category/${this.segment(this.category)}`;
    }
    if (this.city) {
      return `/vacancies/${this.segment(this.city)}`;
    }
    return '/jobs';
  }

  private buildSeoDescription(categoryLabel: string): string {
    const context = [categoryLabel, this.city].filter(Boolean).join(' in ');
    const totalLabel = this.total() ? `${this.total()} active vacancies` : 'Browse active vacancies';
    const filters = [
      this.employmentType ? this.empType(this.employmentType) : '',
      this.shiftSchedule ? this.shiftLabel(this.shiftSchedule) : '',
      this.verifiedOnly ? 'verified employers' : ''
    ].filter(Boolean);
    return [totalLabel, context || 'across Uzbekistan', filters.join(', ')].filter(Boolean).join('. ');
  }

  private shouldNoIndex(): boolean {
    return Boolean(
      this.query ||
      this.salaryMin != null ||
      this.salaryMax != null ||
      this.employmentType ||
      this.shiftSchedule ||
      this.selectedBenefits.length ||
      this.verifiedOnly ||
      this.selectedVacancySlug() ||
      this.page > 0 ||
      (this.sort && this.sort !== 'date_desc')
    );
  }

  private segment(value: string): string {
    return encodeURIComponent(value);
  }

  private normalizeCity(value: string): string {
    const mapping: Record<string, string> = {
      toshkent: 'Tashkent',
      tashkent: 'Tashkent',
      samarqand: 'Samarkand',
      samarkand: 'Samarkand',
      buxoro: 'Bukhara',
      bukhara: 'Bukhara',
      andijon: 'Andijan',
      andijan: 'Andijan',
      namangan: 'Namangan',
      "farg'ona": 'Fergana',
      fergana: 'Fergana',
      nukus: 'Nukus',
      navoiy: 'Navoi',
      navoi: 'Navoi',
      qarshi: 'Karshi',
      karshi: 'Karshi'
    };
    return mapping[value?.trim().toLowerCase()] || value;
  }

  private displayCity(value: string): string {
    const mapping: Record<string, string> = {
      tashkent: 'Toshkent',
      samarkand: 'Samarqand',
      bukhara: 'Buxoro',
      andijan: 'Andijon',
      fergana: "Farg'ona",
      navoi: 'Navoiy',
      karshi: 'Qarshi'
    };
    return mapping[value?.trim().toLowerCase()] || value;
  }
}
