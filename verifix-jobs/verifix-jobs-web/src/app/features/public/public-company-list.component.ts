import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'vjw-public-company-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-6xl mx-auto px-4 pt-4 pb-20 md:pb-8">
      <h1 class="text-xl font-bold text-gray-900 mb-4">Kompaniyalar</h1>

      <div class="flex flex-col sm:flex-row gap-2 mb-6">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" [(ngModel)]="query" placeholder="Kompaniya nomi..."
                 class="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                 (keyup.enter)="search()">
        </div>
        <button (click)="search()" class="h-12 px-6 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Topish</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        @for (c of companies(); track c.id) {
          <a [routerLink]="['/companies', c.slug || c.id]" class="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition group">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-lg font-bold shrink-0">
                {{ (c.name || '?').charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 group-hover:text-black truncate">{{ c.name }}</div>
                @if (c.industry) { <div class="text-xs text-gray-400">{{ c.industry }}</div> }
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              @if (c.city) {
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                  {{ c.city }}
                </span>
              }
              @if (c.isVerified) { <span class="text-green-600 font-medium">&#10003; Tasdiqlangan</span> }
              @if (c.vacancyCount) { <span>{{ c.vacancyCount }} vakansiya</span> }
            </div>
          </a>
        } @empty {
          <div class="col-span-full text-center py-16 text-gray-400 text-sm">
            @if (loading()) { Yuklanmoqda... } @else { Kompaniya topilmadi }
          </div>
        }
      </div>
    </div>

    <vjw-public-footer />
  `,
})
export class PublicCompanyListComponent implements OnInit {
  companies = signal<any[]>([]);
  loading = signal(true);
  query = '';

  constructor(private api: PublicApiService, private seo: SeoService) {}

  ngOnInit() {
    this.updateSeo();
    this.search();
  }

  search() {
    this.loading.set(true);
    this.api.getCompanies({ q: this.query }).subscribe({
      next: (response: any) => {
        this.companies.set(response.content || response || []);
        this.updateSeo();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private updateSeo() {
    const companies = this.companies().slice(0, 10).map(company => ({
      name: company.name,
      path: `/companies/${company.slug || company.id}`,
      description: [company.city, company.industry].filter(Boolean).join(' | ')
    }));

    this.seo.setPage({
      title: 'Companies hiring now',
      description: this.query
        ? `Search employer pages and open vacancies for "${this.query}" on Verifix Jobs.`
        : 'Explore verified employers, employer branding pages, and open vacancies on Verifix Jobs.',
      path: '/companies',
      keywords: ['companies', 'employers', 'jobs', 'verifix jobs'],
      noindex: Boolean(this.query.trim()),
      schema: [
        this.seo.buildCollectionPageSchema('Companies', 'Employer directory with public branding pages and open vacancies.', '/companies'),
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Companies', path: '/companies' }
        ]),
        this.seo.buildItemListSchema('Companies hiring now', companies)
      ]
    });
  }
}
