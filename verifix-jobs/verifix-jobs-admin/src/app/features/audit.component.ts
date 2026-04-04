import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'vja-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="main" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 class="text-xl font-bold text-gray-800">{{ i18n.t('audit.title') }}</h1>
        <button (click)="exportCsv()" class="h-10 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 self-start sm:self-auto">CSV</button>
      </div>

      <div class="sm:hidden space-y-3">
        @for (log of logs(); track log.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-xs text-gray-400">{{ log.createdAt | date:'dd.MM.yyyy HH:mm:ss' }}</div>
                <div class="text-sm font-semibold text-gray-900 mt-1">{{ log.action }}</div>
              </div>
              <button
                (click)="selectedLog.set(selectedLog() === log ? null : log)"
                class="h-8 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 shrink-0">
                {{ selectedLog() === log ? i18n.t('audit.close') : i18n.t('audit.details') }}
              </button>
            </div>

            <div class="grid grid-cols-1 gap-2 text-xs">
              <div>
                <div class="text-gray-400">{{ i18n.t('audit.admin') }}</div>
                <div class="text-gray-700 mt-1 break-all">{{ log.adminEmail || log.adminId?.substring(0, 8) }}</div>
              </div>
              <div>
                <div class="text-gray-400">{{ i18n.t('audit.item') }}</div>
                <div class="text-gray-700 mt-1">{{ log.entityType }} / {{ log.entityId?.substring(0, 8) }}</div>
              </div>
              <div>
                <div class="text-gray-400">{{ i18n.t('audit.ip') }}</div>
                <div class="text-gray-700 mt-1 font-mono break-all">{{ log.ipAddress }}</div>
              </div>
            </div>

            @if (selectedLog() === log && log.details) {
              <div class="rounded-lg bg-gray-50 p-3 overflow-x-auto">
                <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">{{ log.details | json }}</pre>
              </div>
            }
          </div>
        } @empty {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-12 text-center text-gray-400 text-sm">{{ i18n.t('audit.not_found') }}</div>
        }
      </div>

      <div class="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('audit.time') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('audit.admin') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('audit.action') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('audit.item') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('audit.ip') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (log of logs(); track log.id) {
              <tr class="hover:bg-gray-50 cursor-pointer" (click)="selectedLog.set(selectedLog() === log ? null : log)">
                <td class="px-5 py-3 text-xs text-gray-500">{{ log.createdAt | date:'dd.MM.yyyy HH:mm:ss' }}</td>
                <td class="px-5 py-3 text-sm text-gray-700">{{ log.adminEmail || log.adminId?.substring(0, 8) }}</td>
                <td class="px-5 py-3"><span class="text-xs px-2 py-0.5 bg-gray-100 text-black rounded-full">{{ log.action }}</span></td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ log.entityType }} / {{ log.entityId?.substring(0, 8) }}</td>
                <td class="px-5 py-3 text-xs text-gray-400 font-mono">{{ log.ipAddress }}</td>
              </tr>
              @if (selectedLog() === log && log.details) {
                <tr>
                  <td colspan="5" class="px-5 py-3 bg-gray-50">
                    <div class="overflow-x-auto">
                      <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">{{ log.details | json }}</pre>
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <tr><td colspan="5" class="px-5 py-12 text-center text-gray-400 text-sm">{{ i18n.t('audit.not_found') }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AuditComponent implements OnInit {
  logs = signal<any[]>([]);
  selectedLog = signal<any>(null);

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getAuditLogs().subscribe({ next: (res: any) => this.logs.set(res.content || res || []), error: () => this.logs.set([]) });
  }

  exportCsv() {
    const esc = (v: any) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    let csv = 'Timestamp,Admin,Action,EntityType,EntityId,IP\n';
    this.logs().forEach(l => {
      csv += [l.createdAt, l.adminEmail || l.adminId, l.action, l.entityType, l.entityId, l.ipAddress].map(esc).join(',') + '\n';
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit.csv'; a.click();
  }
}
