import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="main" class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800">Audit log</h1>
        <button (click)="exportCsv()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">CSV</button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Vaqt</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Admin</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Amal</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Element</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">IP</th>
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
                    <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">{{ log.details | json }}</pre>
                  </td>
                </tr>
              }
            } @empty {
              <tr><td colspan="5" class="px-5 py-12 text-center text-gray-400 text-sm">Loglar topilmadi</td></tr>
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

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getAuditLogs().subscribe({ next: (res: any) => this.logs.set(res.content || res || []) });
  }

  exportCsv() {
    let csv = 'Timestamp,Admin,Action,EntityType,EntityId,IP\n';
    this.logs().forEach(l => {
      csv += `${l.createdAt},${l.adminEmail || l.adminId},${l.action},${l.entityType},${l.entityId},${l.ipAddress}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit.csv'; a.click();
  }
}
