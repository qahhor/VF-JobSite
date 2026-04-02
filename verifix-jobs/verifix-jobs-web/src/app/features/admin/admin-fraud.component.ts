import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';

@Component({
  selector: 'vjw-admin-fraud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="text-2xl font-bold mb-6">Frod nazorati</h1>

    <div class="space-y-3">
      @for (alert of alerts(); track alert.id) {
        <div class="bg-gray-800 border rounded-xl p-5" [class]="alert.reviewed ? 'border-gray-700' : 'border-yellow-700'">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold" [class]="severityCls(alert.severity)">{{ alert.severity }}</span>
                <span class="text-sm text-gray-300">{{ alert.alertType }}</span>
              </div>
              <div class="text-xs text-gray-400 mt-1">{{ alert.description }}</div>
              <div class="text-xs text-gray-600 mt-2">
                Candidate: {{ alert.candidateId }} &middot; {{ alert.createdAt | date:'dd.MM.yyyy HH:mm' }}
              </div>
            </div>
            @if (!alert.reviewed) {
              <button (click)="review(alert.id)" class="h-8 px-4 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-600 transition shrink-0">
                Ko'rib chiqildi
              </button>
            } @else {
              <span class="text-xs text-green-500 shrink-0">&#10003; Ko'rilgan</span>
            }
          </div>
        </div>
      } @empty {
        <div class="text-center py-16 text-gray-500 text-sm">Frod alertlari topilmadi</div>
      }
    </div>
  `,
})
export class AdminFraudComponent implements OnInit {
  alerts = signal<any[]>([]);

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getFraudAlerts().subscribe({
      next: (r: any) => this.alerts.set(r.content || r || []),
      error: () => {}
    });
  }

  review(id: string) {
    this.api.reviewFraudAlert(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  severityCls(s: string): string {
    return ({ HIGH: 'text-red-400', MEDIUM: 'text-yellow-400', LOW: 'text-gray-400' } as Record<string,string>)[s] || 'text-gray-400';
  }
}
