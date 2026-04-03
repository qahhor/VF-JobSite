import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { SeoService } from '../../core/services/seo.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-public-company-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-4xl mx-auto px-4 py-8">
      @if (company(); as c) {
        <nav class="text-xs text-gray-400 mb-4">
          <a routerLink="/" class="hover:text-black">{{ i18n.t('public.company.home') }}</a> /
          <a routerLink="/companies" class="hover:text-black">{{ i18n.t('public.company.companies') }}</a> /
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
              @if (c.isVerified) { <span class="text-green-600">&#10003; {{ i18n.t('public.companies.verified') }}</span> }
            </div>
          </div>
        </div>

        @if (branding()?.coverImages?.length) {
          <div class="mb-6 rounded-xl overflow-hidden">
            <img [src]="branding().coverImages[0].imageUrl" alt="Cover" class="w-full h-48 md:h-64 object-cover">
          </div>
        }

        @if (companyDescription(c)) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ i18n.t('public.company.about') }}</h2>
            <p class="text-sm text-gray-600 leading-relaxed">{{ companyDescription(c) }}</p>
          </div>
        }

        @if (branding()?.benefits?.length) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ i18n.t('public.company.benefits') }}</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              @for (b of branding().benefits; track b.id) {
                <div class="bg-emerald-50 rounded-xl p-4 text-center">
                  <div class="text-2xl mb-1">{{ b.icon || 'OK' }}</div>
                  <div class="text-sm font-medium text-gray-800">{{ benefitTitle(b) }}</div>
                  @if (benefitDescription(b)) { <div class="text-xs text-gray-500 mt-1">{{ benefitDescription(b) }}</div> }
                </div>
              }
            </div>
          </div>
        }

        @if (branding()?.galleries?.length) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ i18n.t('public.company.gallery') }}</h2>
            <div class="grid grid-cols-3 gap-2">
              @for (g of branding().galleries[0]?.images || []; track g.id) {
                <img [src]="g.imageUrl" [alt]="g.caption || 'Photo'" class="rounded-lg w-full h-32 object-cover">
              }
            </div>
          </div>
        }

        @if (branding()?.videos?.length) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ i18n.t('public.company.video') }}</h2>
            @for (v of branding().videos; track v.id) {
              <div class="rounded-xl overflow-hidden bg-black aspect-video">
                <iframe [src]="safeVideoUrl(v.videoUrl)" class="w-full h-full" allowfullscreen></iframe>
              </div>
            }
          </div>
        }

        @if (branding()?.faqs?.length) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ i18n.t('public.company.faq') }}</h2>
            <div class="space-y-2">
              @for (faq of branding().faqs; track faq.id) {
                <details class="bg-gray-50 rounded-xl p-4 group">
                  <summary class="text-sm font-medium text-gray-800 cursor-pointer">{{ faqQuestion(faq) }}</summary>
                  <p class="text-sm text-gray-600 mt-2">{{ faqAnswer(faq) }}</p>
                </details>
              }
            </div>
          </div>
        }

        @if (branding()?.testimonials?.length) {
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ i18n.t('public.company.testimonials') }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (t of branding().testimonials; track t.id) {
                <div class="bg-white border border-gray-100 rounded-xl p-4">
                  <p class="text-sm text-gray-600 italic">"{{ testimonialQuote(t) }}"</p>
                  <div class="text-xs text-gray-400 mt-2">- {{ testimonialAuthor(t) }}</div>
                </div>
              }
            </div>
          </div>
        }

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ i18n.t('public.company.open_jobs') }}</h2>
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
              <p class="text-sm text-gray-400 py-4">{{ i18n.t('public.company.no_open_jobs') }}</p>
            }
          </div>
        </div>

        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ i18n.t('public.company.reviews') }}</h2>
            @if (reviewData().averageRating) {
              <div class="flex items-center gap-2">
                <span class="text-yellow-500 text-lg">{{ starRating(Math.round(reviewData().averageRating)) }}</span>
                <span class="text-sm font-bold text-gray-700">{{ reviewData().averageRating }}</span>
                <span class="text-xs text-gray-400">({{ reviewData().totalReviews }})</span>
              </div>
            }
          </div>

          @for (r of reviews(); track r.id) {
            <div class="border border-gray-100 rounded-lg p-4 mb-3">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-yellow-400 text-sm">{{ starRating(r.rating) }}</span>
                <span class="text-xs text-gray-500">{{ r.authorName }}</span>
              </div>
              @if (r.pros) { <div class="text-xs text-green-600 mb-1">{{ i18n.t('public.company.pros_label') }}: {{ r.pros }}</div> }
              @if (r.cons) { <div class="text-xs text-red-500 mb-1">{{ i18n.t('public.company.cons_label') }}: {{ r.cons }}</div> }
            </div>
          }

          <div class="border border-gray-200 rounded-xl p-5 mt-4">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">{{ i18n.t('public.company.leave_review') }}</h3>
            <div class="space-y-3">
              <div class="flex gap-1">
                @for (s of [1,2,3,4,5]; track s) {
                  <button type="button" (click)="newReview.rating = s" class="text-2xl" [class]="s <= newReview.rating ? 'text-yellow-400' : 'text-gray-200'">{{ starIcon(s <= newReview.rating) }}</button>
                }
              </div>
              <input type="text" [(ngModel)]="newReview.authorName" [placeholder]="i18n.t('public.company.your_name')" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              <input type="text" [(ngModel)]="newReview.pros" [placeholder]="i18n.t('public.company.pros')" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              <input type="text" [(ngModel)]="newReview.cons" [placeholder]="i18n.t('public.company.cons')" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              <button (click)="submitReview()" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">{{ i18n.t('public.company.submit_review') }}</button>
            </div>
          </div>
        </div>
      } @else if (notFound()) {
        <div class="text-center py-20">
          <div class="text-4xl mb-3">404</div>
          <div class="text-lg font-semibold text-gray-800">{{ i18n.t('public.company.not_found') }}</div>
          <div class="text-sm text-gray-400 mt-2">{{ i18n.t('public.company.not_found_desc') }}</div>
          <a routerLink="/companies" class="inline-flex mt-4 h-10 px-6 bg-black text-white rounded-lg text-sm font-medium items-center hover:bg-gray-800">{{ i18n.t('public.company.back_to_companies') }}</a>
        </div>
      } @else {
        <div class="text-center py-20 text-gray-400 text-sm">{{ i18n.t('common.loading') }}</div>
      }
    </div>

    <vjw-public-footer />
  `,
})
export class PublicCompanyDetailComponent implements OnInit {
  company = signal<any>(null);
  vacancies = signal<any[]>([]);
  branding = signal<any>(null);
  reviews = signal<any[]>([]);
  reviewData = signal<any>({ averageRating: 0, totalReviews: 0 });
  notFound = signal(false);
  newReview = { authorName: '', rating: 5, pros: '', cons: '' };

  private slug = '';

  constructor(
    private api: PublicApiService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private seo: SeoService,
    private sanitizer: DomSanitizer,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.slug = this.route.snapshot.params['slug'];
    this.api.getCompany(this.slug).subscribe({
      next: (company: any) => {
        this.company.set(company);
        this.updateSeo();
      },
      error: () => {
        this.notFound.set(true);
        this.seo.setPage({
          title: 'Company not found',
          description: 'This company page is no longer available on Verifix Jobs.',
          path: `/companies/${this.slug}`,
          noindex: true
        });
      }
    });
    this.api.getCompanyVacancies(this.slug).subscribe({
      next: (response: any) => {
        this.vacancies.set(response.content || []);
        this.updateSeo();
      },
      error: () => {}
    });
    this.http.get<any>(`${environment.apiUrl}/company/${this.slug}`).subscribe({
      next: (branding: any) => {
        this.branding.set(branding);
        this.updateSeo();
      },
      error: () => {}
    });
    this.loadReviews();
  }

  loadReviews() {
    this.http.get<any>(`${environment.apiUrl}/public/companies/${this.slug}/reviews`).subscribe({
      next: (data: any) => {
        this.reviews.set(data.reviews || []);
        this.reviewData.set({ averageRating: data.averageRating || 0, totalReviews: data.totalReviews || 0 });
        this.updateSeo();
      },
      error: () => {}
    });
  }

  submitReview() {
    if (!this.newReview.authorName) {
      return;
    }
    this.http.post<any>(`${environment.apiUrl}/public/companies/${this.slug}/reviews`, this.newReview).subscribe({
      next: () => {
        this.newReview = { authorName: '', rating: 5, pros: '', cons: '' };
        this.loadReviews();
      },
      error: () => {}
    });
  }

  fmt(n: number): string {
    return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'K' : '' + n;
  }

  companyDescription(company: any): string {
    return company?.description || company?.about || '';
  }

  benefitTitle(item: any): string {
    return item?.titleUz || item?.titleRu || item?.title || '';
  }

  benefitDescription(item: any): string {
    return item?.descriptionUz || item?.descriptionRu || item?.description || '';
  }

  faqQuestion(item: any): string {
    return item?.questionUz || item?.questionRu || item?.question || '';
  }

  faqAnswer(item: any): string {
    return item?.answerUz || item?.answerRu || item?.answer || '';
  }

  testimonialQuote(item: any): string {
    return item?.textUz || item?.textRu || item?.quote || '';
  }

  testimonialAuthor(item: any): string {
    const parts = [item?.employeeName || item?.authorName, item?.employeePosition || item?.authorRole].filter(Boolean);
    return parts.join(', ');
  }

  starIcon(active: boolean): string {
    return active ? '\u2605' : '\u2606';
  }

  starRating(rating: number): string {
    const safeRating = Math.max(0, Math.min(5, rating || 0));
    return '\u2605'.repeat(safeRating) + '\u2606'.repeat(5 - safeRating);
  }

  safeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.toEmbedUrl(url));
  }

  private toEmbedUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com/video/')) {
      const videoId = url.split('vimeo.com/')[1]?.split(/[?&]/)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  }

  private updateSeo() {
    const company = this.company();
    if (!company) {
      return;
    }

    const branding = this.branding();
    const vacancies = this.vacancies();
    const reviews = this.reviewData();
    const companyPath = `/companies/${this.slug}`;
    const title = branding?.metaTitle || `${company.name} jobs`;
    const description = (
      branding?.metaDescription ||
      company.description ||
      company.about ||
      `${company.name} hiring in ${company.city || 'Uzbekistan'}. Explore employer reviews, open vacancies, and workplace benefits on Verifix Jobs.`
    ).replace(/\s+/g, ' ').trim();

    const organization: any = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.name,
      url: this.seo.absoluteUrl(companyPath),
      logo: company.logo ? this.seo.absoluteUrl(company.logo) : undefined,
      description,
      address: company.city ? {
        '@type': 'PostalAddress',
        addressLocality: company.city,
        addressCountry: 'UZ'
      } : undefined,
      sameAs: company.website ? [company.website] : undefined
    };

    if (reviews?.totalReviews) {
      organization.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviews.averageRating,
        reviewCount: reviews.totalReviews
      };
    }

    const schemas: any[] = [
      this.seo.buildBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Companies', path: '/companies' },
        { name: company.name, path: companyPath }
      ]),
      organization
    ];

    const faqSchema = this.seo.buildFaqSchema((branding?.faqs || []).map((item: any) => ({
      question: this.faqQuestion(item),
      answer: this.faqAnswer(item)
    })));
    if (faqSchema) {
      schemas.push(faqSchema);
    }
    if (vacancies.length) {
      schemas.push(this.seo.buildItemListSchema(
        `${company.name} open jobs`,
        vacancies.slice(0, 10).map((vacancy: any) => ({
          name: vacancy.title,
          path: `/jobs/${vacancy.slug || vacancy.id}`,
          description: [vacancy.city, vacancy.salaryFrom ? `${this.fmt(vacancy.salaryFrom)} UZS` : 'Salary negotiable'].join(' | ')
        }))
      ));
    }

    this.seo.setPage({
      title,
      description,
      path: companyPath,
      keywords: [company.name, company.industry, company.city, 'employer branding'].filter(Boolean),
      schema: schemas
    });
  }
}
