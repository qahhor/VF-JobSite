import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminOverview, EmployerAdminRow } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-employers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="text-sm uppercase tracking-[0.24em] text-cyan-300">{{ i18n.t('admin.companies') }}</div>
            <h1 class="mt-3 text-3xl font-semibold">{{ i18n.t('admin.company_control') }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{{ i18n.t('admin.company_control_hint') }}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.companies') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ overview()?.totalEmployers || 0 }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.pending') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ overview()?.pendingEmployers || 0 }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.verified_companies') }}</div>
              <div class="mt-2 text-2xl font-semibold">{{ overview()?.verifiedEmployers || 0 }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid gap-4 xl:grid-cols-[1fr_220px_auto]">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('common.search') }}</span>
            <input
              [(ngModel)]="search"
              (keyup.enter)="load()"
              type="text"
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950"
              [placeholder]="i18n.t('admin.search_companies')" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.moderation.status') }}</span>
            <select
              [(ngModel)]="statusFilter"
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950">
              <option value="">{{ i18n.t('filter.all') }}</option>
              <option value="PENDING">{{ i18n.t('admin.pending') }}</option>
              <option value="ACTIVE">{{ i18n.t('status.active') }}</option>
              <option value="BLOCKED">{{ i18n.t('status.blocked') }}</option>
            </select>
          </label>

          <div class="flex items-end gap-3">
            <button (click)="load()" class="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              {{ i18n.t('common.search') }}
            </button>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          @for (company of employers(); track company.id) {
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="text-lg font-semibold">{{ company.name }}</div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-medium" [class]="statusCls(company.status)">
                      {{ statusLabel(company.status) }}
                    </span>
                    @if (company.isVerified) {
                      <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                        {{ i18n.t('settings.verified') }}
                      </span>
                    }
                  </div>

                  <div class="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    @if (company.inn) { <span>INN: {{ company.inn }}</span> }
                    @if (company.city) { <span>{{ company.city }}</span> }
                    @if (company.industry) { <span>{{ company.industry }}</span> }
                    <span>{{ i18n.t('common.vacancies') }}: {{ company.activeVacancies || 0 }}</span>
                  </div>

                  @if (company.email) {
                    <div class="mt-2 text-sm text-slate-500">{{ company.email }}</div>
                  }
                </div>

                <div class="flex flex-wrap gap-2 xl:justify-end">
                  @if (!company.isVerified) {
                    <button
                      (click)="verify(company.id)"
                      class="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400">
                      {{ i18n.t('common.confirm') }}
                    </button>
                  }
                  @if (company.status === 'PENDING') {
                    <button
                      (click)="activate(company.id)"
                      class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      {{ i18n.t('admin.activate') }}
                    </button>
                  }
                  @if (company.status === 'ACTIVE') {
                    <button
                      (click)="block(company.id)"
                      class="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
                      {{ i18n.t('admin.block') }}
                    </button>
                  }
                  @if (company.status === 'BLOCKED') {
                    <button
                      (click)="activate(company.id)"
                      class="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-slate-300 hover:bg-slate-100">
                      {{ i18n.t('admin.reactivate') }}
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              {{ i18n.t('admin.no_companies') }}
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class AdminEmployersComponent implements OnInit {
  employers = signal<EmployerAdminRow[]>([]);
  overview = signal<AdminOverview | null>(null);
  statusFilter = '';
  search = '';

  constructor(
    private api: AdminApiService,
    private toast: ToastService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.api.getOverview().subscribe({ next: (overview) => this.overview.set(overview), error: () => {} });
    this.load();
  }

  load() {
    this.api.getEmployers(0, 50, this.statusFilter || undefined, this.search || undefined).subscribe({
      next: (response) => this.employers.set(response.content || []),
      error: () => this.toast.error(this.i18n.t('admin.load_failed'))
    });
  }

  verify(id: string) {
    this.api.verifyEmployer(id).subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('admin.company_verified'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  activate(id: string) {
    this.api.changeEmployerStatus(id, 'ACTIVE').subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('admin.company_activated'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  block(id: string) {
    this.api.changeEmployerStatus(id, 'BLOCKED').subscribe({
      next: () => {
        this.load();
        this.toast.success(this.i18n.t('admin.company_blocked'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  statusCls(status: string): string {
    return ({
      PENDING: 'border border-amber-400/30 bg-amber-500/10 text-amber-300',
      ACTIVE: 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
      BLOCKED: 'border border-red-400/30 bg-red-500/10 text-red-300',
    } as Record<string, string>)[status] || 'border border-slate-200 bg-white text-slate-600';
  }

  statusLabel(status: string): string {
    return ({
      PENDING: this.i18n.t('admin.pending'),
      ACTIVE: this.i18n.t('status.active'),
      BLOCKED: this.i18n.t('status.blocked'),
    } as Record<string, string>)[status] || status;
  }
}
