import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService, PublicCompany } from '../../core/services/public-api.service';

@Component({
  selector: 'vjw-public-company-list',
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
            <a routerLink="/jobs" class="text-sm font-medium text-gray-600 hover:text-[#000000]">Vakansiyalar</a>
            <a routerLink="/companies" class="text-sm font-medium text-[#000000]">Kompaniyalar</a>
            <a routerLink="/login" class="text-sm font-medium text-white bg-[#000000] px-4 py-2 rounded-lg hover:bg-[#154a6e]">Kirish</a>
          </div>
        </div>
      </div>
    </nav>

    <div class="bg-[#FFFFFF] min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Kompaniyalar</h1>
          <p class="text-gray-500 mt-1">Ishonchli ish beruvchilarni toping</p>
        </div>

        <!-- Search + Filter -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="applySearch()"
                     placeholder="Kompaniya nomini qidirish..."
                     class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 text-sm" />
            </div>
            <select [(ngModel)]="filterIndustry" (ngModelChange)="applySearch()"
                    class="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#000000]/30 bg-white">
              <option value="">Barcha sohalar</option>
              @for (ind of industries; track ind) {
                <option [value]="ind">{{ ind }}</option>
              }
            </select>
            <button (click)="applySearch()"
                    class="bg-[#000000] hover:bg-[#154a6e] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
              Qidirish
            </button>
          </div>
        </div>

        <!-- Results -->
        <p class="text-sm text-gray-500 mb-4">{{ totalElements() }} ta kompaniya topildi</p>

        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-white border border-gray-200 rounded-xl h-48 animate-pulse"></div>
            }
          </div>
        } @else if (companies().length === 0) {
          <div class="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Kompaniya topilmadi</h3>
            <p class="text-gray-500 text-sm">Qidiruv shartlarini o'zgartirib ko'ring</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (c of companies(); track c.id) {
              <a [routerLink]="['/companies', c.slug || c.id]"
                 class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#000000]/20 transition-all duration-200 group">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-14 h-14 bg-[#000000]/10 rounded-xl flex items-center justify-center text-[#000000] font-bold text-xl shrink-0">
                    @if (c.logo) {
                      <img [src]="c.logo" [alt]="c.name" class="w-full h-full object-cover rounded-xl" />
                    } @else {
                      {{ c.name.charAt(0) }}
                    }
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold text-gray-800 group-hover:text-[#000000] transition-colors truncate">{{ c.name }}</h3>
                      @if (c.isVerified) {
                        <svg class="w-5 h-5 text-[#000000] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      }
                    </div>
                    <p class="text-xs text-gray-500">{{ c.industry }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ c.city }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {{ c.vacancyCount }} vakansiya
                  </span>
                  @if (c.size) {
                    <span class="inline-flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ c.size }}
                    </span>
                  }
                </div>
              </a>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-center gap-2 mt-8">
              <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 0"
                      class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              @for (p of paginationPages(); track $index) {
                @if (p === -1) {
                  <span class="px-2 py-2 text-gray-400">...</span>
                } @else {
                  <button (click)="goToPage(p)"
                          class="px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors"
                          [class.bg-\[#000000\]]="p === currentPage()" [class.text-white]="p === currentPage()"
                          [class.border-\[#000000\]]="p === currentPage()" [class.border-gray-200]="p !== currentPage()"
                          [class.hover:bg-gray-50]="p !== currentPage()">
                    {{ p + 1 }}
                  </button>
                }
              }
              <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages() - 1"
                      class="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PublicCompanyListComponent implements OnInit {
  companies = signal<PublicCompany[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);

  searchQuery = '';
  filterIndustry = '';

  industries = [
    'Oziq-ovqat', 'Qurilish', 'Savdo', 'Transport', 'IT', 'Ishlab chiqarish',
    'Mehmonxona va restoran', 'Logistika', 'Xizmat ko\'rsatish', 'Ta\'lim', 'Tibbiyot'
  ];

  paginationPages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: number[] = [0];
    if (current > 2) pages.push(-1);
    for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) pages.push(i);
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
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.filterIndustry = params['industry'] || '';
      const page = parseInt(params['page'] || '0', 10);
      this.currentPage.set(page);
      this.fetchCompanies();
    });
  }

  applySearch() {
    this.router.navigate(['/companies'], {
      queryParams: {
        q: this.searchQuery || undefined,
        industry: this.filterIndustry || undefined,
        page: undefined,
      },
    });
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.router.navigate(['/companies'], {
      queryParams: { page: page || undefined },
      queryParamsHandling: 'merge',
    });
  }

  private fetchCompanies() {
    this.loading.set(true);
    this.publicApi.getCompanies({
      q: this.searchQuery || undefined,
      industry: this.filterIndustry || undefined,
      page: this.currentPage(),
      size: 12,
    }).subscribe({
      next: (res) => {
        this.companies.set(res.content);
        this.totalElements.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
