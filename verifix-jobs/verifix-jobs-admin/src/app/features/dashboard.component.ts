import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div role="main" class="space-y-6">
      <h1 class="text-xl font-bold text-gray-800">Dashboard</h1>

      <!-- KPI cards -->
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
            <div class="text-xs text-gray-500 mt-1">{{ kpi.label }}</div>
          </div>
        }
      </div>

      <!-- System health + Quick links -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Tizim holati</h3>
          <div role="main" class="space-y-3">
            @for (s of services; track s.name) {
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ s.name }}</span>
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full" [class]="s.healthy ? 'bg-green-400' : 'bg-red-400'"></span>
                  <span class="text-xs" [class]="s.healthy ? 'text-green-600' : 'text-red-600'">{{ s.healthy ? 'Ishlayapti' : 'Xato' }}</span>
                </span>
              </div>
            }
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Tezkor havolalar</h3>
          <div class="grid grid-cols-2 gap-3">
            @for (link of quickLinks; track link.path) {
              <a [routerLink]="link.path" class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-black transition text-sm">
                <span>{{ link.icon }}</span>{{ link.label }}
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-5 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">So'nggi faoliyat</h3>
        </div>
        <div class="divide-y divide-gray-50">
          @for (a of activity(); track $index) {
            <div class="px-5 py-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm" [class]="a.color">{{ a.icon }}</div>
              <div class="flex-1">
                <div class="text-sm text-gray-700">{{ a.text }}</div>
                <div class="text-xs text-gray-400">{{ a.time }}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  kpis = signal([
    { icon: '👥', value: '0', label: 'Jami foydalanuvchilar', trend: 0 },
    { icon: '📋', value: '0', label: 'Faol vakansiyalar', trend: 0 },
    { icon: '📨', value: '0', label: 'Bugungi arizalar', trend: 0 },
    { icon: '💰', value: '0', label: 'Oylik daromad', trend: 0 },
  ]);

  activity = signal<{ icon: string; text: string; time: string; color: string }[]>([]);

  services = [
    { name: 'PostgreSQL', healthy: true }, { name: 'Redis', healthy: true },
    { name: 'Elasticsearch', healthy: true }, { name: 'Kafka', healthy: true },
    { name: 'ML Service', healthy: true }, { name: 'MinIO', healthy: true },
  ];

  quickLinks = [
    { path: '/moderation', icon: '🛡️', label: 'Moderatsiya' },
    { path: '/fraud', icon: '🚨', label: 'Fraud alertlar' },
    { path: '/users', icon: '👥', label: 'Foydalanuvchilar' },
    { path: '/ab-testing', icon: '🔬', label: 'A/B Testlar' },
  ];

  constructor(private api: AdminApiService) {}

  ngOnInit() {
    this.api.getAnalytics().subscribe({
      next: (data: any) => {
        this.kpis.set([
          { icon: '👥', value: data.totalUsers?.toString() || '0', label: 'Jami foydalanuvchilar', trend: 12 },
          { icon: '📋', value: data.activeVacancies?.toString() || '0', label: 'Faol vakansiyalar', trend: 5 },
          { icon: '📨', value: data.applicationsToday?.toString() || '0', label: 'Bugungi arizalar', trend: -3 },
          { icon: '💰', value: this.formatAmount(data.monthlyRevenue || 0), label: 'Oylik daromad (UZS)', trend: 8 },
        ]);
      }
    });
  }

  formatAmount(n: number): string {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    return n.toLocaleString();
  }
}
