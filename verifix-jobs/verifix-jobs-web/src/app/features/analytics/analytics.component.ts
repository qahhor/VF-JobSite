import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DashboardData } from '../../core/models';

@Component({
  selector: 'vjw-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Analitika</h1>
        <button (click)="exportCsv()" aria-label="CSV yuklash" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">CSV yuklab olish</button>
      </div>

      <!-- Funnel -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Ariza voronkasi</h3>
        <div class="space-y-3">
          @for (stage of funnel(); track stage.label) {
            <div class="flex items-center gap-4">
              <span class="w-28 text-sm text-gray-500 text-right">{{ stage.label }}</span>
              <div class="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                <div class="h-full rounded-lg transition-all duration-700"
                     [style.width.%]="stage.percent" [class]="stage.color"></div>
                <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                  {{ stage.count }} ({{ stage.percent.toFixed(1) }}%)
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Applications over time -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Kunlik arizalar</h3>
          <div class="h-48 flex items-end gap-0.5">
            @for (bar of dailyBars(); track $index) {
              <div class="flex-1 rounded-t-sm transition-all hover:opacity-80 cursor-pointer relative group"
                   [style.height.%]="bar.percent" [class]="'bg-primary'">
                <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  {{ bar.date }}: {{ bar.count }}
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sources breakdown -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Manba taqsimoti</h3>
          <div class="space-y-4">
            @for (src of sources(); track src.source) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">{{ getSourceLabel(src.source) }}</span>
                  <span class="font-semibold">{{ src.count }} <span class="text-gray-400 font-normal">({{ src.percent.toFixed(1) }}%)</span></span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" [style.width.%]="src.percent" [class]="src.color"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Time-to-hire -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Yollash vaqti metrikasi</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-black">{{ avgTimeToHire() }}</div>
            <div class="text-sm text-gray-500 mt-1">O'rtacha kun</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-secondary">{{ data()?.hiredThisMonth || 0 }}</div>
            <div class="text-sm text-gray-500 mt-1">Bu oy yollangan</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-accent">{{ data()?.totalApplications || 0 }}</div>
            <div class="text-sm text-gray-500 mt-1">Jami arizalar</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnalyticsComponent implements OnInit {
  data = signal<DashboardData | null>(null);
  funnel = signal<{ label: string; count: number; percent: number; color: string }[]>([]);
  dailyBars = signal<{ date: string; count: number; percent: number }[]>([]);
  sources = signal<{ source: string; count: number; percent: number; color: string }[]>([]);
  avgTimeToHire = signal(0);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe(d => {
      this.data.set(d);
      this.avgTimeToHire.set(d.avgTimeToHire);
      const total = d.totalApplications || 1;
      this.funnel.set([
        { label: 'Arizalar', count: total, percent: 100, color: 'bg-blue-400' },
        { label: "Ko'rilgan", count: Math.round(total * 0.7), percent: 70, color: 'bg-indigo-400' },
        { label: 'Suhbat', count: Math.round(total * 0.3), percent: 30, color: 'bg-purple-400' },
        { label: 'Taklif', count: Math.round(total * 0.15), percent: 15, color: 'bg-orange-400' },
        { label: 'Yollangan', count: d.hiredThisMonth, percent: (d.hiredThisMonth / total) * 100, color: 'bg-green-400' },
      ]);
      const maxDay = Math.max(...d.applicationsByDay.map(x => x.count), 1);
      this.dailyBars.set(d.applicationsByDay.map(x => ({ date: x.date, count: x.count, percent: (x.count / maxDay) * 100 })));
      const totalSrc = d.applicationsBySource.reduce((s, x) => s + x.count, 0) || 1;
      const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-purple-400', 'bg-pink-400'];
      this.sources.set(d.applicationsBySource.map((s, i) => ({ ...s, percent: (s.count / totalSrc) * 100, color: colors[i % colors.length] })));
    });
  }

  getSourceLabel(s: string): string {
    const m: Record<string, string> = { 'TELEGRAM': 'Telegram', 'WEB': 'Veb-sayt', 'SMS': 'SMS', 'REFERRAL': 'Referal', 'EMPLOYER': 'Ish beruvchi' };
    return m[s] || s;
  }

  exportCsv() {
    const d = this.data();
    if (!d) return;
    let csv = 'Metric,Value\n';
    csv += `Active Vacancies,${d.activeVacancies}\nTotal Applications,${d.totalApplications}\nHired This Month,${d.hiredThisMonth}\nAvg Time to Hire,${d.avgTimeToHire}\n`;
    csv += '\nDate,Applications\n';
    d.applicationsByDay.forEach(r => csv += `${r.date},${r.count}\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'analytics.csv';
    a.click();
  }
}
