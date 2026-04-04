import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { SeoService } from '../../core/services/seo.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-public-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <div class="mb-8">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-2">{{ i18n.t('public.categories.hubs') }}</div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">{{ i18n.t('categories.title') }}</h1>
        <p class="text-sm text-gray-500 mt-2">{{ i18n.t('footer.categories') }}</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (item of categories(); track item.category) {
              <a [routerLink]="['/vacancies/category', item.category]"
                 class="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition">
                <div class="text-3xl">{{ item.icon || '📋' }}</div>
                <div class="text-sm font-semibold text-gray-900 mt-3">{{ i18n.t('category.' + item.category) }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ item.vacancyCount }} {{ i18n.t('public.companies.vacancies') }}</div>
                @if (item.avgSalary) {
                  <div class="text-xs text-gray-400 mt-2">{{ i18n.t('public.salary.average') }} {{ fmt(item.avgSalary) }} UZS</div>
                }
              </a>
            }
          </div>
        </div>

        <aside class="space-y-4">
          <div class="rounded-2xl border border-gray-100 bg-white p-5">
            <div class="text-sm font-semibold text-gray-900 mb-3">{{ i18n.t('public.salary.compare_cities') }}</div>
            <div class="space-y-2">
              @for (city of cities(); track city.city) {
                <a [routerLink]="['/vacancies', city.city]"
                   class="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 transition">
                  <span class="text-sm text-gray-700">{{ city.city }}</span>
                  <span class="text-xs text-gray-400">{{ city.vacancyCount }}</span>
                </a>
              }
            </div>
          </div>
        </aside>
      </div>
    </div>

    <vjw-public-footer />
  `
})
export class PublicCategoriesComponent implements OnInit {
  categories = signal<any[]>([]);
  cities = signal<any[]>([]);

  constructor(private api: PublicApiService, private seo: SeoService, public i18n: I18nService) {}

  ngOnInit() {
    this.updateSeo();
    this.api.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories.set(data || []);
        this.updateSeo();
      },
      error: () => {}
    });
    this.api.getCities().subscribe({
      next: (data: any[]) => {
        this.cities.set((data || []).slice(0, 12));
        this.updateSeo();
      },
      error: () => {}
    });
  }

  fmt(n: number): string {
    return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n;
  }

  private updateSeo() {
    this.seo.setPage({
      title: this.i18n.t('seo.categories.title'),
      description: this.i18n.t('seo.categories.description'),
      path: '/categories',
      keywords: [this.i18n.t('seo.categories.title'), this.i18n.t('seo.categories.city_hubs_title'), this.i18n.t('common.vacancies')],
      schema: [
        this.seo.buildCollectionPageSchema(
          this.i18n.t('seo.categories.collection_title'),
          this.i18n.t('seo.categories.collection_description'),
          '/categories'
        ),
        this.seo.buildBreadcrumbSchema([
          { name: this.i18n.t('common.home'), path: '/' },
          { name: this.i18n.t('seo.categories.breadcrumb_title'), path: '/categories' }
        ]),
        this.seo.buildItemListSchema(
          this.i18n.t('seo.categories.popular_title'),
          this.categories().slice(0, 12).map((item: any) => ({
            name: this.i18n.t('category.' + item.category),
            path: `/vacancies/category/${encodeURIComponent(item.category)}`,
            description: item.vacancyCount ? this.fill('seo.categories.jobs_suffix', { count: item.vacancyCount }) : undefined
          }))
        ),
        this.seo.buildItemListSchema(
          this.i18n.t('seo.categories.city_hubs_title'),
          this.cities().slice(0, 12).map((item: any) => ({
            name: item.city,
            path: `/vacancies/${encodeURIComponent(item.city)}`,
            description: item.vacancyCount ? this.fill('seo.categories.jobs_suffix', { count: item.vacancyCount }) : undefined
          }))
        )
      ]
    });
  }

  private fill(key: string, params: Record<string, string | number>): string {
    let template = this.i18n.t(key);
    for (const [name, value] of Object.entries(params)) {
      template = template.replaceAll(`{${name}}`, String(value));
    }
    return template;
  }
}
