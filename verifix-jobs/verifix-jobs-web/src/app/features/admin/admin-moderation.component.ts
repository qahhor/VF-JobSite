import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-admin-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="text-2xl font-bold mb-6">{{ i18n.t('admin.moderation.title') }}</h1>

    <div class="space-y-3">
      @for (item of items(); track item.id) {
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold">{{ item.entityType || 'CONTENT' }}: {{ item.entityId || item.id }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ i18n.t('admin.moderation.status') }}: {{ item.status || 'PENDING' }}</div>
              @if (item.reason) { <p class="text-xs text-gray-400 mt-2 line-clamp-3">{{ item.reason }}</p> }
              <div class="text-xs text-gray-600 mt-2">{{ item.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
            </div>

            <div class="flex gap-2 shrink-0">
              <button (click)="approve(item.id)" class="h-8 px-4 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-500 transition">{{ i18n.t('common.approve') }}</button>
              <button (click)="openReject(item)" class="h-8 px-4 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition">{{ i18n.t('common.reject') }}</button>
            </div>
          </div>

          @if (rejectingId() === item.id) {
            <div class="mt-3 flex gap-2">
              <input type="text" [(ngModel)]="rejectReason" [placeholder]="i18n.t('admin.moderation.reject_reason')"
                     class="flex-1 h-9 px-3 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 outline-none">
              <button (click)="reject(item.id)" class="h-9 px-4 bg-red-600 text-white text-xs font-medium rounded-lg">{{ i18n.t('common.send') }}</button>
              <button (click)="rejectingId.set('')" class="h-9 px-3 text-gray-500 text-xs">{{ i18n.t('common.cancel') }}</button>
            </div>
          }
        </div>
      } @empty {
        <div class="text-center py-16 text-gray-500">
          <div class="text-4xl mb-3">&#10003;</div>
          <div class="text-sm">{{ i18n.t('admin.moderation.empty') }}</div>
        </div>
      }
    </div>
  `,
})
export class AdminModerationComponent implements OnInit {
  items = signal<any[]>([]);
  rejectingId = signal('');
  rejectReason = '';

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getPendingModeration().subscribe({
      next: (r: any) => this.items.set(r.content || []),
      error: () => {}
    });
  }

  approve(id: string) {
    this.api.approveModeration(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  openReject(item: any) {
    this.rejectingId.set(item.id);
    this.rejectReason = '';
  }

  reject(id: string) {
    this.api.rejectModeration(id, this.rejectReason).subscribe({ next: () => { this.rejectingId.set(''); this.load(); }, error: () => {} });
  }
}
