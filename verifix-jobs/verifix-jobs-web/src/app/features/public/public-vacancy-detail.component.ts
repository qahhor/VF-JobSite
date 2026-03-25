import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
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

        <!-- Title -->
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ v.title }}</h1>
        <div class="text-sm text-gray-500 mb-6">{{ v.employer?.name || v.employerName }}</div>

        <!-- Key info -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          @if (v.salaryFrom) {
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-xs text-gray-400 mb-1">Maosh</div>
              <div class="text-sm font-semibold text-gray-900">{{ fmt(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + fmt(v.salaryTo) : '+' }} UZS</div>
            </div>
          }
          @if (v.city) {
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-xs text-gray-400 mb-1">Shahar</div>
              <div class="text-sm font-medium text-gray-900">{{ v.city }}</div>
            </div>
          }
          @if (v.employmentType) {
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-xs text-gray-400 mb-1">Ish turi</div>
              <div class="text-sm font-medium text-gray-900">{{ empType(v.employmentType) }}</div>
            </div>
          }
          @if (v.positionsCount) {
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-xs text-gray-400 mb-1">O'rinlar</div>
              <div class="text-sm font-medium text-gray-900">{{ v.positionsCount }}</div>
            </div>
          }
        </div>

        <!-- Description -->
        @if (v.description) {
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Tavsif</h2>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ v.description }}</p>
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

        <!-- Apply CTA -->
        <div class="bg-gray-50 rounded-lg p-6 text-center">
          <p class="text-sm text-gray-500 mb-3">Ushbu vakansiyaga ariza topshirish uchun Telegram botimizga murojaat qiling</p>
          <a href="https://t.me/VerifixJobsBot" target="_blank" class="inline-flex bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition">Telegram orqali ariza berish &#8594;</a>
        </div>

      } @else {
        <div class="text-center py-20 text-gray-400 text-sm">Yuklanmoqda...</div>
      }
    </div>

    <vjw-public-footer />
  `,
})
export class PublicVacancyDetailComponent implements OnInit {
  vacancy = signal<any>(null);

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
