import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { PublicApplyModalComponent } from './public-apply-modal.component';

@Component({
  selector: 'vjw-public-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent, PublicApplyModalComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-8">
      @if (vacancy(); as v) {
        <!-- Back -->
        <a routerLink="/jobs" class="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-black mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Orqaga
        </a>

        <!-- Salary — hero section -->
        @if (v.salaryFrom) {
          <div class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' – ' + fmt(v.salaryTo) : '+' }}
            <span class="text-base font-normal text-gray-400">UZS / oy</span>
          </div>
        }

        <!-- Title & employer -->
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 mt-2">{{ v.title }}</h1>
        <a [routerLink]="['/companies', v.employer?.slug || v.employerId]"
           class="text-sm text-gray-500 hover:text-black transition mt-1 inline-block">
          {{ v.employer?.name || v.employerName }}
          @if (v.employerVerified) { <span class="text-green-500 ml-1">&#10003;</span> }
        </a>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mt-4">
          @if (v.city) {
            <span class="inline-flex items-center gap-1 h-8 px-3 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
              {{ v.city }}
            </span>
          }
          @if (v.employmentType) {
            <span class="h-8 px-3 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center">{{ empType(v.employmentType) }}</span>
          }
          @if (v.positionsCount > 1) {
            <span class="h-8 px-3 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center">{{ v.positionsCount }} o'rin ochiq</span>
          }
        </div>

        <!-- Description -->
        @if (v.description) {
          <div class="mt-6">
            <h2 class="text-base font-semibold text-gray-900 mb-2">Tavsif</h2>
            <div class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ v.description }}</div>
          </div>
        }

        <!-- Benefits -->
        @if (v.benefits?.length) {
          <div class="mt-6">
            <h2 class="text-base font-semibold text-gray-900 mb-2">Imtiyozlar</h2>
            <div class="flex flex-wrap gap-2">
              @for (b of v.benefits; track b) {
                <span class="h-8 px-3 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium flex items-center">&#10003; {{ b }}</span>
              }
            </div>
          </div>
        }

        <!-- Employer card -->
        <a [routerLink]="['/companies', v.employer?.slug || v.employerId]"
           class="block mt-8 bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-lg font-bold shrink-0">
              {{ ((v.employer?.name || v.employerName) || '?').charAt(0) }}
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-900">{{ v.employer?.name || v.employerName }}</div>
              @if (v.employerIndustry) { <div class="text-xs text-gray-400">{{ v.employerIndustry }}</div> }
            </div>
            <svg class="w-5 h-5 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </a>

        <!-- Fixed bottom apply bar (mobile) -->
        <div class="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 md:p-4 z-40 safe-bottom">
          <div class="max-w-4xl mx-auto flex gap-2">
            <button (click)="showApplyModal.set(true)"
                    class="flex-1 h-12 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
              Ariza topshirish
            </button>
            <a href="https://t.me/VerifixJobBot" target="_blank"
               class="h-12 w-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition shrink-0">
              <svg class="w-5 h-5 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-2.01 9.47c-.15.68-.54.84-1.1.53l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.06 5.56-5.02c.24-.22-.05-.34-.38-.13L8.6 14.27l-2.98-.93c-.65-.2-.66-.65.14-.96l11.65-4.49c.54-.2 1.01.13.84.96l-.3 1.28z"/></svg>
            </a>
          </div>
        </div>

      } @else {
        <div class="text-center py-20 text-gray-400 text-sm">Yuklanmoqda...</div>
      }
    </div>

    @if (showApplyModal()) {
      <vjw-public-apply-modal
        [vacancyId]="vacancy()?.id || vacancy()?.slug || ''"
        [vacancyTitle]="vacancy()?.title || ''"
        (closed)="showApplyModal.set(false)" />
    }

    <vjw-public-footer />
  `,
  styles: [`.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }`]
})
export class PublicVacancyDetailComponent implements OnInit {
  vacancy = signal<any>(null);
  showApplyModal = signal(false);

  constructor(private api: PublicApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.api.getVacancy(slug).subscribe({ next: (v:any) => this.vacancy.set(v), error: () => {} });
  }

  fmt(n:number):string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':''+n; }
  empType(t:string):string { return ({FULL_TIME:"To'liq stavka",PART_TIME:'Yarim stavka',CONTRACT:'Shartnoma',TEMPORARY:'Vaqtinchalik'} as Record<string,string>)[t]||t; }
}
