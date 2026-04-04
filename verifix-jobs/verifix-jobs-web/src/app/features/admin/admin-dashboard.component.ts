import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  AdminApiService,
  AdminAuditItem,
  AdminFraudAlert,
  AdminModerationItem,
  AdminOverview,
  AdminProfile,
} from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';

interface Kpi {
  label: string;
  value: string;
  trend: number;
}

interface HealthService {
  name: string;
  key: string;
  healthy: boolean;
}

@Component({
  selector: 'vjw-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-5">
      <!-- Header with operational signals -->
      <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="text-sm uppercase tracking-[0.24em] text-slate-500">{{ i18n.t('admin.dashboard') }}</div>
            <h1 class="mt-3 text-3xl font-semibold text-slate-950">{{ i18n.t('admin.control_center') }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{{ i18n.t('admin.dashboard_intro') }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <a routerLink="/admin/moderation" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.pending_review') }}</div>
              <div class="mt-2 text-2xl font-semibold text-slate-950">{{ overview()?.pendingModeration || 0 }}</div>
            </a>
            <a routerLink="/admin/fraud" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.open_alerts') }}</div>
              <div class="mt-2 text-2xl font-semibold text-slate-950">{{ overview()?.openFraudAlerts || 0 }}</div>
            </a>
            <a routerLink="/admin/access" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.active_admins') }}</div>
              <div class="mt-2 text-2xl font-semibold text-slate-950">{{ overview()?.activeAdmins || 0 }}</div>
            </a>
          </div>
        </div>
      </section>

      <!-- KPI cards with trends -->
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        @if (kpis().length === 0) {
          @for (i of [1,2,3,4]; track i) {
            <div class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="h-3 w-20 animate-pulse rounded bg-slate-200"></div>
                <div class="h-5 w-12 animate-pulse rounded-lg bg-slate-100"></div>
              </div>
              <div class="mt-3 h-8 w-24 animate-pulse rounded-lg bg-slate-200"></div>
            </div>
          }
        }
        @for (kpi of kpis(); track kpi.label) {
          <div class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t(kpi.label) }}</div>
              @if (kpi.trend !== 0) {
                <span class="inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-medium"
                  [class]="kpi.trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    [class]="kpi.trend < 0 ? 'rotate-180' : ''">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
                  </svg>
                  {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
                </span>
              }
            </div>
            <div class="mt-3 text-3xl font-semibold text-slate-950">{{ kpi.value }}</div>
          </div>
        }
      </section>

      <!-- Secondary stats -->
      <section class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        @for (card of metricCards(); track card.label) {
          <div class="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <div class="text-xl font-bold text-slate-900">{{ card.value }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ card.label }}</div>
            @if (card.sub) {
              <div class="mt-1 text-xs text-slate-400">{{ card.sub }}</div>
            }
          </div>
        }
      </section>

      <!-- Main content grid -->
      <section class="grid gap-5 2xl:grid-cols-[1.2fr_1fr]">
        <div class="space-y-5">
          <!-- Moderation preview -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-950">{{ i18n.t('admin.needs_attention') }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.needs_attention_hint') }}</p>
              </div>
              <a routerLink="/admin/moderation" class="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4">
                {{ i18n.t('admin.view_queue') }}
              </a>
            </div>

            <div class="grid gap-3 lg:grid-cols-2">
              @for (item of moderationPreview(); track item.id) {
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-sm font-semibold text-slate-950">{{ item.title || item.entityType }}</div>
                      <div class="mt-1 text-xs text-slate-500">{{ item.subtitle || item.entityId }}</div>
                    </div>
                    <span class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                      {{ i18n.t('status.' + item.status) || item.status }}
                    </span>
                  </div>
                  <div class="mt-3 text-sm text-slate-700 line-clamp-3">{{ item.previewText || item.reason || i18n.t('admin.no_preview') }}</div>
                  <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    @if (item.city) { <span>{{ item.city }}</span> }
                    @if (item.category) { <span>{{ item.category }}</span> }
                    @if (item.salaryLabel) { <span>{{ item.salaryLabel }}</span> }
                  </div>
                </div>
              } @empty {
                <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 lg:col-span-2">
                  {{ i18n.t('admin.no_pending_queue') }}
                </div>
              }
            </div>
          </div>

          <!-- Recent activity -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-950">{{ i18n.t('admin.recent_activity') }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.recent_activity_hint') }}</p>
              </div>
              <a routerLink="/admin/audit" class="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4">
                {{ i18n.t('admin.open_section') }}
              </a>
            </div>

            <div class="space-y-3">
              @for (item of auditItems(); track item.id) {
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-sm font-semibold text-slate-950">{{ item.action }}</div>
                    <div class="text-xs text-slate-500">{{ item.createdAt | date:'dd.MM HH:mm' }}</div>
                  </div>
                  <div class="mt-2 text-xs text-slate-500">{{ item.adminEmail || 'admin' }} · {{ item.entityType || 'SYSTEM' }}</div>
                </div>
              } @empty {
                <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  {{ i18n.t('admin.no_activity') }}
                </div>
              }
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <!-- System health -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-slate-950">{{ i18n.t('admin.system_health') }}</h2>
            <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.system_health_hint') }}</p>

            @if (healthLoading()) {
              <div class="mt-4 py-4 text-center text-sm text-slate-400">{{ i18n.t('admin.logging_in') }}</div>
            } @else {
              <div class="mt-4 space-y-2">
                @for (svc of services(); track svc.key) {
                  <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <span class="text-sm text-slate-700">{{ i18n.t(svc.name) }}</span>
                    <span class="flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full" [class]="svc.healthy ? 'bg-emerald-400' : 'bg-red-400'"></span>
                      <span class="text-xs font-medium" [class]="svc.healthy ? 'text-emerald-600' : 'text-red-500'">
                        {{ svc.healthy ? i18n.t('admin.status_running') : i18n.t('admin.status_down') }}
                      </span>
                    </span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Quick actions -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-slate-950">{{ i18n.t('admin.quick_actions') }}</h2>
            <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.quick_actions_hint') }}</p>

            <div class="mt-5 grid gap-3">
              <a routerLink="/admin/employers" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100">
                <div class="text-sm font-semibold text-slate-950">{{ i18n.t('admin.companies') }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ i18n.t('admin.review_companies') }}</div>
              </a>
              <a routerLink="/admin/analytics" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100">
                <div class="text-sm font-semibold text-slate-950">{{ i18n.t('admin.analytics_nav') }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ i18n.t('admin.analytics.hint') }}</div>
              </a>
              <a routerLink="/admin/settings" class="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100">
                <div class="text-sm font-semibold text-slate-950">{{ i18n.t('admin.settings_nav') }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ i18n.t('admin.settings.hint') }}</div>
              </a>
            </div>
          </div>

          <!-- Fraud preview -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-950">{{ i18n.t('admin.fraud') }}</h2>
                <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.fraud_hint') }}</p>
              </div>
              <a routerLink="/admin/fraud" class="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4">
                {{ i18n.t('admin.open_section') }}
              </a>
            </div>

            <div class="space-y-3">
              @for (alert of fraudPreview(); track alert.id) {
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-sm font-semibold text-slate-950">{{ alert.fraudType }}</div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-medium" [class]="severityClass(alert.score)">
                      {{ alert.score || 0 }}
                    </span>
                  </div>
                  <div class="mt-2 text-xs text-slate-500">{{ alert.entityType }} · {{ alert.entityId }}</div>
                </div>
              } @empty {
                <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  {{ i18n.t('admin.no_fraud_alerts') }}
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  overview = signal<AdminOverview | null>(null);
  profile = signal<AdminProfile | null>(null);
  auditItems = signal<AdminAuditItem[]>([]);
  moderationPreview = signal<AdminModerationItem[]>([]);
  fraudPreview = signal<AdminFraudAlert[]>([]);
  kpis = signal<Kpi[]>([]);
  metricCards = signal<{ label: string; value: number | string; sub?: string }[]>([]);
  services = signal<HealthService[]>([
    { name: 'admin.service.postgres', key: 'postgres', healthy: false },
    { name: 'admin.service.redis', key: 'redis', healthy: false },
    { name: 'admin.service.elasticsearch', key: 'elasticsearch', healthy: false },
    { name: 'admin.service.kafka', key: 'kafka', healthy: false },
    { name: 'admin.service.ml', key: 'ml', healthy: false },
    { name: 'admin.service.minio', key: 'minio', healthy: false },
  ]);
  healthLoading = signal(true);

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getCurrentAdminProfile().subscribe({ next: (p) => this.profile.set(p), error: () => {} });

    this.api.getOverview().subscribe({
      next: (d) => {
        this.overview.set(d);

        const totalUsers = d.totalUsers ?? (d.totalCandidates + d.totalEmployers);
        this.kpis.set([
          { label: 'admin.kpi.total_users', value: this.fmt(totalUsers), trend: d.usersTrend ?? 0 },
          { label: 'admin.kpi.active_vacancies', value: this.fmt(d.activeVacancies), trend: d.vacanciesTrend ?? 0 },
          { label: 'admin.kpi.applications_today', value: this.fmt(d.applicationsToday ?? 0), trend: d.applicationsTrend ?? 0 },
          { label: 'admin.kpi.monthly_revenue', value: this.fmtAmount(d.monthlyRevenue ?? 0), trend: d.revenueTrend ?? 0 },
        ]);

        this.metricCards.set([
          { label: this.i18n.t('admin.companies'), value: d.totalEmployers, sub: `${this.i18n.t('admin.pending')}: ${d.pendingEmployers}` },
          { label: this.i18n.t('admin.candidates'), value: d.totalCandidates, sub: `+${d.newCandidatesLast7Days} / 7d` },
          { label: this.i18n.t('admin.kpi.vacancies'), value: d.totalVacancies },
          { label: this.i18n.t('admin.kpi.applications'), value: d.totalApplications },
          { label: this.i18n.t('admin.verified_companies'), value: d.verifiedEmployers },
          { label: this.i18n.t('admin.kpi.hired'), value: d.totalHired },
        ]);
      },
      error: () => {},
    });

    this.api.getHealthStatus().subscribe({
      next: (health) => {
        this.healthLoading.set(false);
        this.services.update(svcs => svcs.map(s => ({ ...s, healthy: health[s.key] ?? false })));
      },
      error: () => this.healthLoading.set(false),
    });

    this.api.getAuditLogs(0, 6).subscribe({ next: (r) => this.auditItems.set(r.content || []), error: () => {} });
    this.api.getPendingModeration(0, 4).subscribe({ next: (r) => this.moderationPreview.set(r.content || []), error: () => {} });
    this.api.getFraudAlerts(false, 0, 4).subscribe({ next: (r) => this.fraudPreview.set(r.content || []), error: () => {} });
  }

  severityClass(score?: number): string {
    const n = Number(score || 0);
    if (n >= 0.7) return 'border border-red-200 bg-red-50 text-red-700';
    if (n >= 0.4) return 'border border-amber-200 bg-amber-50 text-amber-700';
    return 'border border-slate-200 bg-white text-slate-600';
  }

  private fmt(n: number): string {
    return n.toLocaleString();
  }

  private fmtAmount(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n > 0) return n.toLocaleString() + ' ' + this.i18n.t('admin.currency_uzs');
    return '0';
  }
}
