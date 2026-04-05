import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, Clock, MapPin, Download, CheckCircle, AlertCircle, Filter } from 'lucide-angular';

interface TimeEntry {
  id: string;
  employee: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  overtime: number;
  status: 'verified' | 'pending' | 'disputed';
  location: string;
  lat?: number;
  lng?: number;
}

@Component({
  selector: 'vjw-time-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-title font-semibold text-gray-900">Time Tracking</h1>
          <p class="mt-1 text-sm text-muted">Clock-in/out records and attendance</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="viewMode.set(viewMode() === 'table' ? 'map' : 'table')"
            class="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface transition">
            <lucide-icon [img]="viewMode() === 'table' ? MapPinIcon : ClockIcon" [size]="16"></lucide-icon>
            {{ viewMode() === 'table' ? 'Map View' : 'Table View' }}
          </button>
          <button class="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-surface transition">
            <lucide-icon [img]="DownloadIcon" [size]="16"></lucide-icon>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <input type="date" [(ngModel)]="dateFrom"
          class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
        <input type="date" [(ngModel)]="dateTo"
          class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
        <select [(ngModel)]="statusFilter"
          class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="disputed">Disputed</option>
        </select>
        <button (click)="bulkApprove()"
          class="h-10 rounded-xl bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-600 transition">
          Bulk Approve
        </button>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="rounded-2xl border border-border bg-white p-4 shadow-card text-center">
          <div class="text-caption font-medium uppercase tracking-wider text-muted">Total Hours</div>
          <div class="mt-1 text-2xl font-bold text-gray-900">{{ totalHours() }}</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-4 shadow-card text-center">
          <div class="text-caption font-medium uppercase tracking-wider text-muted">Overtime</div>
          <div class="mt-1 text-2xl font-bold text-warning">{{ totalOvertime() }}h</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-4 shadow-card text-center">
          <div class="text-caption font-medium uppercase tracking-wider text-muted">Pending</div>
          <div class="mt-1 text-2xl font-bold text-coral">{{ pendingCount() }}</div>
        </div>
        <div class="rounded-2xl border border-border bg-white p-4 shadow-card text-center">
          <div class="text-caption font-medium uppercase tracking-wider text-muted">Verified</div>
          <div class="mt-1 text-2xl font-bold text-accent">{{ verifiedCount() }}</div>
        </div>
      </div>

      @if (viewMode() === 'table') {
        <!-- Table View -->
        <div class="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border text-left">
                  <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Employee</th>
                  <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Date</th>
                  <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Clock In</th>
                  <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Clock Out</th>
                  <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted text-center">Hours</th>
                  <th class="hidden lg:table-cell px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted text-center">OT</th>
                  <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Status</th>
                  <th class="hidden md:table-cell px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Location</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of filteredEntries(); track entry.id) {
                  <tr class="border-b border-border/50 hover:bg-surface/50 transition">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {{ entry.employee.substring(0,2).toUpperCase() }}
                        </div>
                        <span class="font-medium text-gray-900">{{ entry.employee }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 text-muted">{{ entry.date }}</td>
                    <td class="px-5 py-3.5 font-mono text-gray-700">{{ entry.clockIn }}</td>
                    <td class="px-5 py-3.5 font-mono text-gray-700">{{ entry.clockOut }}</td>
                    <td class="px-5 py-3.5 text-center font-semibold text-gray-900">{{ entry.totalHours }}h</td>
                    <td class="hidden lg:table-cell px-5 py-3.5 text-center">
                      @if (entry.overtime > 0) {
                        <span class="text-warning font-semibold">+{{ entry.overtime }}h</span>
                      } @else {
                        <span class="text-muted">—</span>
                      }
                    </td>
                    <td class="px-5 py-3.5">
                      <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                            [class]="entry.status === 'verified' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' :
                                     entry.status === 'pending' ? 'border border-amber-200 bg-amber-50 text-amber-700' :
                                     'border border-red-200 bg-red-50 text-red-600'">
                        <lucide-icon [img]="entry.status === 'verified' ? CheckIcon : AlertIcon" [size]="10"></lucide-icon>
                        {{ entry.status | titlecase }}
                      </span>
                    </td>
                    <td class="hidden md:table-cell px-5 py-3.5">
                      <div class="flex items-center gap-1 text-xs text-muted">
                        <lucide-icon [img]="MapPinIcon" [size]="12"></lucide-icon>
                        {{ entry.location }}
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <!-- Map View Placeholder -->
        <div class="rounded-2xl border border-border bg-white p-12 shadow-card text-center">
          <lucide-icon [img]="MapPinIcon" [size]="48" class="mx-auto text-muted mb-4"></lucide-icon>
          <h2 class="text-lg font-semibold text-gray-900">Map View</h2>
          <p class="mt-2 text-sm text-muted max-w-md mx-auto">
            Interactive map showing clock-in locations with GPS pins. Leaflet integration coming soon.
          </p>
        </div>
      }
    </div>
  `,
})
export class TimeTrackingComponent {
  ClockIcon = Clock;
  MapPinIcon = MapPin;
  DownloadIcon = Download;
  CheckIcon = CheckCircle;
  AlertIcon = AlertCircle;

  viewMode = signal<'table' | 'map'>('table');
  dateFrom = '';
  dateTo = '';
  statusFilter = '';

  // Demo data
  entries = signal<TimeEntry[]>([
    { id: '1', employee: 'Alisher Kurbanov', employeeId: '1', date: '2026-04-04', clockIn: '08:55', clockOut: '18:05', totalHours: 9, overtime: 1, status: 'verified', location: 'Tashkent Office' },
    { id: '2', employee: 'Elena Volkova', employeeId: '2', date: '2026-04-04', clockIn: '09:58', clockOut: '19:02', totalHours: 9, overtime: 1, status: 'verified', location: 'Tashkent Office' },
    { id: '3', employee: 'Rustam Inoyatov', employeeId: '3', date: '2026-04-04', clockIn: '07:45', clockOut: '20:15', totalHours: 12.5, overtime: 4.5, status: 'pending', location: 'Remote' },
    { id: '4', employee: 'Madina Tulyaganova', employeeId: '4', date: '2026-04-04', clockIn: '09:00', clockOut: '18:00', totalHours: 8, overtime: 0, status: 'verified', location: 'Tashkent Office' },
    { id: '5', employee: 'Jasur Mavlonov', employeeId: '5', date: '2026-04-04', clockIn: '09:10', clockOut: '18:30', totalHours: 8.3, overtime: 0, status: 'pending', location: 'Samarkand Office' },
    { id: '6', employee: 'Alisher Kurbanov', employeeId: '1', date: '2026-04-03', clockIn: '08:50', clockOut: '18:10', totalHours: 9.3, overtime: 1.3, status: 'verified', location: 'Tashkent Office' },
    { id: '7', employee: 'Rustam Inoyatov', employeeId: '3', date: '2026-04-03', clockIn: '08:00', clockOut: '21:00', totalHours: 13, overtime: 5, status: 'disputed', location: 'Remote' },
    { id: '8', employee: 'Elena Volkova', employeeId: '2', date: '2026-04-03', clockIn: '10:00', clockOut: '18:30', totalHours: 8.5, overtime: 0.5, status: 'verified', location: 'Tashkent Office' },
  ]);

  filteredEntries = signal<TimeEntry[]>(this.entries());

  totalHours = signal('78.6');
  totalOvertime = signal(13.3);
  pendingCount = signal(2);
  verifiedCount = signal(5);

  constructor(public i18n: I18nService) {
    this.filteredEntries.set(this.entries());
  }

  bulkApprove() {
    this.entries.update(list =>
      list.map(e => e.status === 'pending' ? { ...e, status: 'verified' as const } : e)
    );
    this.filteredEntries.set(this.entries());
    this.pendingCount.set(0);
    this.verifiedCount.set(this.entries().filter(e => e.status === 'verified').length);
  }
}
