import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">{{ i18n.t('admin.analytics.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ i18n.t('admin.analytics.hint') }}</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="rounded-[20px] border border-slate-200 bg-white p-4">
              <div class="h-7 w-20 animate-pulse rounded-lg bg-slate-200"></div>
              <div class="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100"></div>
            </div>
          }
        </div>
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div class="rounded-[28px] border border-slate-200 bg-white p-5">
            <div class="h-4 w-32 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-4 flex h-40 items-end gap-1.5">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="flex-1 animate-pulse rounded-t-lg bg-slate-100" [style.height.%]="20 + i * 10"></div>
              }
            </div>
          </div>
          <div class="rounded-[28px] border border-slate-200 bg-white p-5">
            <div class="h-4 w-32 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-4 space-y-4">
              @for (i of [1,2,3]; track i) {
                <div>
                  <div class="mb-1 h-3 w-20 animate-pulse rounded bg-slate-100"></div>
                  <div class="h-2 w-full animate-pulse rounded-full bg-slate-100"></div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <!-- Metric cards -->
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          @for (m of metrics(); track m.label) {
            <div class="rounded-[20px] border border-slate-200 bg-white p-4">
              <div class="text-2xl font-bold text-slate-900">{{ m.value }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ i18n.t(m.label) }}</div>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <!-- Growth chart -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-5">
            <h3 class="mb-4 text-sm font-semibold">{{ i18n.t('admin.analytics.user_growth') }}</h3>
            @if (growthBars().length === 0) {
              <div class="flex h-40 items-center justify-center text-sm text-slate-400">
                {{ i18n.t('admin.no_activity') }}
              </div>
            } @else {
              <div class="flex h-40 items-end gap-2">
                @for (bar of growthBars(); track $index) {
                  <div class="group flex flex-1 flex-col items-center gap-1">
                    <span class="text-[10px] font-medium text-slate-500 opacity-0 transition group-hover:opacity-100">
                      {{ growthValues()[$index] }}
                    </span>
                    <div
                      class="w-full rounded-t-lg bg-slate-900 transition-all hover:bg-slate-700"
                      [style.height.%]="bar || 2">
                    </div>
                    <span class="text-[10px] text-slate-400">{{ monthLabels()[$index] }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Top cities -->
          <div class="rounded-[28px] border border-slate-200 bg-white p-5">
            <h3 class="mb-4 text-sm font-semibold">{{ i18n.t('admin.analytics.top_cities') }}</h3>
            @if (topCities().length === 0) {
              <div class="flex h-40 items-center justify-center">
                <div class="text-center">
                  <div class="text-2xl text-slate-300">📍</div>
                  <div class="mt-2 text-sm text-slate-400">{{ i18n.t('admin.no_activity') }}</div>
                </div>
              </div>
            } @else {
              <div class="space-y-3">
                @for (city of topCities(); track city.name; let idx = $index) {
                  <div>
                    <div class="mb-1 flex items-center justify-between text-xs">
                      <span class="flex items-center gap-2 font-medium text-slate-700">
                        <span class="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">{{ idx + 1 }}</span>
                        {{ city.name }}
                      </span>
                      <span class="font-medium text-slate-600">{{ city.count }}</span>
                    </div>
                    <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full rounded-full bg-slate-900 transition-all" [style.width.%]="city.percent"></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminAnalyticsComponent implements OnInit {
  loading = signal(true);
  metrics = signal<{ label: string; value: string }[]>([]);
  growthBars = signal<number[]>([]);
  growthValues = signal<number[]>([]);
  monthLabels = signal<string[]>([]);
  topCities = signal<{ name: string; count: number; percent: number }[]>([]);

  private readonly MONTH_NAMES_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  private readonly MONTH_NAMES_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  constructor(
    private api: AdminApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.api.getOverview().subscribe({
      next: (d: any) => {
        this.metrics.set([
          { label: 'admin.analytics.total_candidates', value: this.fmt(d.totalCandidates ?? 0) },
          { label: 'admin.analytics.total_employers', value: this.fmt(d.totalEmployers ?? 0) },
          { label: 'admin.analytics.total_vacancies', value: this.fmt(d.totalVacancies ?? 0) },
          { label: 'admin.analytics.monthly_revenue', value: this.fmtAmount(d.monthlyRevenue ?? 0) },
        ]);

        const growth: number[] = d.growthData || [];
        const max = Math.max(...growth, 1);
        this.growthBars.set(growth.map(v => Math.round((v / max) * 100)));
        this.growthValues.set(growth);

        // Generate month labels for last 6 months
        const months = this.i18n.lang() === 'ru' ? this.MONTH_NAMES_RU : this.MONTH_NAMES_UZ;
        const now = new Date();
        const labels: string[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(months[d.getMonth()]);
        }
        this.monthLabels.set(labels);

        const cities: any[] = d.topCities || [];
        const maxCity = Math.max(...cities.map((c: any) => c.count), 1);
        this.topCities.set(cities.map((c: any) => ({ name: c.name, count: c.count, percent: Math.round((c.count / maxCity) * 100) })));

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.i18n.t('admin.load_failed'));
      },
    });
  }

  private fmt(n: number): string { return n.toLocaleString(); }

  private fmtAmount(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    return n.toLocaleString() + ' UZS';
  }
}
