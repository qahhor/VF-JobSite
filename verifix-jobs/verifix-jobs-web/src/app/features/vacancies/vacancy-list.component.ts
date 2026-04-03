import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Vacancy } from '../../core/models';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-vacancy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 class="text-2xl font-bold text-gray-800">{{ i18n.t('vacancy.list.title') }}</h1>
        <a routerLink="/employer/vacancies/new" [attr.aria-label]="i18n.t('employer.page.new_vacancy')"
           class="rounded-lg bg-black px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800">
          {{ i18n.t('vacancy.list.new') }}
        </a>
      </div>

      <div class="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" [placeholder]="i18n.t('vacancy.list.search_placeholder')"
               class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-black/20">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()"
                class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">{{ i18n.t('vacancy.list.all_statuses') }}</option>
          <option value="DRAFT">{{ i18n.t('status.draft') }}</option>
          <option value="ACTIVE">{{ i18n.t('status.active') }}</option>
          <option value="PAUSED">{{ i18n.t('status.paused') }}</option>
          <option value="CLOSED">{{ i18n.t('status.closed') }}</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-100 bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('vacancy.list.title') }}</th>
                <th class="hidden px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">{{ i18n.t('vacancy.list.city') }}</th>
                <th class="hidden px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 lg:table-cell">{{ i18n.t('vacancy.list.salary') }}</th>
                <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('vacancy.list.status') }}</th>
                <th class="hidden px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 sm:table-cell">{{ i18n.t('vacancy.list.applications') }}</th>
                <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">{{ i18n.t('vacancy.list.action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (v of vacancies(); track v.id) {
                <tr class="transition-colors hover:bg-gray-50">
                  <td class="px-5 py-3">
                    <a [routerLink]="['/employer/vacancies', v.id]" class="text-sm font-medium text-gray-800 hover:text-black">{{ v.title }}</a>
                    <div class="mt-0.5 text-xs text-gray-400">{{ v.category }}</div>
                  </td>
                  <td class="hidden px-5 py-3 text-sm text-gray-600 md:table-cell">{{ v.city }}</td>
                  <td class="hidden px-5 py-3 text-sm text-gray-600 lg:table-cell">
                    @if (v.salaryFrom) {
                      {{ formatSalary(v.salaryFrom) }}
                      @if (v.salaryTo) { - {{ formatSalary(v.salaryTo) }} }
                      {{ v.currency }}
                    } @else {
                      <span class="text-gray-400">-</span>
                    }
                  </td>
                  <td class="px-5 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs" [class]="getStatusClass(v.status)">{{ getStatusLabel(v.status) }}</span>
                  </td>
                  <td class="hidden px-5 py-3 text-sm text-gray-600 sm:table-cell">{{ v.positionsFilled }}/{{ v.positionsCount }}</td>
                  <td class="flex items-center justify-end gap-2 px-5 py-3 text-right">
                    <button (click)="bump(v.id)" class="rounded border border-gray-200 px-2 py-1 text-xs transition hover:bg-gray-50" [title]="i18n.t('vacancy.list.bump')">↑</button>
                    <a [routerLink]="['/employer/vacancies', v.id, 'edit']" class="text-sm text-black hover:underline">{{ i18n.t('vacancy.list.edit') }}</a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-5 py-12 text-center text-gray-400">{{ i18n.t('vacancy.list.no_results') }}</td></tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <span class="text-sm text-gray-500">{{ totalElements() }} {{ i18n.t('vacancy.list.total_results') }}</span>
            <div class="flex gap-1">
              @for (p of pages(); track p) {
                <button (click)="goToPage(p)" [class]="p === currentPage() ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                        class="h-8 w-8 rounded-lg text-sm font-medium transition">{{ p + 1 }}</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class VacancyListComponent implements OnInit {
  vacancies = signal<Vacancy[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pages = signal<number[]>([]);
  statusFilter = '';
  search = '';

  constructor(private api: ApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getVacancies(this.currentPage(), 20, this.statusFilter || undefined).subscribe({
      next: res => {
        this.vacancies.set(res.content);
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
    this.load();
  }

  formatSalary(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      ACTIVE: 'bg-green-50 text-green-600',
      PAUSED: 'bg-yellow-50 text-yellow-600',
      CLOSED: 'bg-red-50 text-red-600',
      PENDING_MODERATION: 'bg-blue-50 text-blue-600',
      ARCHIVED: 'bg-gray-50 text-gray-400',
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
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
    this.api.publishVacancy(id).subscribe({ next: () => this.load(), error: () => {} });
  }
}
