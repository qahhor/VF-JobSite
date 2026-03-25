import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService, PublicVacancy, VacancySearchParams } from '../../core/services/public-api.service';

@Component({
  selector: 'vjw-public-vacancy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
            <a routerLink="/jobs" class="text-sm font-medium text-[#000000]">Vakansiyalar</a>
            <a routerLink="/companies" class="text-sm font-medium text-gray-600 hover:text-[#000000] transition-colors">Kompaniyalar</a>
            <a routerLink="/login" class="text-sm font-medium text-white bg-[#000000] px-4 py-2 rounded-lg hover:bg-[#154a6e] transition-colors">Kirish</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- SEARCH BAR -->
    <section class="bg-[#000000] py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl p-3">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="applySearch()"
                     placeholder="Kalit so'z yoki lavozim..."
                     class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 text-sm" />
            </div>
            <button (click)="applySearch()"
                    class="bg-[#333333] hover:bg-[#27ae60] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
              Qidirish
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Results header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-800">Vakansiyalar</h1>
          <p class="text-sm text-gray-500 mt-1">{{ totalElements() }} ta natija topildi</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-500">Saralash:</label>
          <select [(ngModel)]="sortBy" (ngModelChange)="applySearch()"
                  class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 bg-white">
            <option value="newest">Eng yangi</option>
            <option value="salary_desc">Maosh: yuqoridan</option>
            <option value="salary_asc">Maosh: pastdan</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- SIDEBAR FILTERS -->
        <aside class="lg:w-72 shrink-0">
          <!-- Mobile filter toggle -->
          <button (click)="filtersOpen.set(!filtersOpen())"
                  class="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm font-medium text-gray-700">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filterlar
            </span>
            <svg class="w-5 h-5 transition-transform" [class.rotate-180]="filtersOpen()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <div [class.hidden]="!filtersOpen()" class="lg:!block">
            <div class="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
              <!-- City -->
              <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-3">Shahar</h3>
                <select [(ngModel)]="filterCity" (ngModelChange)="applySearch()"
                        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 bg-white">
                  <option value="">Barcha shaharlar</option>
                  @for (city of cities; track city) {
                    <option [value]="city">{{ city }}</option>
                  }
                </select>
              </div>

              <!-- Category -->
              <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-3">Kategoriya</h3>
                <select [(ngModel)]="filterCategory" (ngModelChange)="applySearch()"
                        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 bg-white">
                  <option value="">Barcha kategoriyalar</option>
                  @for (cat of categoryOptions; track cat.key) {
                    <option [value]="cat.key">{{ cat.label }}</option>
                  }
                </select>
              </div>

              <!-- Salary range -->
              <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-3">Maosh oralig'i</h3>
                <div class="flex items-center gap-2">
                  <input type="number" [(ngModel)]="filterSalaryMin" placeholder="Min"
                         class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#000000]/30" />
                  <span class="text-gray-400">-</span>
                  <input type="number" [(ngModel)]="filterSalaryMax" placeholder="Max"
                         class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#000000]/30" />
                </div>
                <button (click)="applySearch()" class="mt-2 text-xs text-[#000000] hover:underline">Qo'llash</button>
              </div>

              <!-- Employment Type -->
              <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-3">Bandlik turi</h3>
                <div class="space-y-2">
                  @for (et of employmentTypes; track et.key) {
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="empType" [value]="et.key" [(ngModel)]="filterEmploymentType" (ngModelChange)="applySearch()"
                             class="w-4 h-4 text-[#000000] border-gray-300 focus:ring-[#000000]" />
                      <span class="text-sm text-gray-600">{{ et.label }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Reset -->
              <button (click)="resetFilters()"
                      class="w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors">
                Filtrlarni tozalash
              </button>
            </div>
          </div>
        </aside>

        <!-- VACANCY CARDS GRID -->
        <div class="flex-1">
          @if (loading()) {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="bg-white border border-gray-200 rounded-xl h-56 animate-pulse"></div>
              }
            </div>
          } @else if (vacancies().length === 0) {
            <div class="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">Vakansiya topilmadi</h3>
              <p class="text-gray-500 text-sm">Qidiruv shartlarini o'zgartirib ko'ring</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              @for (v of vacancies(); track v.id) {
                <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#000000]/20 transition-all duration-200 flex flex-col">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                      <a [routerLink]="['/jobs', v.slug || v.id]"
                         class="font-semibold text-gray-800 hover:text-[#000000] transition-colors line-clamp-2 text-sm">
                        {{ v.title }}
                      </a>
                      <p class="text-xs text-gray-500 mt-1">{{ v.employerName }}</p>
                    </div>
                    <button (click)="toggleFavorite(v)" class="ml-2 shrink-0 text-gray-300 hover:text-[#666666] transition-colors">
                      <svg class="w-5 h-5" [attr.fill]="isFavorite(v.id) ? '#666666' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>
                  </div>

                  <div class="flex flex-wrap gap-1.5 mb-3">
                    <span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ v.city }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {{ getEmploymentLabel(v.employmentType) }}
                    </span>
                  </div>

                  @if (v.salaryFrom || v.salaryTo) {
                    <div class="text-[#333333] font-semibold text-sm mb-3">
                      @if (v.salaryFrom && v.salaryTo) {
                        {{ formatSalary(v.salaryFrom) }} - {{ formatSalary(v.salaryTo) }} {{ v.currency || 'UZS' }}
                      } @else if (v.salaryFrom) {
                        {{ formatSalary(v.salaryFrom) }}+ {{ v.currency || 'UZS' }}
                      } @else {
                        {{ formatSalary(v.salaryTo!) }} gacha {{ v.currency || 'UZS' }}
                      }
                    </div>
                  } @else {
                    <div class="text-gray-400 text-sm mb-3">Kelishiladi</div>
                  }

                  @if (v.benefits && v.benefits.length > 0) {
                    <div class="flex flex-wrap gap-1 mb-3">
                      @for (b of v.benefits.slice(0, 3); track b) {
                        <span class="text-xs bg-[#000000]/5 text-[#000000] px-2 py-0.5 rounded">{{ b }}</span>
                      }
                    </div>
                  }

                  <div class="mt-auto pt-3 border-t border-gray-100">
                    <a [routerLink]="['/jobs', v.slug || v.id]"
                       class="block w-full text-center bg-[#000000] hover:bg-[#154a6e] text-white text-sm font-medium py-2 rounded-lg transition-colors">
                      Ariza topshirish
                    </a>
                  </div>
                </div>
              }
            </div>

            <!-- PAGINATION -->
            @if (totalPages() > 1) {
              <div class="flex items-center justify-center gap-2 mt-8">
                <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 0"
                        class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (p of paginationPages(); track p) {
                  @if (p === -1) {
                    <span class="px-2 py-2 text-gray-400">...</span>
                  } @else {
                    <button (click)="goToPage(p)" [class.bg-\[#000000\]]="p === currentPage()" [class.text-white]="p === currentPage()"
                            class="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                            [class.border-\[#000000\]]="p === currentPage()">
                      {{ p + 1 }}
                    </button>
                  }
                }
                <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages() - 1"
                        class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class PublicVacancyListComponent implements OnInit {
  vacancies = signal<PublicVacancy[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  filtersOpen = signal(false);
  favorites = signal<Set<string>>(new Set());

  searchQuery = '';
  filterCity = '';
  filterCategory = '';
  filterSalaryMin: number | null = null;
  filterSalaryMax: number | null = null;
  filterEmploymentType = '';
  sortBy = 'newest';

  cities = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon', 'Farg\'ona',
    'Nukus', 'Navoiy', 'Qarshi', 'Jizzax', 'Termiz', 'Urganch', 'Guliston'
  ];

  categoryOptions = [
    { key: 'COOK', label: 'Oshpaz' }, { key: 'DRIVER', label: 'Haydovchi' },
    { key: 'SALES', label: 'Sotuvchi' }, { key: 'BUILDER', label: 'Qurilishchi' },
    { key: 'CLEANER', label: 'Tozalovchi' }, { key: 'WAITER', label: 'Ofitsiant' },
    { key: 'CASHIER', label: 'Kassir' }, { key: 'WAREHOUSE', label: 'Omborchi' },
    { key: 'SECURITY', label: 'Qo\'riqchi' }, { key: 'ELECTRICIAN', label: 'Elektrik' },
    { key: 'PLUMBER', label: 'Santexnik' }, { key: 'TAILOR', label: 'Tikuvchi' },
    { key: 'COURIER', label: 'Kuryer' }, { key: 'LOADER', label: 'Yukchi' },
  ];

  employmentTypes = [
    { key: '', label: 'Barchasi' },
    { key: 'FULL_TIME', label: 'To\'liq stavka' },
    { key: 'PART_TIME', label: 'Yarim stavka' },
    { key: 'SHIFT', label: 'Smenali' },
    { key: 'TEMPORARY', label: 'Vaqtinchalik' },
  ];

  paginationPages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [];
    pages.push(0);
    if (current > 2) pages.push(-1);
    for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 3) pages.push(-1);
    pages.push(total - 1);
    return pages;
  });

  constructor(
    private publicApi: PublicApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFavorites();
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.filterCity = params['city'] || '';
      this.filterCategory = params['category'] || '';
      this.sortBy = params['sort'] || 'newest';
      const page = parseInt(params['page'] || '0', 10);
      this.currentPage.set(page);
      this.fetchVacancies();
    });
  }

  applySearch() {
    this.router.navigate(['/jobs'], {
      queryParams: {
        q: this.searchQuery || undefined,
        city: this.filterCity || undefined,
        category: this.filterCategory || undefined,
        salaryMin: this.filterSalaryMin || undefined,
        salaryMax: this.filterSalaryMax || undefined,
        employmentType: this.filterEmploymentType || undefined,
        sort: this.sortBy !== 'newest' ? this.sortBy : undefined,
        page: undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterCity = '';
    this.filterCategory = '';
    this.filterSalaryMin = null;
    this.filterSalaryMax = null;
    this.filterEmploymentType = '';
    this.sortBy = 'newest';
    this.router.navigate(['/jobs']);
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.router.navigate(['/jobs'], {
      queryParams: { page: page || undefined },
      queryParamsHandling: 'merge',
    });
  }

  private fetchVacancies() {
    this.loading.set(true);
    const params: VacancySearchParams = {
      q: this.searchQuery || undefined,
      city: this.filterCity || undefined,
      category: this.filterCategory || undefined,
      salaryMin: this.filterSalaryMin || undefined,
      salaryMax: this.filterSalaryMax || undefined,
      employmentType: this.filterEmploymentType || undefined,
      sort: this.sortBy,
      page: this.currentPage(),
      size: 12,
    };
    this.publicApi.getVacancies(params).subscribe({
      next: (res) => {
        this.vacancies.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleFavorite(v: PublicVacancy) {
    const favs = new Set(this.favorites());
    if (favs.has(v.id)) {
      favs.delete(v.id);
    } else {
      favs.add(v.id);
    }
    this.favorites.set(favs);
    localStorage.setItem('vjw_favorites', JSON.stringify([...favs]));
  }

  isFavorite(id: string): boolean {
    return this.favorites().has(id);
  }

  private loadFavorites() {
    try {
      const raw = localStorage.getItem('vjw_favorites');
      if (raw) this.favorites.set(new Set(JSON.parse(raw)));
    } catch {}
  }

  formatSalary(amount: number): string {
    if (amount >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' mln';
    }
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
