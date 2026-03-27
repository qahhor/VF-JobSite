import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'vjw-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div class="text-sm text-gray-400 mt-1">Hiring oqimi, task inbox va employer trust ko'rsatkichlari.</div>
        </div>
        @if (taskCounts().urgent) {
          <div class="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
            {{ taskCounts().urgent }} ta urgent task
          </div>
        }
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (kpi of kpis(); track kpi.label) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="text-xs uppercase tracking-wide text-gray-400">{{ kpi.label }}</div>
            <div class="text-2xl font-bold text-gray-900 mt-2">{{ kpi.value }}</div>
            @if (kpi.hint) {
              <div class="text-xs text-gray-400 mt-2">{{ kpi.hint }}</div>
            }
          </div>
        }
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Task inbox</h3>
            <div class="text-xs text-gray-400">{{ taskCounts().open }} open / {{ taskCounts().urgent }} urgent</div>
          </div>

          @if (tasks().length) {
            <div class="space-y-3">
              @for (task of tasks(); track task.id) {
                <div class="rounded-xl border p-4"
                     [class.border-red-200]="task.priority === 'URGENT'"
                     [class.bg-red-50]="task.priority === 'URGENT'"
                     [class.border-gray-100]="task.priority !== 'URGENT'"
                     [class.bg-white]="task.priority !== 'URGENT'">
                  <div class="flex items-start gap-3">
                    <div class="mt-0.5">
                      <span class="inline-flex h-7 px-2 rounded-full items-center text-[10px] font-semibold"
                            [class]="task.priority === 'URGENT' ? 'bg-red-100 text-red-700' : task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'">
                        {{ task.priority }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-gray-900">{{ task.title }}</div>
                      <div class="text-xs text-gray-500 mt-1">{{ task.description }}</div>
                      @if (task.dueAt) {
                        <div class="text-[11px] text-gray-400 mt-2">Deadline: {{ task.dueAt | date:'dd.MM HH:mm' }}</div>
                      }
                    </div>
                    <button
                      (click)="markTaskDone(task.id)"
                      class="shrink-0 h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                      Bajarildi
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Ochiq tasklar yo'q</div>
          }
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">Civility score</h3>
            @if (civility(); as score) {
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                   [class]="score.grade === 'A' ? 'bg-green-50 text-green-600' :
                            score.grade === 'B' ? 'bg-blue-50 text-blue-600' :
                            score.grade === 'C' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'">
                {{ score.grade }}
              </div>
            }
          </div>

          @if (civility(); as score) {
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-3xl font-bold text-gray-900">{{ score.overallScore }}</div>
                <div class="text-xs text-gray-400 mt-1">Umumiy ball</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-gray-900">{{ score.responseRate }}%</div>
                <div class="text-xs text-gray-400 mt-1">Response rate</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ score.ignoredCandidatesPct }}%</div>
                <div class="text-xs text-gray-400 mt-1">Ignored</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ score.cleanClosureRate }}%</div>
                <div class="text-xs text-gray-400 mt-1">Closed cleanly</div>
              </div>
            </div>
            <div class="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">{{ score.summary }}</div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Yuklanmoqda...</div>
          }
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Vakansiya salomatligi</h3>
          @if (healthItems().length) {
            <div class="space-y-3">
              @for (item of healthItems(); track item.vacancyId) {
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                       [class]="item.healthGrade === 'A' ? 'bg-green-50 text-green-600' :
                                item.healthGrade === 'B' ? 'bg-blue-50 text-blue-600' :
                                item.healthGrade === 'C' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'">
                    {{ item.healthGrade }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</div>
                    <div class="text-xs text-gray-400">{{ item.applies }} ariza / {{ item.healthScore }} ball</div>
                  </div>
                  @if (item.recommendations?.length) {
                    <div class="text-xs text-orange-500 max-w-[160px] truncate" title="{{ item.recommendations[0] }}">
                      {{ item.recommendations[0] }}
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Hozircha vakansiyalar yo'q</div>
          }
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Bozor maoshlari</h3>
          @if (salaryData().length) {
            <div class="space-y-3">
              @for (salary of salaryData(); track salary.category) {
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-700">{{ salary.category }}</div>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="text-gray-400">{{ fmt(salary.p25) }}</span>
                    <span class="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{{ fmt(salary.median) }}</span>
                    <span class="text-gray-400">{{ fmt(salary.p75) }}</span>
                    <span class="text-gray-300">UZS</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Ma'lumot yuklanmoqda...</div>
          }
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Qiymat hisoboti</h3>
          @if (valueReport(); as report) {
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ report.totalHires }}</div>
                <div class="text-xs text-gray-400">Jami yollangan</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ report.totalApplications }}</div>
                <div class="text-xs text-gray-400">Jami arizalar</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{{ report.estimatedTimeSavedHours | number:'1.0-0' }} soat</div>
                <div class="text-xs text-gray-400">Tejangan vaqt</div>
              </div>
              <div>
                <div class="text-sm font-semibold px-2 py-1 rounded-full inline-block"
                     [class]="report.maturityLevel === 'ADVANCED' ? 'bg-green-50 text-green-600' :
                              report.maturityLevel === 'GROWING' ? 'bg-blue-50 text-blue-600' :
                              report.maturityLevel === 'GETTING_STARTED' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-50 text-gray-500'">
                  {{ maturityLabel(report.maturityLevel) }}
                </div>
                <div class="text-xs text-gray-400 mt-1">Daraja</div>
              </div>
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Yuklanmoqda...</div>
          }
        </div>

        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-4">Faoliyat lentasi</h3>
          @if (activities().length) {
            <div class="space-y-3">
              @for (activity of activities(); track activity.id) {
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                       [class]="activity.eventType === 'APPLICATION_NEW' ? 'bg-blue-50 text-blue-500' :
                                activity.eventType === 'APPLICATION_HIRED' ? 'bg-green-50 text-green-500' :
                                activity.eventType === 'VACANCY_APPROVED' ? 'bg-purple-50 text-purple-500' : 'bg-gray-50 text-gray-400'">
                    {{ eventIcon(activity.eventType) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-gray-700">{{ activity.title }}</div>
                    <div class="text-xs text-gray-400">{{ activity.description }}</div>
                  </div>
                  <div class="text-xs text-gray-300 whitespace-nowrap">{{ activity.createdAt | date:'HH:mm' }}</div>
                </div>
              }
            </div>
          } @else {
            <div class="text-sm text-gray-400 py-4">Hozircha faoliyat yo'q</div>
          }
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Yollash voronkasi</h3>
        @if (funnelData().length) {
          <div class="flex items-end gap-2 h-32">
            @for (item of funnelData(); track item.label) {
              <div class="flex-1 flex flex-col items-center gap-1">
                <div class="text-xs font-bold text-gray-700">{{ item.count }}</div>
                <div class="w-full rounded-t" [style.height.%]="item.percent" [class]="item.color"></div>
                <div class="text-[10px] text-gray-400 text-center">{{ item.label }}</div>
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
  loading = signal(true);
  loadError = signal('');
  kpis = signal<{ value: string | number; label: string; hint?: string }[]>([]);
  taskCounts = signal({ open: 0, urgent: 0 });
  tasks = signal<any[]>([]);
  civility = signal<any>(null);
  healthItems = signal<any[]>([]);
  salaryData = signal<any[]>([]);
  valueReport = signal<any>(null);
  activities = signal<any[]>([]);
  funnelData = signal<{ label: string; count: number; percent: number; color: string }[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading.set(true);
    this.loadDashboard();
    this.loadTasks();
    this.loadCivility();
    this.loadVacancyHealth();
    this.loadSalaryData();
    this.loadValueReport();
    this.loadActivityFeed();
    this.loadFunnel();
    // Clear loading after 3s max (all parallel requests should finish)
    setTimeout(() => this.loading.set(false), 3000);
  }

  markTaskDone(taskId: string) {
    this.api.updateTask(taskId, 'COMPLETED').subscribe({
      next: () => {
        this.loadTasks();
        this.loadActivityFeed();
      },
      error: () => {}
    });
  }

  fmt(value: number): string {
    return value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value >= 1e3 ? `${Math.round(value / 1e3)}K` : `${value}`;
  }

  maturityLabel(level: string): string {
    return ({
      ADVANCED: 'Ilg\'or',
      GROWING: 'O\'sish',
      GETTING_STARTED: 'Boshlang\'ich',
      NEW: 'Yangi'
    } as Record<string, string>)[level] || level;
  }

  eventIcon(type: string): string {
    return ({
      APPLICATION_NEW: 'IN',
      APPLICATION_HIRED: 'OK',
      APPLICATION_REJECTED: 'NO',
      VACANCY_APPROVED: 'VA',
      VACANCY_EXPIRED: 'EX',
      REFERRAL_HIRED: 'RF'
    } as Record<string, string>)[type] || 'EV';
  }

  private loadDashboard() {
    this.api.getDashboard().subscribe({
      next: (data: any) => {
        this.kpis.set([
          { value: data.activeVacancies || 0, label: 'Faol vakansiyalar' },
          { value: data.totalApplications || 0, label: 'Jami arizalar' },
          { value: data.hiredCount || 0, label: 'Ishga olingan' },
          { value: data.newApplications || 0, label: 'Yangi arizalar', hint: 'So\'nggi davr' },
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

  private loadCivility() {
    this.api.getCivilityScore().subscribe({
      next: score => this.civility.set(score),
      error: () => {}
    });
  }

  private loadVacancyHealth() {
    this.api.getAllVacancyHealth().subscribe({
      next: items => this.healthItems.set((items || []).slice(0, 5)),
      error: () => {}
    });
  }

  private loadSalaryData() {
    const categories = ['COOK', 'DRIVER', 'SALES', 'BUILDER', 'SECURITY'];
    this.salaryData.set([]);
    categories.forEach(category => {
      this.api.getSalaryPredict(category).subscribe({
        next: (salary: any) => {
          if (salary && salary.sampleSize > 0) {
            this.salaryData.update(list => [...list, {
              category,
              p25: salary.p25,
              median: salary.median,
              p75: salary.p75
            }]);
          }
        },
        error: () => {}
      });
    });
  }

  private loadValueReport() {
    this.api.getValueReport().subscribe({
      next: report => this.valueReport.set(report),
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
        if (!data?.statusCounts) {
          return;
        }

        const order = ['NEW', 'VIEWED', 'SHORTLIST', 'INVITED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
        const colors = ['bg-blue-400', 'bg-gray-400', 'bg-yellow-400', 'bg-purple-400', 'bg-indigo-400', 'bg-orange-400', 'bg-green-500', 'bg-red-400'];
        const labels: Record<string, string> = {
          NEW: 'Yangi',
          VIEWED: "Ko'rildi",
          SHORTLIST: 'Tanlandi',
          INVITED: 'Taklif',
          INTERVIEW: 'Suhbat',
          OFFER: 'Offer',
          HIRED: 'Yollandi',
          REJECTED: 'Rad'
        };

        const entries = order.map((status, index) => ({
          label: labels[status] || status,
          count: (data.statusCounts[status] || 0) as number,
          color: colors[index]
        }));
        const maxValue = Math.max(...entries.map(item => item.count), 1);
        this.funnelData.set(entries.map(item => ({ ...item, percent: (item.count / maxValue) * 100 })));
      },
      error: () => {}
    });
  }
}
