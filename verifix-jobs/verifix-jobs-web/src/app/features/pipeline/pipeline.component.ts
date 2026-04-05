import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { Application, ApplicationStatus, Vacancy } from '../../core/models';
import { LucideAngularModule, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'vjw-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-title font-semibold text-gray-900">Recruitment Pipeline</h1>
        <div class="flex items-center gap-3">
          <select [(ngModel)]="selectedVacancyId" (ngModelChange)="loadApplications()"
            class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary max-w-xs">
            <option value="">All Vacancies</option>
            @for (v of vacancies(); track v.id) { <option [value]="v.id">{{ v.title }}</option> }
          </select>
          <div class="relative">
            <lucide-icon [img]="SearchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="filterApps()"
              placeholder="Search candidates..."
              class="h-10 w-48 rounded-xl border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary">
          </div>
        </div>
      </div>

      <!-- Desktop Kanban -->
      <div class="hidden lg:flex gap-3 overflow-x-auto pb-4">
        @for (col of columns; track col.status) {
          <div class="flex-shrink-0 w-72 rounded-2xl bg-surface border border-border/50">
            <div class="flex items-center justify-between px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold uppercase tracking-wide" [class]="col.headerColor">{{ col.label }}</span>
              </div>
              <span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-semibold text-muted border border-border">
                {{ getColumnApps(col.status).length }}
              </span>
            </div>
            <div class="px-2 pb-2 space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
              @for (app of getColumnApps(col.status); track app.id) {
                <div (click)="selectedApp.set(app)"
                  class="rounded-xl bg-white p-3 shadow-card border border-border/50 cursor-pointer hover:shadow-dropdown hover:border-primary/20 transition group">
                  <div class="flex items-center gap-2.5 mb-2">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                         [class]="'bg-primary/10 text-primary'">
                      {{ app.candidateName?.substring(0,2)?.toUpperCase() || '?' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-gray-900 truncate">{{ app.candidateName }}</div>
                      <div class="text-[11px] text-muted truncate">{{ app.vacancyTitle }}</div>
                    </div>
                    @if (app.matchScore) {
                      <span class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                            [class]="app.matchScore >= 80 ? 'bg-accent/10 text-accent' : app.matchScore >= 60 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'">
                        {{ app.matchScore }}%
                      </span>
                    }
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-muted">
                    <span class="rounded-full border border-border px-2 py-0.5">{{ app.source || 'Platform' }}</span>
                    <span>{{ app.appliedAt | date:'dd.MM' }}</span>
                  </div>
                  <!-- Quick actions on hover -->
                  <div class="mt-2 pt-2 border-t border-border/50 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    @for (action of getNextActions(col.status); track action.status) {
                      <button (click)="$event.stopPropagation(); moveApp(app, action.status)"
                        class="flex-1 text-[10px] py-1 rounded-lg text-center font-medium transition"
                        [class]="action.class">{{ action.label }}</button>
                    }
                  </div>
                </div>
              }
              @if (getColumnApps(col.status).length === 0) {
                <div class="flex items-center justify-center h-20 text-xs text-muted">No candidates</div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Mobile List -->
      <div class="lg:hidden space-y-3">
        @for (col of columns; track col.status) {
          @if (getColumnApps(col.status).length > 0) {
            <div class="rounded-2xl border border-border bg-white shadow-card">
              <div class="px-4 py-3 border-b border-border flex items-center justify-between">
                <span class="text-sm font-semibold" [class]="col.headerColor">{{ col.label }}</span>
                <span class="text-xs text-muted">{{ getColumnApps(col.status).length }}</span>
              </div>
              @for (app of getColumnApps(col.status); track app.id) {
                <div (click)="selectedApp.set(app)" class="px-4 py-3 border-b border-border/50 flex items-center justify-between cursor-pointer hover:bg-surface transition">
                  <div class="flex items-center gap-2.5">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {{ app.candidateName?.substring(0,2)?.toUpperCase() || '?' }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ app.candidateName }}</div>
                      <div class="text-[11px] text-muted">{{ app.vacancyTitle }}</div>
                    </div>
                  </div>
                  @if (getNextActions(col.status).length > 0) {
                    <button (click)="$event.stopPropagation(); moveApp(app, getNextActions(col.status)[0].status)"
                      class="text-xs px-3 py-1 rounded-lg font-medium" [class]="getNextActions(col.status)[0].class">
                      {{ getNextActions(col.status)[0].label }}
                    </button>
                  }
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Candidate Detail Drawer -->
      @if (selectedApp(); as app) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/40" (click)="selectedApp.set(null)"></div>
          <div class="relative w-full max-w-drawer bg-white shadow-modal h-full overflow-y-auto">
            <div class="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4">
              <h2 class="text-heading font-semibold text-gray-900">Candidate Profile</h2>
              <button (click)="selectedApp.set(null)" class="rounded-lg p-1.5 text-muted hover:text-gray-700 hover:bg-surface transition">
                <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
              </button>
            </div>
            <div class="p-6 space-y-6">
              <!-- Profile header -->
              <div class="flex items-center gap-4">
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
                  {{ app.candidateName?.charAt(0) }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ app.candidateName }}</h3>
                  <p class="text-sm text-muted">{{ app.candidatePhone }}</p>
                </div>
              </div>

              <!-- Status grid -->
              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-xl bg-surface p-3">
                  <span class="text-caption text-muted block">Status</span>
                  <span class="text-sm font-semibold">{{ statusLabel(app.status) }}</span>
                </div>
                <div class="rounded-xl bg-surface p-3">
                  <span class="text-caption text-muted block">Source</span>
                  <span class="text-sm font-semibold">{{ app.source || 'Platform' }}</span>
                </div>
                <div class="rounded-xl bg-surface p-3">
                  <span class="text-caption text-muted block">Applied</span>
                  <span class="text-sm font-semibold">{{ app.appliedAt | date:'dd.MM.yyyy' }}</span>
                </div>
                <div class="rounded-xl bg-surface p-3">
                  <span class="text-caption text-muted block">Vacancy</span>
                  <span class="text-sm font-semibold truncate">{{ app.vacancyTitle }}</span>
                </div>
              </div>

              @if (app.matchScore) {
                <div class="rounded-xl border border-border p-4">
                  <div class="text-caption text-muted mb-2">AI Match Score</div>
                  <div class="flex items-center gap-3">
                    <div class="text-2xl font-bold" [class]="app.matchScore >= 80 ? 'text-accent' : app.matchScore >= 60 ? 'text-warning' : 'text-error'">
                      {{ app.matchScore }}%
                    </div>
                    <div class="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div class="h-full rounded-full transition-all"
                           [style.width.%]="app.matchScore"
                           [class]="app.matchScore >= 80 ? 'bg-accent' : app.matchScore >= 60 ? 'bg-warning' : 'bg-error'"></div>
                    </div>
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="flex gap-2">
                @for (action of getNextActions(app.status); track action.status) {
                  <button (click)="moveApp(app, action.status)"
                    class="flex-1 h-10 rounded-xl text-sm font-semibold transition" [class]="action.class">
                    {{ action.label }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PipelineComponent implements OnInit {
  SearchIcon = Search;
  XIcon = X;

  vacancies = signal<Vacancy[]>([]);
  allApplications = signal<Application[]>([]);
  filteredApplications = signal<Application[]>([]);
  selectedApp = signal<Application | null>(null);
  selectedVacancyId = '';
  searchQuery = '';

  columns = [
    { status: 'NEW', label: 'Applied', headerColor: 'text-primary' },
    { status: 'VIEWED', label: 'Screening', headerColor: 'text-muted' },
    { status: 'SHORTLIST', label: 'Shortlisted', headerColor: 'text-warning' },
    { status: 'INTERVIEW', label: 'Interview', headerColor: 'text-indigo-600' },
    { status: 'OFFER', label: 'Offer', headerColor: 'text-coral' },
    { status: 'HIRED', label: 'Hired', headerColor: 'text-accent' },
    { status: 'REJECTED', label: 'Rejected', headerColor: 'text-error' },
  ];

  constructor(private api: ApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getVacancies(0, 100, 'ACTIVE').subscribe(r => this.vacancies.set(r.content));
    this.loadApplications();
  }

  loadApplications() {
    this.api.getApplications(this.selectedVacancyId || undefined, undefined, 0, 200).subscribe(r => {
      this.allApplications.set(r.content);
      this.filterApps();
    });
  }

  filterApps() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredApplications.set(this.allApplications());
    } else {
      this.filteredApplications.set(this.allApplications().filter(a =>
        (a.candidateName || '').toLowerCase().includes(q)
      ));
    }
  }

  getColumnApps(status: string): Application[] {
    return this.filteredApplications().filter(a => a.status === status);
  }

  getNextActions(status: string): { status: string; label: string; class: string }[] {
    const map: Record<string, { status: string; label: string; class: string }[]> = {
      'NEW': [{ status: 'VIEWED', label: 'Screen', class: 'bg-surface text-gray-700 hover:bg-border' }],
      'VIEWED': [
        { status: 'SHORTLIST', label: 'Shortlist', class: 'bg-warning/10 text-warning hover:bg-warning/20' },
        { status: 'REJECTED', label: 'Reject', class: 'bg-error/10 text-error hover:bg-error/20' },
      ],
      'SHORTLIST': [{ status: 'INVITED', label: 'Invite', class: 'bg-primary/10 text-primary hover:bg-primary/20' }],
      'INVITED': [{ status: 'INTERVIEW', label: 'Interview', class: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' }],
      'INTERVIEW': [
        { status: 'OFFER', label: 'Offer', class: 'bg-coral/10 text-coral hover:bg-coral/20' },
        { status: 'REJECTED', label: 'Reject', class: 'bg-error/10 text-error hover:bg-error/20' },
      ],
      'OFFER': [{ status: 'HIRED', label: 'Hire', class: 'bg-accent/10 text-accent hover:bg-accent/20' }],
    };
    return map[status] || [];
  }

  statusLabel(status: string): string {
    return ({ NEW: 'Applied', VIEWED: 'Screening', SHORTLIST: 'Shortlisted', INVITED: 'Invited',
              INTERVIEW: 'Interview', OFFER: 'Offer', HIRED: 'Hired', REJECTED: 'Rejected' } as Record<string, string>)[status] || status;
  }

  moveApp(app: Application, newStatus: string) {
    const prevStatus = app.status;
    app.status = newStatus as any;
    this.allApplications.update(list => [...list]);
    this.filterApps();

    this.api.changeApplicationStatus(app.id, newStatus).subscribe({
      next: () => this.loadApplications(),
      error: () => {
        app.status = prevStatus as any;
        this.allApplications.update(list => [...list]);
        this.filterApps();
      }
    });
  }

  // Keyboard shortcuts
  selectedAppIndex = signal(0);

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const apps = this.filteredApplications();
    if (!apps.length) return;
    const idx = this.selectedAppIndex();

    switch (e.key) {
      case 'j': this.selectedAppIndex.set(Math.min(idx + 1, apps.length - 1)); this.selectedApp.set(apps[this.selectedAppIndex()]); break;
      case 'k': this.selectedAppIndex.set(Math.max(idx - 1, 0)); this.selectedApp.set(apps[this.selectedAppIndex()]); break;
      case 'l': if (apps[idx]) { const next = this.getNextActions(apps[idx].status); if (next.length) this.moveApp(apps[idx], next[0].status); } break;
      case 'Escape': this.selectedApp.set(null); break;
    }
  }
}
