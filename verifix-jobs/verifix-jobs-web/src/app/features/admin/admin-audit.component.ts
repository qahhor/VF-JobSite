import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService, AdminAuditItem } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ i18n.t('admin.audit.title') }}</h1>
          <p class="mt-1 text-sm text-muted">{{ i18n.t('admin.audit.hint') }}</p>
        </div>
        <button
          (click)="exportCsv()"
          class="shrink-0 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-border hover:bg-surface">
          {{ i18n.t('admin.audit.export') }}
        </button>
      </div>

      @if (loading()) {
        <div class="py-12 text-center text-sm text-muted">{{ i18n.t('admin.logging_in') }}</div>
      } @else if (logs().length === 0) {
        <div class="rounded-2xl border border-border bg-white p-12 text-center">
          <div class="text-3xl">&#x1F4DD;</div>
          <div class="mt-3 text-sm text-muted">{{ i18n.t('admin.audit.empty') }}</div>
        </div>
      } @else {
        <div class="space-y-2">
          @for (log of logs(); track log.id) {
            <div
              class="rounded-2xl border border-border bg-white transition hover:border-border"
              [class.border-border]="expandedId() === log.id">
              <button
                (click)="toggle(log)"
                class="flex w-full items-center gap-4 px-4 py-3.5 text-left">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{{ log.action }}</span>
                    <span class="text-xs text-muted">{{ log.adminEmail }}</span>
                  </div>
                  <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{{ log.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
                    @if (log.entityType) {
                      <span>{{ log.entityType }} {{ log.entityId }}</span>
                    }
                    @if (log.ipAddress) {
                      <span>{{ log.ipAddress }}</span>
                    }
                  </div>
                </div>
                <svg class="h-4 w-4 shrink-0 text-muted transition" [class.rotate-180]="expandedId() === log.id" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (expandedId() === log.id && log.details) {
                <div class="border-t border-border/50 px-4 py-3">
                  <pre class="max-h-40 overflow-auto rounded-xl bg-surface p-3 text-xs text-slate-600">{{ formatDetails(log.details) }}</pre>
                </div>
              }
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-3 pt-2">
            <button [disabled]="page() === 0" (click)="goPage(page() - 1)" class="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-surface disabled:opacity-40">&larr;</button>
            <span class="text-sm text-slate-600">{{ page() + 1 }} / {{ totalPages() }}</span>
            <button [disabled]="page() >= totalPages() - 1" (click)="goPage(page() + 1)" class="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-surface disabled:opacity-40">&rarr;</button>
          </div>
        }
      }
    </div>
  `,
})
export class AdminAuditComponent implements OnInit {
  logs = signal<AdminAuditItem[]>([]);
  loading = signal(false);
  page = signal(0);
  totalPages = signal(0);
  expandedId = signal<string | null>(null);

  constructor(
    private api: AdminApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAuditLogs(this.page(), 30).subscribe({
      next: (res) => {
        this.logs.set(res.content || []);
        this.totalPages.set(res.totalPages || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.i18n.t('admin.load_failed'));
      },
    });
  }

  goPage(p: number) {
    this.page.set(p);
    this.load();
  }

  toggle(log: AdminAuditItem) {
    this.expandedId.set(this.expandedId() === log.id ? null : log.id);
  }

  formatDetails(details: any): string {
    if (!details) return '';
    if (typeof details === 'string') {
      try { return JSON.stringify(JSON.parse(details), null, 2); } catch { return details; }
    }
    return JSON.stringify(details, null, 2);
  }

  exportCsv() {
    const escape = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
    const rows = this.logs().map(l =>
      [l.createdAt, l.adminEmail, l.action, l.entityType, l.entityId, l.ipAddress].map(v => escape(String(v ?? ''))).join(',')
    );
    const header = [
      this.i18n.t('admin.audit.col_timestamp'),
      this.i18n.t('admin.audit.col_admin'),
      this.i18n.t('admin.audit.col_action'),
      this.i18n.t('admin.audit.col_entity_type'),
      this.i18n.t('admin.audit.col_entity_id'),
      this.i18n.t('admin.audit.col_ip'),
    ].join(',');
    const csv = '\uFEFF' + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
