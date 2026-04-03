import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-churn-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">⚠️ {{ i18n.t('churn.title') }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ i18n.t('churn.subtitle') }}</p>
      </div>

      @if (alerts().length) {
        <div class="space-y-3">
          @for (a of alerts(); track a.candidateId || $index) {
            <div class="bg-white rounded-xl p-5 shadow-sm border-l-4"
                 [class]="a.riskLevel === 'HIGH' ? 'border-l-red-500' : a.riskLevel === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-gray-300'">
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-gray-800">{{ a.candidateName || i18n.t('common.candidate') }}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          [class]="a.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'">
                      {{ a.riskLevel }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ a.reason }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ i18n.t('churn.last_active') }}: {{ a.lastActive || i18n.t('common.not_set') }}</div>
                </div>
                <button class="h-9 px-4 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition">
                  📨 {{ i18n.t('churn.reengage') }}
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div class="text-4xl mb-3">✅</div>
          <div class="text-sm text-gray-500">{{ i18n.t('churn.empty') }}</div>
        </div>
      }
    </div>
  `,
})
export class ChurnAlertsComponent implements OnInit {
  alerts = signal<any[]>([]);

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    // Try to load from churn prediction service
    this.http.get<any[]>(`${environment.apiUrl}/intelligence/churn-alerts`).subscribe({
      next: (r: any) => this.alerts.set(r || []),
      error: () => {
        // Demo data as fallback
        this.alerts.set([]);
      }
    });
  }
}
