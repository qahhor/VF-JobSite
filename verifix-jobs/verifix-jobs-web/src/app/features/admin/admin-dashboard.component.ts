import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../core/services/admin-api.service';

@Component({
  selector: 'vjw-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      @for (kpi of kpis(); track kpi.label) {
        <div class="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div class="text-3xl font-bold text-white">{{ kpi.value }}</div>
          <div class="text-sm text-gray-400 mt-1">{{ kpi.label }}</div>
          @if (kpi.sub) { <div class="text-xs text-gray-500 mt-0.5">{{ kpi.sub }}</div> }
        </div>
      }
    </div>

    <!-- Quick actions -->
    <h2 class="text-lg font-semibold mb-4">Tezkor amallar</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <a routerLink="/admin/employers" class="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition group">
        <div class="text-2xl mb-2">🏢</div>
        <div class="text-sm font-semibold group-hover:text-white">Kompaniyalar</div>
        <div class="text-xs text-gray-500 mt-1">Tasdiqlash va boshqarish</div>
      </a>
      <a routerLink="/admin/moderation" class="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition group">
        <div class="text-2xl mb-2">🔍</div>
        <div class="text-sm font-semibold group-hover:text-white">Moderatsiya</div>
        <div class="text-xs text-gray-500 mt-1">{{ pendingCount() }} ta kutilmoqda</div>
      </a>
      <a routerLink="/admin/fraud" class="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition group">
        <div class="text-2xl mb-2">🚨</div>
        <div class="text-sm font-semibold group-hover:text-white">Frod nazorati</div>
        <div class="text-xs text-gray-500 mt-1">Shubhali faoliyatlar</div>
      </a>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  kpis = signal<{value: number|string; label: string; sub?: string}[]>([]);
  pendingCount = signal(0);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getOverview().subscribe({
      next: (d: any) => {
        this.kpis.set([
          { value: d.totalEmployers || 0, label: 'Kompaniyalar', sub: `+${d.newVacanciesLast7Days || 0} hafta` },
          { value: d.totalCandidates || 0, label: 'Nomzodlar', sub: `+${d.newCandidatesLast7Days || 0} hafta` },
          { value: d.totalVacancies || 0, label: 'Vakansiyalar', sub: `${d.activeVacancies || 0} faol` },
          { value: d.totalApplications || 0, label: 'Arizalar', sub: `${d.totalHired || 0} ishga olingan` },
        ]);
      },
      error: () => {}
    });

    this.api.getPendingModeration(0, 1).subscribe({
      next: (r: any) => this.pendingCount.set(r.totalElements || 0),
      error: () => {}
    });
  }
}
