import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-company-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
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

        <!-- Reviews section -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Sharhlar</h2>
            @if (reviewData().averageRating) {
              <div class="flex items-center gap-2">
                <span class="text-yellow-500 text-lg">{{ '★'.repeat(Math.round(reviewData().averageRating)) }}{{ '☆'.repeat(5 - Math.round(reviewData().averageRating)) }}</span>
                <span class="text-sm font-bold text-gray-700">{{ reviewData().averageRating }}</span>
                <span class="text-xs text-gray-400">({{ reviewData().totalReviews }})</span>
              </div>
            }
          </div>

          <!-- Review list -->
          @for (r of reviews(); track r.id) {
            <div class="border border-gray-100 rounded-lg p-4 mb-3">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-yellow-400 text-sm">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
                <span class="text-xs text-gray-500">{{ r.authorName }}</span>
              </div>
              @if (r.pros) { <div class="text-xs text-green-600 mb-1">👍 {{ r.pros }}</div> }
              @if (r.cons) { <div class="text-xs text-red-500 mb-1">👎 {{ r.cons }}</div> }
            </div>
          }

          <!-- Add review form -->
          <div class="border border-gray-200 rounded-xl p-5 mt-4">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">Sharh qoldiring</h3>
            <div class="space-y-3">
              <div class="flex gap-1">
                @for (s of [1,2,3,4,5]; track s) {
                  <button (click)="newReview.rating = s" class="text-2xl" [class]="s <= newReview.rating ? 'text-yellow-400' : 'text-gray-200'">★</button>
                }
              </div>
              <input type="text" [(ngModel)]="newReview.authorName" placeholder="Ismingiz" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              <input type="text" [(ngModel)]="newReview.pros" placeholder="👍 Yaxshi tomonlari" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              <input type="text" [(ngModel)]="newReview.cons" placeholder="👎 Yomon tomonlari" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              <button (click)="submitReview()" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">Yuborish</button>
            </div>
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
  reviews = signal<any[]>([]);
  reviewData = signal<any>({averageRating: 0, totalReviews: 0});
  newReview = { authorName: '', rating: 5, pros: '', cons: '' };
  Math = Math;

  private slug = '';

  constructor(private api: PublicApiService, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.slug = this.route.snapshot.params['slug'];
    this.api.getCompany(this.slug).subscribe({ next: (c: any) => this.company.set(c), error: () => {} });
    this.api.getCompanyVacancies(this.slug).subscribe({ next: (r: any) => this.vacancies.set(r.content || []), error: () => {} });
    this.loadReviews();
  }

  loadReviews() {
    this.http.get<any>(`${environment.apiUrl}/public/companies/${this.slug}/reviews`).subscribe({
      next: (d: any) => {
        this.reviews.set(d.reviews || []);
        this.reviewData.set({ averageRating: d.averageRating || 0, totalReviews: d.totalReviews || 0 });
      },
      error: () => {}
    });
  }

  submitReview() {
    if (!this.newReview.authorName) return;
    this.http.post<any>(`${environment.apiUrl}/public/companies/${this.slug}/reviews`, this.newReview).subscribe({
      next: () => {
        this.newReview = { authorName: '', rating: 5, pros: '', cons: '' };
        this.loadReviews();
      },
      error: () => {}
    });
  }

  fmt(n: number): string { return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':''+n; }
}
