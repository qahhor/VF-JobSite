import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Vacancy } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, Plus, MoreVertical } from 'lucide-angular';

@Component({
  selector: 'vjw-vacancy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-title font-semibold text-gray-900">Vacancies</h1>
          <div class="mt-1 text-sm text-muted">
            {{ countByStatus('ACTIVE') }} active, {{ countByStatus('DRAFT') }} draft, {{ countByStatus('CLOSED') + countByStatus('ARCHIVED') }} archived
          </div>
        </div>
        <a routerLink="/employer/vacancies/new"
           class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 shadow-card">
          <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
          Create New Vacancy
        </a>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()"
          placeholder="Search by title or ID..."
          class="flex-1 h-10 rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary">
        <div class="flex gap-2">
          <select [(ngModel)]="statusFilter" (ngModelChange)="load()"
            class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
            <option value="">{{ i18n.t('vacancy.list.all_statuses') }}</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_MODERATION">Under Review</option>
            <option value="ACTIVE">Published</option>
            <option value="PAUSED">Paused</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left">
                <th (click)="sort('title')" class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted cursor-pointer hover:text-gray-700 select-none">Title {{ sortIcon('title') }}</th>
                <th class="hidden px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted md:table-cell">Department</th>
                <th (click)="sort('city')" class="hidden px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted lg:table-cell cursor-pointer hover:text-gray-700 select-none">Location {{ sortIcon('city') }}</th>
                <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Status</th>
                <th (click)="sort('positionsFilled')" class="hidden px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted text-center sm:table-cell cursor-pointer hover:text-gray-700 select-none">Applications {{ sortIcon('positionsFilled') }}</th>
                <th class="hidden px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted text-center xl:table-cell">Views</th>
                <th class="hidden px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted lg:table-cell">Published</th>
                <th class="px-5 py-3 text-right text-caption font-medium uppercase tracking-wider text-muted"></th>
              </tr>
            </thead>
            <tbody>
              @for (v of vacancies(); track v.id) {
                <tr class="border-b border-border/50 transition hover:bg-surface/50">
                  <td class="px-5 py-3.5">
                    <a [routerLink]="['/employer/vacancies', v.id]" class="font-medium text-gray-900 hover:text-primary">{{ v.title }}</a>
                    <div class="mt-0.5 text-[11px] text-muted font-mono">{{ v.category || '—' }}</div>
                  </td>
                  <td class="hidden px-5 py-3.5 text-muted md:table-cell">{{ v.category || '—' }}</td>
                  <td class="hidden px-5 py-3.5 text-muted lg:table-cell">{{ v.city || '—' }}</td>
                  <td class="px-5 py-3.5">
                    <span class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold" [class]="getStatusClass(v.status)">
                      {{ getStatusLabel(v.status) }}
                    </span>
                  </td>
                  <td class="hidden px-5 py-3.5 text-center sm:table-cell">
                    <span class="font-semibold text-primary">{{ v.positionsFilled || 0 }}</span>
                  </td>
                  <td class="hidden px-5 py-3.5 text-center text-muted xl:table-cell">{{ v.viewsCount || 0 }}</td>
                  <td class="hidden px-5 py-3.5 text-muted lg:table-cell">{{ v.createdAt | date:'yyyy-MM-dd' }}</td>
                  <td class="px-5 py-3.5 text-right">
                    <div class="relative inline-block">
                      <button (click)="toggleMenu(v.id)" class="rounded-md p-1.5 text-muted hover:bg-surface hover:text-gray-700 transition">
                        <lucide-icon [img]="MoreVertIcon" [size]="16"></lucide-icon>
                      </button>
                      @if (openMenuId() === v.id) {
                        <div class="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-border bg-white py-1 shadow-dropdown">
                          <a [routerLink]="['/employer/vacancies', v.id, 'edit']" class="block px-3 py-1.5 text-xs hover:bg-surface transition">Edit</a>
                          @if (v.status === 'DRAFT') {
                            <button (click)="publish(v.id)" class="w-full text-left px-3 py-1.5 text-xs hover:bg-surface transition">Publish</button>
                          }
                          @if (v.status === 'ACTIVE') {
                            <button (click)="bump(v.id)" class="w-full text-left px-3 py-1.5 text-xs hover:bg-surface transition">Bump</button>
                          }
                          <button class="w-full text-left px-3 py-1.5 text-xs hover:bg-surface transition">Duplicate</button>
                          <button class="w-full text-left px-3 py-1.5 text-xs text-error hover:bg-error/5 transition">Archive</button>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="px-5 py-16 text-center text-muted">{{ i18n.t('vacancy.list.no_results') }}</td></tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="flex items-center justify-between border-t border-border px-5 py-3">
            <span class="text-xs text-muted">{{ totalElements() }} total</span>
            <div class="flex gap-1">
              @for (p of pages(); track p) {
                <button (click)="goToPage(p)"
                  class="h-8 w-8 rounded-lg text-xs font-medium transition"
                  [class]="p === currentPage() ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-border'">
                  {{ p + 1 }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class VacancyListComponent implements OnInit {
  PlusIcon = Plus;
  MoreVertIcon = MoreVertical;

  vacancies = signal<Vacancy[]>([]);
  allVacancies = signal<Vacancy[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pages = signal<number[]>([]);
  openMenuId = signal<string | null>(null);
  statusFilter = '';
  search = '';
  sortField = '';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(private api: ApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getVacancies(this.currentPage(), 20, this.statusFilter || undefined).subscribe({
      next: res => {
        this.allVacancies.set(res.content);
        this.vacancies.set(this.applySearch(res.content));
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.pages.set(Array.from({ length: Math.min(res.totalPages, 7) }, (_, i) => i));
      }
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.load();
  }

  onSearch() {
    this.currentPage.set(0);
    this.vacancies.set(this.applySearch(this.allVacancies()));
  }

  formatSalary(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.vacancies.update(list => [...list].sort((a: any, b: any) => {
      const va = a[field] ?? '';
      const vb = b[field] ?? '';
      if (typeof va === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    }));
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return '';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  toggleMenu(id: string) {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  countByStatus(status: string): number {
    return this.allVacancies().filter(v => v.status === status).length;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      DRAFT: 'border border-slate-200 bg-slate-50 text-slate-600',
      ACTIVE: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
      PAUSED: 'border border-amber-200 bg-amber-50 text-amber-700',
      CLOSED: 'border border-red-200 bg-red-50 text-red-600',
      PENDING_MODERATION: 'border border-blue-200 bg-blue-50 text-blue-600',
      ARCHIVED: 'border border-slate-200 bg-slate-50 text-slate-400',
    };
    return classes[status] || 'border border-slate-200 bg-slate-50 text-slate-600';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: this.i18n.t('status.draft'),
      ACTIVE: this.i18n.t('status.active'),
      PAUSED: this.i18n.t('status.paused'),
      CLOSED: this.i18n.t('status.closed'),
      PENDING_MODERATION: this.i18n.t('status.pending_moderation'),
      ARCHIVED: this.i18n.t('status.archived'),
    };
    return labels[status] || status;
  }

  bump(id: string) {
    this.api.bumpVacancy(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  publish(id: string) {
    this.api.publishVacancy(id).subscribe({ next: () => this.load(), error: () => {} });
  }

  private applySearch(items: Vacancy[]): Vacancy[] {
    const query = this.search.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter(v => [v.title, v.category, v.city]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query));
  }
}
