import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminModerationItem } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <section class="rounded-2xl border border-border bg-white p-6 shadow-card">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="text-sm uppercase tracking-[0.24em] text-primary">{{ i18n.t('admin.moderation') }}</div>
            <h1 class="mt-3 text-3xl font-semibold">{{ i18n.t('admin.moderation_hub') }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-muted">{{ i18n.t('admin.moderation_hub_hint') }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-border bg-surface p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-muted">{{ i18n.t('admin.pending') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ pendingCount() }}</div>
            </div>
            <div class="rounded-2xl border border-border bg-surface p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-muted">{{ i18n.t('status.approved') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ approvedCount() }}</div>
            </div>
            <div class="rounded-2xl border border-border bg-surface p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-muted">{{ i18n.t('status.rejected') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ rejectedCount() }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-border bg-white p-6 shadow-card">
        <div class="grid gap-4 xl:grid-cols-[220px_1fr_auto]">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.moderation.status') }}</span>
            <select
              [(ngModel)]="statusFilter"
              (ngModelChange)="load()"
              class="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-slate-950">
              <option value="">{{ i18n.t('filter.all') }}</option>
              <option value="PENDING">{{ i18n.t('admin.pending') }}</option>
              <option value="APPROVED">{{ i18n.t('status.approved') }}</option>
              <option value="REJECTED">{{ i18n.t('status.rejected') }}</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('common.search') }}</span>
            <input
              [(ngModel)]="search"
              type="text"
              class="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-slate-950"
              [placeholder]="i18n.t('admin.search_queue')" />
          </label>

          <div class="flex items-end gap-3">
            <button (click)="load()" class="h-12 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-600">
              {{ i18n.t('admin.reload') }}
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          @for (item of filteredItems(); track item.id) {
            <div class="rounded-2xl border border-border bg-surface p-5">
              <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="text-lg font-semibold">{{ item.title || item.entityType }}</div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-medium" [class]="statusCls(item.status)">
                      {{ i18n.t('status.' + item.status) || item.status }}
                    </span>
                  </div>

                  <div class="mt-2 flex flex-wrap gap-4 text-sm text-muted">
                    @if (item.subtitle) { <span>{{ item.subtitle }}</span> }
                    @if (item.city) { <span>{{ item.city }}</span> }
                    @if (item.category) { <span>{{ item.category }}</span> }
                    @if (item.salaryLabel) { <span>{{ item.salaryLabel }}</span> }
                  </div>

                  <div class="mt-4 text-sm leading-6 text-slate-700 line-clamp-4">
                    {{ item.previewText || item.reason || i18n.t('admin.no_preview') }}
                  </div>

                  <div class="mt-4 text-xs text-muted">
                    {{ item.createdAt | date:'dd.MM.yyyy HH:mm' }}
                    @if (item.decidedAt) {
                      &middot; {{ i18n.t('admin.decision_date') }}: {{ item.decidedAt | date:'dd.MM.yyyy HH:mm' }}
                    }
                  </div>
                </div>

                <div class="w-full max-w-md xl:w-80">
                  @if (item.status === 'PENDING') {
                    <div class="space-y-3">
                      <div class="grid gap-2 sm:grid-cols-2">
                        <button
                          (click)="approve(item.id)"
                          class="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400">
                          {{ i18n.t('common.approve') }}
                        </button>
                        <button
                          (click)="toggleReject(item.id)"
                          class="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
                          {{ i18n.t('common.reject') }}
                        </button>
                      </div>

                      @if (rejectingId() === item.id) {
                        <div class="space-y-2">
                          <textarea
                            [(ngModel)]="rejectReason"
                            rows="3"
                            class="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950"
                            [placeholder]="i18n.t('admin.moderation.reject_reason')"></textarea>
                          <div class="flex gap-2">
                            <button
                              (click)="reject(item.id)"
                              class="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400">
                              {{ i18n.t('common.send') }}
                            </button>
                            <button
                              (click)="toggleReject('')"
                              class="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                              {{ i18n.t('common.cancel') }}
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="rounded-2xl border border-border bg-white p-4 text-sm text-slate-700">
                      {{ item.reason || i18n.t('admin.review_completed') }}
                    </div>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-2xl border border-dashed border-border bg-surface px-4 py-12 text-center text-sm text-muted">
              {{ i18n.t('admin.moderation.empty') }}
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class AdminModerationComponent implements OnInit {
  items = signal<AdminModerationItem[]>([]);
  statusFilter = 'PENDING';
  search = '';
  rejectingId = signal('');
  rejectReason = '';

  readonly pendingCount = computed(() => this.items().filter((item) => item.status === 'PENDING').length);
  readonly approvedCount = computed(() => this.items().filter((item) => item.status === 'APPROVED').length);
  readonly rejectedCount = computed(() => this.items().filter((item) => item.status === 'REJECTED').length);

  constructor(
    private api: AdminApiService,
    private toast: ToastService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getModerationQueue(this.statusFilter || undefined, 0, 50).subscribe({
      next: (response) => this.items.set(response.content || []),
      error: () => this.toast.error(this.i18n.t('admin.load_failed'))
    });
  }

  approve(id: string) {
    this.api.approveModeration(id).subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('admin.review_approved'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  toggleReject(id: string) {
    this.rejectingId.set(id);
    if (!id) {
      this.rejectReason = '';
    }
  }

  reject(id: string) {
    this.api.rejectModeration(id, this.rejectReason).subscribe({
      next: () => {
        this.toggleReject('');
        this.load();
        this.toast.success(this.i18n.t('admin.review_rejected'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  statusCls(status: string): string {
    return ({
      PENDING: 'border border-amber-400/30 bg-amber-500/10 text-amber-300',
      APPROVED: 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
      REJECTED: 'border border-red-400/30 bg-red-500/10 text-red-300',
    } as Record<string, string>)[status] || 'border border-border bg-white text-slate-600';
  }

  filteredItems(): AdminModerationItem[] {
    const needle = this.search.trim().toLowerCase();
    if (!needle) return this.items();
    return this.items().filter((item) =>
      [item.title, item.subtitle, item.entityId, item.category, item.city]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }
}
