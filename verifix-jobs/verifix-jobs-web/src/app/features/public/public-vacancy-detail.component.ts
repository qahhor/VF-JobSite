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

    <div class="max-w-4xl mx-auto px-4 py-8">
      @if (vacancy(); as v) {
        <!-- Breadcrumb -->
        <nav class="text-xs text-gray-400 mb-4">
          <a routerLink="/" class="hover:text-black">Bosh sahifa</a> /
          <a routerLink="/jobs" class="hover:text-black">Vakansiyalar</a> /
          <span class="text-gray-600">{{ v.title }}</span>
        </nav>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main content -->
          <div class="flex-1 min-w-0">
            <!-- Title -->
            <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ v.title }}</h1>
            <a [routerLink]="['/companies', v.employer?.slug || v.employerId]" class="text-sm text-gray-500 hover:text-black transition">
              {{ v.employer?.name || v.employerName }}
            </a>

            <!-- Key info -->
            <div class="grid grid-cols-2 gap-3 mt-6 mb-8">
              @if (v.salaryFrom) {
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-xs text-gray-400 mb-1">Maosh</div>
                  <div class="text-sm font-semibold text-gray-900">{{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }} UZS</div>
                </div>
              }
              @if (v.city) {
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-xs text-gray-400 mb-1">Shahar</div>
                  <div class="text-sm font-medium text-gray-900">{{ v.city }}</div>
                </div>
              }
              @if (v.employmentType) {
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-xs text-gray-400 mb-1">Ish turi</div>
                  <div class="text-sm font-medium text-gray-900">{{ empType(v.employmentType) }}</div>
                </div>
              }
              @if (v.positionsCount) {
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="text-xs text-gray-400 mb-1">O'rinlar</div>
                  <div class="text-sm font-medium text-gray-900">{{ v.positionsCount }} ta</div>
                </div>
              }
            </div>

            <!-- Description -->
            @if (v.description) {
              <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Tavsif</h2>
                <div class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ v.description }}</div>
              </div>
            }

            <!-- Benefits -->
            @if (v.benefits?.length) {
              <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-3">Imtiyozlar</h2>
                <div class="flex flex-wrap gap-2">
                  @for (b of v.benefits; track b) {
                    <span class="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">{{ b }}</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Sidebar — Apply CTA (sticky on desktop) -->
          <div class="lg:w-80 shrink-0">
            <div class="lg:sticky lg:top-20 space-y-4">
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                @if (v.salaryFrom) {
                  <div class="text-lg font-bold text-gray-900 mb-1">{{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }} UZS</div>
                  <div class="text-xs text-gray-400 mb-4">oylik maosh</div>
                }
                <button (click)="showApplyModal.set(true)"
                        class="w-full h-12 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                  Ariza topshirish
                </button>
                <a href="https://t.me/VerifixJobBot" target="_blank"
                   class="block w-full h-12 mt-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-2.01 9.47c-.15.68-.54.84-1.1.53l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.06 5.56-5.02c.24-.22-.05-.34-.38-.13L8.6 14.27l-2.98-.93c-.65-.2-.66-.65.14-.96l11.65-4.49c.54-.2 1.01.13.84.96l-.3 1.28z"/></svg>
                  Telegram orqali
                </a>
              </div>

              <!-- Employer card -->
              @if (v.employer?.name || v.employerName) {
                <a [routerLink]="['/companies', v.employer?.slug || v.employerId]"
                   class="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm font-bold shrink-0">
                      {{ ((v.employer?.name || v.employerName) || '?').charAt(0) }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-900 truncate">{{ v.employer?.name || v.employerName }}</div>
                      @if (v.employerVerified) { <div class="text-xs text-green-600">Tasdiqlangan</div> }
                    </div>
                  </div>
                </a>
              }
            </div>
          </div>
        </div>

      } @else {
        <div class="text-center py-20 text-gray-400 text-sm">Yuklanmoqda...</div>
      }
    </div>

    <!-- Apply Modal -->
    @if (showApplyModal()) {
      <vjw-public-apply-modal
        [vacancyId]="vacancy()?.id || vacancy()?.slug || ''"
        [vacancyTitle]="vacancy()?.title || ''"
        (closed)="showApplyModal.set(false)" />
    }

    <vjw-public-footer />
  `,
})
export class PublicVacancyDetailComponent implements OnInit {
  vacancy = signal<any>(null);
  showApplyModal = signal(false);

  constructor(private api: PublicApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.api.getVacancy(slug).subscribe({
      next: (v: any) => this.vacancy.set(v),
      error: () => {}
    });
  }

  fmt(n: number): string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':''+n; }

  empType(t: string): string {
    return ({FULL_TIME:"To'liq stavka",PART_TIME:'Yarim stavka',CONTRACT:'Shartnoma',TEMPORARY:'Vaqtinchalik'} as Record<string,string>)[t]||t;
  }
}
