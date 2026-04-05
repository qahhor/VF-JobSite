import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-gov',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <section class="rounded-2xl border border-border bg-white p-6 shadow-card">
        <div>
          <div class="text-sm uppercase tracking-[0.24em] text-muted">{{ i18n.t('admin.gov') }}</div>
          <h1 class="mt-3 text-3xl font-semibold">{{ i18n.t('admin.gov.title') }}</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-muted">{{ i18n.t('admin.gov_dashboard_hint') }}</p>
        </div>
      </section>

      <section class="grid gap-4 xl:grid-cols-3">
        @for (item of stats(); track item.source) {
          <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div class="flex items-center justify-between gap-3">
              <div class="text-lg font-semibold text-slate-950">{{ sourceLabel(item.source) }}</div>
              <span class="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {{ item.total }} {{ i18n.t('admin.gov.total') }}
              </span>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <div class="text-xs uppercase tracking-[0.18em] text-emerald-700">{{ i18n.t('admin.gov.synced') }}</div>
                <div class="mt-2 text-2xl font-semibold text-emerald-900">{{ item.synced }}</div>
              </div>
              <div class="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div class="text-xs uppercase tracking-[0.18em] text-amber-700">{{ i18n.t('admin.pending') }}</div>
                <div class="mt-2 text-2xl font-semibold text-amber-900">{{ item.pending }}</div>
              </div>
              <div class="rounded-2xl border border-red-200 bg-red-50 p-3">
                <div class="text-xs uppercase tracking-[0.18em] text-red-700">{{ i18n.t('admin.gov.failed') }}</div>
                <div class="mt-2 text-2xl font-semibold text-red-900">{{ item.failed }}</div>
              </div>
              <div class="rounded-2xl border border-border bg-surface p-3">
                <div class="text-xs uppercase tracking-[0.18em] text-muted">{{ i18n.t('admin.gov.total') }}</div>
                <div class="mt-2 text-2xl font-semibold text-slate-950">{{ item.total }}</div>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
              <button
                (click)="triggerExport(item.source)"
                class="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-border hover:bg-slate-100">
                {{ i18n.t('admin.gov.export') }}
              </button>
              <button
                (click)="triggerImport(item.source)"
                class="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600">
                {{ i18n.t('admin.gov.import') }}
              </button>
            </div>
          </div>
        }
      </section>

      <section class="rounded-2xl border border-border bg-white shadow-card">
        <div class="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold text-slate-950">{{ i18n.t('admin.gov.history') }}</h2>
            <p class="mt-2 text-sm text-muted">{{ i18n.t('admin.gov_history_hint') }}</p>
          </div>

          <label class="block min-w-56">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('common.source') }}</span>
            <select
              [(ngModel)]="selectedSource"
              (ngModelChange)="loadHistory()"
              class="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-slate-950">
              <option value="ARGOS">ARGOS</option>
              <option value="ENST">ENST</option>
              <option value="MEHNAT">Mehnat</option>
            </select>
          </label>
        </div>

        <div class="divide-y divide-slate-200">
          @for (item of history(); track item.id || $index) {
            <div class="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex items-start gap-3">
                <span class="mt-1 inline-flex h-2.5 w-2.5 rounded-full" [class]="statusDotClass(item.status)"></span>
                <div>
                  <div class="text-sm font-medium text-slate-950">{{ formatHistorySummary(item) }}</div>
                  @if (item.errorMessage) {
                    <div class="mt-1 text-sm text-red-700">{{ item.errorMessage }}</div>
                  }
                </div>
              </div>
              <div class="text-xs text-muted">{{ item.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
            </div>
          } @empty {
            <div class="px-6 py-12 text-center text-sm text-muted">{{ i18n.t('admin.gov.no_history') }}</div>
          }
        </div>
      </section>
    </div>
  `,
})
export class AdminGovComponent implements OnInit {
  stats = signal<any[]>([]);
  history = signal<any[]>([]);
  selectedSource = 'ARGOS';

  private base = `${environment.apiUrl}/admin/gov`;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadHistory();
  }

  loadStats() {
    this.http.get<any>(`${this.base}/stats`).subscribe({
      next: (data) => {
        const mapped = Object.entries(data?.bySource || {}).map(([source, stats]: [string, any]) => ({
          source,
          synced: stats?.synced || 0,
          pending: stats?.pending || 0,
          failed: stats?.failed || 0,
          total: stats?.total || 0,
        }));
        this.stats.set(mapped);
      },
      error: () => this.toast.error(this.i18n.t('admin.load_failed')),
    });
  }

  loadHistory() {
    this.http.get<any>(`${this.base}/sync-history`, { params: { source: this.selectedSource, size: '20' } }).subscribe({
      next: (data) => this.history.set(data.content || []),
      error: () => this.toast.error(this.i18n.t('admin.load_failed')),
    });
  }

  triggerExport(source: string) {
    this.http.post<any>(`${this.base}/sync/export`, null, { params: { source } }).subscribe({
      next: () => {
        this.loadHistory();
        this.toast.success(this.i18n.t('admin.gov_export_started'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed')),
    });
  }

  triggerImport(source: string) {
    this.http.post<any>(`${this.base}/sync/import`, null, { params: { source } }).subscribe({
      next: () => {
        this.loadStats();
        this.loadHistory();
        this.toast.success(this.i18n.t('admin.gov_import_started'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed')),
    });
  }

  sourceLabel(source: string): string {
    return ({ ARGOS: 'ARGOS', ENST: 'ENST', MEHNAT: 'Mehnat' } as Record<string, string>)[source] || source;
  }

  formatHistorySummary(item: any): string {
    const parts = [item?.direction || 'SYNC'];
    if (item?.entityType) parts.push(item.entityType);
    if (item?.entityId) parts.push(String(item.entityId).slice(0, 8));
    return parts.join(' · ');
  }

  statusDotClass(status: string): string {
    return ({
      SUCCESS: 'bg-emerald-400',
      FAILED: 'bg-red-400',
      PENDING: 'bg-amber-400',
    } as Record<string, string>)[status] || 'bg-slate-400';
  }
}
