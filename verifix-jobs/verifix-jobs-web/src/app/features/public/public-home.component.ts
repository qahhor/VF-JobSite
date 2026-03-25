import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService, PublicVacancy, PublicStats } from '../../core/services/public-api.service';

interface CategoryItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'vjw-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- NAVBAR -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a routerLink="/" class="flex items-center gap-2">
            <img src="assets/logo-icon.svg" alt="Verifix" class="h-8">
            <span class="font-bold text-xl text-gray-800">Verifix <span class="text-[#000000]">Jobs</span></span>
          </a>
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/jobs" class="text-sm font-medium text-gray-600 hover:text-[#000000] transition-colors">Vakansiyalar</a>
            <a routerLink="/companies" class="text-sm font-medium text-gray-600 hover:text-[#000000] transition-colors">Kompaniyalar</a>
            <a routerLink="/login" class="text-sm font-medium text-white bg-[#000000] px-4 py-2 rounded-lg hover:bg-[#154a6e] transition-colors">Ish beruvchi sifatida kirish</a>
          </div>
          <button class="md:hidden text-gray-600 text-2xl" (click)="mobileNav.set(!mobileNav())">
            @if (mobileNav()) { &#x2715; } @else { &#9776; }
          </button>
        </div>
      </div>
      @if (mobileNav()) {
        <div class="md:hidden border-t bg-white px-4 py-3 space-y-2">
          <a routerLink="/jobs" class="block py-2 text-sm font-medium text-gray-600">Vakansiyalar</a>
          <a routerLink="/companies" class="block py-2 text-sm font-medium text-gray-600">Kompaniyalar</a>
          <a routerLink="/login" class="block py-2 text-sm font-medium text-[#000000]">Ish beruvchi sifatida kirish</a>
        </div>
      }
    </nav>

    <!-- HERO -->
    <section class="bg-gradient-to-br from-[#000000] via-[#1a6fa3] to-[#000000] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-3xl md:text-5xl font-bold leading-tight mb-4">
            O'zbekistonda ish topish <span class="text-[#333333]">oson</span> bo'ldi
          </h1>
          <p class="text-lg md:text-xl text-blue-100 mb-8">
            Minglab vakansiyalar orasidan o'zingizga mosini toping. Ro'yxatdan o'tish shart emas.
          </p>

          <!-- Search bar -->
          <div class="bg-white rounded-2xl shadow-2xl p-3 md:p-4">
            <div class="flex flex-col md:flex-row gap-3">
              <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" [(ngModel)]="searchQuery" placeholder="Kalit so'z: oshpaz, haydovchi..."
                       class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 text-sm" />
              </div>
              <select [(ngModel)]="searchCity"
                      class="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 text-sm bg-white">
                <option value="">Barcha shaharlar</option>
                @for (city of cities; track city) {
                  <option [value]="city">{{ city }}</option>
                }
              </select>
              <select [(ngModel)]="searchCategory"
                      class="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#000000]/30 text-sm bg-white">
                <option value="">Barcha kategoriyalar</option>
                @for (cat of categories; track cat.key) {
                  <option [value]="cat.key">{{ cat.label }}</option>
                }
              </select>
              <a [routerLink]="['/jobs']"
                 [queryParams]="{ q: searchQuery || undefined, city: searchCity || undefined, category: searchCategory || undefined }"
                 class="bg-[#333333] hover:bg-[#27ae60] text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm whitespace-nowrap flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Qidirish
              </a>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <span class="text-blue-200 text-sm">Ommabop:</span>
            @for (tag of ['Oshpaz', 'Haydovchi', 'Sotuvchi', 'Kuryer']; track tag) {
              <a routerLink="/jobs" [queryParams]="{ q: tag }"
                 class="text-sm bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full transition-colors">{{ tag }}</a>
            }
          </div>
        </div>
      </div>
      <div class="h-8 bg-[#FFFFFF]" style="clip-path: ellipse(60% 100% at 50% 100%);"></div>
    </section>

    <!-- CATEGORIES -->
    <section class="bg-[#FFFFFF] py-12 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Ommabop kategoriyalar</h2>
          <p class="text-gray-500 mt-2">Sohangizga mos vakansiyalarni toping</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          @for (cat of categories; track cat.key) {
            <a routerLink="/jobs" [queryParams]="{ category: cat.key }"
               class="group bg-white rounded-xl p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-transparent hover:border-[#000000]/20">
              <div class="w-12 h-12 mx-auto mb-3 bg-[#000000]/10 group-hover:bg-[#000000] rounded-xl flex items-center justify-center text-2xl transition-colors">
                <span class="group-hover:scale-110 transition-transform" [class.grayscale-0]="true">{{ cat.icon }}</span>
              </div>
              <span class="text-xs md:text-sm font-medium text-gray-700 group-hover:text-[#000000] transition-colors">{{ cat.label }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- LATEST VACANCIES -->
    <section class="py-12 md:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Yangi vakansiyalar</h2>
            <p class="text-gray-500 mt-1">Eng so'nggi e'lonlar</p>
          </div>
          <a routerLink="/jobs" class="hidden sm:flex items-center gap-1 text-[#000000] font-medium text-sm hover:underline">
            Barchasini ko'rish
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loadingVacancies()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-gray-100 rounded-xl h-52 animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            @for (v of latestVacancies(); track v.id) {
              <a [routerLink]="['/jobs', v.slug || v.id]"
                 class="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#000000]/30 transition-all duration-200">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-800 group-hover:text-[#000000] transition-colors truncate">{{ v.title }}</h3>
                    <p class="text-sm text-gray-500 mt-0.5">{{ v.employerName }}</p>
                  </div>
                  @if (v.isMassHiring) {
                    <span class="ml-2 shrink-0 bg-[#666666]/10 text-[#666666] text-xs font-medium px-2 py-0.5 rounded-full">Ommaviy</span>
                  }
                </div>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ v.city }}
                  </span>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ v.employmentType === 'FULL_TIME' ? 'To\'liq' : v.employmentType === 'PART_TIME' ? 'Yarim' : v.employmentType }}
                  </span>
                </div>
                @if (v.salaryFrom || v.salaryTo) {
                  <div class="text-[#333333] font-semibold text-sm">
                    @if (v.salaryFrom && v.salaryTo) {
                      {{ formatSalary(v.salaryFrom) }} - {{ formatSalary(v.salaryTo) }} {{ v.currency || 'UZS' }}
                    } @else if (v.salaryFrom) {
                      {{ formatSalary(v.salaryFrom) }}+ {{ v.currency || 'UZS' }}
                    } @else {
                      {{ formatSalary(v.salaryTo!) }} gacha {{ v.currency || 'UZS' }}
                    }
                  </div>
                } @else {
                  <div class="text-gray-400 text-sm">Kelishiladi</div>
                }
                @if (v.benefits && v.benefits.length > 0) {
                  <div class="flex flex-wrap gap-1 mt-3">
                    @for (b of v.benefits.slice(0, 3); track b) {
                      <span class="text-xs bg-[#000000]/5 text-[#000000] px-2 py-0.5 rounded">{{ b }}</span>
                    }
                    @if (v.benefits.length > 3) {
                      <span class="text-xs text-gray-400">+{{ v.benefits.length - 3 }}</span>
                    }
                  </div>
                }
              </a>
            }
          </div>
          <div class="mt-8 text-center sm:hidden">
            <a routerLink="/jobs" class="inline-flex items-center gap-1 text-[#000000] font-medium text-sm hover:underline">
              Barcha vakansiyalar
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        }
      </div>
    </section>

    <!-- STATS -->
    <section class="bg-[#000000] py-12 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
          <div>
            <div class="text-4xl md:text-5xl font-bold">{{ stats().totalVacancies | number }}+</div>
            <div class="text-blue-200 mt-2">Faol vakansiyalar</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold">{{ stats().totalEmployers | number }}+</div>
            <div class="text-blue-200 mt-2">Ish beruvchilar</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-bold">{{ stats().totalHired | number }}+</div>
            <div class="text-blue-200 mt-2">Ishga olinganlar</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TELEGRAM CTA -->
    <section class="bg-[#FFFFFF] py-12 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
            <div class="flex-1 text-center md:text-left">
              <div class="inline-flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] text-sm font-medium px-3 py-1 rounded-full mb-4">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram Bot
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                Telegram botimiz orqali ish toping
              </h2>
              <p class="text-gray-500 mb-6">
                Har kuni yangi vakansiyalar to'g'ridan-to'g'ri telefoningizga keladi. Ariza topshirish bir bosish bilan.
              </p>
              <a href="https://t.me/VerifixJobsBot" target="_blank" rel="noopener"
                 class="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#006daa] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Botga o'tish
              </a>
            </div>
            <div class="shrink-0">
              <div class="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                  </svg>
                  <span class="text-xs text-gray-400">QR Code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
              <span class="font-bold text-white">Verifix Jobs</span>
            </div>
            <p class="text-sm text-gray-400">O'zbekistondagi eng yirik ish qidirish platformasi. Verifix HRM ekotizimi tarkibida.</p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Ish qidiruvchilar</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/jobs" class="hover:text-white transition-colors">Vakansiyalar</a></li>
              <li><a routerLink="/companies" class="hover:text-white transition-colors">Kompaniyalar</a></li>
              <li><a href="https://t.me/VerifixJobsBot" target="_blank" class="hover:text-white transition-colors">Telegram bot</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Ish beruvchilar</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/login" class="hover:text-white transition-colors">Kirish</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Narxlar</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Yordam</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Bog'lanish</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                info&#64;verifix.uz
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +998 71 200 00 00
              </li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-500">&copy; 2024-2026 Verifix LLC. Barcha huquqlar himoyalangan.</p>
          <div class="flex gap-4 text-sm text-gray-500">
            <a href="#" class="hover:text-white transition-colors">Maxfiylik siyosati</a>
            <a href="#" class="hover:text-white transition-colors">Foydalanish shartlari</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PublicHomeComponent implements OnInit {
  mobileNav = signal(false);
  loadingVacancies = signal(true);
  latestVacancies = signal<PublicVacancy[]>([]);
  stats = signal<PublicStats>({ totalVacancies: 0, totalEmployers: 0, totalHired: 0 });

  searchQuery = '';
  searchCity = '';
  searchCategory = '';

  cities = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon', 'Farg\'ona',
    'Nukus', 'Navoiy', 'Qarshi', 'Jizzax', 'Termiz', 'Urganch', 'Guliston'
  ];

  categories: CategoryItem[] = [
    { key: 'COOK', label: 'Oshpaz', icon: '\uD83D\uDC68\u200D\uD83C\uDF73' },
    { key: 'DRIVER', label: 'Haydovchi', icon: '\uD83D\uDE97' },
    { key: 'SALES', label: 'Sotuvchi', icon: '\uD83D\uDED2' },
    { key: 'BUILDER', label: 'Qurilishchi', icon: '\uD83C\uDFD7\uFE0F' },
    { key: 'CLEANER', label: 'Tozalovchi', icon: '\uD83E\uDDF9' },
    { key: 'WAITER', label: 'Ofitsiant', icon: '\uD83C\uDF7D\uFE0F' },
    { key: 'CASHIER', label: 'Kassir', icon: '\uD83D\uDCB0' },
    { key: 'WAREHOUSE', label: 'Omborchi', icon: '\uD83D\uDCE6' },
    { key: 'SECURITY', label: 'Qo\'riqchi', icon: '\uD83D\uDEE1\uFE0F' },
    { key: 'ELECTRICIAN', label: 'Elektrik', icon: '\u26A1' },
    { key: 'PLUMBER', label: 'Santexnik', icon: '\uD83D\uDD27' },
    { key: 'TAILOR', label: 'Tikuvchi', icon: '\uD83E\uDEA1' },
    { key: 'COURIER', label: 'Kuryer', icon: '\uD83D\uDEB4' },
    { key: 'LOADER', label: 'Yukchi', icon: '\uD83D\uDCAA' },
  ];

  constructor(private publicApi: PublicApiService) {}

  ngOnInit() {
    this.publicApi.getLatestVacancies(6).subscribe({
      next: (res) => {
        this.latestVacancies.set(res.content);
        this.loadingVacancies.set(false);
      },
      error: () => this.loadingVacancies.set(false),
    });

    this.publicApi.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => {},
    });
  }

  formatSalary(amount: number): string {
    if (amount >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' mln';
    }
    return amount.toLocaleString('uz');
  }
}
