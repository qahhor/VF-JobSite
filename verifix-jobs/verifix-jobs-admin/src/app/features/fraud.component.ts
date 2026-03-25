import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-fraud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="main" class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800">Fraud alertlar</h1>
        <div class="flex gap-2">
          <button (click)="showReviewed = false; load()" class="px-3 py-1.5 rounded-lg text-xs font-medium"
                  [class]="!showReviewed ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'">Yangi</button>
          <button (click)="showReviewed = true; load()" class="px-3 py-1.5 rounded-lg text-xs font-medium"
                  [class]="showReviewed ? 'bg-gray-500 text-white' : 'bg-white text-gray-600 border border-gray-200'">Ko'rilgan</button>
        </div>
      </div>

      <div role="main" class="space-y-3">
        @for (alert of alerts(); track alert.id) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                     [class]="alert.score >= 0.7 ? 'bg-red-100 text-red-600' : alert.score >= 0.4 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'">
                  {{ alert.score >= 0.7 ? '🔴' : alert.score >= 0.4 ? '🟠' : '🟡' }}
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ alert.entityType }} — {{ alert.fraudType || 'Shubhali faoliyat' }}</div>
                  <div class="text-xs text-gray-400">ID: {{ alert.entityId?.substring(0, 12) }}...</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold" [class]="alert.score >= 0.7 ? 'text-red-600' : 'text-orange-500'">
                  {{ (alert.score * 100).toFixed(0) }}%
                </div>
                <div class="text-xs text-gray-400">fraud score</div>
              </div>
            </div>

            <!-- Flags -->
            <div class="flex flex-wrap gap-1 mb-3">
              @for (flag of parseFlags(alert.flags); track flag) {
                <span class="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">{{ flag }}</span>
              }
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <span class="text-xs text-gray-400">{{ alert.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
              @if (!alert.reviewed) {
                <div class="flex gap-2">
                  <button (click)="review(alert)" class="text-xs px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">Ko'rildi</button>
                </div>
              } @else {
                <span class="text-xs text-gray-400">Ko'rilgan</span>
              }
            </div>
          </div>
        } @empty {
          <div class="py-16 text-center text-gray-400 text-sm">Fraud alertlar yo'q</div>
        }
      </div>
    </div>
  `,
})
export class FraudComponent implements OnInit {
  alerts = signal<any[]>([]);
  showReviewed = false;

  constructor(private api: AdminApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getFraudAlerts(this.showReviewed).subscribe({
      next: (res: any) => this.alerts.set(res.content || res || []),
    });
  }

  parseFlags(flags: any): string[] {
    if (Array.isArray(flags)) return flags;
    try { return JSON.parse(flags); } catch { return []; }
  }

  review(alert: any) {
    this.api.reviewFraud(alert.id).subscribe(() => this.load());
  }
}
