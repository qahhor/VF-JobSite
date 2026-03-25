import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div role="main" class="space-y-6">
      <h1 class="text-xl font-bold text-gray-800">Platforma analitikasi</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (m of metrics(); track m.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="text-xs text-gray-500 mb-1">{{ m.label }}</div>
            <div class="text-2xl font-bold text-gray-800">{{ m.value }}</div>
          </div>
        }
      </div>

      <!-- Growth chart placeholder -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Foydalanuvchi o'sishi</h3>
          <div class="h-48 flex items-end gap-1">
            @for (bar of growthBars(); track $index) {
              <div class="flex-1 bg-black/60 rounded-t-sm hover:bg-black transition" [style.height.%]="bar"></div>
            }
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-400"><span>12 oy oldin</span><span>Bugun</span></div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Top shaharlar</h3>
          <div role="main" class="space-y-3">
            @for (city of topCities(); track city.name) {
              <div>
                <div class="flex justify-between text-sm mb-1"><span class="text-gray-600">{{ city.name }}</span><span class="font-medium">{{ city.count }}</span></div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-black rounded-full" [style.width.%]="city.percent"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminAnalyticsComponent implements OnInit {
  metrics = signal<{ label: string; value: string }[]>([]);
  growthBars = signal<number[]>([20, 25, 30, 35, 28, 40, 45, 50, 55, 60, 70, 80]);
  topCities = signal<{ name: string; count: number; percent: number }[]>([
    { name: 'Tashkent', count: 1250, percent: 100 }, { name: 'Samarkand', count: 450, percent: 36 },
    { name: 'Bukhara', count: 320, percent: 25.6 }, { name: 'Andijan', count: 280, percent: 22.4 },
    { name: 'Fergana', count: 210, percent: 16.8 },
  ]);

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getAnalytics().subscribe({
      next: (d: any) => {
        this.metrics.set([
          { label: 'Jami nomzodlar', value: d.totalCandidates?.toLocaleString() || '0' },
          { label: 'Jami ish beruvchilar', value: d.totalEmployers?.toLocaleString() || '0' },
          { label: 'Jami vakansiyalar', value: d.totalVacancies?.toLocaleString() || '0' },
          { label: 'Oylik daromad', value: (d.monthlyRevenue || 0).toLocaleString() + ' UZS' },
        ]);
      }
    });
  }
}
