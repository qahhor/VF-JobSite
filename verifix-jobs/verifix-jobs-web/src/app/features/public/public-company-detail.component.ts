import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-company-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-4xl mx-auto px-4 py-8">
      @if (company(); as c) {
        <nav class="text-xs text-gray-400 mb-4">
          <a routerLink="/" class="hover:text-black">Bosh sahifa</a> /
          <a routerLink="/companies" class="hover:text-black">Kompaniyalar</a> /
          <span class="text-gray-600">{{ c.name }}</span>
        </nav>

        <div class="flex items-center gap-4 mb-6">
          <div class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xl font-bold shrink-0">
            {{ (c.name || '?').charAt(0) }}
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ c.name }}</h1>
            <div class="flex items-center gap-3 text-sm text-gray-500 mt-1">
              @if (c.industry) { <span>{{ c.industry }}</span> }
              @if (c.city) { <span>{{ c.city }}</span> }
              @if (c.isVerified) { <span class="text-green-600">&#10003; Tasdiqlangan</span> }
            </div>
          </div>
        </div>

        @if (c.description) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Kompaniya haqida</h2>
            <p class="text-sm text-gray-600 leading-relaxed">{{ c.description }}</p>
          </div>
        }

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Ochiq vakansiyalar</h2>
          <div class="space-y-3">
            @for (v of vacancies(); track v.id) {
              <a [routerLink]="['/jobs', v.slug || v.id]" class="block bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition group">
                <h3 class="text-base font-medium text-gray-900 group-hover:text-black">{{ v.title }}</h3>
                <div class="flex items-center gap-3 text-sm text-gray-400 mt-1">
                  @if (v.salaryFrom) { <span class="font-medium text-gray-700">{{ fmt(v.salaryFrom) }}+ UZS</span> }
                  <span>{{ v.city }}</span>
                </div>
              </a>
            } @empty {
              <p class="text-sm text-gray-400 py-4">Hozircha ochiq vakansiya yo'q</p>
            }
          </div>
        </div>

      } @else {
        <div class="text-center py-20 text-gray-400 text-sm">Yuklanmoqda...</div>
      }
    </div>

    <vjw-public-footer />
  `,
})
export class PublicCompanyDetailComponent implements OnInit {
  company = signal<any>(null);
  vacancies = signal<any[]>([]);

  constructor(private api: PublicApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.api.getCompany(slug).subscribe({ next: (c: any) => this.company.set(c), error: () => {} });
    this.api.getCompanyVacancies(slug).subscribe({ next: (r: any) => this.vacancies.set(r.content || []), error: () => {} });
  }

  fmt(n: number): string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':''+n; }
}
