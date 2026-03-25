import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-vacancy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Search -->
      <div class="flex flex-col sm:flex-row gap-2 mb-6">
        <input type="text" [(ngModel)]="query" placeholder="Kasb, lavozim yoki kompaniya..."
               class="flex-1 h-12 px-4 border border-gray-300 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
               (keyup.enter)="search()">
        <select [(ngModel)]="city" (ngModelChange)="search()" class="h-12 px-4 border border-gray-300 rounded-lg text-sm bg-white sm:w-44">
          <option value="">Barcha shaharlar</option>
          @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
        </select>
        <select [(ngModel)]="category" (ngModelChange)="search()" class="h-12 px-4 border border-gray-300 rounded-lg text-sm bg-white sm:w-44">
          <option value="">Barcha kasblar</option>
          @for (c of catOptions; track c.key) { <option [value]="c.key">{{ c.label }}</option> }
        </select>
        <button (click)="search()" class="h-12 px-6 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">Topish</button>
      </div>

      <!-- Results header -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-gray-900">
          Vakansiyalar
          <span class="text-gray-400 font-normal text-base ml-2">{{ total() }}</span>
        </h1>
      </div>

      <!-- Vacancy cards -->
      <div class="space-y-3">
        @for (v of vacancies(); track v.id) {
          <a [routerLink]="['/jobs', v.slug || v.id]" class="block bg-white border border-gray-100 rounded-lg p-4 md:p-5 hover:shadow-md transition group">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-medium text-gray-900 group-hover:text-black truncate">{{ v.title }}</h3>
                <div class="text-sm text-gray-500 mt-0.5">{{ v.employer?.name || v.employerName }}</div>
              </div>
              <div class="flex items-center gap-4 text-sm shrink-0">
                @if (v.salaryFrom) {
                  <span class="font-semibold text-gray-900 whitespace-nowrap">{{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }} UZS</span>
                }
                <span class="text-gray-400">{{ v.city }}</span>
              </div>
            </div>
          </a>
        } @empty {
          <div class="text-center py-16 text-gray-400 text-sm">
            @if (loading()) { Yuklanmoqda... } @else { Vakansiya topilmadi }
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-2 mt-8">
          @for (p of pages(); track p) {
            <button (click)="goPage(p)" class="w-10 h-10 rounded-lg text-sm font-medium transition"
                    [class]="p === page() ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">{{ p + 1 }}</button>
          }
        </div>
      }
    </div>

    <vjw-public-footer />
  `,
})
export class PublicVacancyListComponent implements OnInit {
  vacancies = signal<any[]>([]);
  total = signal(0);
  totalPages = signal(0);
  page = signal(0);
  pages = signal<number[]>([]);
  loading = signal(true);
  query = '';
  city = '';
  category = '';
  cities = ['Toshkent','Samarqand','Buxoro','Andijon','Namangan','Fargona','Nukus','Navoiy','Qarshi'];
  catOptions = [
    {key:'COOK',label:'Oshpaz'},{key:'DRIVER',label:'Haydovchi'},{key:'SALES',label:'Sotuvchi'},
    {key:'BUILDER',label:'Qurilishchi'},{key:'CLEANER',label:'Tozalovchi'},{key:'WAITER',label:'Ofitsiant'},
    {key:'CASHIER',label:'Kassir'},{key:'WAREHOUSE',label:'Omborchi'},{key:'SECURITY',label:"Qo'riqchi"},
    {key:'ELECTRICIAN',label:'Elektrik'},{key:'PLUMBER',label:'Santexnik'},{key:'TAILOR',label:'Tikuvchi'},
    {key:'COURIER',label:'Kuryer'},{key:'LOADER',label:'Yukchi'},
  ];

  constructor(private api: PublicApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.query = p['q'] || '';
      this.city = p['city'] || '';
      this.category = p['category'] || '';
      this.search();
    });
  }

  search() {
    this.loading.set(true);
    this.api.getVacancies({ q: this.query, city: this.city, category: this.category, page: this.page(), size: 15 }).subscribe({
      next: (r: any) => {
        this.vacancies.set(r.content || []);
        this.total.set(r.totalElements || 0);
        this.totalPages.set(r.totalPages || 0);
        this.pages.set(Array.from({length: Math.min(r.totalPages || 0, 7)}, (_,i) => i));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goPage(p: number) { this.page.set(p); this.search(); }

  fmt(n: number): string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':''+n; }
}
