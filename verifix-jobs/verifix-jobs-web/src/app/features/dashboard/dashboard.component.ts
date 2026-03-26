import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'vjw-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="text-3xl mb-1">{{ kpi.icon }}</div>
            <div class="text-2xl font-bold text-gray-900">{{ kpi.value }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ kpi.label }}</div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Vacancy Health -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">📊 Vakansiya salomatligi</h3>
          @if (healthItems().length) {
            <div class="space-y-3">
              @for (h of healthItems(); track h.vacancyId) {
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                       [class]="h.healthGrade === 'A' ? 'bg-green-50 text-green-600' :
                                h.healthGrade === 'B' ? 'bg-blue-50 text-blue-600' :
                                h.healthGrade === 'C' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'">
                    {{ h.healthGrade }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ h.title }}</div>
                    <div class="text-xs text-gray-400">{{ h.applies }} ariza · {{ h.healthScore }}/100 ball</div>
                  </div>
                  @if (h.recommendations?.length) {
                    <div class="text-xs text-orange-500 max-w-[150px] truncate" title="{{ h.recommendations[0] }}">💡 {{ h.recommendations[0] }}</div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Hozircha vakansiyalar yo'q</div>
          }
        </div>

        <!-- Salary Intelligence -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">💰 Bozor maoshlari</h3>
          @if (salaryData().length) {
            <div class="space-y-3">
              @for (s of salaryData(); track s.category) {
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-700">{{ s.category }}</div>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-gray-400">{{ fmt(s.p25) }}</span>
                    <span class="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{{ fmt(s.median) }}</span>
                    <span class="text-gray-400">{{ fmt(s.p75) }}</span>
                    <span class="text-gray-300">UZS</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Ma'lumot yuklanmoqda...</div>
          }
        </div>

        <!-- ROI / Value Report -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">📈 Qiymat hisoboti</h3>
          @if (valueReport(); as vr) {
            <div class="grid grid-cols-2 gap-4">
              <div><div class="text-2xl font-bold text-gray-900">{{ vr.totalHires }}</div><div class="text-xs text-gray-400">Jami yollangan</div></div>
              <div><div class="text-2xl font-bold text-gray-900">{{ vr.totalApplications }}</div><div class="text-xs text-gray-400">Jami arizalar</div></div>
              <div><div class="text-2xl font-bold text-green-600">{{ vr.estimatedTimeSavedHours | number:'1.0-0' }} soat</div><div class="text-xs text-gray-400">Tejangan vaqt</div></div>
              <div>
                <div class="text-sm font-semibold px-2 py-1 rounded-full inline-block"
                     [class]="vr.maturityLevel === 'ADVANCED' ? 'bg-green-50 text-green-600' :
                              vr.maturityLevel === 'GROWING' ? 'bg-blue-50 text-blue-600' :
                              vr.maturityLevel === 'GETTING_STARTED' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-500'">
                  {{ maturityLabel(vr.maturityLevel) }}
                </div>
                <div class="text-xs text-gray-400 mt-1">Daraja</div>
              </div>
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Yuklanmoqda...</div>
          }
        </div>

        <!-- Activity Feed -->
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">🔔 Faoliyat lentasi</h3>
          @if (activities().length) {
            <div class="space-y-3">
              @for (a of activities(); track a.id) {
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                       [class]="a.eventType === 'APPLICATION_NEW' ? 'bg-blue-50 text-blue-500' :
                                a.eventType === 'APPLICATION_HIRED' ? 'bg-green-50 text-green-500' :
                                a.eventType === 'VACANCY_APPROVED' ? 'bg-purple-50 text-purple-500' : 'bg-gray-50 text-gray-400'">
                    {{ eventIcon(a.eventType) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-gray-700">{{ a.title }}</div>
                    <div class="text-xs text-gray-400">{{ a.description }}</div>
                  </div>
                  <div class="text-xs text-gray-300 whitespace-nowrap">{{ a.createdAt | date:'HH:mm' }}</div>
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Hozircha faoliyat yo'q</div>
          }
        </div>

      </div>

      <!-- Funnel -->
      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">🔄 Yollash voronkasi</h3>
        @if (funnelData().length) {
          <div class="flex items-end gap-2 h-32">
            @for (f of funnelData(); track f.label) {
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="text-xs font-bold text-gray-700">{{ f.count }}</div>
                <div class="w-full rounded-t" [style.height.%]="f.percent" [class]="f.color"></div>
                <div class="text-[10px] text-gray-400 text-center">{{ f.label }}</div>
              </div>
            }
          </div>
        } @else {
          <div class="text-sm text-gray-400 py-4">Ma'lumot yo'q</div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  kpis = signal<{icon: string; value: string | number; label: string}[]>([]);
  healthItems = signal<any[]>([]);
  salaryData = signal<any[]>([]);
  valueReport = signal<any>(null);
  activities = signal<any[]>([]);
  funnelData = signal<{label: string; count: number; percent: number; color: string}[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() {
    // KPIs
    this.api.getDashboard().subscribe({
      next: (d: any) => {
        this.kpis.set([
          { icon: '📋', value: d.activeVacancies || 0, label: 'Faol vakansiyalar' },
          { icon: '📨', value: d.totalApplications || 0, label: 'Jami arizalar' },
          { icon: '✅', value: d.hiredCount || 0, label: 'Ishga olingan' },
          { icon: '🆕', value: d.newApplications || 0, label: 'Yangi arizalar' },
        ]);
      }, error: () => {}
    });

    // Vacancy Health
    this.api.getAllVacancyHealth().subscribe({
      next: (items: any[]) => this.healthItems.set((items || []).slice(0, 5)),
      error: () => {}
    });

    // Salary Intelligence — top categories
    const cats = ['COOK', 'DRIVER', 'SALES', 'BUILDER', 'SECURITY'];
    cats.forEach(cat => {
      this.api.getSalaryPredict(cat).subscribe({
        next: (s: any) => {
          if (s && s.sampleSize > 0) {
            this.salaryData.update(list => [...list, { category: cat, p25: s.p25, median: s.median, p75: s.p75 }]);
          }
        }, error: () => {}
      });
    });

    // Value Report
    this.api.getValueReport().subscribe({
      next: (vr: any) => this.valueReport.set(vr),
      error: () => {}
    });

    // Activity Feed
    this.api.getActivityFeed(0, 8).subscribe({
      next: (items: any[]) => this.activities.set(items || []),
      error: () => {}
    });

    // Funnel
    this.api.getFunnel().subscribe({
      next: (data: any) => {
        if (data?.statusCounts) {
          const order = ['NEW', 'VIEWED', 'SHORTLIST', 'INVITED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
          const colors = ['bg-blue-400', 'bg-gray-400', 'bg-yellow-400', 'bg-purple-400', 'bg-indigo-400', 'bg-orange-400', 'bg-green-500', 'bg-red-400'];
          const labels: Record<string,string> = { NEW:'Yangi', VIEWED:"Ko'rildi", SHORTLIST:'Tanlandi', INVITED:'Taklif', INTERVIEW:'Suhbat', OFFER:'Taklif', HIRED:'Yollandi', REJECTED:'Rad' };
          const entries = order.map((s, i) => ({
            label: labels[s] || s, count: (data.statusCounts[s] || 0) as number, color: colors[i]
          }));
          const max = Math.max(...entries.map(e => e.count), 1);
          this.funnelData.set(entries.map(e => ({ ...e, percent: (e.count / max) * 100 })));
        }
      }, error: () => {}
    });
  }

  fmt(n: number): string { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n; }

  maturityLabel(level: string): string {
    return ({ ADVANCED: 'Ilg\'or', GROWING: 'O\'sish', GETTING_STARTED: 'Boshlang\'ich', NEW: 'Yangi' } as Record<string,string>)[level] || level;
  }

  eventIcon(type: string): string {
    return ({ APPLICATION_NEW: '📨', APPLICATION_HIRED: '✅', APPLICATION_REJECTED: '❌', VACANCY_APPROVED: '📋', VACANCY_EXPIRED: '⏰', REFERRAL_HIRED: '🔗' } as Record<string,string>)[type] || '📌';
  }
}
