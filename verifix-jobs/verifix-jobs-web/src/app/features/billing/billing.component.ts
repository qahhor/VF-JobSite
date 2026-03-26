import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { PricingPlan, Payment } from '../../core/models';

@Component({
  selector: 'vjw-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">Billing</h1>

      <!-- Current plan -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-2">Joriy tarif</h3>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-black text-xl">💎</div>
          <div>
            <div class="text-lg font-bold text-gray-800">{{ currentPlan() || 'Free' }}</div>
            <div class="text-sm text-gray-500">Joriy obuna</div>
          </div>
        </div>
      </div>

      <!-- Plans comparison -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (plan of plans(); track plan.code) {
          <div class="bg-white rounded-xl p-6 shadow-sm border-2 transition"
               [class]="plan.code === currentPlan() ? 'border-primary' : 'border-gray-100 hover:border-primary/30'">
            <div class="text-center mb-4">
              <h3 class="text-lg font-bold text-gray-800">{{ plan.name }}</h3>
              <div class="mt-2">
                <span class="text-3xl font-bold text-black">{{ formatPrice(plan.priceMonthlyUzs) }}</span>
                <span class="text-sm text-gray-400"> / oy</span>
              </div>
              <div class="text-xs text-gray-400 mt-1">{{ formatPrice(plan.priceAnnualUzs) }} / yil</div>
            </div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center gap-2 text-sm"><span class="text-green-500">✓</span> {{ plan.maxVacancies }} vakansiya</li>
              <li class="flex items-center gap-2 text-sm"><span class="text-green-500">✓</span> {{ plan.maxResumeViews }} rezyume ko'rish</li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasAts ? '' : 'text-gray-300'">
                <span>{{ plan.hasAts ? '✓' : '×' }}</span> ATS
              </li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasAnalytics ? '' : 'text-gray-300'">
                <span>{{ plan.hasAnalytics ? '✓' : '×' }}</span> Analitika
              </li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasBranding ? '' : 'text-gray-300'">
                <span>{{ plan.hasBranding ? '✓' : '×' }}</span> Brending
              </li>
              <li class="flex items-center gap-2 text-sm" [class]="plan.hasApi ? '' : 'text-gray-300'">
                <span>{{ plan.hasApi ? '✓' : '×' }}</span> API
              </li>
            </ul>
            @if (plan.code !== currentPlan()) {
              <button (click)="upgrade(plan.code)" class="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Tanlash
              </button>
            } @else {
              <div class="w-full py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium text-center">Joriy tarif</div>
            }
          </div>
        }
      </div>

      <!-- Payment history -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-5 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">To'lov tarixi</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Sana</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Summa</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Usul</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
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
                <tr><td colspan="4" class="px-5 py-8 text-center text-gray-400 text-sm">To'lovlar yo'q</td></tr>
              }
            </tbody>
          </table>
        </div>
      <!-- Entitlements / Limits -->
      @if (entitlements().length) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-5 py-4 border-b border-gray-100"><h3 class="font-semibold text-gray-800">📊 Limitlar va kreditlar</h3></div>
          <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (e of entitlements(); track e.id) {
              <div class="border border-gray-100 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">{{ entitlementLabel(e.type) }}</span>
                  <span class="text-xs text-gray-400">{{ e.used }} / {{ e.total }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div class="rounded-full h-2 transition-all" [style.width.%]="(e.used / e.total) * 100"
                       [class]="e.remaining > 0 ? 'bg-black' : 'bg-red-500'"></div>
                </div>
                <div class="text-xs mt-1" [class]="e.remaining > 0 ? 'text-gray-400' : 'text-red-500'">
                  {{ e.remaining > 0 ? e.remaining + ' ta qoldi' : 'Limit tugadi!' }}
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

  constructor(private api: ApiService, private http: HttpClient) {}

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
    if (!n) return 'Bepul';
    return new Intl.NumberFormat('uz-UZ').format(n);
  }

  entitlementLabel(type: string): string {
    return ({
      VACANCY_POST: 'Vakansiya joylash', CONTACT_VIEW: 'Kontakt ko\'rish',
      VACANCY_PROMOTION: 'Vakansiya ko\'tarish', RESUME_DOWNLOAD: 'Rezume yuklab olish',
      ATS_ACCESS: 'ATS Pipeline', ANALYTICS_ACCESS: 'Analitika'
    } as Record<string, string>)[type] || type;
  }

  upgrade(planCode: string) {
    this.api.purchaseSubscription(planCode, 'MONTHLY').subscribe({
      next: (res: any) => { if (res.redirectUrl) window.location.href = res.redirectUrl; },
      error: () => {}
    });
  }
}
