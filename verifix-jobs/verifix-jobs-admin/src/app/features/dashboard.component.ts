import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'vja-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div role="main" class="space-y-6">
      <h1 class="text-xl font-bold text-gray-800">{{ i18n.t('admin.dashboard') }}</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg">{{ kpi.icon }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" [class]="kpi.trend > 0 ? 'bg-green-50 text-green-600' : kpi.trend < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'">
                {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
              </span>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ kpi.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ i18n.t(kpi.label) }}</div>
          </div>
        }
      </div>

      <!-- Secondary stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        @for (stat of secondaryStats(); track stat.label) {
          <div class="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
            <div class="text-lg font-bold text-gray-800">{{ stat.value }}</div>
            <div class="text-xs text-gray-400 mt-0.5">{{ i18n.t(stat.label) }}</div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">{{ i18n.t('admin.system_status') }}</h3>
          @if (healthLoading) {
            <div class="text-sm text-gray-400 py-4 text-center">{{ i18n.t('admin.logging_in') }}</div>
          } @else {
            <div role="main" class="space-y-3">
              @for (s of services(); track s.name) {
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">{{ s.name }}</span>
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" [class]="s.healthy ? 'bg-green-400' : 'bg-red-400'"></span>
                    <span class="text-xs" [class]="s.healthy ? 'text-green-600' : 'text-red-600'">{{ s.healthy ? i18n.t('admin.running') : i18n.t('admin.error') }}</span>
                  </span>
                </div>
              }
            </div>
          }
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">{{ i18n.t('admin.quick_links') }}</h3>
          <div class="grid grid-cols-2 gap-3">
            @for (link of quickLinks; track link.path) {
              <a [routerLink]="link.path" class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-black transition text-sm">
                <span>{{ link.icon }}</span>{{ i18n.t(link.label) }}
              </a>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  kpis = signal([
    { icon: '\u{1F465}', value: '0', label: 'admin.total_users', trend: 0 },
    { icon: '\u{1F4CB}', value: '0', label: 'admin.active_vacancies', trend: 0 },
    { icon: '\u{1F4E8}', value: '0', label: 'admin.applications_today', trend: 0 },
    { icon: '\u{1F4B0}', value: '0', label: 'admin.monthly_revenue', trend: 0 },
  ]);

  secondaryStats = signal<{ label: string; value: string }[]>([]);

  services = signal([
    { name: 'PostgreSQL', healthy: false }, { name: 'Redis', healthy: false },
    { name: 'Elasticsearch', healthy: false }, { name: 'Kafka', healthy: false },
    { name: 'ML Service', healthy: false }, { name: 'MinIO', healthy: false },
  ]);

  healthLoading = true;

  quickLinks = [
    { path: '/moderation', icon: '\u{1F6E1}\uFE0F', label: 'quick.moderation' },
    { path: '/fraud', icon: '\u{1F6A8}', label: 'quick.fraud' },
    { path: '/users', icon: '\u{1F465}', label: 'quick.users' },
    { path: '/ab-testing', icon: '\u{1F52C}', label: 'quick.ab' },
  ];

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getAnalytics().subscribe({
      next: (d: any) => {
        this.kpis.set([
          { icon: '\u{1F465}', value: this.fmt(d.totalUsers ?? (d.totalCandidates + d.totalEmployers)), label: 'admin.total_users', trend: d.usersTrend ?? 0 },
          { icon: '\u{1F4CB}', value: this.fmt(d.activeVacancies ?? 0), label: 'admin.active_vacancies', trend: d.vacanciesTrend ?? 0 },
          { icon: '\u{1F4E8}', value: this.fmt(d.applicationsToday ?? 0), label: 'admin.applications_today', trend: d.applicationsTrend ?? 0 },
          { icon: '\u{1F4B0}', value: this.fmtAmount(d.monthlyRevenue ?? 0), label: 'admin.monthly_revenue', trend: d.revenueTrend ?? 0 },
        ]);

        this.secondaryStats.set([
          { label: 'dash.total_vacancies', value: this.fmt(d.totalVacancies ?? 0) },
          { label: 'dash.total_hired', value: this.fmt(d.totalHired ?? 0) },
          { label: 'dash.pending_moderation', value: this.fmt(d.pendingModeration ?? 0) },
          { label: 'dash.fraud_alerts', value: this.fmt(d.openFraudAlerts ?? 0) },
          { label: 'dash.new_7d', value: `+${this.fmt(d.newCandidatesLast7Days ?? 0)}` },
        ]);
      },
      error: () => {}
    });

    this.api.getHealthStatus().subscribe({
      next: (health: any) => {
        this.healthLoading = false;
        const statusMap: Record<string, string> = {
          'PostgreSQL': 'postgres', 'Redis': 'redis', 'Elasticsearch': 'elasticsearch',
          'Kafka': 'kafka', 'ML Service': 'ml', 'MinIO': 'minio',
        };
        this.services.set(this.services().map(s => ({
          ...s,
          healthy: health[statusMap[s.name]] ?? false
        })));
      },
      error: () => { this.healthLoading = false; }
    });
  }

  private fmt(n: number): string {
    return n.toLocaleString();
  }

  private fmtAmount(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    return n.toLocaleString() + ' UZS';
  }
}
