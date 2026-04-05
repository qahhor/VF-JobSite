import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminOverview, EmployerAdminRow, EmployerDetailResponse, RefCity, RefRegion } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-employers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Header + Stats -->
      <section class="rounded-2xl border border-border bg-white p-4 shadow-card">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="text-[11px] uppercase tracking-[0.2em] text-primary">{{ i18n.t('admin.companies') }}</div>
            <h1 class="mt-1 text-xl font-semibold">{{ i18n.t('admin.company_control') }}</h1>
          </div>
          <div class="flex gap-2">
            <div class="rounded-xl border border-border bg-surface px-3 py-2 text-center min-w-[80px]">
              <div class="text-[10px] uppercase tracking-wider text-muted">{{ i18n.t('admin.companies') }}</div>
              <div class="text-lg font-semibold">{{ overview()?.totalEmployers || 0 }}</div>
            </div>
            <div class="rounded-xl border border-border bg-surface px-3 py-2 text-center min-w-[80px]">
              <div class="text-[10px] uppercase tracking-wider text-muted">{{ i18n.t('admin.pending') }}</div>
              <div class="text-lg font-semibold">{{ overview()?.pendingEmployers || 0 }}</div>
            </div>
            <div class="rounded-xl border border-border bg-surface px-3 py-2 text-center min-w-[80px]">
              <div class="text-[10px] uppercase tracking-wider text-muted">{{ i18n.t('settings.verified') }}</div>
              <div class="text-lg font-semibold">{{ overview()?.verifiedEmployers || 0 }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Search + Filters + Actions -->
      <section class="rounded-2xl border border-border bg-white p-4 shadow-card">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div class="flex-1">
            <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('common.search') }}</label>
            <input
              [(ngModel)]="search"
              (keyup.enter)="load()"
              type="text"
              class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition focus:border-slate-950"
              [placeholder]="i18n.t('admin.search_companies')" />
          </div>
          <div class="w-full lg:w-48">
            <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('admin.moderation.status') }}</label>
            <select
              [(ngModel)]="statusFilter"
              class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition focus:border-slate-950">
              <option value="">{{ i18n.t('filter.all') }}</option>
              <option value="PENDING">{{ i18n.t('admin.pending') }}</option>
              <option value="ACTIVE">{{ i18n.t('status.active') }}</option>
              <option value="BLOCKED">{{ i18n.t('status.blocked') }}</option>
              <option value="SUSPENDED">{{ i18n.t('status.SUSPENDED') }}</option>
              <option value="INACTIVE">{{ i18n.t('status.INACTIVE') }}</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button (click)="load()" class="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-600">
              {{ i18n.t('common.search') }}
            </button>
            <button (click)="openCreate()" class="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-600">
              + {{ i18n.t('common.add') }}
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                <th class="pb-2 pr-3 font-medium">{{ i18n.t('employer.company') }}</th>
                <th class="pb-2 pr-3 font-medium">INN</th>
                <th class="pb-2 pr-3 font-medium">{{ i18n.t('employer.city') }}</th>
                <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.moderation.status') }}</th>
                <th class="pb-2 pr-3 font-medium text-center">{{ i18n.t('common.vacancies') }}</th>
                <th class="pb-2 font-medium text-right">{{ i18n.t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (company of employers(); track company.id) {
                <tr class="border-b border-border/50 hover:bg-surface/50 transition">
                  <td class="py-2.5 pr-3">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-slate-900">{{ company.name }}</span>
                      @if (company.isVerified) {
                        <svg class="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
                        </svg>
                      }
                    </div>
                    @if (company.email) {
                      <div class="text-xs text-muted">{{ company.email }}</div>
                    }
                  </td>
                  <td class="py-2.5 pr-3 text-muted">{{ company.inn || '—' }}</td>
                  <td class="py-2.5 pr-3 text-muted">{{ company.city || '—' }}</td>
                  <td class="py-2.5 pr-3">
                    <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" [class]="statusCls(company.status)">
                      {{ statusLabel(company.status) }}
                    </span>
                  </td>
                  <td class="py-2.5 pr-3 text-center text-muted">{{ company.activeVacancies || 0 }}</td>
                  <td class="py-2.5 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <!-- View -->
                      <button (click)="openDetail(company.id)" title="Просмотр"
                        class="rounded-md p-1.5 text-muted transition hover:bg-slate-100 hover:text-slate-700">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <!-- Edit -->
                      <button (click)="openEdit(company.id)" title="Редактировать"
                        class="rounded-md p-1.5 text-muted transition hover:bg-slate-100 hover:text-slate-700">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <!-- Verify (if not verified) -->
                      @if (!company.isVerified) {
                        <button (click)="verify(company.id)" title="Верифицировать"
                          class="rounded-md p-1.5 text-emerald-400 transition hover:bg-emerald-50 hover:text-emerald-600">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                      }
                      <!-- Activate (if PENDING or BLOCKED or SUSPENDED or INACTIVE) -->
                      @if (company.status !== 'ACTIVE') {
                        <button (click)="activate(company.id)" title="Активировать"
                          class="rounded-md p-1.5 text-blue-400 transition hover:bg-blue-50 hover:text-blue-600">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7"/>
                          </svg>
                        </button>
                      }
                      <!-- Block (if ACTIVE or PENDING) -->
                      @if (company.status === 'ACTIVE' || company.status === 'PENDING') {
                        <button (click)="openBlockModal(company.id)" title="Заблокировать"
                          class="rounded-md p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                          </svg>
                        </button>
                      }
                      <!-- Delete (only if no active vacancies) -->
                      @if ((company.activeVacancies || 0) === 0) {
                        <button (click)="confirmDelete(company)" title="Удалить"
                          class="rounded-md p-1.5 text-red-300 transition hover:bg-red-50 hover:text-red-500">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-8 text-center text-sm text-muted">{{ i18n.t('admin.no_companies') }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
            <span class="text-xs text-muted">{{ i18n.t('common.page') }} {{ currentPage() + 1 }} / {{ totalPages() }}</span>
            <div class="flex gap-1">
              <button [disabled]="currentPage() === 0" (click)="goToPage(currentPage() - 1)"
                class="rounded-md border border-border px-2.5 py-1 text-xs transition hover:bg-surface disabled:opacity-40">
                ←
              </button>
              <button [disabled]="currentPage() >= totalPages() - 1" (click)="goToPage(currentPage() + 1)"
                class="rounded-md border border-border px-2.5 py-1 text-xs transition hover:bg-surface disabled:opacity-40">
                →
              </button>
            </div>
          </div>
        }
      </section>
    </div>

    <!-- ═══ Detail Modal ═══ -->
    @if (detailEmployer()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="detailEmployer.set(null)">
        <div class="relative mx-4 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" (click)="$event.stopPropagation()">
          <button (click)="detailEmployer.set(null)" class="absolute right-3 top-3 rounded-md p-1 text-muted hover:text-slate-700">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          @if (detailEmployer(); as emp) {
            <!-- Title + badges -->
            <h2 class="pr-8 text-lg font-semibold">{{ emp.name }}</h2>
            @if (emp.slug) {
              <div class="mt-0.5 text-xs text-muted">/companies/{{ emp.slug }}</div>
            }
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" [class]="statusCls(emp.status)">{{ statusLabel(emp.status) }}</span>
              @if (emp.isVerified) {
                <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">✓ {{ i18n.t('settings.verified') }}</span>
              } @else {
                <span class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">{{ i18n.t('admin.pending') }}</span>
              }
            </div>

            <!-- Lifecycle block (only when relevant) -->
            @if (emp.verifiedAt || emp.deactivatedAt) {
              <div class="mt-3 rounded-xl border border-border bg-surface px-3 py-2 text-xs space-y-1">
                @if (emp.verifiedAt) {
                  <div class="flex items-center gap-2 text-emerald-700">
                    <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>{{ i18n.t('admin.verified_at') }}: {{ emp.verifiedAt | date:'dd.MM.yyyy HH:mm' }}</span>
                  </div>
                }
                @if (emp.deactivatedAt) {
                  <div class="flex items-center gap-2 text-red-600">
                    <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>{{ i18n.t('admin.deactivated_at') }}: {{ emp.deactivatedAt | date:'dd.MM.yyyy HH:mm' }}</span>
                  </div>
                  @if (emp.deactivationReason) {
                    <div class="ml-5 text-muted italic">"{{ emp.deactivationReason }}"</div>
                  }
                }
              </div>
            }

            <!-- Vacancy metrics -->
            <div class="mt-3 grid grid-cols-2 gap-2">
              <div class="rounded-xl border border-border bg-surface px-3 py-2 text-center">
                <div class="text-[10px] uppercase tracking-wider text-muted">{{ i18n.t('admin.active_vacancies') }}</div>
                <div class="text-xl font-bold text-emerald-600">{{ emp.activeVacancies }}</div>
              </div>
              <div class="rounded-xl border border-border bg-surface px-3 py-2 text-center">
                <div class="text-[10px] uppercase tracking-wider text-muted">{{ i18n.t('admin.total_vacancies') }}</div>
                <div class="text-xl font-bold text-slate-700">{{ emp.totalVacancies }}</div>
              </div>
            </div>

            <!-- Details grid -->
            <div class="mt-4 space-y-2 text-sm">
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">INN:</span>
                <span>{{ emp.inn || '—' }}</span>
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.legal_name') }}:</span>
                <span>{{ emp.legalName || '—' }}</span>
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.industry') }}:</span>
                <span>{{ emp.industry || '—' }}</span>
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.city') }}:</span>
                <span>{{ emp.city || '—' }}{{ emp.region ? ', ' + emp.region : '' }}</span>
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.website') }}:</span>
                @if (emp.websiteUrl) {
                  <a [href]="emp.websiteUrl" target="_blank" class="text-cyan-600 hover:underline truncate">{{ emp.websiteUrl }}</a>
                } @else {
                  <span>—</span>
                }
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.employees') }}:</span>
                <span>{{ emp.employeeCountRange || '—' }}</span>
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.founded') }}:</span>
                <span>{{ emp.foundedYear || '—' }}</span>
              </div>
              <div class="grid grid-cols-[130px_1fr] gap-1">
                <span class="text-muted">{{ i18n.t('employer.subscription') }}:</span>
                <span>{{ emp.subscriptionPlan || 'FREE' }}</span>
              </div>
              @if (emp.description) {
                <div class="grid grid-cols-[130px_1fr] gap-1">
                  <span class="text-muted">{{ i18n.t('employer.description') }}:</span>
                  <span class="whitespace-pre-line">{{ emp.description }}</span>
                </div>
              }
              <div class="grid grid-cols-[130px_1fr] gap-1 pt-1 border-t border-border/50">
                <span class="text-muted">{{ i18n.t('common.created') }}:</span>
                <span>{{ emp.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
              </div>
              @if (emp.updatedAt) {
                <div class="grid grid-cols-[130px_1fr] gap-1">
                  <span class="text-muted">{{ i18n.t('common.updated') }}:</span>
                  <span>{{ emp.updatedAt | date:'dd.MM.yyyy HH:mm' }}</span>
                </div>
              }
            </div>

            <div class="mt-4 flex gap-2">
              <button (click)="detailEmployer.set(null); openEdit(emp.id)" class="h-8 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-600">
                {{ i18n.t('common.edit') }}
              </button>
              <button (click)="detailEmployer.set(null)" class="h-8 rounded-lg border border-border px-4 text-xs font-semibold transition hover:bg-surface">
                {{ i18n.t('common.close') }}
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- ═══ Create/Edit Modal ═══ -->
    @if (showForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="showForm.set(false)">
        <div class="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" (click)="$event.stopPropagation()">
          <button (click)="showForm.set(false)" class="absolute right-3 top-3 rounded-md p-1 text-muted hover:text-slate-700">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <h2 class="text-lg font-semibold">
            {{ editingId() ? i18n.t('common.edit') : i18n.t('common.add') }} {{ i18n.t('employer.company').toLowerCase() }}
          </h2>

          <div class="mt-4 space-y-3">
            <!-- Name (required) -->
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.company_name') }} *</label>
              <input [(ngModel)]="formData.name" type="text"
                class="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-slate-950" />
            </div>

            <!-- INN + Legal name -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">INN</label>
                <input [(ngModel)]="formData.inn" type="text"
                  class="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-slate-950" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.legal_name') }}</label>
                <input [(ngModel)]="formData.legalName" type="text"
                  class="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-slate-950" />
              </div>
            </div>

            <!-- Region + City -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.region') }}</label>
                <select [(ngModel)]="formData.region" (ngModelChange)="onRegionChange()"
                  class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-slate-950">
                  <option value="">—</option>
                  @for (r of regions(); track r.id) {
                    <option [value]="r.fullCode">{{ i18n.lang() === 'ru' ? r.nameRu : r.nameUzLat }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.city') }}</label>
                <select [(ngModel)]="formData.city"
                  class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-slate-950">
                  <option value="">—</option>
                  @for (c of filteredCities(); track c.id) {
                    <option [value]="i18n.lang() === 'ru' ? c.nameRu : c.nameUzLat">{{ i18n.lang() === 'ru' ? c.nameRu : c.nameUzLat }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Industry -->
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.industry') }}</label>
              <select [(ngModel)]="formData.industry"
                class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-slate-950">
                <option value="">—</option>
                @for (ind of industries; track ind) {
                  <option [value]="ind">{{ i18n.t('industry.' + ind) }}</option>
                }
              </select>
            </div>

            <!-- Website -->
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.website') }}</label>
              <input [(ngModel)]="formData.websiteUrl" type="url"
                class="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-slate-950" />
            </div>

            <!-- Employees + Founded -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.employees') }}</label>
                <select [(ngModel)]="formData.employeeCountRange"
                  class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-slate-950">
                  <option value="">—</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.founded') }}</label>
                <input [(ngModel)]="formData.foundedYear" type="number" min="1900" max="2026"
                  class="h-9 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-slate-950" />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('employer.description') }}</label>
              <textarea [(ngModel)]="formData.description" rows="3"
                class="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-slate-950"></textarea>
            </div>

            <!-- ── Admin-only fields ── -->
            <div class="rounded-xl border border-border bg-surface p-3 space-y-3">
              <div class="text-[10px] uppercase tracking-wider text-muted font-medium">{{ i18n.t('admin.moderation.status') }}</div>

              <!-- Status select -->
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('admin.moderation.status') }}</label>
                <select [(ngModel)]="formData.status"
                  class="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-slate-950">
                  <option value="">— {{ i18n.t('filter.all') }}</option>
                  <option value="PENDING">{{ i18n.t('admin.pending') }}</option>
                  <option value="ACTIVE">{{ i18n.t('status.active') }}</option>
                  <option value="BLOCKED">{{ i18n.t('status.blocked') }}</option>
                  <option value="SUSPENDED">{{ i18n.t('status.SUSPENDED') }}</option>
                  <option value="INACTIVE">{{ i18n.t('status.INACTIVE') }}</option>
                </select>
              </div>

              <!-- isVerified checkbox -->
              <label class="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" [(ngModel)]="formData.isVerified"
                  class="h-4 w-4 rounded border-border accent-emerald-500" />
                <span>{{ i18n.t('settings.verified') }}</span>
              </label>

              <!-- Deactivation reason (only for deactivated statuses) -->
              @if (isDeactivatedStatus()) {
                <div>
                  <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('admin.deactivation_reason') }}</label>
                  <textarea [(ngModel)]="formData.deactivationReason" rows="2"
                    [placeholder]="i18n.t('admin.block_reason_placeholder')"
                    class="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-slate-950"></textarea>
                </div>
              }
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button (click)="saveForm()" [disabled]="!formData.name"
              class="h-8 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-600 disabled:opacity-40">
              {{ i18n.t('common.save') }}
            </button>
            <button (click)="showForm.set(false)"
              class="h-8 rounded-lg border border-border px-4 text-xs font-semibold transition hover:bg-surface">
              {{ i18n.t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ═══ Block Reason Modal ═══ -->
    @if (blockTargetId()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="blockTargetId.set(null)">
        <div class="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-semibold">{{ i18n.t('admin.confirm_block') }}</h3>
          <p class="mt-1 text-sm text-muted">{{ i18n.t('admin.confirm_block_msg') }}</p>
          <div class="mt-3">
            <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('admin.block_reason') }}</label>
            <textarea [(ngModel)]="blockReason" rows="2"
              [placeholder]="i18n.t('admin.block_reason_placeholder')"
              class="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-slate-950"></textarea>
          </div>
          <div class="mt-4 flex gap-2">
            <button (click)="doBlock()" class="h-8 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-400">
              {{ i18n.t('admin.block') }}
            </button>
            <button (click)="blockTargetId.set(null)" class="h-8 rounded-lg border border-border px-4 text-xs font-semibold transition hover:bg-surface">
              {{ i18n.t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ═══ Delete Confirmation ═══ -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="deleteTarget.set(null)">
        <div class="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-semibold">{{ i18n.t('common.confirm_delete') }}</h3>
          <p class="mt-2 text-sm text-muted">
            {{ i18n.t('admin.delete_employer_confirm') }} <strong>{{ deleteTarget()?.name }}</strong>?
          </p>
          <div class="mt-4 flex gap-2">
            <button (click)="doDelete()" class="h-8 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-400">
              {{ i18n.t('common.delete') }}
            </button>
            <button (click)="deleteTarget.set(null)" class="h-8 rounded-lg border border-border px-4 text-xs font-semibold transition hover:bg-surface">
              {{ i18n.t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminEmployersComponent implements OnInit {
  employers = signal<EmployerAdminRow[]>([]);
  overview = signal<AdminOverview | null>(null);
  detailEmployer = signal<EmployerDetailResponse | null>(null);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteTarget = signal<EmployerAdminRow | null>(null);
  blockTargetId = signal<string | null>(null);
  currentPage = signal(0);
  totalPages = signal(0);
  regions = signal<RefRegion[]>([]);
  filteredCities = signal<RefCity[]>([]);
  statusFilter = '';
  search = '';
  pageSize = 20;
  blockReason = '';

  readonly DEACTIVATED_STATUSES = new Set(['BLOCKED', 'SUSPENDED', 'INACTIVE']);

  industries = ['FOOD', 'TRANSPORT', 'CONSTRUCTION', 'RETAIL', 'SERVICES', 'MANUFACTURING', 'IT', 'EDUCATION', 'HEALTHCARE'];
  formData: EmployerFormData = this.emptyForm();

  get isDeactivatedStatus(): boolean {
    return this.DEACTIVATED_STATUSES.has(this.formData.status || '');
  }

  constructor(
    private api: AdminApiService,
    private toast: ToastService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.api.getOverview().subscribe({ next: (o) => this.overview.set(o), error: () => {} });
    this.api.getRegionsByCountry('UZ').subscribe({
      next: (list) => this.regions.set(list),
      error: () => {}
    });
    this.load();
  }

  onRegionChange() {
    this.formData.city = '';
    const region = this.formData.region;
    if (region) {
      this.api.getCitiesByCountry('UZ', region).subscribe({
        next: (list) => this.filteredCities.set(list),
        error: () => this.filteredCities.set([])
      });
    } else {
      this.filteredCities.set([]);
    }
  }

  load() {
    this.api.getEmployers(this.currentPage(), this.pageSize, this.statusFilter || undefined, this.search || undefined).subscribe({
      next: (response) => {
        this.employers.set(response.content || []);
        this.totalPages.set(response.totalPages || 0);
      },
      error: () => this.toast.error(this.i18n.t('admin.load_failed'))
    });
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.load();
  }

  // ── Detail ──
  openDetail(id: string) {
    this.api.getEmployerDetail(id).subscribe({
      next: (emp) => this.detailEmployer.set(emp),
      error: () => this.toast.error(this.i18n.t('admin.load_failed'))
    });
  }

  // ── Create / Edit ──
  openCreate() {
    this.editingId.set(null);
    this.formData = this.emptyForm();
    this.filteredCities.set([]);
    this.showForm.set(true);
  }

  openEdit(id: string) {
    this.api.getEmployerDetail(id).subscribe({
      next: (emp) => {
        this.editingId.set(id);
        this.formData = {
          name: emp.name || '',
          inn: emp.inn || '',
          legalName: emp.legalName || '',
          city: emp.city || '',
          region: emp.region || '',
          industry: emp.industry || '',
          websiteUrl: emp.websiteUrl || '',
          employeeCountRange: emp.employeeCountRange || '',
          foundedYear: emp.foundedYear || null,
          description: emp.description || '',
          status: emp.status || '',
          isVerified: !!emp.isVerified,
          deactivationReason: emp.deactivationReason || '',
        };
        // Load cities for the pre-selected region without clearing the city field
        if (emp.region) {
          this.api.getCitiesByCountry('UZ', emp.region).subscribe({
            next: (list) => this.filteredCities.set(list),
            error: () => this.filteredCities.set([])
          });
        } else {
          this.filteredCities.set([]);
        }
        this.showForm.set(true);
      },
      error: () => this.toast.error(this.i18n.t('admin.load_failed'))
    });
  }

  saveForm() {
    if (!this.formData.name) return;
    const payload = { ...this.formData };
    // Send null for empty status so backend uses default
    if (!payload.status) delete (payload as any).status;
    if (!payload.deactivationReason) delete (payload as any).deactivationReason;
    const isEdit = !!this.editingId();
    const obs = isEdit
      ? this.api.updateEmployer(this.editingId()!, payload)
      : this.api.createEmployer(payload);

    obs.subscribe({
      next: () => {
        const successKey = isEdit ? this.i18n.t('admin.company_updated') : this.i18n.t('admin.company_created');
        this.showForm.set(false);
        this.editingId.set(null);
        this.filteredCities.set([]);
        this.load();
        this.toast.success(successKey);
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  // ── Delete ──
  confirmDelete(company: EmployerAdminRow) {
    this.deleteTarget.set(company);
  }

  doDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.api.deleteEmployer(target.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.toast.success(this.i18n.t('admin.company_deleted'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  // ── Status Actions ──
  verify(id: string) {
    this.api.verifyEmployer(id).subscribe({
      next: () => { this.load(); this.toast.success(this.i18n.t('admin.company_verified')); },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  activate(id: string) {
    this.api.changeEmployerStatus(id, 'ACTIVE').subscribe({
      next: () => { this.load(); this.toast.success(this.i18n.t('admin.company_activated')); },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  openBlockModal(id: string) {
    this.blockTargetId.set(id);
    this.blockReason = '';
  }

  doBlock() {
    const id = this.blockTargetId();
    if (!id) return;
    this.api.changeEmployerStatus(id, 'BLOCKED', this.blockReason || undefined).subscribe({
      next: () => {
        this.blockTargetId.set(null);
        this.blockReason = '';
        this.load();
        this.toast.success(this.i18n.t('admin.company_blocked'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  // ── Helpers ──
  statusCls(status: string): string {
    return ({
      PENDING:   'border border-amber-400/30 bg-amber-500/10 text-amber-600',
      ACTIVE:    'border border-emerald-400/30 bg-emerald-500/10 text-emerald-600',
      BLOCKED:   'border border-red-400/30 bg-red-500/10 text-red-600',
      SUSPENDED: 'border border-orange-400/30 bg-orange-500/10 text-orange-600',
      INACTIVE:  'border border-border bg-slate-100 text-muted',
    } as Record<string, string>)[status] || 'border border-border bg-white text-slate-600';
  }

  statusLabel(status: string): string {
    return ({
      PENDING:   this.i18n.t('admin.pending'),
      ACTIVE:    this.i18n.t('status.active'),
      BLOCKED:   this.i18n.t('status.blocked'),
      SUSPENDED: this.i18n.t('status.SUSPENDED'),
      INACTIVE:  this.i18n.t('status.INACTIVE'),
    } as Record<string, string>)[status] || status;
  }

  private emptyForm(): EmployerFormData {
    return {
      name: '', inn: '', legalName: '', city: '', region: '',
      industry: '', websiteUrl: '', employeeCountRange: '',
      foundedYear: null, description: '',
      status: '', isVerified: false, deactivationReason: '',
    };
  }
}

interface EmployerFormData {
  name: string;
  inn: string;
  legalName: string;
  city: string;
  region: string;
  industry: string;
  websiteUrl: string;
  employeeCountRange: string;
  foundedYear: number | null;
  description: string;
  status: string;
  isVerified: boolean;
  deactivationReason: string;
}
