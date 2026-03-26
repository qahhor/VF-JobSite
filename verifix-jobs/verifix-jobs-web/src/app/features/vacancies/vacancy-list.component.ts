import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Vacancy, PageResponse } from '../../core/models';

@Component({
  selector: 'vjw-vacancy-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-gray-800">Vakansiyalar</h1>
        <a routerLink="/employer/vacancies/new" aria-label="Yangi vakansiya"
           class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition text-center">
          + Yangi vakansiya
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
        <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="Qidirish..."
               class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-primary outline-none">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()"
                class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="">Barcha statuslar</option>
          <option value="DRAFT">Qoralama</option>
          <option value="ACTIVE">Faol</option>
          <option value="PAUSED">To'xtatilgan</option>
          <option value="CLOSED">Yopilgan</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Vakansiya</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden md:table-cell">Shahar</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden lg:table-cell">Maosh</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3 hidden sm:table-cell">Arizalar</th>
                <th class="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Amal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (v of vacancies(); track v.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-3">
                    <a [routerLink]="['/employer/vacancies', v.id]" class="text-sm font-medium text-gray-800 hover:text-black">{{ v.title }}</a>
                    <div class="text-xs text-gray-400 mt-0.5">{{ v.category }}</div>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-600 hidden md:table-cell">{{ v.city }}</td>
                  <td class="px-5 py-3 text-sm text-gray-600 hidden lg:table-cell">
                    @if (v.salaryFrom) {
                      {{ formatSalary(v.salaryFrom) }}
                      @if (v.salaryTo) { — {{ formatSalary(v.salaryTo) }} }
                      {{ v.currency }}
                    } @else { <span class="text-gray-400">—</span> }
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full" [class]="getStatusClass(v.status)">{{ getStatusLabel(v.status) }}</span>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-600 hidden sm:table-cell">{{ v.positionsFilled }}/{{ v.positionsCount }}</td>
                  <td class="px-5 py-3 text-right">
                    <a [routerLink]="['/employer/vacancies', v.id, 'edit']" class="text-sm text-black hover:underline">Tahrirlash</a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-5 py-12 text-center text-gray-400">Vakansiyalar topilmadi</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span class="text-sm text-gray-500">{{ totalElements() }} ta vakansiya</span>
            <div class="flex gap-1">
              @for (p of pages(); track p) {
                <button (click)="goToPage(p)" [class]="p === currentPage() ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                        class="w-8 h-8 rounded-lg text-sm font-medium transition">{{ p + 1 }}</button>
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

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getVacancies(this.currentPage(), 20, this.statusFilter || undefined).subscribe({
      next: (res) => {
        this.vacancies.set(res.content);
        this.totalPages.set(res.totalPages);
        this.totalElements.set(res.totalElements);
        this.pages.set(Array.from({ length: Math.min(res.totalPages, 7) }, (_, i) => i));
      }
    });
  }

  goToPage(page: number) { this.currentPage.set(page); this.load(); }
  onSearch() { this.currentPage.set(0); this.load(); }

  formatSalary(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-600', 'ACTIVE': 'bg-green-50 text-green-600',
      'PAUSED': 'bg-yellow-50 text-yellow-600', 'CLOSED': 'bg-red-50 text-red-600',
      'PENDING_MODERATION': 'bg-blue-50 text-blue-600', 'ARCHIVED': 'bg-gray-50 text-gray-400',
    };
    return m[s] || 'bg-gray-100 text-gray-600';
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = {
      'DRAFT': 'Qoralama', 'ACTIVE': 'Faol', 'PAUSED': "To'xtatilgan",
      'CLOSED': 'Yopilgan', 'PENDING_MODERATION': 'Moderatsiya', 'ARCHIVED': 'Arxiv',
    };
    return m[s] || s;
  }
}
