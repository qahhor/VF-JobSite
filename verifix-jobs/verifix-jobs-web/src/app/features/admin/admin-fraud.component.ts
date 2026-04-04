import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminFraudAlert } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-fraud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="text-sm uppercase tracking-[0.24em] text-cyan-300">{{ i18n.t('admin.fraud') }}</div>
            <h1 class="mt-3 text-3xl font-semibold">{{ i18n.t('admin.fraud_center') }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{{ i18n.t('admin.fraud_center_hint') }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.open_alerts') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ pendingAlerts().length }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.high_risk') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ highRiskCount() }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.reviewed_alerts') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ reviewedAlerts().length }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid gap-4 xl:grid-cols-[220px_1fr_auto]">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.fraud_filter') }}</span>
            <select
              [(ngModel)]="reviewed"
              (ngModelChange)="load()"
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950">
              <option [ngValue]="false">{{ i18n.t('admin.pending') }}</option>
              <option [ngValue]="true">{{ i18n.t('admin.reviewed_alerts') }}</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('common.search') }}</span>
            <input
              [(ngModel)]="search"
              type="text"
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950"
              [placeholder]="i18n.t('admin.search_alerts')" />
          </label>

          <div class="flex items-end gap-3">
            <button (click)="load()" class="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              {{ i18n.t('admin.reload') }}
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          @for (alert of filteredAlerts(); track alert.id) {
            <div class="rounded-2xl border p-5" [class]="alert.reviewed ? 'border-slate-200 bg-slate-50' : 'border-amber-200 bg-amber-50'">
              <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]" [class]="severityClass(alert.score)">
                      {{ severityLabel(alert.score) }}
                    </span>
                    <div class="text-sm font-semibold">{{ alert.fraudType }}</div>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
                    <span>{{ alert.entityType }}</span>
                    <span>{{ alert.entityId }}</span>
                    <span>{{ alert.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-2">
                    @for (flag of parsedFlags(alert.flags); track flag) {
                      <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {{ flag }}
                      </span>
                    }
                  </div>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                  @if (!alert.reviewed) {
                    <button
                      (click)="review(alert.id)"
                      class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      {{ i18n.t('admin.mark_reviewed') }}
                    </button>
                  } @else {
                    <span class="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {{ i18n.t('admin.reviewed_alerts') }}
                    </span>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              {{ i18n.t('admin.no_fraud_alerts') }}
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class AdminFraudComponent implements OnInit {
  alerts = signal<AdminFraudAlert[]>([]);
  reviewed = false;
  search = '';

  readonly pendingAlerts = computed(() => this.alerts().filter((alert) => !alert.reviewed));
  readonly reviewedAlerts = computed(() => this.alerts().filter((alert) => !!alert.reviewed));
  readonly highRiskCount = computed(() => this.alerts().filter((alert) => Number(alert.score || 0) >= 0.7).length);

  constructor(
    private api: AdminApiService,
    private toast: ToastService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFraudAlerts(this.reviewed, 0, 50).subscribe({
      next: (response) => this.alerts.set(response.content || []),
      error: () => this.toast.error(this.i18n.t('admin.load_failed'))
    });
  }

  review(id: string) {
    this.api.reviewFraudAlert(id).subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('admin.alert_reviewed'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  parsedFlags(flags?: string | string[]): string[] {
    if (!flags) return [];
    if (Array.isArray(flags)) return flags;
    try {
      const parsed = JSON.parse(flags);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [String(flags)];
    }
  }

  severityClass(score?: number): string {
    const numeric = Number(score || 0);
    if (numeric >= 0.7) return 'border border-red-200 bg-red-100 text-red-700';
    if (numeric >= 0.4) return 'border border-amber-200 bg-amber-100 text-amber-800';
    return 'border border-slate-200 bg-white text-slate-600';
  }

  severityLabel(score?: number): string {
    const numeric = Number(score || 0);
    if (numeric >= 0.7) return this.i18n.t('admin.severity_high');
    if (numeric >= 0.4) return this.i18n.t('admin.severity_medium');
    return this.i18n.t('admin.severity_low');
  }

  filteredAlerts(): AdminFraudAlert[] {
    const needle = this.search.trim().toLowerCase();
    if (!needle) return this.alerts();
    return this.alerts().filter((alert) =>
      [alert.fraudType, alert.entityType, alert.entityId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }
}
