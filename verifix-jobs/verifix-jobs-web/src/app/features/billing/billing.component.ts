import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { PricingPlan, Payment } from '../../core/models';

@Component({
  selector: 'vjw-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-title font-semibold text-gray-900">{{ i18n.t('billing.title') }}</h1>

      <!-- Current plan -->
      <div class="bg-white rounded-xl p-6 shadow-card border border-border">
        <h3 class="font-semibold text-gray-800 mb-2">{{ i18n.t('billing.current') }}</h3>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-black text-xl">💎</div>
          <div>
            <div class="text-lg font-bold text-gray-800">{{ currentPlanLabel() }}</div>
            <div class="text-sm text-gray-500">{{ i18n.t('billing.current_subscription') }}</div>
          </div>
        </div>
      </div>

      <!-- Plans comparison -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (plan of plans(); track plan.code) {
          <div class="bg-white rounded-xl p-6 shadow-sm border-2 transition"
               [class]="plan.code === currentPlan() ? 'border-primary' : 'border-gray-100 hover:border-primary/30'">
            <div class="text-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ planName(plan.code || plan.name) }}</h3>
              <div class="mt-2">
                <span class="text-3xl font-bold text-black">{{ formatPrice(plan.priceMonthlyUzs) }}</span>
                <span class="text-sm text-gray-400"> {{ i18n.t('billing.per_month') }}</span>
              </div>
              <div class="text-xs text-gray-400 mt-1">{{ formatPrice(plan.priceAnnualUzs) }} {{ i18n.t('billing.per_year') }}</div>
            </div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center gap-2 text-sm"><span class="text-green-500">✓</span> {{ plan.maxVacancies }} {{ i18n.t('billing.vacancies') }}</li>
              <li class="flex items-center gap-2 text-sm"><span class="text-green-500">✓</span> {{ plan.maxResumeViews }} {{ i18n.t('billing.resume_views') }}</li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasAts ? '' : 'text-gray-300'">
                <span>{{ plan.hasAts ? '✓' : '×' }}</span> ATS
              </li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasAnalytics ? '' : 'text-gray-300'">
                <span>{{ plan.hasAnalytics ? '✓' : '×' }}</span> {{ i18n.t('billing.analytics') }}
              </li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasBranding ? '' : 'text-gray-300'">
                <span>{{ plan.hasBranding ? '✓' : '×' }}</span> {{ i18n.t('billing.branding') }}
              </li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasApi ? '' : 'text-gray-300'">
                <span>{{ plan.hasApi ? '✓' : '×' }}</span> {{ i18n.t('billing.api') }}
              </li>
            </ul>
            @if (plan.code !== currentPlan()) {
              <button (click)="upgrade(plan.code)" class="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition">
                {{ i18n.t('billing.select') }}
              </button>
            } @else {
              <div class="w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium text-center">{{ i18n.t('billing.current_badge') }}</div>
            }
          </div>
        }
      </div>

      <!-- Promotion Packages (TOP) -->
      <div class="bg-white rounded-xl p-6 shadow-card border border-border">
        <h3 class="font-semibold text-gray-800 mb-4">⭐ {{ i18n.t('billing.top_packages') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          @for (pkg of promotionPackages; track pkg.days) {
            <div class="border border-orange-100 rounded-xl p-4 text-center hover:border-orange-300 transition">
              <div class="text-lg font-bold text-orange-600">TOP-{{ pkg.days }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ pkg.days }} {{ i18n.t('billing.top_days') }}</div>
              <div class="text-xl font-bold text-gray-900 mt-2">{{ formatPrice(pkg.price) }} <span class="text-xs font-normal text-gray-400">UZS</span></div>
              <button (click)="buyPromotion(pkg)" class="w-full mt-3 h-9 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition">
                {{ i18n.t('billing.buy') }}
              </button>
            </div>
          }
        </div>
        <p class="text-xs text-gray-400 mt-3">{{ i18n.t('billing.top_desc') }}</p>
      </div>

      <!-- Bundle Packages -->
      <div class="bg-white rounded-xl p-6 shadow-card border border-border">
        <h3 class="font-semibold text-gray-800 mb-4">📦 {{ i18n.t('billing.bundles') }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          @for (bundle of bundles; track bundle.name) {
            <div class="border border-gray-200 rounded-xl p-5 hover:border-black transition">
              <div class="text-base font-bold text-gray-900">{{ planName(bundle.name) }}</div>
              <ul class="mt-3 space-y-1.5 text-xs text-gray-600">
                <li>📋 {{ bundle.vacancies }} {{ i18n.t('billing.vacancies') }}</li>
                <li>👁 {{ bundle.contacts }} {{ i18n.t('billing.contacts') }}</li>
                <li>⭐ {{ bundle.tops }} {{ i18n.t('billing.top_slots') }}</li>
              </ul>
              <div class="mt-3">
                <div class="text-xl font-bold text-gray-900">{{ formatPrice(bundle.price) }} <span class="text-xs font-normal text-gray-400">UZS{{ i18n.t('billing.per_month') }}</span></div>
                <div class="text-xs text-gray-400 line-through">{{ formatPrice(bundle.originalPrice) }}</div>
              </div>
              <button class="w-full mt-3 h-9 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition">
                {{ i18n.t('billing.select') }}
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Payment history -->
      <div class="bg-white rounded-xl shadow-card border border-border">
        <div class="p-5 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">{{ i18n.t('billing.history') }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('billing.date') }}</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('billing.amount') }}</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('billing.method') }}</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('billing.status') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (p of payments(); track p.id) {
                <tr>
                  <td class="px-5 py-3 text-sm text-gray-600">{{ p.createdAt | date:'dd.MM.yyyy' }}</td>
                  <td class="px-5 py-3 text-sm font-medium text-gray-800">{{ formatPrice(p.amount) }} {{ p.currency }}</td>
                  <td class="px-5 py-3 text-sm text-gray-600">{{ p.gateway }}</td>
                  <td class="px-5 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full"
                          [class]="p.status === 'PAID' ? 'bg-green-50 text-green-600' : p.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'">
                      {{ p.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="px-5 py-8 text-center text-gray-400 text-sm">{{ i18n.t('billing.no_payments') }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      <!-- Entitlements / Limits -->
      @if (entitlements().length) {
        <div class="bg-white rounded-xl shadow-card border border-border">
          <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-semibold text-gray-800">📊 {{ i18n.t('billing.entitlements') }}</h3></div>
          <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (e of entitlements(); track e.id) {
              <div class="border border-gray-100 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">{{ entitlementLabel(e.type) }}</span>
                  <span class="text-xs text-gray-400">{{ e.used }} / {{ e.total }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div class="rounded-full h-2 transition-all" [style.width.%]="e.total > 0 ? (e.used / e.total) * 100 : 0"
                       [class]="e.remaining > 0 ? 'bg-black' : 'bg-red-500'"></div>
                </div>
                <div class="text-xs mt-1" [class]="e.remaining > 0 ? 'text-gray-400' : 'text-red-500'">
                  {{ e.remaining > 0 ? e.remaining + ' ' + i18n.t('billing.remaining') : i18n.t('billing.limit_reached') }}
                </div>
              </div>
            }
          </div>
        </div>
      }
      </div>
    </div>
  `,
})
export class BillingComponent implements OnInit {
  plans = signal<PricingPlan[]>([]);
  payments = signal<Payment[]>([]);
  currentPlan = signal<string>('');
  entitlements = signal<any[]>([]);

  constructor(private api: ApiService, private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getPlans().subscribe({ next: (p: any) => this.plans.set(p), error: () => {} });
    this.api.getPayments().subscribe({ next: (r: any) => this.payments.set(r.content || []), error: () => {} });
    this.api.getProfile().subscribe({ next: (p: any) => this.currentPlan.set(p.subscriptionPlan || ''), error: () => {} });
    this.http.get<any[]>(`${environment.apiUrl}/employer/entitlements`).subscribe({
      next: (e: any[]) => this.entitlements.set(e || []),
      error: () => {}
    });
  }

  formatPrice(n: number): string {
    if (!n) return this.i18n.t('billing.free');
    return new Intl.NumberFormat('uz-UZ').format(n);
  }

  entitlementLabel(type: string): string {
    return ({
      VACANCY_POST: this.i18n.t('billing.entitlement.vacancy_post'),
      CONTACT_VIEW: this.i18n.t('billing.entitlement.contact_view'),
      VACANCY_PROMOTION: this.i18n.t('billing.entitlement.vacancy_promotion'),
      RESUME_DOWNLOAD: this.i18n.t('billing.entitlement.resume_download'),
      ATS_ACCESS: this.i18n.t('billing.entitlement.ats_access'),
      ANALYTICS_ACCESS: this.i18n.t('billing.entitlement.analytics_access')
    } as Record<string, string>)[type] || type;
  }

  promotionPackages = [
    { days: 7, price: 200000 },
    { days: 14, price: 350000 },
    { days: 30, price: 500000 },
  ];

  bundles = [
    { name: 'Starter', vacancies: 5, contacts: 100, tops: 2, price: 790000, originalPrice: 1100000 },
    { name: 'Business', vacancies: 15, contacts: 300, tops: 5, price: 1990000, originalPrice: 2800000 },
    { name: 'Enterprise', vacancies: 50, contacts: 1000, tops: 20, price: 4990000, originalPrice: 7500000 },
  ];

  currentPlanLabel(): string {
    return this.planName(this.currentPlan() || '');
  }

  planName(code: string): string {
    const key = code?.toUpperCase();
    if (key === 'STARTER') return this.i18n.t('billing.starter');
    if (key === 'BUSINESS') return this.i18n.t('billing.business');
    if (key === 'ENTERPRISE') return this.i18n.t('billing.enterprise');
    return code || this.i18n.t('billing.free');
  }

  upgrade(planCode: string) {
    this.api.purchaseSubscription(planCode, 'MONTHLY').subscribe({
      next: (res: any) => { if (res.redirectUrl) window.location.href = res.redirectUrl; },
      error: () => {}
    });
  }

  buyPromotion(pkg: any) {
    this.api.purchaseSubscription(`TOP_${pkg.days}`, `${pkg.days}_DAYS`, 'CLICK').subscribe({
      next: (res: any) => { if (res.redirectUrl) window.location.href = res.redirectUrl; },
      error: () => {}
    });
  }
}
