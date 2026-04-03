import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { Vacancy, Application, PageResponse } from '../../core/models';

@Component({
  selector: 'vjw-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      @if (vacancy(); as v) {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <a routerLink="/employer/vacancies" class="text-sm text-black hover:underline mb-1 inline-block">← {{ i18n.t('common.back_to_vacancies') }}</a>
            <h1 class="text-2xl font-bold text-gray-800">{{ v.title }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ v.category }} · {{ v.city }} · {{ v.employmentType }}</p>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/employer/vacancies', v.id, 'edit']" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{{ i18n.t('vacancy_detail.edit') }}</a>
            @if (v.status === 'DRAFT') {
              <button (click)="publish()" class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">{{ i18n.t('common.publish') }}</button>
            }
            @if (v.status === 'ACTIVE' && !v.isBranded) {
              <button (click)="promote()" class="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">⭐ TOP</button>
            }
          </div>
        </div>

        <!-- Info cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-black">{{ v.positionsFilled }}</div>
            <div class="text-xs text-gray-500">{{ v.positionsCount }} {{ i18n.t('vacancy_detail.hired_of') }}</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ applications().length }}</div>
            <div class="text-xs text-gray-500">{{ i18n.t('settings.notification.new_application') }}</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-lg font-bold text-gray-800">
              @if (v.salaryFrom) { <span>{{ formatSalary(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + formatSalary(v.salaryTo) : '+' }}</span> }
              @else { — }
            </div>
            <div class="text-xs text-gray-500">{{ i18n.t('common.salary') }} ({{ v.currency || 'UZS' }})</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <span class="text-xs px-2 py-1 rounded-full" [class]="getStatusClass(v.status)">{{ v.status }}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 class="font-semibold text-gray-800 mb-3">{{ i18n.t('common.description') }}</h3>
          <p class="text-sm text-gray-600 whitespace-pre-line">{{ v.description }}</p>
          @if (v.benefits?.length) {
            <h4 class="font-medium text-gray-700 mt-4 mb-2">{{ i18n.t('jobs.benefits') }}</h4>
            <div class="flex flex-wrap gap-2">
              @for (b of v.benefits; track b) {
                <span class="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full">{{ b }}</span>
              }
            </div>
          }
        </div>

        <!-- Applications -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-5 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">{{ i18n.t('settings.notification.new_application') }}</h3>
          </div>
          <div class="divide-y divide-gray-50">
            @for (app of applications(); track app.id) {
              <div class="px-5 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-black font-medium text-sm">
                    {{ app.candidateName?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ app.candidateName }}</div>
                    <div class="text-xs text-gray-400">{{ app.candidatePhone }} · {{ app.source }}</div>
                  </div>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full" [class]="getAppStatusClass(app.status)">{{ app.status }}</span>
              </div>
            } @empty {
              <div class="p-8 text-center text-gray-400 text-sm">{{ i18n.t('vacancy_detail.no_applications') }}</div>
            }
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center h-64 text-gray-400">{{ i18n.t('vacancy_detail.loading') }}</div>
      }
    </div>
  `,
})
export class VacancyDetailComponent implements OnInit {
  vacancy = signal<Vacancy | null>(null);
  applications = signal<Application[]>([]);

  constructor(private api: ApiService, private route: ActivatedRoute, private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.api.getVacancy(id).subscribe(v => this.vacancy.set(v));
    this.api.getApplications(id).subscribe(res => this.applications.set(res.content));
  }

  publish() {
    const v = this.vacancy();
    if (v) this.api.publishVacancy(v.id).subscribe(updated => this.vacancy.set(updated));
  }

  promote() {
    const v = this.vacancy();
    if (!v) return;
    // Use commerce endpoint for promotion
    this.http.post<any>(`${environment.apiUrl}/employer/vacancies/${v.id}/promote`, {}).subscribe({
      next: () => { (v as any).isBranded = true; this.vacancy.set({...v}); },
      error: () => {}
    });
  }

  formatSalary(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = { 'ACTIVE': 'bg-green-50 text-green-600', 'DRAFT': 'bg-gray-100 text-gray-600', 'CLOSED': 'bg-red-50 text-red-600' };
    return m[s] || 'bg-gray-100 text-gray-600';
  }

  getAppStatusClass(s: string): string {
    const m: Record<string, string> = {
      'NEW': 'bg-blue-50 text-blue-600', 'VIEWED': 'bg-gray-50 text-gray-600', 'SHORTLIST': 'bg-yellow-50 text-yellow-600',
      'HIRED': 'bg-green-50 text-green-600', 'REJECTED': 'bg-red-50 text-red-600',
    };
    return m[s] || 'bg-gray-50 text-gray-600';
  }
}
