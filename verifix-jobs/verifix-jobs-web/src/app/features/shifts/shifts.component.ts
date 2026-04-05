import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, ChevronLeft, ChevronRight, Plus, Zap, AlertTriangle } from 'lucide-angular';

interface ShiftBlock {
  employeeId: string;
  day: number;
  start: string;
  end: string;
  hours: number;
  type: 'normal' | 'overtime' | 'violation';
}

interface Employee {
  id: string;
  name: string;
  role: string;
  totalHours: number;
}

@Component({
  selector: 'vjw-shifts',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-title font-semibold text-gray-900">Shift Planner</h1>
          <p class="mt-1 text-sm text-muted">Weekly schedule — drag to assign shifts</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface transition">
            <lucide-icon [img]="ZapIcon" [size]="16" class="text-warning"></lucide-icon>
            Auto-Schedule
          </button>
          <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-primary-600 transition">
            <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
            Add Shift
          </button>
        </div>
      </div>

      <!-- Week navigation -->
      <div class="flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-3 shadow-card">
        <button (click)="prevWeek()" class="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-gray-700 transition">
          <lucide-icon [img]="ChevronLeftIcon" [size]="20"></lucide-icon>
        </button>
        <span class="text-sm font-semibold text-gray-900">{{ weekLabel() }}</span>
        <button (click)="nextWeek()" class="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-gray-700 transition">
          <lucide-icon [img]="ChevronRightIcon" [size]="20"></lucide-icon>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm min-w-[800px]">
            <thead>
              <tr class="border-b border-border">
                <th class="w-48 px-4 py-3 text-left text-caption font-medium uppercase tracking-wider text-muted">Employee</th>
                @for (day of weekDays(); track day.label) {
                  <th class="px-2 py-3 text-center min-w-[100px]"
                      [class.bg-sky-50]="day.isToday">
                    <div class="text-caption font-medium uppercase tracking-wider text-muted">{{ day.label }}</div>
                    <div class="text-lg font-semibold text-gray-900">{{ day.dateNum }}</div>
                  </th>
                }
                <th class="w-20 px-3 py-3 text-center text-caption font-medium uppercase tracking-wider text-muted">Hours</th>
              </tr>
            </thead>
            <tbody>
              @for (emp of employees(); track emp.id) {
                <tr class="border-b border-border/50 hover:bg-surface/30 transition">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                        {{ emp.name.substring(0,2).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 text-xs">{{ emp.name }}</div>
                        <div class="text-[10px] text-muted">{{ emp.role }}</div>
                      </div>
                    </div>
                  </td>
                  @for (day of weekDays(); track day.label; let dayIdx = $index) {
                    <td class="px-1 py-2 text-center" [class.bg-sky-50]="day.isToday">
                      @if (getShift(emp.id, dayIdx); as shift) {
                        <div class="mx-auto rounded-lg px-2 py-1.5 text-[10px] font-semibold cursor-pointer transition hover:scale-105"
                             [class]="shift.type === 'normal' ? 'bg-accent/10 text-accent border border-accent/20' :
                                      shift.type === 'overtime' ? 'bg-warning/10 text-warning border border-warning/20' :
                                      'bg-error/10 text-error border border-error/20'">
                          {{ shift.start }} - {{ shift.end }}
                          <div class="text-[8px] opacity-70">{{ shift.hours }}h 0m</div>
                          @if (shift.type === 'overtime') {
                            <lucide-icon [img]="AlertIcon" [size]="10" class="inline ml-0.5"></lucide-icon>
                          }
                        </div>
                      } @else {
                        <div class="mx-auto h-8 w-full rounded-lg border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition"></div>
                      }
                    </td>
                  }
                  <td class="px-3 py-3 text-center">
                    <span class="text-xs font-semibold" [class]="emp.totalHours > 40 ? 'text-warning' : 'text-gray-700'">
                      {{ emp.totalHours }}h
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Labor Compliance Warning -->
      @if (hasOvertimeViolation()) {
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <lucide-icon [img]="AlertIcon" [size]="20" class="text-amber-600 shrink-0 mt-0.5"></lucide-icon>
          <div>
            <div class="text-sm font-semibold text-amber-900">Labor Compliance Warning</div>
            <div class="text-xs text-amber-700 mt-0.5">Rustam I. is scheduled for 48 hours this week, exceeding the standard 40-hour limit. Consider reassigning the Friday shift.</div>
          </div>
        </div>
      }

      <!-- Legend -->
      <div class="flex items-center gap-6 text-xs text-muted">
        <div class="flex items-center gap-1.5">
          <div class="h-3 w-3 rounded-full bg-accent"></div> Normal
        </div>
        <div class="flex items-center gap-1.5">
          <div class="h-3 w-3 rounded-full bg-warning"></div> Overtime
        </div>
      </div>
    </div>
  `,
})
export class ShiftsComponent {
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  PlusIcon = Plus;
  ZapIcon = Zap;
  AlertIcon = AlertTriangle;

  weekOffset = signal(0);

  // Demo data
  employees = signal<Employee[]>([
    { id: '1', name: 'Alisher Kurbanov', role: 'Senior Developer', totalHours: 40 },
    { id: '2', name: 'Elena Volkova', role: 'Product Designer', totalHours: 38 },
    { id: '3', name: 'Rustam Inoyatov', role: 'Backend Engineer', totalHours: 44 },
    { id: '4', name: 'Madina Tulyaganova', role: 'UX Researcher', totalHours: 36 },
    { id: '5', name: 'Jasur Mavlonov', role: 'Frontend Developer', totalHours: 40 },
  ]);

  shifts: ShiftBlock[] = [
    { employeeId: '1', day: 0, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '1', day: 1, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '1', day: 2, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '1', day: 3, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '1', day: 4, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '2', day: 0, start: '10:00', end: '19:00', hours: 8, type: 'normal' },
    { employeeId: '2', day: 1, start: '10:00', end: '19:00', hours: 8, type: 'normal' },
    { employeeId: '2', day: 3, start: '10:00', end: '19:00', hours: 8, type: 'normal' },
    { employeeId: '2', day: 4, start: '10:00', end: '17:00', hours: 6, type: 'normal' },
    { employeeId: '3', day: 0, start: '08:00', end: '20:00', hours: 12, type: 'overtime' },
    { employeeId: '3', day: 1, start: '08:00', end: '18:00', hours: 10, type: 'overtime' },
    { employeeId: '3', day: 2, start: '08:00', end: '18:00', hours: 10, type: 'normal' },
    { employeeId: '3', day: 3, start: '08:00', end: '20:00', hours: 12, type: 'violation' },
    { employeeId: '4', day: 1, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '4', day: 2, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '4', day: 3, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '4', day: 4, start: '09:00', end: '15:00', hours: 6, type: 'normal' },
    { employeeId: '5', day: 0, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '5', day: 1, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '5', day: 2, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '5', day: 3, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
    { employeeId: '5', day: 4, start: '09:00', end: '18:00', hours: 8, type: 'normal' },
  ];

  hasOvertimeViolation = computed(() => this.employees().some(e => e.totalHours > 40));

  constructor(public i18n: I18nService) {}

  weekDays = computed(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + this.weekOffset() * 7);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayNames.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        label,
        date: `${d.getDate()}.${d.getMonth() + 1}`,
        dateNum: d.getDate(),
        isToday: d.toDateString() === today.toDateString()
      };
    });
  });

  weekLabel = computed(() => {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + this.weekOffset() * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${months[monday.getMonth()]} ${monday.getDate()} - ${months[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
  });

  getShift(empId: string, dayIdx: number): ShiftBlock | undefined {
    return this.shifts.find(s => s.employeeId === empId && s.day === dayIdx);
  }

  prevWeek() { this.weekOffset.update(v => v - 1); }
  nextWeek() { this.weekOffset.update(v => v + 1); }
}
