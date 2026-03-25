import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800">Moderatsiya navbati</h1>
        <div class="flex gap-2">
          @for (s of statuses; track s.value) {
            <button (click)="statusFilter = s.value; load()"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    [class]="statusFilter === s.value ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'">
              {{ s.label }}
            </button>
          }
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Turi</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Element</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Sana</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (item of items(); track item.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-5 py-3"><span class="text-xs px-2 py-0.5 bg-gray-100 text-black rounded-full">{{ item.entityType }}</span></td>
                <td class="px-5 py-3 text-sm text-gray-700">{{ item.entityId?.substring(0, 8) }}...</td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full"
                        [class]="item.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : item.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-gray-400">{{ item.createdAt | date:'dd.MM.yyyy HH:mm' }}</td>
                <td class="px-5 py-3 text-right">
                  @if (item.status === 'PENDING') {
                    <button (click)="approve(item)" class="text-xs text-green-600 hover:underline mr-3">Tasdiqlash</button>
                    <button (click)="openReject(item)" class="text-xs text-red-600 hover:underline" aria-label="Rad etish">Rad etish</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-12 text-center text-gray-400 text-sm">Navbatda element yo'q</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Reject dialog -->
      @if (rejectItem()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="font-semibold text-gray-800 mb-4">Rad etish sababi</h3>
            <textarea [(ngModel)]="rejectReason" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4" placeholder="Sababni kiriting..."></textarea>
            <div class="flex justify-end gap-2">
              <button (click)="rejectItem.set(null)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Bekor qilish</button>
              <button (click)="reject()" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">Rad etish</button>
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
    { value: 'PENDING', label: 'Kutilmoqda' },
    { value: 'APPROVED', label: 'Tasdiqlangan' },
    { value: 'REJECTED', label: 'Rad etilgan' },
  ];

  constructor(private api: AdminApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getModerationQueue(this.statusFilter).subscribe({
      next: (res: any) => this.items.set(res.content || res || []),
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
    if (!item) return;
    this.api.rejectModeration(item.id, this.rejectReason).subscribe(() => {
      this.rejectItem.set(null);
      this.load();
    });
  }
}
