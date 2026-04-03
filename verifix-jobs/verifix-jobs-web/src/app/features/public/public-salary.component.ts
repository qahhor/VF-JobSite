import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { SeoService } from '../../core/services/seo.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-public-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <h1 class="text-xl font-bold text-gray-900 mb-2">&#128176; {{ i18n.t('public.salary.title') }}</h1>
      <p class="text-sm text-gray-400 mb-6">{{ i18n.t('public.salary.subtitle') }}</p>

      <div class="flex flex-wrap gap-2 mb-6">
        @for (cat of categories; track cat.key) {
          <button (click)="selectCategory(cat.key)"
                  class="h-10 px-4 rounded-full text-sm font-medium border transition"
                  [class]="selectedCategory === cat.key ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
            {{ cat.icon }} {{ categoryLabel(cat.key) }}
          </button>
        }
      </div>

      @if (salary()) {
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div class="text-sm text-gray-500 mb-4">{{ selectedLabel() }} {{ i18n.t('public.salary.market_salary_for') }}</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-xs text-gray-400 mb-1">{{ i18n.t('public.salary.minimum') }}</div>
              <div class="text-xl font-bold text-gray-700">{{ fmt(salary()!.p25) }}</div>
              <div class="text-xs text-gray-300">UZS</div>
            </div>
            <div class="bg-black rounded-xl p-4 text-white">
              <div class="text-xs text-gray-300 mb-1">{{ i18n.t('public.salary.average') }}</div>
              <div class="text-2xl font-bold">{{ fmt(salary()!.median) }}</div>
              <div class="text-xs text-gray-400">UZS / oy</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">{{ i18n.t('public.salary.maximum') }}</div>
              <div class="text-xl font-bold text-gray-700">{{ fmt(salary()!.p75) }}</div>
              <div class="text-xs text-gray-300">UZS</div>
            </div>
          </div>
          <div class="text-xs text-gray-400 text-center mt-4">{{ salary()!.sampleSize }} {{ i18n.t('public.salary.based_on') }}</div>
        </div>
      }

      @if (cities().length) {
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="font-semibold text-gray-800 mb-4">&#128205; {{ i18n.t('public.salary.compare_cities') }}</h2>
          <div class="space-y-3">
            @for (c of cities(); track c.city) {
              <div class="flex items-center gap-3">
                <div class="text-sm text-gray-600 w-24 sm:w-28 shrink-0">{{ c.city }}</div>
                <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div class="bg-black h-full rounded-full flex items-center justify-end pr-2"
                       [style.width.%]="(c.avgSalary / maxSalary()) * 100">
                    <span class="text-[10px] text-white font-medium">{{ fmt(c.avgSalary) }}</span>
                  </div>
                </div>
                <div class="text-xs text-gray-400 w-16 text-right">{{ c.vacancyCount }} {{ i18n.t('public.salary.jobs_count') }}</div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <vjw-public-footer />
  `,
})
export class PublicSalaryComponent implements OnInit {
  salary = signal<any>(null);
  cities = signal<any[]>([]);
  maxSalary = signal(1);
  selectedCategory = 'COOK';

  categories = [
    { key: 'COOK', label: 'Oshpaz', icon: '\u{1F468}\u200D\u{1F373}' },
    { key: 'DRIVER', label: 'Haydovchi', icon: '\u{1F697}' },
    { key: 'SALES', label: 'Sotuvchi', icon: '\u{1F6D2}' },
    { key: 'BUILDER', label: 'Qurilishchi', icon: '\u{1F3D7}\uFE0F' },
    { key: 'SECURITY', label: "Qo'riqchi", icon: '\u{1F6E1}\uFE0F' },
    { key: 'WAITER', label: 'Ofitsiant', icon: '\u{1F37D}\uFE0F' },
    { key: 'CASHIER', label: 'Kassir', icon: '\u{1F4B0}' },
    { key: 'ELECTRICIAN', label: 'Elektrik', icon: '\u26A1' },
  ];

  constructor(private http: HttpClient, private seo: SeoService, public i18n: I18nService) {}

  ngOnInit() {
    this.updateSeo();
    this.load();
  }

  selectedLabel(): string {
    return this.categoryLabel(this.selectedCategory);
  }

  categoryLabel(category: string): string {
    return this.i18n.t(`category.${category}`);
  }

  selectCategory(key: string) {
    this.selectedCategory = key;
    this.load();
  }

  load() {
    const base = environment.apiUrl;
    this.http.get<any>(`${base}/salary/predict`, { params: { category: this.selectedCategory } }).subscribe({
      next: (salary: any) => {
        this.salary.set(salary);
        this.updateSeo();
      },
      error: () => this.salary.set(null)
    });
    this.http.get<any[]>(`${base}/intelligence/salary/cities`, { params: { category: this.selectedCategory } }).subscribe({
      next: (cities: any[]) => {
        this.cities.set(cities || []);
        this.maxSalary.set(Math.max(...(cities || []).map((city: any) => city.avgSalary || 0), 1));
        this.updateSeo();
      },
      error: () => this.cities.set([])
    });
  }

  fmt(n: number): string {
    return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : `${n}`;
  }

  private updateSeo() {
    const label = this.selectedLabel() || 'Salary';
    const salary = this.salary();
    const description = salary
      ? `Salary guide for ${label}: median ${this.fmt(salary.median)} ${salary.currency || 'UZS'} based on ${salary.sampleSize || 0} vacancies.`
      : `Compare market salary ranges for ${label} jobs across Uzbekistan on Verifix Jobs.`;

    this.seo.setPage({
      title: `${label} ${this.i18n.t('public.salary.title')}`,
      description,
      path: '/salary',
      keywords: ['salary guide', label, 'job salary', 'uzbekistan salary'],
      schema: [
        this.seo.buildCollectionPageSchema('Salary guide', description, '/salary'),
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Salary', path: '/salary' }
        ]),
        this.seo.buildItemListSchema(
          `${label} salaries by city`,
          this.cities().slice(0, 10).map((city: any) => ({
            name: city.city,
            path: `/vacancies/${encodeURIComponent(city.city)}/${encodeURIComponent(this.selectedCategory)}`,
            description: `${this.fmt(city.avgSalary)} UZS average`
          }))
        )
      ]
    });
  }
}
