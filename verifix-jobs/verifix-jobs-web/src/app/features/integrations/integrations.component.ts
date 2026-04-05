import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-integrations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-title font-semibold text-gray-900">{{ i18n.t('integrations.title') }}</h1>
        @if (hub()) {
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ i18n.t('integrations.level') }}:</span>
            <span class="text-sm font-bold px-3 py-1 rounded-full"
                  [class]="hub()!.maturityLevel >= 3 ? 'bg-green-50 text-green-600' : hub()!.maturityLevel >= 2 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'">
              {{ hub()!.maturityLabel }} ({{ hub()!.connectedCount }}/{{ hub()!.integrations.length }})
            </span>
          </div>
        }
      </div>

      <!-- Progress bar -->
      @if (hub()) {
        <div class="bg-white rounded-xl p-5 shadow-card border border-border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ i18n.t('integrations.progress') }}</span>
            <span class="text-sm text-gray-400">{{ hub()!.connectedCount }} / {{ hub()!.integrations.length }}</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-3">
            <div class="bg-primary rounded-full h-3 transition-all" [style.width.%]="(hub()!.connectedCount / hub()!.integrations.length) * 100"></div>
          </div>
        </div>
      }

      <!-- Integration cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (item of hub()?.integrations || []; track item.name) {
          <div class="bg-white rounded-xl p-5 shadow-card border border-border flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                 [class]="item.connected ? 'bg-green-50' : 'bg-gray-100'">
              {{ categoryIcon(item.category) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-800">{{ item.name }}</span>
                @if (item.connected) {
                  <span class="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">{{ i18n.t('common.connected') }}</span>
                } @else {
                  <span class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-medium">{{ i18n.t('common.not_connected') }}</span>
                }
              </div>
              <div class="text-xs text-gray-400 mt-1">{{ item.description }}</div>
              <div class="text-[10px] text-gray-300 mt-1">{{ item.category }}</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class IntegrationsComponent implements OnInit {
  hub = signal<any>(null);

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/employer/integrations`).subscribe({
      next: (d: any) => this.hub.set(d),
      error: () => {}
    });
  }

  categoryIcon(cat: string): string {
    return ({HRM:'🏢',KYC:'🪪',Channel:'📱',Notification:'📲',Payment:'💳',Government:'🏛️',Search:'🔍',AI:'🤖'} as Record<string,string>)[cat] || '⚙️';
  }
}
