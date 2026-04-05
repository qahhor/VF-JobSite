import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService, AdminAuditItem, AdminFraudAlert, AdminModerationItem, AdminOverview } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, Shield, AlertTriangle, Users, Building2, Briefcase, FileText, CheckCircle, BarChart3, Settings, TrendingUp, TrendingDown, ArrowRight } from 'lucide-angular';

interface Kpi { label: string; value: string; trend: number; icon: any; }
interface HealthService { name: string; key: string; healthy: boolean; }

@Component({
  selector: 'vjw-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-5">
      <!-- ═══ KPI Row — dark cards like employer panel ═══ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        @for (kpi of kpis(); track kpi.label) {
          <div class="rounded-2xl bg-sidebar p-5 text-white">
            <div class="flex items-center justify-between">
              <span class="text-caption font-medium uppercase tracking-wider text-white/50">{{ i18n.t(kpi.label) }}</span>
              @if (kpi.trend !== 0) {
                <span class="flex items-center gap-0.5 text-xs font-semibold"
                      [class]="kpi.trend > 0 ? 'text-emerald-400' : 'text-red-400'">
                  <lucide-icon [img]="kpi.trend > 0 ? TrendingUpIcon : TrendingDownIcon" [size]="14"></lucide-icon>
                  {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
                </span>
              }
            </div>
            <div class="mt-2 text-3xl font-bold text-white">{{ kpi.value }}</div>
          </div>
        }
      </div>

      <!-- ═══ Secondary stats — compact grid ═══ -->
      <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
        @for (card of metricCards(); track card.label) {
          <div class="rounded-2xl border border-border bg-white p-4 shadow-card">
            <div class="text-xl font-bold text-gray-900">{{ card.value }}</div>
            <div class="mt-1 text-[11px] text-muted">{{ card.label }}</div>
            @if (card.sub) {
              <div class="mt-0.5 text-[10px] text-muted">{{ card.sub }}</div>
            }
          </div>
        }
      </div>

      <!-- ═══ Three-column layout: Attention + Health + Quick Actions ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <!-- Moderation preview -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading font-semibold text-gray-900">{{ i18n.t('admin.needs_attention') }}</h2>
            <a routerLink="/admin/moderation" class="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              {{ i18n.t('admin.view_queue') }}
              <lucide-icon [img]="ArrowRightIcon" [size]="12"></lucide-icon>
            </a>
          </div>
          @if (moderationPreview().length) {
            <div class="space-y-2">
              @for (item of moderationPreview(); track item.id) {
                <div class="rounded-xl border border-border/50 bg-surface p-3">
                  <div class="flex items-start justify-between gap-2">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ item.title || item.entityType }}</div>
                    <span class="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {{ i18n.t('status.' + item.status) || item.status }}
                    </span>
                  </div>
                  <div class="mt-1 text-[11px] text-muted truncate">{{ item.subtitle || item.entityId }}</div>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-24 text-sm text-muted">{{ i18n.t('admin.no_pending_queue') }}</div>
          }
        </div>

        <!-- System health -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h2 class="text-heading font-semibold text-gray-900 mb-4">{{ i18n.t('admin.system_health') }}</h2>
          @if (healthLoading()) {
            <div class="flex items-center justify-center h-24 text-sm text-muted">{{ i18n.t('admin.logging_in') }}</div>
          } @else {
            <div class="space-y-2">
              @for (svc of services(); track svc.key) {
                <div class="flex items-center justify-between rounded-xl border border-border/50 bg-surface px-3 py-2.5">
                  <span class="text-sm text-gray-700">{{ i18n.t(svc.name) }}</span>
                  <span class="flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full" [class]="svc.healthy ? 'bg-emerald-400' : 'bg-red-400'"></span>
                    <span class="text-[11px] font-medium" [class]="svc.healthy ? 'text-emerald-600' : 'text-red-500'">
                      {{ svc.healthy ? i18n.t('admin.status_running') : i18n.t('admin.status_down') }}
                    </span>
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick actions -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h2 class="text-heading font-semibold text-gray-900 mb-4">{{ i18n.t('admin.quick_actions') }}</h2>
          <div class="space-y-2">
            <a routerLink="/admin/employers" class="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 hover:border-primary/30 hover:bg-primary/5 transition">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <lucide-icon [img]="Building2Icon" [size]="16" class="text-primary"></lucide-icon>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ i18n.t('admin.companies') }}</div>
                <div class="text-[10px] text-muted">{{ i18n.t('admin.review_companies') }}</div>
              </div>
            </a>
            <a routerLink="/admin/moderation" class="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 hover:border-primary/30 hover:bg-primary/5 transition">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <lucide-icon [img]="ShieldIcon" [size]="16" class="text-warning"></lucide-icon>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ i18n.t('admin.moderation') }}</div>
                <div class="text-[10px] text-muted">{{ overview()?.pendingModeration || 0 }} pending</div>
              </div>
            </a>
            <a routerLink="/admin/analytics" class="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 hover:border-primary/30 hover:bg-primary/5 transition">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <lucide-icon [img]="BarChart3Icon" [size]="16" class="text-accent"></lucide-icon>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ i18n.t('admin.analytics_nav') }}</div>
                <div class="text-[10px] text-muted">{{ i18n.t('admin.analytics.hint') }}</div>
              </div>
            </a>
            <a routerLink="/admin/settings" class="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3 hover:border-primary/30 hover:bg-primary/5 transition">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border">
                <lucide-icon [img]="SettingsIcon" [size]="16" class="text-muted"></lucide-icon>
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ i18n.t('admin.settings_nav') }}</div>
                <div class="text-[10px] text-muted">{{ i18n.t('admin.settings.hint') }}</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- ═══ Two-column: Activity + Fraud ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <!-- Recent activity -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading font-semibold text-gray-900">{{ i18n.t('admin.recent_activity') }}</h2>
            <a routerLink="/admin/audit" class="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              {{ i18n.t('admin.open_section') }}
              <lucide-icon [img]="ArrowRightIcon" [size]="12"></lucide-icon>
            </a>
          </div>
          @if (auditItems().length) {
            <div class="space-y-2">
              @for (item of auditItems(); track item.id) {
                <div class="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                       [class]="actionStyle(item.action)">
                    {{ item.action?.substring(0,2) || '?' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900">{{ item.action }}</div>
                    <div class="text-[10px] text-muted">{{ item.adminEmail || 'admin' }} · {{ item.entityType || 'SYSTEM' }}</div>
                  </div>
                  <div class="text-[10px] text-muted whitespace-nowrap">{{ item.createdAt | date:'dd.MM HH:mm' }}</div>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-24 text-sm text-muted">{{ i18n.t('admin.no_activity') }}</div>
          }
        </div>

        <!-- Fraud alerts -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-heading font-semibold text-gray-900">{{ i18n.t('admin.fraud') }}</h2>
            <a routerLink="/admin/fraud" class="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              {{ i18n.t('admin.open_section') }}
              <lucide-icon [img]="ArrowRightIcon" [size]="12"></lucide-icon>
            </a>
          </div>
          @if (fraudPreview().length) {
            <div class="space-y-2">
              @for (alert of fraudPreview(); track alert.id) {
                <div class="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-3">
                  <lucide-icon [img]="AlertTriangleIcon" [size]="16" class="shrink-0"
                    [class]="(alert.score || 0) >= 0.7 ? 'text-error' : 'text-warning'"></lucide-icon>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900">{{ alert.fraudType }}</div>
                    <div class="text-[10px] text-muted">{{ alert.entityType }} · {{ alert.entityId?.substring(0,8) }}</div>
                  </div>
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" [class]="severityClass(alert.score)">
                    {{ ((alert.score || 0) * 100).toFixed(0) }}%
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-24 text-sm text-muted">{{ i18n.t('admin.no_fraud_alerts') }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  ArrowRightIcon = ArrowRight;
  ShieldIcon = Shield;
  AlertTriangleIcon = AlertTriangle;
  Building2Icon = Building2;
  BarChart3Icon = BarChart3;
  SettingsIcon = Settings;

  overview = signal<AdminOverview | null>(null);
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
    this.api.getOverview().subscribe({
      next: (d) => {
        this.overview.set(d);
        const totalUsers = d.totalUsers ?? (d.totalCandidates + d.totalEmployers);
        this.kpis.set([
          { label: 'admin.kpi.total_users', value: this.fmt(totalUsers), trend: d.usersTrend ?? 0, icon: Users },
          { label: 'admin.kpi.active_vacancies', value: this.fmt(d.activeVacancies), trend: d.vacanciesTrend ?? 0, icon: Briefcase },
          { label: 'admin.kpi.applications_today', value: this.fmt(d.applicationsToday ?? 0), trend: d.applicationsTrend ?? 0, icon: FileText },
          { label: 'admin.kpi.monthly_revenue', value: this.fmtAmount(d.monthlyRevenue ?? 0), trend: d.revenueTrend ?? 0, icon: BarChart3 },
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
      next: (health) => { this.healthLoading.set(false); this.services.update(svcs => svcs.map(s => ({ ...s, healthy: health[s.key] ?? false }))); },
      error: () => this.healthLoading.set(false),
    });

    this.api.getAuditLogs(0, 5).subscribe({ next: (r) => this.auditItems.set(r.content || []), error: () => {} });
    this.api.getPendingModeration(0, 3).subscribe({ next: (r) => this.moderationPreview.set(r.content || []), error: () => {} });
    this.api.getFraudAlerts(false, 0, 3).subscribe({ next: (r) => this.fraudPreview.set(r.content || []), error: () => {} });
  }

  actionStyle(action: string): string {
    if (action?.includes('CREATE')) return 'bg-accent/10 text-accent';
    if (action?.includes('DELETE')) return 'bg-error/10 text-error';
    if (action?.includes('STATUS')) return 'bg-warning/10 text-warning';
    return 'bg-primary/10 text-primary';
  }

  severityClass(score?: number): string {
    const n = Number(score || 0);
    if (n >= 0.7) return 'border border-red-200 bg-red-50 text-red-700';
    if (n >= 0.4) return 'border border-amber-200 bg-amber-50 text-amber-700';
    return 'border border-border bg-white text-gray-600';
  }

  private fmt(n: number): string { return n.toLocaleString(); }

  private fmtAmount(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n > 0) return n.toLocaleString() + ' UZS';
    return '0';
  }
}
