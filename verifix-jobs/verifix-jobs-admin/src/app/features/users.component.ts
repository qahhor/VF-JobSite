import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'vja-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-4">
      <h1 class="text-xl font-bold text-gray-800">{{ i18n.t('users.title') }}</h1>

      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex gap-1 overflow-x-auto bg-white rounded-lg border border-gray-200 p-1 no-scrollbar">
          @for (tab of tabs; track tab.value) {
            <button (click)="activeTab = tab.value; load()"
                    class="px-4 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap"
                    [class]="activeTab === tab.value ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'">
              {{ i18n.t(tab.labelKey) }}
            </button>
          }
        </div>
        <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="load()" [placeholder]="i18n.t('users.search')"
               class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
      </div>

      <div class="text-xs text-gray-400">{{ totalElements }} {{ i18n.t('users.records') }}</div>

      <div class="sm:hidden space-y-3">
        @for (u of users(); track u.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-black text-sm font-medium shrink-0">
                {{ (u.firstName || u.name || u.email || '?').charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ u.firstName || u.name || 'N/A' }} {{ u.lastName || '' }}</div>
                <div class="text-xs text-gray-400 truncate">{{ u.phone || u.email || '-' }}</div>
                <div class="text-[11px] text-gray-400 mt-1">{{ u.id?.substring(0, 8) }}...</div>
              </div>
              <span class="text-xs px-2 py-1 rounded-full shrink-0"
                    [class]="u.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : u.status === 'SUSPENDED' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'">
                {{ u.status || 'ACTIVE' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div class="text-gray-400">{{ i18n.t('users.registered') }}</div>
                <div class="text-gray-700 mt-1">{{ u.createdAt | date:'dd.MM.yyyy' }}</div>
              </div>
              <div>
                <div class="text-gray-400">{{ i18n.t('common.role') }}</div>
                <div class="text-gray-700 mt-1">{{ activeTab }}</div>
              </div>
            </div>

            <div class="flex justify-end">
              @if (activeTab === 'EMPLOYER' && u.status !== 'SUSPENDED') {
                <button (click)="suspend(u)" class="h-9 px-3 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50">{{ i18n.t('users.suspend') }}</button>
              } @else if (activeTab === 'EMPLOYER') {
                <button (click)="activate(u)" class="h-9 px-3 rounded-lg border border-green-200 text-xs font-medium text-green-600 hover:bg-green-50">{{ i18n.t('users.activate') }}</button>
              } @else {
                <span class="text-xs text-gray-400">{{ i18n.t('users.read_only') }}</span>
              }
            </div>
          </div>
        } @empty {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-12 text-center text-gray-400 text-sm">{{ i18n.t('users.not_found') }}</div>
        }
      </div>

      <div class="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('users.user') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('common.contact') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('users.status') }}</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('users.registered') }}</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">{{ i18n.t('users.action') }}</th>
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
                <td class="px-5 py-3 text-sm text-gray-600">{{ u.phone || u.email || '-' }}</td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full"
                        [class]="u.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : u.status === 'SUSPENDED' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'">
                    {{ u.status || 'ACTIVE' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-gray-400">{{ u.createdAt | date:'dd.MM.yyyy' }}</td>
                <td class="px-5 py-3 text-right">
                  @if (activeTab === 'EMPLOYER' && u.status !== 'SUSPENDED') {
                    <button (click)="suspend(u)" class="text-xs text-red-600 hover:underline" [attr.aria-label]="i18n.t('users.suspend')">{{ i18n.t('users.suspend') }}</button>
                  } @else if (activeTab === 'EMPLOYER') {
                    <button (click)="activate(u)" class="text-xs text-green-600 hover:underline">{{ i18n.t('users.activate') }}</button>
                  } @else {
                    <span class="text-xs text-gray-400">{{ i18n.t('users.read_only') }}</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-5 py-12 text-center text-gray-400 text-sm">{{ i18n.t('users.not_found') }}</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
        <div class="flex items-center justify-center gap-2 pt-2">
          <button (click)="goPage(currentPage - 1)" [disabled]="currentPage === 0"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40">&laquo;</button>
          <span class="text-xs text-gray-500">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button (click)="goPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 text-xs disabled:opacity-40">&raquo;</button>
        </div>
      }
    </div>
  `,
  styles: [`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`]
})
export class UsersComponent implements OnInit {
  users = signal<any[]>([]);
  activeTab = 'CANDIDATE';
  searchQuery = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  tabs = [
    { value: 'CANDIDATE', labelKey: 'users.candidates' },
    { value: 'EMPLOYER', labelKey: 'users.employers' },
    { value: 'ADMIN', labelKey: 'users.admins' },
  ];

  constructor(private api: AdminApiService, public i18n: I18nService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getUsers(this.activeTab, this.currentPage, this.searchQuery).subscribe({
      next: (res: any) => {
        this.users.set(res.content || res || []);
        this.totalElements = res.totalElements ?? this.users().length;
        this.totalPages = res.totalPages ?? 1;
      },
      error: () => this.users.set([])
    });
  }

  goPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.load();
  }

  suspend(u: any) { this.api.suspendUser(u.id).subscribe(() => this.load()); }
  activate(u: any) { this.api.activateUser(u.id).subscribe(() => this.load()); }
}
