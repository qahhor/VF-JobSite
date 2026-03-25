import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-4">
      <h1 class="text-xl font-bold text-gray-800">Foydalanuvchilar</h1>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
          @for (tab of tabs; track tab.value) {
            <button (click)="activeTab = tab.value; load()"
                    class="px-4 py-1.5 rounded-md text-xs font-medium transition"
                    [class]="activeTab === tab.value ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'">
              {{ tab.label }}
            </button>
          }
        </div>
        <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="load()" placeholder="Qidirish..."
               class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Foydalanuvchi</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Kontakt</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Ro'yxatdan</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Amal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (u of users(); track u.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-black text-xs font-medium">
                      {{ (u.firstName || u.name || u.email || '?').charAt(0) }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-800">{{ u.firstName || u.name || 'N/A' }} {{ u.lastName || '' }}</div>
                      <div class="text-xs text-gray-400">{{ u.id?.substring(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ u.phone || u.email || '—' }}</td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full"
                        [class]="u.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : u.status === 'SUSPENDED' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'">
                    {{ u.status || 'ACTIVE' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-gray-400">{{ u.createdAt | date:'dd.MM.yyyy' }}</td>
                <td class="px-5 py-3 text-right">
                  @if (u.status !== 'SUSPENDED') {
                    <button (click)="suspend(u)" class="text-xs text-red-600 hover:underline" aria-label="To'xtatish">To'xtatish</button>
                  } @else {
                    <button (click)="activate(u)" class="text-xs text-green-600 hover:underline">Faollashtirish</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-12 text-center text-gray-400 text-sm">Foydalanuvchilar topilmadi</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UsersComponent implements OnInit {
  users = signal<any[]>([]);
  activeTab = 'CANDIDATE';
  searchQuery = '';
  tabs = [
    { value: 'CANDIDATE', label: 'Nomzodlar' },
    { value: 'EMPLOYER', label: 'Ish beruvchilar' },
    { value: 'ADMIN', label: 'Adminlar' },
  ];

  constructor(private api: AdminApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getUsers(this.activeTab, 0, this.searchQuery).subscribe({
      next: (res: any) => this.users.set(res.content || res || []),
    });
  }

  suspend(u: any) { this.api.suspendUser(u.id).subscribe(() => this.load()); }
  activate(u: any) { this.api.activateUser(u.id).subscribe(() => this.load()); }
}
