import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'vja-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 class="text-xl font-bold text-gray-800">{{ i18n.t('admin.queue') }}</h1>
        <div class="grid grid-cols-3 gap-2 md:flex">
          @for (status of statuses; track status.value) {
            <button
              (click)="statusFilter = status.value; load()"
              class="rounded-lg px-3 py-2 text-xs font-medium transition"
              [class]="statusFilter === status.value ? 'bg-black text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'">
              {{ i18n.t(status.label) }}
            </button>
          }
        </div>
      </div>

      @if (statusFilter !== 'PENDING') {
        <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {{ i18n.t('admin.pending') }}: {{ i18n.t('admin.history_unavailable') }}.
        </div>
      }

      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div class="divide-y divide-gray-100 md:hidden">
          @for (item of items(); track item.id) {
            <div class="space-y-3 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-black">{{ item.entityType }}</div>
                  <div class="mt-2 text-sm font-medium text-gray-700">{{ item.entityId?.substring(0, 8) }}...</div>
                  <div class="mt-1 text-xs text-gray-400">{{ item.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
                </div>
                <span class="rounded-full px-2 py-1 text-xs"
                      [class]="item.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : item.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                  {{ item.status }}
                </span>
              </div>
              @if (item.status === 'PENDING') {
                <div class="grid grid-cols-2 gap-2">
                  <button (click)="approve(item)" class="h-10 rounded-lg bg-green-600 px-4 text-sm font-medium text-white">{{ i18n.t('common.approve') }}</button>
                  <button (click)="openReject(item)" class="h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600">{{ i18n.t('common.reject') }}</button>
                </div>
              }
            </div>
          } @empty {
            <div class="px-5 py-12 text-center text-sm text-gray-400">{{ i18n.t('admin.no_items') }}</div>
          }
        </div>

        <table class="hidden w-full md:table">
          <thead class="border-b border-gray-100 bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('admin.type') }}</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('admin.item') }}</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('admin.status') }}</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('admin.date') }}</th>
              <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">{{ i18n.t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (item of items(); track item.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-5 py-3"><span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-black">{{ item.entityType }}</span></td>
                <td class="px-5 py-3 text-sm text-gray-700">{{ item.entityId?.substring(0, 8) }}...</td>
                <td class="px-5 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs"
                        [class]="item.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : item.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-gray-400">{{ item.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
                <td class="px-5 py-3 text-right">
                  @if (item.status === 'PENDING') {
                    <button (click)="approve(item)" class="mr-3 text-xs text-green-600 hover:underline">{{ i18n.t('common.approve') }}</button>
                    <button (click)="openReject(item)" class="text-xs text-red-600 hover:underline" [attr.aria-label]="i18n.t('common.reject')">{{ i18n.t('common.reject') }}</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-12 text-center text-sm text-gray-400">{{ i18n.t('admin.no_items') }}</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (rejectItem()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 class="mb-4 font-semibold text-gray-800">{{ i18n.t('common.reject') }}</h3>
            <textarea [(ngModel)]="rejectReason" rows="3" class="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" [placeholder]="i18n.t('admin.reason_placeholder')"></textarea>
            <div class="flex justify-end gap-2">
              <button (click)="rejectItem.set(null)" class="rounded-lg border border-gray-300 px-4 py-2 text-sm">{{ i18n.t('common.cancel') }}</button>
              <button (click)="reject()" class="rounded-lg bg-red-500 px-4 py-2 text-sm text-white">{{ i18n.t('common.reject') }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ModerationComponent implements OnInit {
  items = signal<any[]>([]);
  statusFilter = 'PENDING';
  rejectItem = signal<any>(null);
  rejectReason = '';

  statuses = [
    { value: 'PENDING', label: 'status.pending' },
    { value: 'APPROVED', label: 'status.approved' },
    { value: 'REJECTED', label: 'status.rejected' },
  ];

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getModerationQueue(this.statusFilter).subscribe({
      next: (res: any) => this.items.set(res.content || res || []),
      error: () => this.items.set([])
    });
  }

  approve(item: any) {
    this.api.approveModeration(item.id).subscribe(() => this.load());
  }

  openReject(item: any) {
    this.rejectItem.set(item);
    this.rejectReason = '';
  }

  reject() {
    const item = this.rejectItem();
    if (!item) {
      return;
    }
    this.api.rejectModeration(item.id, this.rejectReason).subscribe(() => {
      this.rejectItem.set(null);
      this.load();
    });
  }
}
