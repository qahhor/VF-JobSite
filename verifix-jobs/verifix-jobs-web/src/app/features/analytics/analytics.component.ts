import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../core/services/api.service';
import { DashboardData } from '../../core/models';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, Clock, DollarSign, TrendingUp, PieChart, Users,
  Filter, Plus, Download, RotateCcw, GripVertical } from 'lucide-angular';

@Component({
  selector: 'vjw-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DragDropModule],
  styles: [`
    .cdk-drag-preview { border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); opacity: 0.9; }
    .cdk-drag-placeholder { opacity: 0.3; border: 2px dashed #0EA5E9; border-radius: 16px; }
    .cdk-drag-animating { transition: transform 200ms ease-out; }
  `],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-title font-semibold text-gray-900">Analytics Hub</h1>
          <p class="mt-1 text-sm text-muted">Customizable widget-based insights</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface transition">
            <lucide-icon [img]="FilterIcon" [size]="16"></lucide-icon>
            Global Filters
          </button>
          <button (click)="exportCsv()" class="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface transition">
            <lucide-icon [img]="DownloadIcon" [size]="16"></lucide-icon>
            Export
          </button>
          <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-primary-600 transition">
            <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
            Add Widget
          </button>
        </div>
      </div>

      <!-- Widget Grid Row 1: Time-to-Fill (big) + Application Sources (donut) -->
      <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <!-- Time to Fill -->
        <div class="xl:col-span-3 rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="ClockIcon" [size]="18" class="text-muted"></lucide-icon>
              <h3 class="text-heading font-semibold text-gray-900">Time to Fill (Days)</h3>
            </div>
            <lucide-icon [img]="GripIcon" [size]="16" class="text-muted/50 cursor-grab"></lucide-icon>
          </div>
          <!-- Line chart as CSS -->
          <div class="relative h-48">
            <div class="absolute inset-0 flex items-end">
              @for (point of timeToFillData(); track $index; let i = $index) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <div class="text-[10px] text-muted">{{ point.value }}d</div>
                  <div class="w-full max-w-[40px] mx-auto rounded-t-md transition-all hover:opacity-80"
                       [style.height.%]="point.percent"
                       [class]="'bg-primary/30'"></div>
                  <div class="text-[9px] text-muted">{{ point.label }}</div>
                </div>
              }
            </div>
            <!-- Reference lines -->
            <div class="absolute left-0 right-0 top-1/4 border-t border-dashed border-border/50"></div>
            <div class="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/50"></div>
            <div class="absolute left-0 right-0 top-3/4 border-t border-dashed border-border/50"></div>
          </div>
        </div>

        <!-- Application Sources -->
        <div class="xl:col-span-2 rounded-2xl border border-border bg-white p-5 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="PieChartIcon" [size]="18" class="text-muted"></lucide-icon>
              <h3 class="text-heading font-semibold text-gray-900">Application Sources</h3>
            </div>
            <lucide-icon [img]="GripIcon" [size]="16" class="text-muted/50 cursor-grab"></lucide-icon>
          </div>
          <!-- Donut chart as CSS ring -->
          <div class="flex items-center justify-center mb-4">
            <div class="relative h-36 w-36">
              <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
                @for (seg of sourceSegments(); track seg.label; let i = $index) {
                  <circle cx="50" cy="50" r="40" fill="none" [attr.stroke]="seg.color"
                    stroke-width="16" [attr.stroke-dasharray]="seg.dashArray" [attr.stroke-dashoffset]="seg.dashOffset"></circle>
                }
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900">{{ totalApps() }}</div>
                  <div class="text-[10px] text-muted">Total</div>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            @for (src of sourceSegments(); track src.label) {
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <div class="h-2.5 w-2.5 rounded-full" [style.background]="src.color"></div>
                  <span class="text-gray-700">{{ src.label }}</span>
                </div>
                <span class="font-semibold text-gray-900">{{ src.percent }}%</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Widget Grid Row 2: Cost per Hire, Offer Acceptance, Diversity (drag-reorderable) -->
      <div cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onWidgetDrop($event)"
           class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Cost per Hire -->
        <div cdkDrag class="rounded-2xl border border-border bg-white p-5 shadow-card cursor-grab">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="DollarIcon" [size]="18" class="text-muted"></lucide-icon>
              <h3 class="text-sm font-semibold text-gray-900">Cost per Hire</h3>
            </div>
            <lucide-icon [img]="GripIcon" [size]="16" class="text-muted/50 cursor-grab"></lucide-icon>
          </div>
          <div class="text-3xl font-bold text-gray-900">$1,240</div>
          <div class="mt-1 flex items-center gap-1 text-xs text-accent">
            <lucide-icon [img]="TrendingUpIcon" [size]="14"></lucide-icon>
            12% lower than last month
          </div>
          <div class="mt-4 space-y-2">
            @for (cost of costBreakdown; track cost.label) {
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">{{ cost.label }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-20 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-primary" [style.width.%]="cost.percent"></div>
                  </div>
                  <span class="font-semibold text-gray-700 w-10 text-right">{{ cost.value }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Offer Acceptance Rate -->
        <div cdkDrag class="rounded-2xl border border-border bg-white p-5 shadow-card cursor-grab">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="TrendingUpIcon" [size]="18" class="text-muted"></lucide-icon>
              <h3 class="text-sm font-semibold text-gray-900">Offer Acceptance Rate</h3>
            </div>
            <lucide-icon [img]="GripIcon" [size]="16" class="text-muted/50 cursor-grab"></lucide-icon>
          </div>
          <div class="flex items-center justify-center my-4">
            <div class="relative h-32 w-32">
              <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" stroke-width="12"></circle>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" stroke-width="12"
                  [attr.stroke-dasharray]="42 * 2 * 3.14159"
                  [attr.stroke-dashoffset]="42 * 2 * 3.14159 * (1 - 0.78)"
                  stroke-linecap="round"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-2xl font-bold text-accent">78%</div>
                <div class="text-[10px] text-muted">Accepted</div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-center text-xs">
            <div><div class="text-lg font-bold text-gray-900">45</div><div class="text-muted">Offers sent</div></div>
            <div><div class="text-lg font-bold text-accent">35</div><div class="text-muted">Accepted</div></div>
          </div>
        </div>

        <!-- Diversity Heatmap -->
        <div cdkDrag class="rounded-2xl border border-border bg-white p-5 shadow-card cursor-grab">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="UsersIcon" [size]="18" class="text-muted"></lucide-icon>
              <h3 class="text-sm font-semibold text-gray-900">Diversity Heatmap</h3>
            </div>
            <lucide-icon [img]="GripIcon" [size]="16" class="text-muted/50 cursor-grab"></lucide-icon>
          </div>
          <div class="space-y-3 mt-4">
            @for (dept of diversityData; track dept.name) {
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-gray-700">{{ dept.name }}</span>
                  <span class="font-semibold">{{ dept.percent }}%</span>
                </div>
                <div class="flex h-4 rounded-full overflow-hidden">
                  <div class="bg-primary transition-all" [style.width.%]="dept.male"></div>
                  <div class="bg-coral transition-all" [style.width.%]="dept.female"></div>
                </div>
              </div>
            }
            <div class="flex items-center gap-4 text-[10px] text-muted mt-2">
              <div class="flex items-center gap-1"><div class="h-2 w-2 rounded-full bg-primary"></div> Male</div>
              <div class="flex items-center gap-1"><div class="h-2 w-2 rounded-full bg-coral"></div> Female</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Widget Grid Row 3: Pipeline Funnel full-width -->
      <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-heading font-semibold text-gray-900">Pipeline Conversion Funnel</h3>
          <lucide-icon [img]="GripIcon" [size]="16" class="text-muted/50 cursor-grab"></lucide-icon>
        </div>
        @if (funnel().length) {
          <div class="space-y-2.5">
            @for (stage of funnel(); track stage.label) {
              <div class="flex items-center gap-4">
                <span class="w-24 text-xs text-muted text-right shrink-0">{{ stage.label }}</span>
                <div class="flex-1 h-7 bg-surface rounded-lg overflow-hidden relative">
                  <div class="h-full rounded-lg transition-all duration-700"
                       [style.width.%]="stage.percent" [class]="stage.color"></div>
                  <span class="absolute inset-0 flex items-center px-3 text-[11px] font-semibold text-gray-700">
                    {{ stage.count }} ({{ stage.percent.toFixed(0) }}%)
                  </span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="h-32 flex items-center justify-center text-sm text-muted">Loading...</div>
        }
      </div>
    </div>
  `,
})
export class AnalyticsComponent implements OnInit {
  ClockIcon = Clock;
  DollarIcon = DollarSign;
  TrendingUpIcon = TrendingUp;
  PieChartIcon = PieChart;
  UsersIcon = Users;
  FilterIcon = Filter;
  PlusIcon = Plus;
  DownloadIcon = Download;
  GripIcon = GripVertical;

  data = signal<DashboardData | null>(null);
  funnel = signal<{ label: string; count: number; percent: number; color: string }[]>([]);
  totalApps = signal(0);

  timeToFillData = signal<{ label: string; value: number; percent: number }[]>([
    { label: 'Jan', value: 22, percent: 78 },
    { label: 'Feb', value: 25, percent: 89 },
    { label: 'Mar', value: 18, percent: 64 },
    { label: 'Apr', value: 20, percent: 71 },
    { label: 'May', value: 17, percent: 60 },
  ]);

  sourceSegments = signal<{ label: string; color: string; percent: number; dashArray: string; dashOffset: string }[]>([]);

  costBreakdown = [
    { label: 'Marketing', value: '$450', percent: 36 },
    { label: 'Referrals', value: '$300', percent: 24 },
    { label: 'Platform', value: '$290', percent: 23 },
    { label: 'Recruiter Time', value: '$200', percent: 16 },
  ];

  diversityData = [
    { name: 'Engineering', percent: 65, male: 65, female: 35 },
    { name: 'Design', percent: 82, male: 18, female: 82 },
    { name: 'Sales', percent: 45, male: 55, female: 45 },
    { name: 'HR', percent: 90, male: 10, female: 90 },
  ];

  constructor(private api: ApiService, public i18n: I18nService) {}

  onWidgetDrop(event: CdkDragDrop<any>) {
    // Reorder widgets visually (CDK handles DOM reorder)
  }

  ngOnInit() {
    this.api.getDashboard().subscribe((d: any) => {
      this.data.set(d);
      this.totalApps.set(d.totalApplications || 0);
    });

    this.api.getFunnel().subscribe((data: any) => {
      if (!data?.statusCounts) return;
      const order = ['NEW', 'VIEWED', 'SHORTLIST', 'INTERVIEW', 'OFFER', 'HIRED'];
      const labels: Record<string, string> = {
        NEW: 'Applied', VIEWED: 'Screened', SHORTLIST: 'Shortlisted',
        INTERVIEW: 'Interview', OFFER: 'Offer', HIRED: 'Hired'
      };
      const colors = ['bg-primary', 'bg-primary/80', 'bg-indigo-400', 'bg-violet-400', 'bg-coral', 'bg-accent'];
      const entries = order.map((s, i) => ({
        label: labels[s], count: (data.statusCounts[s] || 0) as number, color: colors[i]
      }));
      const max = Math.max(...entries.map(e => e.count), 1);
      this.funnel.set(entries.map(e => ({ ...e, percent: (e.count / max) * 100 })));

      // Build source segments for donut
      const total = entries.reduce((s, e) => s + e.count, 0) || 1;
      const srcColors = ['#0EA5E9', '#10B981', '#F97316', '#8B5CF6'];
      const srcLabels = ['Platform', 'Referral', 'Direct', 'Social'];
      const srcValues = [45, 25, 20, 10];
      const circumference = 2 * Math.PI * 40;
      let offset = 0;
      this.sourceSegments.set(srcLabels.map((label, i) => {
        const pct = srcValues[i];
        const dash = (pct / 100) * circumference;
        const seg = {
          label, color: srcColors[i], percent: pct,
          dashArray: `${dash} ${circumference - dash}`,
          dashOffset: `${-offset}`
        };
        offset += dash;
        return seg;
      }));
    });
  }

  exportCsv() {
    const d = this.data();
    if (!d) return;
    let csv = 'Metric,Value\n';
    csv += `Active Vacancies,${d.activeVacancies}\nTotal Applications,${d.totalApplications}\nHired,${d.hiredThisMonth}\n`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'analytics.csv';
    a.click();
  }
}
