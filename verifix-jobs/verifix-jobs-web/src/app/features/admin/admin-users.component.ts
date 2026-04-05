import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">{{ i18n.t('admin.users.title') }}</h1>
        <p class="mt-1 text-sm text-muted">{{ i18n.t('admin.users.hint') }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        @for (tab of tabs; track tab.type) {
          <button
            (click)="switchTab(tab.type)"
            class="rounded-2xl border px-4 py-2.5 text-sm font-medium transition"
            [class]="activeTab() === tab.type
              ? 'border-slate-950 bg-primary text-white'
              : 'border-border bg-white text-slate-600 hover:border-border hover:bg-surface'">
            {{ i18n.t(tab.label) }}
          </button>
        }
      </div>

      <!-- Search + count -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative max-w-xs flex-1">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="loadUsers()"
            [placeholder]="i18n.t('admin.users.search')"
            class="h-11 w-full rounded-2xl border border-border bg-white pl-4 pr-10 text-sm outline-none transition focus:border-slate-950" />
          <button (click)="loadUsers()" class="absolute right-1.5 top-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white">
            &rarr;
          </button>
        </div>
        <div class="text-sm text-muted">
          {{ totalElements() }} {{ i18n.t('admin.users.records') }}
        </div>
      </div>

      <!-- User list -->
      @if (loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="rounded-2xl border border-border bg-white p-4">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 animate-pulse rounded-2xl bg-slate-200"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-32 animate-pulse rounded bg-slate-200"></div>
                  <div class="h-3 w-48 animate-pulse rounded bg-slate-100"></div>
                </div>
                <div class="h-6 w-16 animate-pulse rounded-xl bg-slate-100"></div>
              </div>
            </div>
          }
        </div>
      } @else if (users().length === 0) {
        <div class="rounded-2xl border border-border bg-white p-12 text-center">
          <div class="text-3xl">&#x1F465;</div>
          <div class="mt-3 text-sm text-muted">{{ i18n.t('admin.users.not_found') }}</div>
        </div>
      } @else {
        <div class="space-y-2">
          @for (user of users(); track user.id) {
            <div class="rounded-2xl border border-border bg-white p-4 transition hover:border-border">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold uppercase text-slate-600">
                      {{ (user.firstName || user.name || user.email || '?')[0] }}
                    </div>
                    <div class="min-w-0">
                      <div class="truncate text-sm font-medium">{{ user.firstName && user.lastName ? user.firstName + ' ' + user.lastName : (user.name || user.email) }}</div>
                      <div class="truncate text-xs text-muted">{{ user.email || user.phone || '' }}</div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-xl px-2.5 py-1 text-xs font-medium"
                    [class]="user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700'
                           : user.status === 'SUSPENDED' ? 'bg-red-50 text-red-700'
                           : 'bg-slate-100 text-slate-600'">
                    {{ i18n.t('status.' + user.status) || user.status }}
                  </span>
                  <span class="text-xs text-muted">{{ user.createdAt | date:'dd.MM.yyyy' }}</span>

                  @if (activeTab() === 'EMPLOYER') {
                    @if (user.status === 'ACTIVE') {
                      <button (click)="suspend(user)" class="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50">
                        {{ i18n.t('admin.users.suspend') }}
                      </button>
                    } @else if (user.status === 'SUSPENDED') {
                      <button (click)="activate(user)" class="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50">
                        {{ i18n.t('admin.users.activate') }}
                      </button>
                    }
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              [disabled]="currentPage() === 0"
              (click)="goPage(currentPage() - 1)"
              class="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-surface disabled:opacity-40">
              &larr;
            </button>
            <span class="text-sm text-slate-600">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
            <button
              [disabled]="currentPage() >= totalPages() - 1"
              (click)="goPage(currentPage() + 1)"
              class="rounded-xl border border-border px-4 py-2 text-sm transition hover:bg-surface disabled:opacity-40">
              &rarr;
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  tabs = [
    { type: 'CANDIDATE', label: 'admin.users.candidates' },
    { type: 'EMPLOYER', label: 'admin.users.employers' },
    { type: 'ADMIN', label: 'admin.users.admins' },
  ];

  activeTab = signal('CANDIDATE');
  users = signal<any[]>([]);
  loading = signal(false);
  searchQuery = '';
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  constructor(
    private api: AdminApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  switchTab(type: string) {
    this.activeTab.set(type);
    this.currentPage.set(0);
    this.searchQuery = '';
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.api.getUsers(this.activeTab(), this.currentPage(), 20, this.searchQuery || undefined).subscribe({
      next: (res) => {
        this.users.set(res.content || []);
        this.totalPages.set(res.totalPages || 0);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.i18n.t('admin.load_failed'));
      },
    });
  }

  goPage(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  suspend(user: any) {
    this.api.suspendUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.toast.error(this.i18n.t('admin.action_failed')),
    });
  }

  activate(user: any) {
    this.api.activateUser(user.id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.toast.error(this.i18n.t('admin.action_failed')),
    });
  }
}
