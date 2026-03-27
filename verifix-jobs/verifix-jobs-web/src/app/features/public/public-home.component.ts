import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { getBenefitIcon } from '../../shared/utils/benefit-icons';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <!-- HERO — big search, mobile-first -->
    <section class="bg-gradient-to-b from-gray-50 to-white pt-8 pb-6 md:pt-14 md:pb-10">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">{{ i18n.t('hero.title') }}</h1>
        <p class="text-gray-400 text-sm md:text-base mb-6">{{ i18n.t('hero.subtitle') }}</p>
        <div class="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" [(ngModel)]="searchQuery" [placeholder]="i18n.t('hero.search_placeholder')"
                   class="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                   (keyup.enter)="doSearch()">
          </div>
          <a [routerLink]="['/jobs']" [queryParams]="{q: searchQuery}"
             class="h-12 px-8 bg-black text-white rounded-xl text-sm font-semibold flex items-center justify-center hover:bg-gray-800 transition whitespace-nowrap">
            {{ i18n.t('hero.search') }}
          </a>
        </div>
      </div>
    </section>

    <!-- CATEGORIES — large icons, easy tap -->
    <section class="py-8 md:py-10">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ i18n.t('categories.title') }}</h2>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          @for (cat of categoryIcons; track cat.key) {
            <a [routerLink]="['/jobs']" [queryParams]="{category: cat.key}"
               class="flex flex-col items-center gap-2 py-4 px-2 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition bg-white group">
              <span class="text-3xl">{{ cat.icon }}</span>
              <span class="text-xs font-medium text-gray-600 group-hover:text-black text-center leading-tight">{{ cat.label }}</span>
              @if (getCatCount(cat.key); as count) {
                <span class="text-[10px] text-gray-400">{{ count }}</span>
              }
            </a>
          }
        </div>
      </div>
    </section>

    <!-- VACANCIES — card style, salary prominent -->
    <section class="bg-gray-50 py-8 md:py-10">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-gray-900">{{ i18n.t('vacancies.new') }}</h2>
          <a routerLink="/jobs" class="text-sm text-gray-500 hover:text-black font-medium transition">{{ i18n.t('vacancies.view_all') }} &rarr;</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (v of vacancies(); track v.id) {
            <a [routerLink]="['/jobs', v.slug || v.id]"
               class="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition group">
              <!-- Salary — most important for blue collar -->
              @if (v.salaryFrom) {
                <div class="text-lg font-bold text-gray-900 mb-1">
                  {{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' – ' + fmt(v.salaryTo) : '+' }}
                  <span class="text-xs font-normal text-gray-400">UZS</span>
                </div>
              }
              <h3 class="text-sm font-semibold text-gray-800 group-hover:text-black truncate">{{ v.title }}</h3>
              <div class="text-xs text-gray-400 mt-1 truncate">{{ v.employer?.name || v.employerName }}</div>
              <!-- Benefits icons -->
              @if (v.benefits?.length) {
                <div class="flex gap-1 mt-2">
                  @for (b of v.benefits.slice(0, 4); track b) {
                    <span class="text-sm" [title]="b">{{ getBenefitIcon(b) }}</span>
                  }
                </div>
              }
              <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ v.city || 'Toshkent' }}
                </span>
                @if (v.employmentType) {
                  <span class="px-2 py-0.5 bg-gray-100 rounded-full">{{ empType(v.employmentType) }}</span>
                }
                @if (v.isBranded || v.promoted) {
                  <span class="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">TOP ⭐</span>
                }
              </div>
            </a>
          } @empty {
            <div class="col-span-full text-center py-12 text-gray-400 text-sm">Yuklanmoqda...</div>
          }
        </div>
      </div>
    </section>

    <!-- POPULAR CITIES — quick access -->
    <section class="py-8 md:py-10">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Shaharlar bo'yicha</h2>
        <div class="flex flex-wrap gap-2">
          @for (city of cities; track city) {
            <a [routerLink]="['/vacancies', city]"
               class="h-10 px-5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-black hover:text-white hover:border-black transition flex items-center">
              {{ city }}
            </a>
          }
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="bg-black text-white py-10">
      <div class="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
        <div><div class="text-2xl md:text-3xl font-bold">{{ stats().vacancies }}+</div><div class="text-xs text-gray-400 mt-1">{{ i18n.t('stats.vacancies') }}</div></div>
        <div><div class="text-2xl md:text-3xl font-bold">{{ stats().employers }}+</div><div class="text-xs text-gray-400 mt-1">{{ i18n.t('stats.employers') }}</div></div>
        <div><div class="text-2xl md:text-3xl font-bold">{{ stats().hired }}+</div><div class="text-xs text-gray-400 mt-1">{{ i18n.t('stats.hired') }}</div></div>
      </div>
    </section>

    <!-- TELEGRAM CTA -->
    <section class="py-10">
      <div class="max-w-xl mx-auto px-4 text-center">
        <div class="text-4xl mb-3">📱</div>
        <h2 class="text-lg font-bold text-gray-900 mb-2">{{ i18n.t('telegram.title') }}</h2>
        <p class="text-sm text-gray-400 mb-5">{{ i18n.t('telegram.desc') }}</p>
        <a href="https://t.me/VerifixJobBot" target="_blank"
           class="inline-flex items-center gap-2 h-12 px-6 bg-[#2AABEE] text-white rounded-xl text-sm font-semibold hover:bg-[#229ED9] transition">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-2.01 9.47c-.15.68-.54.84-1.1.53l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.06 5.56-5.02c.24-.22-.05-.34-.38-.13L8.6 14.27l-2.98-.93c-.65-.2-.66-.65.14-.96l11.65-4.49c.54-.2 1.01.13.84.96l-.3 1.28z"/></svg>
          {{ i18n.t('telegram.cta') }}
        </a>
      </div>
    </section>

    <div class="mb-16 md:mb-0"></div><!-- space for mobile bottom nav -->
    <vjw-public-footer />
  `,
})
export class PublicHomeComponent implements OnInit {
  searchQuery = '';
  categories = signal<any[]>([]);
  vacancies = signal<any[]>([]);
  stats = signal({vacancies:0,employers:0,hired:0});
  cities = ['Toshkent','Samarqand','Buxoro','Andijon','Namangan','Farg\'ona','Nukus','Navoiy','Qarshi','Jizzax','Termiz','Urganch','Guliston'];

  categoryIcons = [
    {key:'COOK',label:'Oshpaz',icon:'👨‍🍳'},
    {key:'DRIVER',label:'Haydovchi',icon:'🚗'},
    {key:'SALES',label:'Sotuvchi',icon:'🛒'},
    {key:'BUILDER',label:'Qurilishchi',icon:'🏗️'},
    {key:'WAITER',label:'Ofitsiant',icon:'🍽️'},
    {key:'SECURITY',label:'Qo\'riqchi',icon:'🛡️'},
    {key:'WAREHOUSE',label:'Omborchi',icon:'📦'},
    {key:'CLEANER',label:'Tozalovchi',icon:'🧹'},
    {key:'ELECTRICIAN',label:'Elektrik',icon:'⚡'},
    {key:'TAILOR',label:'Tikuvchi',icon:'🧵'},
    {key:'COURIER',label:'Kuryer',icon:'🏍️'},
    {key:'CASHIER',label:'Kassir',icon:'💰'},
    {key:'LOADER',label:'Yukchi',icon:'💪'},
    {key:'PLUMBER',label:'Santexnik',icon:'🔧'},
  ];

  constructor(private api: PublicApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getCategories().subscribe({
      next: (cats:any[]) => {
        this.categories.set(cats);
        const total = cats.reduce((a:number,c:any) => a+(c.vacancyCount||0), 0);
        this.stats.set({vacancies: total, employers: cats.length, hired: Math.round(total*0.05)});
      },
      error: () => {}
    });
    this.api.getVacancies({page:0,size:9,sort:'date_desc'}).subscribe({
      next: (r:any) => this.vacancies.set(r.content||[]),
      error: () => {}
    });
  }

  getCatCount(key:string): number {
    const c = this.categories().find((x:any) => x.category === key);
    return c?.vacancyCount || 0;
  }

  doSearch() {}

  fmt(n:number):string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':''+n; }

  empType(t:string):string {
    return ({FULL_TIME:"To'liq",PART_TIME:'Yarim',CONTRACT:'Shartnoma',TEMPORARY:'Vaqtinchalik'} as Record<string,string>)[t]||t;
  }

  getBenefitIcon = getBenefitIcon;
}
