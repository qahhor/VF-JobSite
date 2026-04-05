import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminApiService,
  RefCity, RefCityRequest,
  RefRegion, RefRegionRequest,
  RefCountry, RefCountryRequest,
} from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

type Tab = 'cities' | 'regions' | 'countries';
type ActiveFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'vjw-admin-references',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">

      <!-- Header -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="text-[11px] uppercase tracking-[0.2em] text-cyan-400">{{ i18n.t('admin.ref.title') }}</div>
            <h1 class="mt-1 text-xl font-semibold">{{ i18n.t('admin.ref.hint') }}</h1>
          </div>
          <div class="flex gap-2">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center min-w-[80px]">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">{{ i18n.t('admin.ref.records') }}</div>
              <div class="text-lg font-semibold">{{ totalElements() }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs + Controls -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <!-- Tab bar -->
        <div class="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-4">
          @for (tab of tabs; track tab.key) {
            <button
              (click)="switchTab(tab.key)"
              class="rounded-lg border px-4 py-1.5 text-[13px] font-medium transition"
              [class]="activeTab() === tab.key
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'">
              {{ i18n.t(tab.label) }}
            </button>
          }
        </div>

        <!-- Search + filter + add -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          @if (activeTab() !== 'countries') {
            <div class="flex-1">
              <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('common.search') }}</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadData()"
                [placeholder]="i18n.t('admin.ref.search')"
                class="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-950" />
            </div>
            <div class="w-full sm:w-40">
              <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.moderation.status') }}</label>
              <select [(ngModel)]="activeFilter" (ngModelChange)="loadData()"
                class="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-950">
                <option value="all">{{ i18n.t('admin.ref.filter_all') }}</option>
                <option value="active">{{ i18n.t('admin.ref.filter_active') }}</option>
                <option value="inactive">{{ i18n.t('admin.ref.filter_inactive') }}</option>
              </select>
            </div>
          }
          <div class="flex items-center gap-2">
            @if (activeTab() !== 'countries') {
              <button (click)="loadData()" class="h-9 rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800">
                {{ i18n.t('common.search') }}
              </button>
              <button (click)="openForm()" class="h-9 rounded-lg bg-cyan-600 px-4 text-xs font-semibold text-white transition hover:bg-cyan-500">
                + {{ i18n.t('admin.ref.add') }}
              </button>
            }
          </div>
        </div>

        <!-- Loading skeleton -->
        @if (loading()) {
          <div class="mt-4 space-y-2">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="rounded-xl border border-slate-100 p-3">
                <div class="flex items-center gap-3">
                  <div class="h-4 w-40 animate-pulse rounded bg-slate-200"></div>
                  <div class="h-4 w-32 animate-pulse rounded bg-slate-100"></div>
                  <div class="h-4 w-20 animate-pulse rounded bg-slate-100"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- ═══ CITIES TABLE ═══ -->
        @if (!loading() && activeTab() === 'cities') {
          @if (cities().length === 0) {
            <div class="mt-4 rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
              {{ i18n.t('admin.ref.empty') }}
            </div>
          } @else {
            <div class="mt-4 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.ref.name_uz') }} / {{ i18n.t('admin.ref.name_ru') }}</th>
                    <th class="pb-2 pr-3 font-medium hidden md:table-cell">{{ i18n.t('admin.ref.name_en') }}</th>
                    <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.ref.country') }} / {{ i18n.t('admin.ref.region') }}</th>
                    <th class="pb-2 pr-3 font-medium hidden sm:table-cell">{{ i18n.t('admin.ref.population') }}</th>
                    <th class="pb-2 pr-3 font-medium text-center">{{ i18n.t('admin.moderation.status') }}</th>
                    <th class="pb-2 font-medium text-right">{{ i18n.t('admin.ref.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (city of cities(); track city.id) {
                    <tr class="border-b border-slate-100 transition hover:bg-slate-50/50"
                        [class.opacity-50]="!city.isActive">
                      <td class="py-2.5 pr-3">
                        <div class="font-medium text-slate-900">{{ city.nameUzLat }}</div>
                        @if (city.nameRu) {
                          <div class="text-xs text-slate-400">{{ city.nameRu }}</div>
                        }
                      </td>
                      <td class="py-2.5 pr-3 text-slate-500 hidden md:table-cell">{{ city.nameEn || '—' }}</td>
                      <td class="py-2.5 pr-3">
                        <div class="font-mono text-xs text-slate-700">{{ city.countryIso2 || city.country }}</div>
                        @if (city.region) {
                          <div class="text-xs text-slate-400">{{ city.region }}</div>
                        }
                      </td>
                      <td class="py-2.5 pr-3 text-slate-500 hidden sm:table-cell">
                        {{ city.population ? (city.population | number) : '—' }}
                      </td>
                      <td class="py-2.5 pr-3 text-center">
                        <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          [class]="city.isActive
                            ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-700'
                            : 'border border-slate-200 bg-slate-100 text-slate-500'">
                          {{ city.isActive ? i18n.t('admin.ref.active') : i18n.t('admin.ref.inactive') }}
                        </span>
                      </td>
                      <td class="py-2.5 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button (click)="editCity(city)" title="{{ i18n.t('admin.ref.edit') }}"
                            class="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button (click)="toggleCity(city)" [title]="i18n.t('admin.ref.toggle_active')"
                            class="rounded-md p-1.5 transition"
                            [class]="city.isActive
                              ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600'
                              : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              @if (city.isActive) {
                                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                              } @else {
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              }
                            </svg>
                          </button>
                          <button (click)="confirmDeleteCity(city)" title="{{ i18n.t('admin.ref.delete') }}"
                            class="rounded-md p-1.5 text-red-300 transition hover:bg-red-50 hover:text-red-500">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- ═══ REGIONS TABLE ═══ -->
        @if (!loading() && activeTab() === 'regions') {
          @if (regions().length === 0) {
            <div class="mt-4 rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">
              {{ i18n.t('admin.ref.empty') }}
            </div>
          } @else {
            <div class="mt-4 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.ref.full_code') }}</th>
                    <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.ref.name_uz') }} / {{ i18n.t('admin.ref.name_ru') }}</th>
                    <th class="pb-2 pr-3 font-medium hidden md:table-cell">{{ i18n.t('admin.ref.name_en') }}</th>
                    <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.ref.country') }}</th>
                    <th class="pb-2 pr-3 font-medium text-center">{{ i18n.t('admin.moderation.status') }}</th>
                    <th class="pb-2 font-medium text-right">{{ i18n.t('admin.ref.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (region of regions(); track region.id) {
                    <tr class="border-b border-slate-100 transition hover:bg-slate-50/50"
                        [class.opacity-50]="!region.isActive">
                      <td class="py-2.5 pr-3 font-mono text-xs font-semibold text-slate-700">{{ region.fullCode }}</td>
                      <td class="py-2.5 pr-3">
                        <div class="font-medium text-slate-900">{{ region.nameUzLat }}</div>
                        @if (region.nameRu) {
                          <div class="text-xs text-slate-400">{{ region.nameRu }}</div>
                        }
                      </td>
                      <td class="py-2.5 pr-3 text-slate-500 hidden md:table-cell">{{ region.nameEn || '—' }}</td>
                      <td class="py-2.5 pr-3 font-mono text-xs text-slate-500">{{ region.countryIso2 || '—' }}</td>
                      <td class="py-2.5 pr-3 text-center">
                        <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          [class]="region.isActive
                            ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-700'
                            : 'border border-slate-200 bg-slate-100 text-slate-500'">
                          {{ region.isActive ? i18n.t('admin.ref.active') : i18n.t('admin.ref.inactive') }}
                        </span>
                      </td>
                      <td class="py-2.5 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button (click)="editRegion(region)" title="{{ i18n.t('admin.ref.edit') }}"
                            class="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button (click)="toggleRegion(region)" [title]="i18n.t('admin.ref.toggle_active')"
                            class="rounded-md p-1.5 transition"
                            [class]="region.isActive
                              ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600'
                              : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              @if (region.isActive) {
                                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                              } @else {
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              }
                            </svg>
                          </button>
                          <button (click)="confirmDeleteRegion(region)" title="{{ i18n.t('admin.ref.delete') }}"
                            class="rounded-md p-1.5 text-red-300 transition hover:bg-red-50 hover:text-red-500">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }

        <!-- ═══ COUNTRIES TABLE ═══ -->
        @if (!loading() && activeTab() === 'countries') {
          <div class="mt-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th class="pb-2 pr-3 font-medium">ISO2</th>
                  <th class="pb-2 pr-3 font-medium">{{ i18n.t('admin.ref.name_uz') }} / {{ i18n.t('admin.ref.name_ru') }}</th>
                  <th class="pb-2 pr-3 font-medium hidden md:table-cell">{{ i18n.t('admin.ref.name_en') }}</th>
                  <th class="pb-2 pr-3 font-medium hidden sm:table-cell">{{ i18n.t('admin.ref.capital') }}</th>
                  <th class="pb-2 pr-3 font-medium hidden sm:table-cell">{{ i18n.t('admin.ref.phone_code') }}</th>
                  <th class="pb-2 font-medium text-right">{{ i18n.t('admin.ref.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (c of countries(); track c.id) {
                  <tr class="border-b border-slate-100 transition hover:bg-slate-50/50">
                    <td class="py-2.5 pr-3 font-mono text-xs font-semibold text-slate-700">{{ c.iso2 }}</td>
                    <td class="py-2.5 pr-3">
                      <div class="font-medium text-slate-900">{{ c.nameUzLat }}</div>
                      @if (c.nameRu) {
                        <div class="text-xs text-slate-400">{{ c.nameRu }}</div>
                      }
                    </td>
                    <td class="py-2.5 pr-3 text-slate-500 hidden md:table-cell">{{ c.nameEn || '—' }}</td>
                    <td class="py-2.5 pr-3 text-slate-500 hidden sm:table-cell">{{ c.capital || '—' }}</td>
                    <td class="py-2.5 pr-3 text-slate-500 hidden sm:table-cell">{{ c.phoneCode || '—' }}</td>
                    <td class="py-2.5 text-right">
                      <button (click)="editCountry(c)" title="{{ i18n.t('admin.ref.edit') }}"
                        class="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Pagination -->
        @if (!loading() && activeTab() !== 'countries' && totalPages() > 1) {
          <div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span class="text-xs text-slate-400">{{ i18n.t('common.page') }} {{ currentPage() + 1 }} / {{ totalPages() }}</span>
            <div class="flex gap-1">
              <button [disabled]="currentPage() === 0" (click)="goPage(currentPage() - 1)"
                class="rounded-md border border-slate-200 px-2.5 py-1 text-xs transition hover:bg-slate-50 disabled:opacity-40">←</button>
              <button [disabled]="currentPage() >= totalPages() - 1" (click)="goPage(currentPage() + 1)"
                class="rounded-md border border-slate-200 px-2.5 py-1 text-xs transition hover:bg-slate-50 disabled:opacity-40">→</button>
            </div>
          </div>
        }
      </section>
    </div>

    <!-- ═══ MODAL FORM ═══ -->
    @if (showForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="closeForm()">
        <div class="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl" (click)="$event.stopPropagation()">
          <button (click)="closeForm()" class="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:text-slate-700">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <h3 class="text-lg font-semibold mb-4">{{ formTitle() }}</h3>

          <!-- City Form -->
          @if (formType() === 'city') {
            <div class="space-y-3">
              <!-- Row 1: Country + Region -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.country') }} *</label>
                  <select [(ngModel)]="cityForm.country" (ngModelChange)="onCityCountryChange()"
                    class="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950">
                    <option value="">—</option>
                    @for (c of refCountries(); track c.iso2) {
                      <option [value]="c.iso2">{{ c.iso2 }} — {{ i18n.lang() === 'ru' ? c.nameRu : c.nameUzLat }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.region') }}</label>
                  <select [(ngModel)]="cityForm.region"
                    class="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950">
                    <option value="">—</option>
                    @for (r of cityFormRegions(); track r.id) {
                      <option [value]="r.fullCode">{{ i18n.lang() === 'ru' ? r.nameRu : r.nameUzLat }}</option>
                    }
                  </select>
                </div>
              </div>
              <!-- Row 2: UZ name -->
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_uz') }} *</label>
                <input [(ngModel)]="cityForm.nameUzLat" type="text"
                  class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
              </div>
              <!-- Row 3: RU + EN names -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_ru') }}</label>
                  <input [(ngModel)]="cityForm.nameRu" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_en') }}</label>
                  <input [(ngModel)]="cityForm.nameEn" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
              </div>
              <!-- Row 4: Population -->
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.population') }}</label>
                <input [(ngModel)]="cityForm.population" type="number" min="0"
                  class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
              </div>
            </div>
          }

          <!-- Region Form -->
          @if (formType() === 'region') {
            <div class="space-y-3">
              <!-- Row 1: Country (full width) -->
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.country') }} *</label>
                <select [(ngModel)]="regionForm.countryIso2"
                  class="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-950">
                  <option value="">—</option>
                  @for (c of refCountries(); track c.iso2) {
                    <option [value]="c.iso2">{{ c.iso2 }} — {{ i18n.lang() === 'ru' ? c.nameRu : c.nameUzLat }}</option>
                  }
                </select>
              </div>
              <!-- Row 2: Code + Full code -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.code') }} *</label>
                  <input [(ngModel)]="regionForm.code" type="text" placeholder="13"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm font-mono outline-none focus:border-slate-950" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.full_code') }} *</label>
                  <input [(ngModel)]="regionForm.fullCode" type="text" placeholder="UZ-13"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm font-mono outline-none focus:border-slate-950" />
                </div>
              </div>
              <!-- Row 3: UZ name -->
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_uz') }} *</label>
                <input [(ngModel)]="regionForm.nameUzLat" type="text"
                  class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
              </div>
              <!-- Row 4: RU + EN names -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_ru') }} *</label>
                  <input [(ngModel)]="regionForm.nameRu" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_en') }}</label>
                  <input [(ngModel)]="regionForm.nameEn" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
              </div>
            </div>
          }

          <!-- Country Form -->
          @if (formType() === 'country') {
            <div class="space-y-3">
              <!-- Row 1: UZ name -->
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_uz') }}</label>
                <input [(ngModel)]="countryForm.nameUzLat" type="text"
                  class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
              </div>
              <!-- Row 2: RU + EN names -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_ru') }}</label>
                  <input [(ngModel)]="countryForm.nameRu" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.name_en') }}</label>
                  <input [(ngModel)]="countryForm.nameEn" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
              </div>
              <!-- Row 3: Capital + Phone code -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.capital') }}</label>
                  <input [(ngModel)]="countryForm.capital" type="text"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-medium text-slate-500">{{ i18n.t('admin.ref.phone_code') }}</label>
                  <input [(ngModel)]="countryForm.phoneCode" type="text" placeholder="+998"
                    class="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-950" />
                </div>
              </div>
            </div>
          }

          <!-- Form actions -->
          <div class="mt-5 flex gap-2">
            <button (click)="save()" [disabled]="saving() || !canSave()"
              class="h-8 rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40">
              {{ saving() ? i18n.t('admin.ref.saving') : i18n.t('admin.ref.save') }}
            </button>
            <button (click)="closeForm()" class="h-8 rounded-lg border border-slate-200 px-4 text-xs font-semibold transition hover:bg-slate-50">
              {{ i18n.t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete confirmation -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="deleteTarget.set(null)">
        <div class="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" (click)="$event.stopPropagation()">
          <h3 class="text-base font-semibold">{{ i18n.t('admin.ref.confirm_delete') }}</h3>
          <p class="mt-2 text-sm text-slate-500">
            {{ i18n.t('admin.ref.delete_confirm') }} <strong>{{ deleteTarget()!.name }}</strong>?
          </p>
          <div class="mt-4 flex gap-2">
            <button (click)="confirmDelete()" class="h-8 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-400">
              {{ i18n.t('admin.ref.delete') }}
            </button>
            <button (click)="deleteTarget.set(null)" class="h-8 rounded-lg border border-slate-200 px-4 text-xs font-semibold transition hover:bg-slate-50">
              {{ i18n.t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminReferencesComponent implements OnInit {
  tabs: { key: Tab; label: string }[] = [
    { key: 'cities',    label: 'admin.ref.cities' },
    { key: 'regions',  label: 'admin.ref.regions' },
    { key: 'countries', label: 'admin.ref.countries' },
  ];

  activeTab    = signal<Tab>('cities');
  activeFilter: ActiveFilter = 'all';
  loading      = signal(false);
  searchQuery  = '';
  currentPage  = signal(0);
  totalPages   = signal(0);
  totalElements = signal(0);

  cities    = signal<RefCity[]>([]);
  regions   = signal<RefRegion[]>([]);
  countries = signal<RefCountry[]>([]);

  showForm  = signal(false);
  formType  = signal<'city' | 'region' | 'country'>('city');
  formTitle = signal('');
  editingId: string | null = null;
  saving    = signal(false);

  refCountries    = signal<RefCountry[]>([]);
  cityFormRegions = signal<RefRegion[]>([]);

  cityForm:    RefCityRequest    = this.emptyCityForm();
  regionForm:  RefRegionRequest  = this.emptyRegionForm();
  countryForm: RefCountryRequest = this.emptyCountryForm();

  deleteTarget = signal<{ id: string; name: string; type: Tab } | null>(null);

  canSave = computed(() => {
    if (this.formType() === 'city') return !!this.cityForm.nameUzLat && !!this.cityForm.country;
    if (this.formType() === 'region') return !!this.regionForm.nameUzLat && !!this.regionForm.code && !!this.regionForm.fullCode;
    return true; // country form — all fields optional
  });

  constructor(
    private api: AdminApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.api.getCountries().subscribe({
      next: (list) => this.refCountries.set(list),
      error: () => {}
    });
    this.loadData();
  }

  // ── Tab ─────────────────────────────────────────────────────────

  switchTab(tab: Tab) {
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.searchQuery = '';
    this.activeFilter = 'all';
    this.loadData();
  }

  // ── Data loading ─────────────────────────────────────────────────

  loadData() {
    this.loading.set(true);
    const tab = this.activeTab();
    const search = this.searchQuery.trim() || undefined;

    if (tab === 'cities') {
      this.api.getCities(this.currentPage(), 20, search).subscribe({
        next: (res) => {
          let content = res.content || [];
          if (this.activeFilter === 'active')   content = content.filter(c => c.isActive);
          if (this.activeFilter === 'inactive') content = content.filter(c => !c.isActive);
          this.cities.set(content);
          this.totalPages.set(res.totalPages || 0);
          this.totalElements.set(res.totalElements || 0);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error(this.i18n.t('admin.load_failed')); },
      });
    } else if (tab === 'regions') {
      this.api.getRegions(this.currentPage(), 20, search).subscribe({
        next: (res) => {
          let content = res.content || [];
          if (this.activeFilter === 'active')   content = content.filter(r => r.isActive);
          if (this.activeFilter === 'inactive') content = content.filter(r => !r.isActive);
          this.regions.set(content);
          this.totalPages.set(res.totalPages || 0);
          this.totalElements.set(res.totalElements || 0);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error(this.i18n.t('admin.load_failed')); },
      });
    } else {
      this.api.getCountries().subscribe({
        next: (list) => {
          this.countries.set(list);
          this.totalElements.set(list.length);
          this.totalPages.set(1);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error(this.i18n.t('admin.load_failed')); },
      });
    }
  }

  goPage(page: number) { this.currentPage.set(page); this.loadData(); }

  // ── City form change handlers ────────────────────────────────────

  onCityCountryChange() {
    this.cityForm.region = '';
    if (this.cityForm.country) {
      this.api.getRegionsByCountry(this.cityForm.country).subscribe({
        next: (list) => this.cityFormRegions.set(list),
        error: () => this.cityFormRegions.set([])
      });
    } else {
      this.cityFormRegions.set([]);
    }
  }

  // ── Form open / close ────────────────────────────────────────────

  openForm() {
    const tab = this.activeTab();
    const type = tab === 'regions' ? 'region' : tab === 'countries' ? 'country' : 'city';
    this.formType.set(type);
    this.editingId = null;
    this.formTitle.set(
      type === 'city'    ? this.i18n.t('admin.ref.add_city')   :
      type === 'region'  ? this.i18n.t('admin.ref.add_region') :
                           this.i18n.t('admin.ref.edit_country')
    );
    this.cityForm    = this.emptyCityForm();
    this.regionForm  = this.emptyRegionForm();
    this.countryForm = this.emptyCountryForm();
    this.cityFormRegions.set([]);
    if (this.cityForm.country) this.onCityCountryChange();
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  // ── City CRUD ────────────────────────────────────────────────────

  editCity(city: RefCity) {
    this.formType.set('city');
    this.editingId = city.id;
    this.formTitle.set(this.i18n.t('admin.ref.edit_city'));
    this.cityForm = {
      nameUzLat: city.nameUzLat,
      nameRu:    city.nameRu,
      nameEn:    city.nameEn,
      country:   city.countryIso2 || city.country,
      region:    city.region,
      population: city.population,
    };
    this.cityFormRegions.set([]);
    if (this.cityForm.country) {
      this.api.getRegionsByCountry(this.cityForm.country).subscribe({
        next: (list) => this.cityFormRegions.set(list),
        error: () => {}
      });
    }
    this.showForm.set(true);
  }

  confirmDeleteCity(city: RefCity) {
    this.deleteTarget.set({ id: city.id, name: city.nameUzLat, type: 'cities' });
  }

  toggleCity(city: RefCity) {
    this.api.toggleCityActive(city.id).subscribe({
      next: (updated) => {
        this.cities.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.toast.success(updated.isActive ? this.i18n.t('admin.ref.activated') : this.i18n.t('admin.ref.deactivated'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  // ── Region CRUD ──────────────────────────────────────────────────

  editRegion(region: RefRegion) {
    this.formType.set('region');
    this.editingId = region.id;
    this.formTitle.set(this.i18n.t('admin.ref.edit_region'));
    this.regionForm = {
      code:        region.code,
      fullCode:    region.fullCode,
      nameUzLat:   region.nameUzLat,
      nameRu:      region.nameRu,
      nameEn:      region.nameEn,
      countryIso2: region.countryIso2 || '',
    };
    this.showForm.set(true);
  }

  confirmDeleteRegion(region: RefRegion) {
    this.deleteTarget.set({ id: region.id, name: region.nameUzLat, type: 'regions' });
  }

  toggleRegion(region: RefRegion) {
    this.api.toggleRegionActive(region.id).subscribe({
      next: (updated) => {
        this.regions.update(list => list.map(r => r.id === updated.id ? updated : r));
        this.toast.success(updated.isActive ? this.i18n.t('admin.ref.activated') : this.i18n.t('admin.ref.deactivated'));
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed'))
    });
  }

  // ── Country CRUD ─────────────────────────────────────────────────

  editCountry(c: RefCountry) {
    this.formType.set('country');
    this.editingId = c.id;
    this.formTitle.set(this.i18n.t('admin.ref.edit_country') + ' — ' + c.iso2);
    this.countryForm = { nameUzLat: c.nameUzLat, nameRu: c.nameRu, nameEn: c.nameEn, capital: c.capital, phoneCode: c.phoneCode };
    this.showForm.set(true);
  }

  // ── Unified save ────────────────────────────────────────────────

  save() {
    if (this.formType() === 'city')    { this.saveCity();    return; }
    if (this.formType() === 'region')  { this.saveRegion();  return; }
    if (this.formType() === 'country') { this.saveCountry(); return; }
  }

  private saveCity() {
    this.saving.set(true);
    const obs = this.editingId
      ? this.api.updateCity(this.editingId, this.cityForm)
      : this.api.createCity(this.cityForm);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.toast.success(this.i18n.t('admin.ref.saved')); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  private saveRegion() {
    this.saving.set(true);
    const obs = this.editingId
      ? this.api.updateRegion(this.editingId, this.regionForm)
      : this.api.createRegion(this.regionForm);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.toast.success(this.i18n.t('admin.ref.saved')); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  private saveCountry() {
    if (!this.editingId) return;
    this.saving.set(true);
    this.api.updateCountry(this.editingId, this.countryForm).subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.toast.success(this.i18n.t('admin.ref.saved')); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  // ── Delete ───────────────────────────────────────────────────────

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    const obs = target.type === 'cities' ? this.api.deleteCity(target.id) : this.api.deleteRegion(target.id);
    obs.subscribe({
      next: () => { this.deleteTarget.set(null); this.toast.success(this.i18n.t('admin.ref.deleted')); this.loadData(); },
      error: () => { this.deleteTarget.set(null); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────

  private emptyCityForm(): RefCityRequest {
    return { nameUzLat: '', nameRu: '', nameEn: '', country: 'UZ', region: '', population: null };
  }
  private emptyRegionForm(): RefRegionRequest {
    return { code: '', fullCode: '', nameUzLat: '', nameRu: '', nameEn: '', countryIso2: 'UZ' };
  }
  private emptyCountryForm(): RefCountryRequest {
    return { nameUzLat: '', nameRu: '', nameEn: '', capital: '', phoneCode: '' };
  }
}
