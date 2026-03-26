import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-salary',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <h1 class="text-xl font-bold text-gray-900 mb-2">💰 Maosh kalkulyatori</h1>
      <p class="text-sm text-gray-400 mb-6">Bozordagi real maosh ma'lumotlari</p>

      <!-- Category selector -->
      <div class="flex flex-wrap gap-2 mb-6">
        @for (cat of categories; track cat.key) {
          <button (click)="selectCategory(cat.key)"
                  class="h-10 px-4 rounded-full text-sm font-medium border transition"
                  [class]="selectedCategory === cat.key ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
            {{ cat.icon }} {{ cat.label }}
          </button>
        }
      </div>

      @if (salary()) {
        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div class="text-sm text-gray-500 mb-4">{{ selectedLabel() }} uchun bozor maoshi</div>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-xs text-gray-400 mb-1">Minimal</div>
              <div class="text-xl font-bold text-gray-700">{{ fmt(salary()!.p25) }}</div>
              <div class="text-xs text-gray-300">UZS</div>
            </div>
            <div class="bg-black rounded-xl p-4 text-white">
              <div class="text-xs text-gray-300 mb-1">O'rtacha</div>
              <div class="text-2xl font-bold">{{ fmt(salary()!.median) }}</div>
              <div class="text-xs text-gray-400">UZS / oy</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 mb-1">Maksimal</div>
              <div class="text-xl font-bold text-gray-700">{{ fmt(salary()!.p75) }}</div>
              <div class="text-xs text-gray-300">UZS</div>
            </div>
          </div>
          <div class="text-xs text-gray-400 text-center mt-4">{{ salary()!.sampleSize }} ta vakansiya asosida</div>
        </div>
      }

      <!-- City comparison -->
      @if (cities().length) {
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="font-semibold text-gray-800 mb-4">📍 Shaharlar bo'yicha taqqoslash</h3>
          <div class="space-y-3">
            @for (c of cities(); track c.city) {
              <div class="flex items-center gap-3">
                <div class="text-sm text-gray-600 w-28 shrink-0">{{ c.city }}</div>
                <div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div class="bg-black h-full rounded-full flex items-center justify-end pr-2"
                       [style.width.%]="(c.avgSalary / maxSalary()) * 100">
                    <span class="text-[10px] text-white font-medium">{{ fmt(c.avgSalary) }}</span>
                  </div>
                </div>
                <div class="text-xs text-gray-400 w-16 text-right">{{ c.vacancyCount }} ish</div>
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
    { key: 'COOK', label: 'Oshpaz', icon: '👨‍🍳' },
    { key: 'DRIVER', label: 'Haydovchi', icon: '🚗' },
    { key: 'SALES', label: 'Sotuvchi', icon: '🛒' },
    { key: 'BUILDER', label: 'Qurilishchi', icon: '🏗️' },
    { key: 'SECURITY', label: "Qo'riqchi", icon: '🛡️' },
    { key: 'WAITER', label: 'Ofitsiant', icon: '🍽️' },
    { key: 'CASHIER', label: 'Kassir', icon: '💰' },
    { key: 'ELECTRICIAN', label: 'Elektrik', icon: '⚡' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  selectedLabel(): string {
    return this.categories.find(c => c.key === this.selectedCategory)?.label || '';
  }

  selectCategory(key: string) {
    this.selectedCategory = key;
    this.load();
  }

  load() {
    const base = environment.apiUrl;
    this.http.get<any>(`${base}/salary/predict`, { params: { category: this.selectedCategory } }).subscribe({
      next: (s: any) => this.salary.set(s),
      error: () => this.salary.set(null)
    });
    this.http.get<any[]>(`${base}/intelligence/salary/cities`, { params: { category: this.selectedCategory } }).subscribe({
      next: (cities: any[]) => {
        this.cities.set(cities || []);
        this.maxSalary.set(Math.max(...(cities || []).map((c: any) => c.avgSalary || 0), 1));
      },
      error: () => this.cities.set([])
    });
  }

  fmt(n: number): string { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n; }
}
