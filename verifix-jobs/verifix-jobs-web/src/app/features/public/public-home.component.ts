import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../core/services/public-api.service';

@Component({
  selector: 'vjw-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- HEADER -->
    <header class="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2.5">
          <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
          <span class="font-semibold text-lg tracking-tight">Verifix Jobs</span>
        </a>
        <nav class="hidden md:flex items-center gap-8 text-sm">
          <a routerLink="/jobs" class="text-gray-500 hover:text-black transition">Vakansiyalar</a>
          <a routerLink="/companies" class="text-gray-500 hover:text-black transition">Kompaniyalar</a>
        </nav>
        <div class="flex items-center gap-3">
          <a routerLink="/login" class="hidden sm:inline text-sm font-medium text-black hover:underline">Kirish</a>
          <a routerLink="/login" class="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">Ish beruvchi</a>
        </div>
      </div>
    </header>

    <!-- HERO SEARCH -->
    <section class="bg-white py-10 md:py-16">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Ish qidirish</h1>
        <p class="text-gray-500 text-sm md:text-base mb-8">Minglab vakansiyalar orasidan mosini toping</p>
        <div class="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Kasb, lavozim yoki kompaniya..."
                 class="flex-1 h-12 px-4 border border-gray-300 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none">
          <select [(ngModel)]="searchCity" class="h-12 px-4 border border-gray-300 rounded-lg text-sm bg-white sm:w-44">
            <option value="">Barcha shaharlar</option>
            @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
          </select>
          <a [routerLink]="['/jobs']" [queryParams]="{q: searchQuery, city: searchCity}"
             class="h-12 px-6 bg-black text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-gray-800 transition">Topish</a>
        </div>
        <div class="flex flex-wrap justify-center gap-2 mt-5">
          @for (tag of popularTags; track tag) {
            <a [routerLink]="['/jobs']" [queryParams]="{q: tag}" class="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition">{{ tag }}</a>
          }
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="bg-gray-50 py-10 md:py-14">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Professional sohalar</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (cat of categories(); track cat.key) {
            <a [routerLink]="['/jobs']" [queryParams]="{category: cat.key}" class="bg-white rounded-lg p-4 hover:shadow-md transition border border-gray-100 group">
              <div class="text-sm font-medium text-gray-900 group-hover:text-black">{{ cat.label }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ cat.count }} vakansiya</div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- VACANCIES -->
    <section class="bg-white py-10 md:py-14">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Yangi vakansiyalar</h2>
          <a routerLink="/jobs" class="text-sm text-gray-500 hover:text-black transition">Barchasi &#8594;</a>
        </div>
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
            <div class="text-center py-10 text-gray-400 text-sm">Yuklanmoqda...</div>
          }
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="bg-gray-50 py-10">
      <div class="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
        <div><div class="text-2xl md:text-3xl font-bold text-gray-900">{{ stats().vacancies }}+</div><div class="text-xs text-gray-500 mt-1">Vakansiyalar</div></div>
        <div><div class="text-2xl md:text-3xl font-bold text-gray-900">{{ stats().employers }}+</div><div class="text-xs text-gray-500 mt-1">Kompaniyalar</div></div>
        <div><div class="text-2xl md:text-3xl font-bold text-gray-900">{{ stats().hired }}+</div><div class="text-xs text-gray-500 mt-1">Ishga olingan</div></div>
      </div>
    </section>

    <!-- TELEGRAM -->
    <section class="bg-black text-white py-10 md:py-14">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-xl md:text-2xl font-bold mb-3">Telegram bot orqali ish toping</h2>
        <p class="text-gray-400 text-sm mb-6">Yangi vakansiyalar har kuni telefoningizga keladi</p>
        <a href="https://t.me/VerifixJobsBot" target="_blank" class="inline-flex bg-white text-black px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition">Botga o'tish &#8594;</a>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-white border-t border-gray-100 py-10">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-3"><img src="assets/logo-icon.svg" alt="Verifix" class="h-6"><span class="font-semibold text-sm">Verifix Jobs</span></div>
            <p class="text-xs text-gray-400">Markaziy Osiyodagi ish qidirish platformasi</p>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ish qidiruvchilar</h4>
            <div class="space-y-2 text-xs text-gray-500"><a routerLink="/jobs" class="block hover:text-black">Vakansiyalar</a><a routerLink="/companies" class="block hover:text-black">Kompaniyalar</a></div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ish beruvchilar</h4>
            <div class="space-y-2 text-xs text-gray-500"><a routerLink="/login" class="block hover:text-black">Kirish</a></div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Aloqa</h4>
            <div class="space-y-2 text-xs text-gray-500"><div>info&#64;verifix.uz</div><div>+998 71 200 00 00</div></div>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-gray-400">&#169; 2024-2026 Verifix LLC</p>
          <div class="flex gap-4 text-xs text-gray-400"><a href="#" class="hover:text-black">Maxfiylik</a><a href="#" class="hover:text-black">Shartlar</a></div>
        </div>
      </div>
    </footer>
  `,
})
export class PublicHomeComponent implements OnInit {
  menuOpen = signal(false);
  searchQuery = '';
  searchCity = '';
  categories = signal<{key:string;label:string;count:number}[]>([]);
  vacancies = signal<any[]>([]);
  stats = signal({vacancies:0,employers:0,hired:0});
  cities = ['Toshkent','Samarqand','Buxoro','Andijon','Namangan','Fargona','Nukus','Navoiy','Qarshi'];
  popularTags = ['Oshpaz','Haydovchi','Sotuvchi','Kuryer','Elektrik','Tikuvchi','Omborchi'];

  constructor(private api: PublicApiService) {}

  ngOnInit() {
    this.api.getCategories().subscribe((cats:any[]) => {
      this.categories.set(cats.map(c => ({key:c.category, label:this.lbl(c.category), count:c.vacancyCount})));
      this.stats.update(s => ({...s, vacancies: cats.reduce((a,c) => a+c.vacancyCount, 0)}));
    });
    this.api.getVacancies({page:0,size:8}).subscribe((r:any) => this.vacancies.set(r.content||[]));
    this.api.getStats().subscribe((s:any) => this.stats.set(s));
  }

  fmt(n:number):string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':''+n; }

  lbl(k:string):string {
    const m:Record<string,string>={COOK:'Oshpaz',DRIVER:'Haydovchi',SALES:'Sotuvchi',BUILDER:'Qurilishchi',CLEANER:'Tozalovchi',WAITER:'Ofitsiant',CASHIER:'Kassir',WAREHOUSE:'Omborchi',SECURITY:'Qo\'riqchi',ELECTRICIAN:'Elektrik',PLUMBER:'Santexnik',TAILOR:'Tikuvchi',COURIER:'Kuryer',LOADER:'Yukchi'};
    return m[k]||k;
  }
}
