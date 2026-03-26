import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <div class="mb-8">
        <div class="text-xs uppercase tracking-wide text-gray-400 mb-2">Category Hubs</div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Kasblar va shaharlar bo'yicha ishlar</h1>
        <p class="text-sm text-gray-500 mt-2">SEO va tezkor navigatsiya uchun public hub sahifalar.</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (item of categories(); track item.category) {
              <a [routerLink]="['/jobs']" [queryParams]="{ category: item.category }"
                 class="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition">
                <div class="text-3xl">{{ item.icon || '📋' }}</div>
                <div class="text-sm font-semibold text-gray-900 mt-3">{{ item.category }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ item.vacancyCount }} ta vakansiya</div>
                @if (item.avgSalary) {
                  <div class="text-xs text-gray-400 mt-2">O'rtacha {{ fmt(item.avgSalary) }} UZS</div>
                }
              </a>
            }
          </div>
        </div>

        <aside class="space-y-4">
          <div class="rounded-2xl border border-gray-100 bg-white p-5">
            <div class="text-sm font-semibold text-gray-900 mb-3">Shahar landing pages</div>
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

  constructor(private api: PublicApiService, private title: Title) {}

  ngOnInit() {
    this.title.setTitle("Kasblar va shaharlar | Verifix Jobs");
    this.api.getCategories().subscribe({
      next: (data: any[]) => this.categories.set(data || []),
      error: () => {}
    });
    this.api.getCities().subscribe({
      next: (data: any[]) => this.cities.set((data || []).slice(0, 12)),
      error: () => {}
    });
  }

  fmt(n: number): string {
    return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n;
  }
}
