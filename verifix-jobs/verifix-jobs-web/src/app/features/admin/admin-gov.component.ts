import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-admin-gov',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="text-2xl font-bold mb-6">{{ i18n.t('admin.gov.title') }}</h1>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      @for (s of stats(); track s.source) {
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div class="text-sm font-semibold text-white mb-3">{{ s.source }}</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div><span class="text-green-400 font-bold">{{ s.synced }}</span> <span class="text-gray-500">{{ i18n.t('admin.gov.synced') }}</span></div>
            <div><span class="text-yellow-400 font-bold">{{ s.pending }}</span> <span class="text-gray-500">{{ i18n.t('admin.pending') }}</span></div>
            <div><span class="text-red-400 font-bold">{{ s.failed }}</span> <span class="text-gray-500">{{ i18n.t('admin.gov.failed') }}</span></div>
            <div><span class="text-gray-300 font-bold">{{ s.total }}</span> <span class="text-gray-500">{{ i18n.t('admin.gov.total') }}</span></div>
          </div>
          <div class="flex gap-2 mt-3">
            <button (click)="triggerExport(s.source)" class="h-7 px-3 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 transition">{{ i18n.t('admin.gov.export') }}</button>
            <button (click)="triggerImport(s.source)" class="h-7 px-3 bg-blue-700 text-white rounded text-xs hover:bg-blue-600 transition">{{ i18n.t('admin.gov.import') }}</button>
          </div>
        </div>
      }
    </div>

    <div class="bg-gray-800 rounded-xl border border-gray-700">
      <div class="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <h3 class="font-semibold text-white">{{ i18n.t('admin.gov.history') }}</h3>
        <select [(ngModel)]="selectedSource" (ngModelChange)="loadHistory()" class="h-8 px-3 bg-gray-700 border border-gray-600 rounded text-xs text-white">
          <option value="ARGOS">ARGOS</option>
          <option value="ENST">ENST</option>
          <option value="MEHNAT">ish.mehnat.uz</option>
        </select>
      </div>
      <div class="divide-y divide-gray-700">
        @for (h of history(); track h.id || $index) {
          <div class="px-5 py-3 flex items-center gap-4">
            <div class="w-2 h-2 rounded-full shrink-0"
                 [class]="h.status === 'SUCCESS' ? 'bg-green-400' : h.status === 'FAILED' ? 'bg-red-400' : 'bg-yellow-400'"></div>
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-300">{{ formatHistorySummary(h) }}</div>
              @if (h.errorMessage) { <div class="text-xs text-red-400 truncate">{{ h.errorMessage }}</div> }
            </div>
            <div class="text-xs text-gray-500 shrink-0">{{ h.createdAt | date:'dd.MM HH:mm' }}</div>
          </div>
        } @empty {
          <div class="px-5 py-8 text-center text-gray-500 text-sm">{{ i18n.t('admin.gov.no_history') }}</div>
        }
      </div>
    </div>
  `,
})
export class AdminGovComponent implements OnInit {
  stats = signal<any[]>([]);
  history = signal<any[]>([]);
  selectedSource = 'ARGOS';

  private base = `${environment.apiUrl}/admin/gov`;

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    this.loadStats();
    this.loadHistory();
  }

  loadStats() {
    this.http.get<any>(`${this.base}/stats`).subscribe({
      next: (data: any) => {
        const mapped = Object.entries(data?.bySource || {}).map(([source, stats]: [string, any]) => ({
          source,
          synced: stats?.synced || 0,
          pending: stats?.pending || 0,
          failed: stats?.failed || 0,
          total: stats?.total || 0
        }));
        this.stats.set(mapped);
      },
      error: () => {}
    });
  }

  loadHistory() {
    this.http.get<any>(`${this.base}/sync-history`, { params: { source: this.selectedSource, size: '20' } }).subscribe({
      next: (data: any) => this.history.set(data.content || []),
      error: () => {}
    });
  }

  triggerExport(source: string) {
    this.http.post<any>(`${this.base}/sync/export`, null, { params: { source } }).subscribe({
      next: () => this.loadHistory(),
      error: () => {}
    });
  }

  triggerImport(source: string) {
    this.http.post<any>(`${this.base}/sync/import`, null, { params: { source } }).subscribe({
      next: () => {
        this.loadStats();
        this.loadHistory();
      },
      error: () => {}
    });
  }

  formatHistorySummary(item: any): string {
    const parts = [item?.direction || 'SYNC'];
    if (item?.entityType) parts.push(item.entityType);
    if (item?.entityId) parts.push(String(item.entityId).slice(0, 8));
    return parts.join(' · ');
  }
}
