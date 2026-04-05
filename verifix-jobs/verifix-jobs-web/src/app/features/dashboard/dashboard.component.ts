import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, Briefcase, Users, TrendingUp, TrendingDown, Target,
  Plus, Kanban, Sparkles, BarChart3, FileDown, Clock, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'vjw-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- ═══ KPI Row — 4 cards with sparklines ═══ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="rounded-2xl border border-border bg-white p-5 shadow-card hover:border-dashed hover:border-primary/30 transition cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-caption font-medium uppercase tracking-wider text-muted">{{ kpi.label }}</span>
              @if (kpi.trend !== 0) {
                <span class="flex items-center gap-0.5 text-xs font-semibold"
                      [class]="kpi.trend > 0 ? 'text-accent' : 'text-error'">
                  <lucide-icon [img]="kpi.trend > 0 ? TrendingUpIcon : TrendingDownIcon" [size]="14"></lucide-icon>
                  {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
                </span>
              }
            </div>
            <div class="mt-2 text-title font-semibold text-gray-900">{{ kpi.value }}</div>
            <!-- Mini sparkline (CSS bars) -->
            <div class="mt-3 flex items-end gap-[2px] h-8">
              @for (bar of kpi.sparkline; track $index) {
                <div class="flex-1 rounded-t-sm transition-all"
                     [style.height.%]="bar"
                     [class]="kpi.trend >= 0 ? 'bg-primary/20' : 'bg-error/20'"></div>
              }
            </div>
            <div class="mt-1 text-[10px] text-muted">{{ kpi.period }}</div>
          </div>
        }
      </div>

      <!-- ═══ Main Row: Funnel (60%) + AI Insights (40%) ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <!-- Application Funnel — 3 cols -->
        <div class="xl:col-span-3 rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-heading font-semibold text-gray-900">Application Funnel</h3>
            <select class="h-8 rounded-lg border border-border bg-surface px-3 text-xs text-muted focus:outline-none focus:border-primary">
              <option>All Vacancies</option>
            </select>
          </div>
          @if (funnelData().length) {
            <div class="space-y-3">
              @for (item of funnelData(); track item.label) {
                <div class="flex items-center gap-3">
                  <span class="w-20 text-xs text-muted text-right shrink-0">{{ item.label }}</span>
                  <div class="flex-1 h-8 bg-surface rounded-lg overflow-hidden">
                    <div class="h-full rounded-lg transition-all duration-500"
                         [style.width.%]="item.percent"
                         [class]="item.color"></div>
                  </div>
                  <span class="w-8 text-xs font-semibold text-gray-700 text-right">{{ item.count }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-48 text-sm text-muted">{{ i18n.t('dashboard.no_data') }}</div>
          }
        </div>

        <!-- AI Insights — 2 cols -->
        <div class="xl:col-span-2 rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center gap-2 mb-5">
            <lucide-icon [img]="SparklesIcon" [size]="20" class="text-primary"></lucide-icon>
            <h3 class="text-heading font-semibold text-gray-900">AI {{ i18n.t('dashboard.insights') }}</h3>
          </div>
          @if (healthItems().length) {
            <div class="space-y-4">
              @for (item of healthItems().slice(0, 4); track item.vacancyId) {
                <div class="flex items-start gap-3">
                  <div class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                       [class]="item.healthGrade === 'A' ? 'bg-accent/10 text-accent' :
                                item.healthGrade === 'B' ? 'bg-info/10 text-info' :
                                item.healthGrade === 'C' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'">
                    {{ item.healthGrade }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm text-gray-700">
                      {{ item.title }}: {{ item.applies }} {{ i18n.t('dashboard.applications') }}
                    </div>
                    @if (item.recommendations?.length) {
                      <a class="mt-0.5 flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer">
                        {{ item.recommendations[0] }}
                        <lucide-icon [img]="ArrowRightIcon" [size]="12"></lucide-icon>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-32 text-sm text-muted">{{ i18n.t('dashboard.loading') }}</div>
          }
        </div>
      </div>

      <!-- ═══ Second Row: Task Inbox + Activity Feed ═══ -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Task Inbox -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-heading font-semibold text-gray-900">{{ i18n.t('dashboard.task_inbox') }}</h3>
            @if (taskCounts().urgent) {
              <span class="flex h-6 items-center rounded-full bg-error/10 px-2.5 text-[10px] font-semibold text-error">
                {{ taskCounts().urgent }} urgent
              </span>
            }
          </div>
          @if (tasks().length) {
            <div class="space-y-2.5">
              @for (task of tasks(); track task.id) {
                <div class="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-surface"
                     [class]="task.priority === 'URGENT' ? 'border-red-200' : 'border-border'">
                  <span class="flex h-6 items-center rounded-full px-2 text-[10px] font-semibold"
                        [class]="task.priority === 'URGENT' ? 'bg-error/10 text-error' :
                                 task.priority === 'HIGH' ? 'bg-warning/10 text-warning' : 'bg-surface text-muted'">
                    {{ task.priority }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</div>
                    <div class="text-[11px] text-muted truncate">{{ task.description }}</div>
                  </div>
                  <button (click)="markTaskDone(task.id)"
                    class="shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition">
                    ✓
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-24 text-sm text-muted">{{ i18n.t('dashboard.no_tasks') }}</div>
          }
        </div>

        <!-- Activity Feed -->
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h3 class="text-heading font-semibold text-gray-900 mb-4">{{ i18n.t('dashboard.activity_feed') }}</h3>
          @if (activities().length) {
            <div class="space-y-3">
              @for (activity of activities(); track activity.id) {
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                       [class]="activityStyle(activity.eventType)">
                    {{ eventIcon(activity.eventType) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-gray-700">{{ activity.title }}</div>
                    <div class="text-[11px] text-muted">{{ activity.description }}</div>
                  </div>
                  <div class="text-[10px] text-muted whitespace-nowrap">{{ activity.createdAt | date:'HH:mm' }}</div>
                </div>
              }
            </div>
          } @else {
            <div class="flex items-center justify-center h-24 text-sm text-muted">{{ i18n.t('dashboard.no_activity') }}</div>
          }
        </div>
      </div>

      <!-- ═══ Quick Actions Row ═══ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <a routerLink="/employer/vacancies/new"
           class="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-card hover:border-primary/30 hover:bg-primary/5 transition cursor-pointer">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <lucide-icon [img]="PlusIcon" [size]="18" class="text-primary"></lucide-icon>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ i18n.t('dashboard.quick.create') }}</span>
        </a>
        <a routerLink="/employer/pipeline"
           class="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-card hover:border-accent/30 hover:bg-accent/5 transition cursor-pointer">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <lucide-icon [img]="KanbanIcon" [size]="18" class="text-accent"></lucide-icon>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ i18n.t('dashboard.quick.pipeline') }}</span>
        </a>
        <a routerLink="/employer/ai-assistant"
           class="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-card hover:border-coral/30 hover:bg-coral/5 transition cursor-pointer">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-coral/10">
            <lucide-icon [img]="SparklesIcon" [size]="18" class="text-coral"></lucide-icon>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ i18n.t('dashboard.quick.ai') }}</span>
        </a>
        <a routerLink="/employer/analytics"
           class="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-card hover:border-info/30 hover:bg-info/5 transition cursor-pointer">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
            <lucide-icon [img]="BarChart3Icon" [size]="18" class="text-info"></lucide-icon>
          </div>
          <span class="text-sm font-medium text-gray-900">{{ i18n.t('dashboard.quick.report') }}</span>
        </a>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  // Icons
  TrendingUpIcon = TrendingUp;
  TrendingDownIcon = TrendingDown;
  SparklesIcon = Sparkles;
  PlusIcon = Plus;
  KanbanIcon = Kanban;
  BarChart3Icon = BarChart3;
  ArrowRightIcon = ArrowRight;

  // State
  kpis = signal<KpiCard[]>([]);
  taskCounts = signal({ open: 0, urgent: 0 });
  tasks = signal<any[]>([]);
  healthItems = signal<any[]>([]);
  activities = signal<any[]>([]);
  funnelData = signal<FunnelItem[]>([]);

  constructor(private api: ApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.loadDashboard();
    this.loadTasks();
    this.loadVacancyHealth();
    this.loadActivityFeed();
    this.loadFunnel();
  }

  markTaskDone(taskId: string) {
    this.api.updateTask(taskId, 'COMPLETED').subscribe({
      next: () => { this.loadTasks(); this.loadActivityFeed(); },
      error: () => {}
    });
  }

  eventIcon(type: string): string {
    return ({ APPLICATION_NEW: '→', APPLICATION_HIRED: '✓', APPLICATION_REJECTED: '✗',
              VACANCY_APPROVED: '◆', VACANCY_EXPIRED: '◇', REFERRAL_HIRED: '★' } as Record<string, string>)[type] || '•';
  }

  activityStyle(type: string): string {
    return ({ APPLICATION_NEW: 'bg-info/10 text-info', APPLICATION_HIRED: 'bg-accent/10 text-accent',
              APPLICATION_REJECTED: 'bg-error/10 text-error', VACANCY_APPROVED: 'bg-primary/10 text-primary',
              VACANCY_EXPIRED: 'bg-warning/10 text-warning' } as Record<string, string>)[type] || 'bg-surface text-muted';
  }

  // ── Data Loaders ──
  private loadDashboard() {
    this.api.getDashboard().subscribe({
      next: (data: any) => {
        const spark = () => Array.from({ length: 14 }, () => 20 + Math.random() * 80);
        this.kpis.set([
          { value: data.activeVacancies || 0, label: this.i18n.t('dashboard.kpi.active_vacancies'),
            trend: 12, period: 'vs last month', sparkline: spark() },
          { value: data.newApplications || 0, label: this.i18n.t('dashboard.kpi.new_apps'),
            trend: 8, period: 'vs last week', sparkline: spark() },
          { value: `${data.conversionRate || 7.2}%`, label: this.i18n.t('dashboard.kpi.conversion'),
            trend: -2, period: 'vs last month', sparkline: spark() },
          { value: data.positionsToFill || data.activeVacancies || 0, label: this.i18n.t('dashboard.kpi.positions'),
            trend: 0, period: 'On track', sparkline: spark() },
        ]);
      },
      error: () => {}
    });
  }

  private loadTasks() {
    this.api.getTaskCounts().subscribe({
      next: counts => this.taskCounts.set({ open: counts.open || 0, urgent: counts.urgent || 0 }),
      error: () => {}
    });
    this.api.getTasks('OPEN', 0, 5).subscribe({
      next: response => this.tasks.set(response.content || []),
      error: () => {}
    });
  }

  private loadVacancyHealth() {
    this.api.getAllVacancyHealth().subscribe({
      next: items => this.healthItems.set((items || []).slice(0, 5)),
      error: () => {}
    });
  }

  private loadActivityFeed() {
    this.api.getActivityFeed(0, 8).subscribe({
      next: response => this.activities.set(response.content || []),
      error: () => {}
    });
  }

  private loadFunnel() {
    this.api.getFunnel().subscribe({
      next: (data: any) => {
        if (!data?.statusCounts) return;
        const order = ['NEW', 'VIEWED', 'SHORTLIST', 'INTERVIEW', 'OFFER', 'HIRED'];
        const labels: Record<string, string> = {
          NEW: 'Applied', VIEWED: 'Screened', SHORTLIST: 'Shortlisted',
          INTERVIEW: 'Interview', OFFER: 'Offer', HIRED: 'Hired'
        };
        const colors = ['bg-primary', 'bg-primary/80', 'bg-primary/60', 'bg-indigo-400', 'bg-violet-400', 'bg-accent'];
        const entries = order.map((status, i) => ({
          label: labels[status] || status,
          count: (data.statusCounts[status] || 0) as number,
          color: colors[i]
        }));
        const maxVal = Math.max(...entries.map(e => e.count), 1);
        this.funnelData.set(entries.map(e => ({ ...e, percent: (e.count / maxVal) * 100 })));
      },
      error: () => {}
    });
  }
}

interface KpiCard {
  value: string | number;
  label: string;
  trend: number;
  period: string;
  sparkline: number[];
}

interface FunnelItem {
  label: string;
  count: number;
  percent: number;
  color: string;
}
