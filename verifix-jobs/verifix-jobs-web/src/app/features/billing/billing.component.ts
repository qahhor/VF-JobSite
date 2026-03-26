import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
      </div>
    </div>
  `,
})
export class BillingComponent implements OnInit {
  plans = signal<PricingPlan[]>([]);
  payments = signal<Payment[]>([]);
  currentPlan = signal<string>('');

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPlans().subscribe(p => this.plans.set(p));
    this.api.getPayments().subscribe(r => this.payments.set(r.content));
    this.api.getProfile().subscribe(p => this.currentPlan.set(p.subscriptionPlan || ''));
  }

  formatPrice(n: number): string {
    if (!n) return 'Bepul';
    return new Intl.NumberFormat('uz-UZ').format(n);
  }

  upgrade(planCode: string) {
    this.api.purchaseSubscription(planCode, 'MONTHLY').subscribe({
      next: (res: any) => { if (res.redirectUrl) window.location.href = res.redirectUrl; },
      error: () => {}
    });
  }
}
