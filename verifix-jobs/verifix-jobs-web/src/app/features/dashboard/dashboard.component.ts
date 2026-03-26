import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardData, Application } from '../../core/models';

@Component({
  selector: 'vjw-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6" role="main" aria-label="Dashboard">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <a routerLink="/employer/vacancies/new" aria-label="Yangi vakansiya yaratish"
           class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Yangi vakansiya
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl" aria-hidden="true">{{ kpi.icon }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full"
                    [class]="kpi.trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
              </span>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ kpi.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ kpi.label }}</div>
          </div>
        }
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Arizalar dinamikasi</h3>
          <div class="h-48 flex items-end gap-1">
            @for (bar of chartBars(); track $index) {
              <div class="flex-1 bg-gray-200 rounded-t-sm relative group cursor-pointer hover:bg-gray-300 transition"
                   [style.height.%]="bar.percent">
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100">
                  {{ bar.count }}
                </div>
              </div>
            }
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-400">
            <span>30 kun oldin</span><span>Bugun</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Ariza manbalari</h3>
          <div class="space-y-3">
            @for (src of sources(); track src.source) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">{{ src.source }}</span>
                  <span class="font-medium">{{ src.count }}</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                       [style.width.%]="src.percent"
                       [class]="src.color"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Applications -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">So'nggi arizalar</h3>
          <a routerLink="/employer/pipeline" aria-label="Barcha arizalar" class="text-sm text-black hover:underline">Barchasini ko'rish</a>
        </div>
        <div class="divide-y divide-gray-50">
          @for (app of recentApps(); track app.id) {
            <div class="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-black font-medium text-sm">
                  {{ app.candidateName?.charAt(0) || '?' }}
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800">{{ app.candidateName || 'Nomalum' }}</div>
                  <div class="text-xs text-gray-400">{{ app.vacancyTitle }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [class]="getStatusClass(app.status)">{{ getStatusLabel(app.status) }}</span>
                <span class="text-xs text-gray-400">{{ app.appliedAt | date:'dd.MM' }}</span>
              </div>
            </div>
          } @empty {
            <div class="p-8 text-center text-gray-400 text-sm">Hali arizalar yo'q</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  kpis = signal<{ icon: string; value: string | number; label: string; trend: number }[]>([
    { icon: '📋', value: 0, label: 'Faol vakansiyalar', trend: 0 },
    { icon: '📨', value: 0, label: 'Jami arizalar', trend: 0 },
    { icon: '✅', value: 0, label: 'Bu oyda yollangan', trend: 0 },
    { icon: '⏱', value: '0 kun', label: "O'rtacha yollash vaqti", trend: 0 },
  ]);
  chartBars = signal<{ count: number; percent: number }[]>([]);
  sources = signal<{ source: string; count: number; percent: number; color: string }[]>([]);
  recentApps = signal<Application[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: (data: any) => {
        this.kpis.set([
          { icon: '📋', value: data.activeVacancies || 0, label: 'Faol vakansiyalar', trend: 0 },
          { icon: '📨', value: data.totalApplications || 0, label: 'Jami arizalar', trend: 0 },
          { icon: '✅', value: data.hiredCount || 0, label: 'Ishga olingan', trend: 0 },
          { icon: '📝', value: data.newApplications || 0, label: 'Yangi arizalar', trend: 0 },
        ]);
      },
      error: () => {}
    });

    // Load funnel data
    this.api.getFunnel().subscribe({
      next: (data: any) => {
        if (data?.statusCounts) {
          const entries: [string, number][] = Object.entries(data.statusCounts).map(([k, v]: any) => [k, v as number]);
          const total: number = entries.reduce((s: number, [, v]: [string, number]) => s + v, 0) || 1;
          const colors = ['bg-blue-400', 'bg-gray-400', 'bg-yellow-400', 'bg-purple-400', 'bg-indigo-400', 'bg-orange-400', 'bg-green-400', 'bg-red-400'];
          this.sources.set(entries.map(([source, count]: [string, number], i: number) => ({
            source: this.getStatusLabel(source), count,
            percent: (count / total) * 100, color: colors[i % colors.length]
          })));
        }
      },
      error: () => {}
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'NEW': 'bg-blue-50 text-blue-600', 'VIEWED': 'bg-gray-50 text-gray-600',
      'SHORTLIST': 'bg-yellow-50 text-yellow-600', 'INVITED': 'bg-purple-50 text-purple-600',
      'INTERVIEW': 'bg-indigo-50 text-indigo-600', 'OFFER': 'bg-orange-50 text-orange-600',
      'HIRED': 'bg-green-50 text-green-600', 'REJECTED': 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'NEW': 'Yangi', 'VIEWED': "Ko'rildi", 'SHORTLIST': 'Tanlandi', 'INVITED': 'Taklif',
      'INTERVIEW': 'Suhbat', 'OFFER': 'Taklif', 'HIRED': 'Yollandi', 'REJECTED': 'Rad',
    };
    return map[status] || status;
  }
}
