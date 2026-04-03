import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-white">{{ i18n.t('admin.dashboard') }}</h1>

    <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      @for (kpi of kpis(); track kpi.label) {
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div class="text-3xl font-bold text-white">{{ kpi.value }}</div>
          <div class="text-sm text-gray-400 mt-1">{{ kpi.label }}</div>
          @if (kpi.sub) { <div class="text-xs text-gray-500 mt-0.5">{{ kpi.sub }}</div> }
        </div>
      }
    </div>

    <h2 class="mb-4 text-lg font-semibold text-white">{{ i18n.t('admin.quick_actions') }}</h2>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <a routerLink="/admin/employers" class="group rounded-xl border border-gray-700 bg-gray-800 p-5 transition hover:border-gray-500">
        <div class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-semibold text-blue-300">CO</div>
        <div class="text-sm font-semibold text-white">{{ i18n.t('admin.companies') }}</div>
        <div class="mt-1 text-xs text-gray-400">{{ i18n.t('admin.approve_manage') }}</div>
      </a>
      <a routerLink="/admin/moderation" class="group rounded-xl border border-gray-700 bg-gray-800 p-5 transition hover:border-gray-500">
        <div class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-xs font-semibold text-amber-300">MOD</div>
        <div class="text-sm font-semibold text-white">{{ i18n.t('admin.moderation') }}</div>
        <div class="mt-1 text-xs text-gray-400">{{ pendingCount() }} {{ i18n.t('admin.awaiting') }}</div>
      </a>
      <a routerLink="/admin/fraud" class="group rounded-xl border border-gray-700 bg-gray-800 p-5 transition hover:border-gray-500">
        <div class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-xs font-semibold text-red-300">FRD</div>
        <div class="text-sm font-semibold text-white">{{ i18n.t('admin.fraud') }}</div>
        <div class="mt-1 text-xs text-gray-400">{{ i18n.t('admin.suspicious_activity') }}</div>
      </a>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  kpis = signal<{value: number | string; label: string; sub?: string}[]>([]);
  pendingCount = signal(0);

  constructor(private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getOverview().subscribe({
      next: (overview: any) => {
        this.kpis.set([
          { value: overview.totalEmployers || 0, label: this.i18n.t('admin.companies'), sub: `+${overview.newVacanciesLast7Days || 0}` },
          { value: overview.totalCandidates || 0, label: this.i18n.t('candidates.title'), sub: `+${overview.newCandidatesLast7Days || 0}` },
          { value: overview.totalVacancies || 0, label: this.i18n.t('vacancy.list.title'), sub: `${overview.activeVacancies || 0}` },
          { value: overview.totalApplications || 0, label: this.i18n.t('dashboard.total_applications'), sub: `${overview.totalHired || 0}` },
        ]);
      },
      error: () => {}
    });

    this.api.getPendingModeration(0, 1).subscribe({
      next: (response: any) => this.pendingCount.set(response.totalElements || 0),
      error: () => {}
    });
  }
}
