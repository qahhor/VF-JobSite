import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { Vacancy, Application } from '../../core/models';

@Component({
  selector: 'vjw-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      @if (vacancy(); as v) {
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <a routerLink="/employer/vacancies" class="mb-1 inline-block text-sm text-black hover:underline">
              ← {{ i18n.t('common.back') }}
            </a>
            <h1 class="text-2xl font-bold text-gray-800">{{ v.title }}</h1>
            <p class="mt-1 text-sm text-gray-500">{{ getMetaLine(v) }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a [routerLink]="['/employer/vacancies', v.id, 'edit']" class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">{{ i18n.t('vacancy_detail.edit') }}</a>
            @if (v.status === 'DRAFT') {
              <button type="button" (click)="publish()" class="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">{{ i18n.t('common.publish') }}</button>
            }
            @if (v.status === 'ACTIVE' && !v.isBranded) {
              <button type="button" (click)="promote()" class="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">{{ i18n.t('common.promote') }}</button>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-black">{{ v.positionsFilled }}</div>
            <div class="text-xs text-gray-500">{{ v.positionsCount }} {{ i18n.t('vacancy_detail.hired_of') }}</div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div class="text-2xl font-bold text-gray-800">{{ applications().length }}</div>
            <div class="text-xs text-gray-500">{{ i18n.t('settings.notification.new_application') }}</div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div class="text-lg font-bold text-gray-800">
              @if (v.salaryFrom) {
                <span>{{ formatSalary(v.salaryFrom) }}{{ v.salaryTo ? ' - ' + formatSalary(v.salaryTo) : '+' }}</span>
              } @else {
                —
              }
            </div>
            <div class="text-xs text-gray-500">{{ i18n.t('common.salary') }} ({{ v.currency || 'UZS' }})</div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <span class="rounded-full px-2 py-1 text-xs" [class]="getStatusClass(v.status)">{{ getStatusLabel(v.status) }}</span>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-400">{{ i18n.t('vacancy_detail.expiry') }}</div>
              <div class="mt-1 font-medium text-gray-700">{{ formatExpiry(v.expiresAt) }}</div>
            </div>
            <div>
              <div class="text-xs uppercase tracking-wide text-gray-400">{{ i18n.t('vacancy_detail.location') }}</div>
              <div class="mt-1 font-medium text-gray-700">{{ formatLocation(v) }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-3 font-semibold text-gray-800">{{ i18n.t('common.description') }}</h3>
          <p class="whitespace-pre-line text-sm text-gray-600">{{ v.description }}</p>
          @if (v.benefits?.length) {
            <h4 class="mb-2 mt-4 font-medium text-gray-700">{{ i18n.t('jobs.benefits') }}</h4>
            <div class="flex flex-wrap gap-2">
              @for (b of v.benefits; track b) {
                <span class="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">{{ b }}</span>
              }
            </div>
          }
        </div>

        <div class="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div class="border-b border-gray-100 p-5">
            <h3 class="font-semibold text-gray-800">{{ i18n.t('settings.notification.new_application') }}</h3>
          </div>
          <div class="divide-y divide-gray-50">
            @for (app of applications(); track app.id) {
              <div class="flex items-center justify-between px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-black">
                    {{ app.candidateName?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-800">{{ app.candidateName }}</div>
                    <div class="text-xs text-gray-400">{{ app.candidatePhone }} · {{ app.source }}</div>
                  </div>
                </div>
                <span class="rounded-full px-2 py-0.5 text-xs" [class]="getAppStatusClass(app.status)">{{ getApplicationStatusLabel(app.status) }}</span>
              </div>
            } @empty {
              <div class="p-8 text-center text-sm text-gray-400">{{ i18n.t('vacancy_detail.no_applications') }}</div>
            }
          </div>
        </div>
      } @else {
        <div class="flex h-64 items-center justify-center text-gray-400">{{ i18n.t('vacancy_detail.loading') }}</div>
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
    if (v) {
      this.api.publishVacancy(v.id).subscribe(updated => this.vacancy.set(updated));
    }
  }

  promote() {
    const v = this.vacancy();
    if (!v) return;

    this.http.post<any>(`${environment.apiUrl}/employer/vacancies/${v.id}/promote`, {}).subscribe({
      next: () => {
        (v as any).isBranded = true;
        this.vacancy.set({ ...v });
      },
      error: () => {}
    });
  }

  formatSalary(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  }

  formatExpiry(value?: string): string {
    if (!value) {
      return this.i18n.t('common.not_set');
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }

  formatLocation(v: Vacancy): string {
    if (v.latitude != null && v.longitude != null) {
      return `${v.city || this.i18n.t('common.not_set')} · ${v.latitude.toFixed(6)}, ${v.longitude.toFixed(6)}`;
    }
    return v.city || this.i18n.t('common.not_set');
  }

  getMetaLine(v: Vacancy): string {
    return [this.i18n.t(`category.${v.category}`), v.city, this.employmentLabel(v.employmentType)]
      .filter(Boolean)
      .join(' · ');
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-50 text-green-600',
      DRAFT: 'bg-gray-100 text-gray-600',
      CLOSED: 'bg-red-50 text-red-600',
      PAUSED: 'bg-yellow-50 text-yellow-600',
      PENDING_MODERATION: 'bg-blue-50 text-blue-600',
      ARCHIVED: 'bg-gray-50 text-gray-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: this.i18n.t('status.active'),
      DRAFT: this.i18n.t('status.draft'),
      CLOSED: this.i18n.t('status.closed'),
      PAUSED: this.i18n.t('status.paused'),
      PENDING_MODERATION: this.i18n.t('status.pending_moderation'),
      ARCHIVED: this.i18n.t('status.archived'),
    };
    return map[status] || status;
  }

  getAppStatusClass(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-blue-50 text-blue-600',
      VIEWED: 'bg-gray-50 text-gray-600',
      SHORTLIST: 'bg-yellow-50 text-yellow-600',
      HIRED: 'bg-green-50 text-green-600',
      REJECTED: 'bg-red-50 text-red-600',
      INTERVIEW: 'bg-purple-50 text-purple-600',
      OFFER: 'bg-emerald-50 text-emerald-600',
      INVITED: 'bg-sky-50 text-sky-600',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  }

  getApplicationStatusLabel(status: string): string {
    const key = `status.${status.toLowerCase()}`;
    const label = this.i18n.t(key);
    return label === key ? status : label;
  }

  private employmentLabel(value: string): string {
    return ({
      FULL_TIME: this.i18n.t('employment.full_time'),
      PART_TIME: this.i18n.t('employment.part_time'),
      CONTRACT: this.i18n.t('employment.contract'),
      TEMPORARY: this.i18n.t('employment.temporary'),
    } as Record<string, string>)[value] || value;
  }
}
