import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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

    <div class="max-w-6xl mx-auto px-4 pt-4 pb-20 md:pb-8">
      <!-- Search bar -->
      <div class="flex flex-col sm:flex-row gap-2 mb-4">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" [(ngModel)]="query" placeholder="Kasb, lavozim..."
                 class="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                 (keyup.enter)="search()">
        </div>
        <button (click)="search()" class="h-12 px-6 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">Topish</button>
      </div>

      <!-- Filters — scrollable chips -->
      <div class="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar">
        <button (click)="setCity('')" class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
                [class]="!city ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">Barchasi</button>
        @for (c of cities; track c) {
          <button (click)="setCity(c)" class="shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition"
                  [class]="city === c ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">{{ c }}</button>
        }
      </div>

      <!-- Category chips -->
      <div class="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
        <button (click)="setCategory('')" class="shrink-0 h-8 px-3 rounded-full text-xs font-medium border transition"
                [class]="!category ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'">Barcha kasblar</button>
        @for (cat of categoryList; track cat.key) {
          <button (click)="setCategory(cat.key)" class="shrink-0 h-8 px-3 rounded-full text-xs font-medium border transition"
                  [class]="category === cat.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'">
            {{ cat.icon }} {{ cat.label }}
          </button>
        }
      </div>

      <!-- Results count -->
      <div class="text-xs text-gray-400 mb-3">{{ total() }} ta vakansiya topildi</div>

      <!-- Vacancy cards — salary prominent -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        @for (v of vacancies(); track v.id) {
          <a [routerLink]="['/jobs', v.slug || v.id]"
             class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition group">
            @if (v.salaryFrom) {
              <div class="text-lg font-bold text-gray-900 mb-1">
                {{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' – ' + fmt(v.salaryTo) : '+' }}
                <span class="text-xs font-normal text-gray-400">UZS</span>
              </div>
            } @else {
              <div class="text-sm font-medium text-gray-400 mb-1">Kelishiladi</div>
            }
            <h3 class="text-sm font-semibold text-gray-800 group-hover:text-black truncate">{{ v.title }}</h3>
            <div class="text-xs text-gray-400 mt-0.5 truncate">{{ v.employer?.name || v.employerName }}</div>
            <div class="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ v.city || 'Toshkent' }}
              </span>
              @if (v.employmentType) {
                <span class="px-2 py-0.5 bg-gray-100 rounded-full">{{ empType(v.employmentType) }}</span>
              }
              @if (v.positionsCount > 1) {
                <span class="px-2 py-0.5 bg-green-50 text-green-600 rounded-full">{{ v.positionsCount }} o'rin</span>
              }
            </div>
          </a>
        } @empty {
          <div class="col-span-full text-center py-16 text-gray-400 text-sm">
            @if (loading()) { Yuklanmoqda... } @else { Vakansiya topilmadi }
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex justify-center gap-1 mt-6">
          @for (p of pages(); track p) {
            <button (click)="goToPage(p)" class="w-10 h-10 rounded-lg text-sm font-medium transition"
                    [class]="p === page ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">{{ p + 1 }}</button>
          }
        </div>
      }
    </div>

    <vjw-public-footer />
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`]
})
export class PublicVacancyListComponent implements OnInit {
  query = '';
  city = '';
  category = '';
  page = 0;
  vacancies = signal<any[]>([]);
  total = signal(0);
  totalPages = signal(0);
  loading = signal(true);

  cities = ['Toshkent','Samarqand','Buxoro','Andijon','Namangan','Farg\'ona','Nukus','Navoiy','Qarshi'];
  categoryList = [
    {key:'COOK',label:'Oshpaz',icon:'👨‍🍳'},{key:'DRIVER',label:'Haydovchi',icon:'🚗'},
    {key:'SALES',label:'Sotuvchi',icon:'🛒'},{key:'BUILDER',label:'Qurilishchi',icon:'🏗️'},
    {key:'WAITER',label:'Ofitsiant',icon:'🍽️'},{key:'SECURITY',label:'Qo\'riqchi',icon:'🛡️'},
    {key:'WAREHOUSE',label:'Omborchi',icon:'📦'},{key:'COURIER',label:'Kuryer',icon:'🏍️'},
    {key:'ELECTRICIAN',label:'Elektrik',icon:'⚡'},{key:'TAILOR',label:'Tikuvchi',icon:'🧵'},
    {key:'CASHIER',label:'Kassir',icon:'💰'},{key:'LOADER',label:'Yukchi',icon:'💪'},
  ];

  constructor(private api: PublicApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.query = p['q'] || '';
      this.city = p['city'] || '';
      this.category = p['category'] || '';
      this.page = +(p['page'] || 0);
      this.loadVacancies();
    });
  }

  loadVacancies() {
    this.loading.set(true);
    this.api.getVacancies({q:this.query,city:this.city,category:this.category,page:this.page,size:12}).subscribe({
      next: (r:any) => {
        this.vacancies.set(r.content||[]);
        this.total.set(r.totalElements||0);
        this.totalPages.set(r.totalPages||0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  search() { this.updateUrl(); }
  setCity(c:string) { this.city = c; this.page = 0; this.updateUrl(); }
  setCategory(c:string) { this.category = c; this.page = 0; this.updateUrl(); }
  goToPage(p:number) { this.page = p; this.updateUrl(); }

  updateUrl() {
    const q: any = {};
    if (this.query) q['q'] = this.query;
    if (this.city) q['city'] = this.city;
    if (this.category) q['category'] = this.category;
    if (this.page) q['page'] = this.page;
    this.router.navigate(['/jobs'], { queryParams: q });
  }

  pages = signal<number[]>([]);
  ngDoCheck() {
    const tp = this.totalPages();
    const arr = [];
    for (let i = Math.max(0, this.page-2); i < Math.min(tp, this.page+5); i++) arr.push(i);
    this.pages.set(arr);
  }

  fmt(n:number):string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':''+n; }
  empType(t:string):string { return ({FULL_TIME:"To'liq",PART_TIME:'Yarim',CONTRACT:'Shartnoma',TEMPORARY:'Vaqtinchalik'} as Record<string,string>)[t]||t; }
}
