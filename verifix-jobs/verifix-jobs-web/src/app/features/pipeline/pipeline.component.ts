import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Application, ApplicationStatus, Vacancy } from '../../core/models';

@Component({
  selector: 'vjw-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-800">ATS Pipeline</h1>
        <select [(ngModel)]="selectedVacancyId" (ngModelChange)="loadApplications()" class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white max-w-xs">
          <option value="">Barcha vakansiyalar</option>
          @for (v of vacancies(); track v.id) { <option [value]="v.id">{{ v.title }}</option> }
        </select>
      </div>

      <!-- Desktop Kanban -->
      <div class="hidden lg:flex gap-3 overflow-x-auto pb-4">
        @for (col of columns; track col.status) {
          <div class="flex-shrink-0 w-72 bg-gray-50 rounded-xl">
            <div class="p-3 border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm">{{ col.icon }}</span>
                <span class="text-sm font-medium text-gray-700">{{ col.label }}</span>
              </div>
              <span class="text-xs px-2 py-0.5 bg-white rounded-full text-gray-500">{{ getColumnApps(col.status).length }}</span>
            </div>
            <div class="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-250px)] overflow-y-auto">
              @for (app of getColumnApps(col.status); track app.id) {
                <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-black font-medium text-xs">
                      {{ app.candidateName?.charAt(0) || '?' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-gray-800 truncate">{{ app.candidateName }}</div>
                      <div class="text-xs text-gray-400 truncate">{{ app.vacancyTitle }}</div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-xs text-gray-400">
                    <span>{{ app.source }}</span>
                    <span>{{ app.appliedAt | date:'dd.MM' }}</span>
                  </div>
                  <!-- Quick actions -->
                  <div class="mt-2 pt-2 border-t border-gray-50 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    @for (action of getNextActions(col.status); track action.status) {
                      <button (click)="moveApp(app, action.status)" class="flex-1 text-xs py-1 rounded text-center transition"
                              [class]="action.class">{{ action.label }}</button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Mobile List -->
      <div class="lg:hidden space-y-3">
        @for (col of columns; track col.status) {
          @if (getColumnApps(col.status).length > 0) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
              <div class="p-3 border-b border-gray-100 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ col.icon }} {{ col.label }}</span>
                <span class="text-xs text-gray-400">{{ getColumnApps(col.status).length }}</span>
              </div>
              @for (app of getColumnApps(col.status); track app.id) {
                <div class="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-black text-xs font-medium">
                      {{ app.candidateName?.charAt(0) || '?' }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-800">{{ app.candidateName }}</div>
                      <div class="text-xs text-gray-400">{{ app.vacancyTitle }}</div>
                    </div>
                  </div>
                  @if (getNextActions(col.status).length > 0) {
                    <button (click)="moveApp(app, getNextActions(col.status)[0].status)"
                            class="text-xs px-2 py-1 bg-gray-100 text-black rounded hover:bg-gray-200">
                      {{ getNextActions(col.status)[0].label }}
                    </button>
                  }
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- Drawer for candidate detail -->
      @if (selectedApp(); as app) {
        <div class="fixed inset-0 z-50 flex justify-end">
          <div class="absolute inset-0 bg-black/30" (click)="selectedApp.set(null)"></div>
          <div class="relative w-full max-w-md bg-white shadow-xl h-full overflow-y-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold">Nomzod</h2>
                <button (click)="selectedApp.set(null)" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-black text-2xl font-bold">
                    {{ app.candidateName?.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ app.candidateName }}</h3>
                    <p class="text-sm text-gray-500">{{ app.candidatePhone }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-gray-50 rounded-lg p-3"><span class="text-gray-400 block text-xs">Status</span>{{ app.status }}</div>
                  <div class="bg-gray-50 rounded-lg p-3"><span class="text-gray-400 block text-xs">Manba</span>{{ app.source }}</div>
                  <div class="bg-gray-50 rounded-lg p-3"><span class="text-gray-400 block text-xs">Ariza sanasi</span>{{ app.appliedAt | date:'dd.MM.yyyy' }}</div>
                  <div class="bg-gray-50 rounded-lg p-3"><span class="text-gray-400 block text-xs">Vakansiya</span>{{ app.vacancyTitle }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PipelineComponent implements OnInit {
  vacancies = signal<Vacancy[]>([]);
  allApplications = signal<Application[]>([]);
  selectedApp = signal<Application | null>(null);
  selectedVacancyId = '';

  columns = [
    { status: 'NEW', label: 'Yangi', icon: '🆕' },
    { status: 'VIEWED', label: "Ko'rildi", icon: '👁' },
    { status: 'SHORTLIST', label: 'Tanlandi', icon: '⭐' },
    { status: 'INVITED', label: 'Taklif', icon: '✉️' },
    { status: 'INTERVIEW', label: 'Suhbat', icon: '🤝' },
    { status: 'OFFER', label: 'Taklif', icon: '📄' },
    { status: 'HIRED', label: 'Yollandi', icon: '✅' },
    { status: 'REJECTED', label: 'Rad', icon: '❌' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getVacancies(0, 100, 'ACTIVE').subscribe(r => this.vacancies.set(r.content));
    this.loadApplications();
  }

  loadApplications() {
    this.api.getApplications(this.selectedVacancyId || undefined, undefined, 0, 200).subscribe(r => this.allApplications.set(r.content));
  }

  getColumnApps(status: string): Application[] {
    return this.allApplications().filter(a => a.status === status);
  }

  getNextActions(status: string): { status: string; label: string; class: string }[] {
    const map: Record<string, { status: string; label: string; class: string }[]> = {
      'NEW': [{ status: 'VIEWED', label: "Ko'rish", class: 'bg-gray-100 text-gray-600 hover:bg-gray-200' }],
      'VIEWED': [
        { status: 'SHORTLIST', label: 'Tanlash', class: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
        { status: 'REJECTED', label: 'Rad', class: 'bg-red-50 text-red-600 hover:bg-red-100' },
      ],
      'SHORTLIST': [{ status: 'INVITED', label: 'Taklif', class: 'bg-purple-50 text-purple-600 hover:bg-purple-100' }],
      'INVITED': [{ status: 'INTERVIEW', label: 'Suhbat', class: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' }],
      'INTERVIEW': [
        { status: 'OFFER', label: 'Taklif', class: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
        { status: 'REJECTED', label: 'Rad', class: 'bg-red-50 text-red-600 hover:bg-red-100' },
      ],
      'OFFER': [{ status: 'HIRED', label: 'Yollash', class: 'bg-green-50 text-green-600 hover:bg-green-100' }],
    };
    return map[status] || [];
  }

  moveApp(app: Application, newStatus: string) {
    this.api.changeApplicationStatus(app.id, newStatus).subscribe(() => this.loadApplications());
  }

  // Keyboard shortcuts: J=next, K=prev, L=advance, H=reject
  selectedAppIndex = signal(0);
  flatApps(): Application[] { return this.allApplications(); }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const apps = this.flatApps();
    if (!apps.length) return;
    const idx = this.selectedAppIndex();

    switch (e.key) {
      case 'j': case 'J':
        this.selectedAppIndex.set(Math.min(idx + 1, apps.length - 1));
        this.selectedApp.set(apps[this.selectedAppIndex()]);
        break;
      case 'k': case 'K':
        this.selectedAppIndex.set(Math.max(idx - 1, 0));
        this.selectedApp.set(apps[this.selectedAppIndex()]);
        break;
      case 'l': case 'L':
        if (apps[idx]) {
          const next = this.getNextActions(apps[idx].status);
          if (next.length) this.moveApp(apps[idx], next[0].status);
        }
        break;
      case 'h': case 'H':
        if (apps[idx]) this.moveApp(apps[idx], 'REJECTED');
        break;
    }
  }
}
