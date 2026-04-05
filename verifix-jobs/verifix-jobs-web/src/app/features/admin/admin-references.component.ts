import { Component, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'vjw-admin-references',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">{{ i18n.t('admin.ref.title') }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ i18n.t('admin.ref.hint') }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="switchTab(tab.key)"
            class="rounded-lg border px-4 py-2 text-[13px] font-medium transition"
            [class]="activeTab() === tab.key
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'">
            {{ i18n.t(tab.label) }}
          </button>
        }
      </div>

      <!-- Search + Add -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        @if (activeTab() !== 'countries') {
          <div class="relative max-w-xs flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadData()"
              [placeholder]="i18n.t('admin.ref.search')"
              class="h-10 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-10 text-[13px] outline-none transition focus:border-slate-900" />
            <button (click)="loadData()" class="absolute right-1 top-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white">&rarr;</button>
          </div>
        }
        <div class="flex items-center gap-3">
          <span class="text-[13px] text-slate-500">{{ totalElements() }} {{ i18n.t('admin.ref.records') }}</span>
          @if (activeTab() !== 'countries') {
            <button (click)="openForm()" class="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-slate-800">
              + {{ i18n.t('admin.ref.add') }}
            </button>
          }
        </div>
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex items-center gap-3">
                <div class="h-4 w-40 animate-pulse rounded bg-slate-200"></div>
                <div class="h-4 w-32 animate-pulse rounded bg-slate-100"></div>
                <div class="h-4 w-24 animate-pulse rounded bg-slate-100"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ═══ CITIES TAB ═══ -->
      @if (!loading() && activeTab() === 'cities') {
        @if (cities().length === 0) {
          <div class="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            {{ i18n.t('admin.ref.empty') }}
          </div>
        } @else {
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left text-[13px]">
              <thead class="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.name_uz') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.name_ru') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.name_en') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.country') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.region') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.population') }}</th>
                  <th class="px-4 py-3 text-right">{{ i18n.t('admin.ref.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (city of cities(); track city.id) {
                  <tr class="transition hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium">{{ city.nameUzLat }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ city.nameRu || '—' }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ city.nameEn || '—' }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ city.country }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ city.region || '—' }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ city.population || '—' }}</td>
                    <td class="px-4 py-3 text-right">
                      <button (click)="editCity(city)" class="mr-2 text-slate-500 transition hover:text-slate-900">{{ i18n.t('admin.ref.edit') }}</button>
                      <button (click)="confirmDeleteCity(city)" class="text-red-500 transition hover:text-red-700">{{ i18n.t('admin.ref.delete') }}</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- ═══ REGIONS TAB ═══ -->
      @if (!loading() && activeTab() === 'regions') {
        @if (regions().length === 0) {
          <div class="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            {{ i18n.t('admin.ref.empty') }}
          </div>
        } @else {
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full text-left text-[13px]">
              <thead class="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.code') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.name_uz') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.name_ru') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.name_en') }}</th>
                  <th class="px-4 py-3">{{ i18n.t('admin.ref.country') }}</th>
                  <th class="px-4 py-3 text-right">{{ i18n.t('admin.ref.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (region of regions(); track region.id) {
                  <tr class="transition hover:bg-slate-50">
                    <td class="px-4 py-3 font-mono text-xs font-medium">{{ region.code }}</td>
                    <td class="px-4 py-3 font-medium">{{ region.nameUzLat }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ region.nameRu || '—' }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ region.nameEn || '—' }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ region.countryIso2 || '—' }}</td>
                    <td class="px-4 py-3 text-right">
                      <button (click)="editRegion(region)" class="mr-2 text-slate-500 transition hover:text-slate-900">{{ i18n.t('admin.ref.edit') }}</button>
                      <button (click)="confirmDeleteRegion(region)" class="text-red-500 transition hover:text-red-700">{{ i18n.t('admin.ref.delete') }}</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- ═══ COUNTRIES TAB ═══ -->
      @if (!loading() && activeTab() === 'countries') {
        <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-left text-[13px]">
            <thead class="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th class="px-4 py-3">ISO</th>
                <th class="px-4 py-3">{{ i18n.t('admin.ref.name_uz') }}</th>
                <th class="px-4 py-3">{{ i18n.t('admin.ref.name_ru') }}</th>
                <th class="px-4 py-3">{{ i18n.t('admin.ref.name_en') }}</th>
                <th class="px-4 py-3">{{ i18n.t('admin.ref.capital') }}</th>
                <th class="px-4 py-3">{{ i18n.t('admin.ref.phone_code') }}</th>
                <th class="px-4 py-3 text-right">{{ i18n.t('admin.ref.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (c of countries(); track c.id) {
                <tr class="transition hover:bg-slate-50">
                  <td class="px-4 py-3 font-mono text-xs font-medium">{{ c.iso2 }}</td>
                  <td class="px-4 py-3 font-medium">{{ c.nameUzLat }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ c.nameRu || '—' }}</td>
                  <td class="px-4 py-3 text-slate-600">{{ c.nameEn || '—' }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ c.capital || '—' }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ c.phoneCode || '—' }}</td>
                  <td class="px-4 py-3 text-right">
                    <button (click)="editCountry(c)" class="text-slate-500 transition hover:text-slate-900">{{ i18n.t('admin.ref.edit') }}</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Pagination -->
      @if (!loading() && activeTab() !== 'countries' && totalPages() > 1) {
        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            [disabled]="currentPage() === 0"
            (click)="goPage(currentPage() - 1)"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] transition hover:bg-slate-50 disabled:opacity-40">&larr;</button>
          <span class="text-[13px] text-slate-600">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
          <button
            [disabled]="currentPage() >= totalPages() - 1"
            (click)="goPage(currentPage() + 1)"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] transition hover:bg-slate-50 disabled:opacity-40">&rarr;</button>
        </div>
      }

      <!-- ═══ MODAL FORM ═══ -->
      @if (showForm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px]" (click)="closeForm()">
          <div class="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
            <div class="mb-5 flex items-center justify-between">
              <h3 class="text-lg font-semibold">{{ formTitle() }}</h3>
              <button (click)="closeForm()" class="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <!-- City Form -->
            @if (formType() === 'city') {
              <form (ngSubmit)="saveCity()" class="space-y-3">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.country') }} *</span>
                    <select [(ngModel)]="cityForm.country" name="country" required (ngModelChange)="onCityCountryChange()"
                      class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-slate-900">
                      <option value="">—</option>
                      @for (c of refCountries(); track c.iso2) {
                        <option [value]="c.iso2">{{ c.iso2 }} — {{ i18n.lang() === 'ru' ? c.nameRu : c.nameUzLat }}</option>
                      }
                    </select>
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.region') }}</span>
                    <select [(ngModel)]="cityForm.region" name="region"
                      class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-slate-900">
                      <option value="">—</option>
                      @for (r of cityFormRegions(); track r.id) {
                        <option [value]="r.fullCode">{{ i18n.lang() === 'ru' ? r.nameRu : r.nameUzLat }}</option>
                      }
                    </select>
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_uz') }} *</span>
                    <input [(ngModel)]="cityForm.nameUzLat" name="nameUzLat" required
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_ru') }}</span>
                    <input [(ngModel)]="cityForm.nameRu" name="nameRu"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_en') }}</span>
                    <input [(ngModel)]="cityForm.nameEn" name="nameEn"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.population') }}</span>
                    <input [(ngModel)]="cityForm.population" name="population" type="number"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                </div>
                <div class="flex justify-end gap-2 pt-3">
                  <button type="button" (click)="closeForm()" class="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                    {{ i18n.t('admin.cancel') }}
                  </button>
                  <button type="submit" [disabled]="saving()" class="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    {{ saving() ? i18n.t('admin.saving_password') : i18n.t('admin.ref.save') }}
                  </button>
                </div>
              </form>
            }

            <!-- Region Form -->
            @if (formType() === 'region') {
              <form (ngSubmit)="saveRegion()" class="space-y-3">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label class="block sm:col-span-2">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.country') }} *</span>
                    <select [(ngModel)]="regionForm.countryIso2" name="countryIso2" required
                      class="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] outline-none focus:border-slate-900">
                      <option value="">—</option>
                      @for (c of refCountries(); track c.iso2) {
                        <option [value]="c.iso2">{{ c.iso2 }} — {{ i18n.lang() === 'ru' ? c.nameRu : c.nameUzLat }}</option>
                      }
                    </select>
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.code') }} *</span>
                    <input [(ngModel)]="regionForm.code" name="code" required placeholder="TK"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.full_code') }} *</span>
                    <input [(ngModel)]="regionForm.fullCode" name="fullCode" required placeholder="UZ-TK"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_uz') }} *</span>
                    <input [(ngModel)]="regionForm.nameUzLat" name="nameUzLat" required
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_ru') }} *</span>
                    <input [(ngModel)]="regionForm.nameRu" name="nameRu" required
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block sm:col-span-2">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_en') }} *</span>
                    <input [(ngModel)]="regionForm.nameEn" name="nameEn" required
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                </div>
                <div class="flex justify-end gap-2 pt-3">
                  <button type="button" (click)="closeForm()" class="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                    {{ i18n.t('admin.cancel') }}
                  </button>
                  <button type="submit" [disabled]="saving()" class="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    {{ saving() ? i18n.t('admin.saving_password') : i18n.t('admin.ref.save') }}
                  </button>
                </div>
              </form>
            }

            <!-- Country Form -->
            @if (formType() === 'country') {
              <form (ngSubmit)="saveCountry()" class="space-y-3">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_uz') }}</span>
                    <input [(ngModel)]="countryForm.nameUzLat" name="nameUzLat"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_ru') }}</span>
                    <input [(ngModel)]="countryForm.nameRu" name="nameRu"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.name_en') }}</span>
                    <input [(ngModel)]="countryForm.nameEn" name="nameEn"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.capital') }}</span>
                    <input [(ngModel)]="countryForm.capital" name="capital"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                  <label class="block sm:col-span-2">
                    <span class="mb-1 block text-xs font-medium text-slate-600">{{ i18n.t('admin.ref.phone_code') }}</span>
                    <input [(ngModel)]="countryForm.phoneCode" name="phoneCode" placeholder="+998"
                      class="h-10 w-full rounded-lg border border-slate-300 px-3 text-[13px] outline-none focus:border-slate-900" />
                  </label>
                </div>
                <div class="flex justify-end gap-2 pt-3">
                  <button type="button" (click)="closeForm()" class="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                    {{ i18n.t('admin.cancel') }}
                  </button>
                  <button type="submit" [disabled]="saving()" class="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                    {{ saving() ? i18n.t('admin.saving_password') : i18n.t('admin.ref.save') }}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      }

      <!-- Delete confirm -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px]" (click)="deleteTarget.set(null)">
          <div class="mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
            <div class="mb-4 text-sm text-slate-700">{{ i18n.t('admin.ref.delete_confirm') }}</div>
            <div class="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium">{{ deleteTarget()!.name }}</div>
            <div class="flex justify-end gap-2">
              <button (click)="deleteTarget.set(null)" class="rounded-lg border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
                {{ i18n.t('admin.cancel') }}
              </button>
              <button (click)="confirmDelete()" class="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700">
                {{ i18n.t('admin.ref.delete') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminReferencesComponent implements OnInit {
  tabs: { key: Tab; label: string }[] = [
    { key: 'cities', label: 'admin.ref.cities' },
    { key: 'regions', label: 'admin.ref.regions' },
    { key: 'countries', label: 'admin.ref.countries' },
  ];

  activeTab = signal<Tab>('cities');
  loading = signal(false);
  searchQuery = '';
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  cities = signal<RefCity[]>([]);
  regions = signal<RefRegion[]>([]);
  countries = signal<RefCountry[]>([]);

  showForm = signal(false);
  formType = signal<'city' | 'region' | 'country'>('city');
  formTitle = signal('');
  editingId: string | null = null;
  saving = signal(false);

  refCountries = signal<RefCountry[]>([]);
  cityFormRegions = signal<RefRegion[]>([]);

  cityForm: RefCityRequest = { nameUzLat: '', nameRu: '', nameEn: '', country: 'UZ', region: '', population: null };
  regionForm: RefRegionRequest = { code: '', fullCode: '', nameUzLat: '', nameRu: '', nameEn: '', countryIso2: 'UZ' };
  countryForm: RefCountryRequest = { nameUzLat: '', nameRu: '', nameEn: '', capital: '', phoneCode: '' };

  deleteTarget = signal<{ id: string; name: string; type: Tab } | null>(null);

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

  switchTab(tab: Tab) {
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.searchQuery = '';
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    const tab = this.activeTab();

    if (tab === 'cities') {
      this.api.getCities(this.currentPage(), 20, this.searchQuery || undefined).subscribe({
        next: (res) => {
          this.cities.set(res.content || []);
          this.totalPages.set(res.totalPages || 0);
          this.totalElements.set(res.totalElements || 0);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.toast.error(this.i18n.t('admin.load_failed')); },
      });
    } else if (tab === 'regions') {
      this.api.getRegions(this.currentPage(), 20, this.searchQuery || undefined).subscribe({
        next: (res) => {
          this.regions.set(res.content || []);
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

  // ── Form open/close ──────────────────────────────────

  openForm(type?: 'city' | 'region' | 'country') {
    const t = type || (this.activeTab() === 'regions' ? 'region' : this.activeTab() === 'countries' ? 'country' : 'city');
    this.formType.set(t);
    this.editingId = null;
    this.formTitle.set(this.i18n.t('admin.ref.add'));
    this.resetForms();
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  private resetForms() {
    this.cityForm = { nameUzLat: '', nameRu: '', nameEn: '', country: 'UZ', region: '', population: null };
    this.regionForm = { code: '', fullCode: '', nameUzLat: '', nameRu: '', nameEn: '', countryIso2: 'UZ' };
    this.countryForm = { nameUzLat: '', nameRu: '', nameEn: '', capital: '', phoneCode: '' };
    this.onCityCountryChange();
  }

  // ── City CRUD ─────────────────────────────────────────

  editCity(city: RefCity) {
    this.formType.set('city');
    this.editingId = city.id;
    this.formTitle.set(this.i18n.t('admin.ref.edit'));
    this.cityForm = { nameUzLat: city.nameUzLat, nameRu: city.nameRu, nameEn: city.nameEn, country: city.country, region: city.region, population: city.population };
    this.onCityCountryChange();
    this.showForm.set(true);
  }

  saveCity() {
    this.saving.set(true);
    const obs = this.editingId
      ? this.api.updateCity(this.editingId, this.cityForm)
      : this.api.createCity(this.cityForm);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.toast.success(this.i18n.t('admin.ref.saved')); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  confirmDeleteCity(city: RefCity) {
    this.deleteTarget.set({ id: city.id, name: city.nameUzLat, type: 'cities' });
  }

  // ── Region CRUD ───────────────────────────────────────

  editRegion(region: RefRegion) {
    this.formType.set('region');
    this.editingId = region.id;
    this.formTitle.set(this.i18n.t('admin.ref.edit'));
    this.regionForm = { code: region.code, fullCode: region.fullCode, nameUzLat: region.nameUzLat, nameRu: region.nameRu, nameEn: region.nameEn, countryIso2: region.countryIso2 || '' };
    this.showForm.set(true);
  }

  saveRegion() {
    this.saving.set(true);
    const obs = this.editingId
      ? this.api.updateRegion(this.editingId, this.regionForm)
      : this.api.createRegion(this.regionForm);
    obs.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.toast.success(this.i18n.t('admin.ref.saved')); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  confirmDeleteRegion(region: RefRegion) {
    this.deleteTarget.set({ id: region.id, name: region.nameUzLat, type: 'regions' });
  }

  // ── Country edit ──────────────────────────────────────

  editCountry(c: RefCountry) {
    this.formType.set('country');
    this.editingId = c.id;
    this.formTitle.set(this.i18n.t('admin.ref.edit') + ' — ' + c.iso2);
    this.countryForm = { nameUzLat: c.nameUzLat, nameRu: c.nameRu, nameEn: c.nameEn, capital: c.capital, phoneCode: c.phoneCode };
    this.showForm.set(true);
  }

  saveCountry() {
    if (!this.editingId) return;
    this.saving.set(true);
    this.api.updateCountry(this.editingId, this.countryForm).subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.toast.success(this.i18n.t('admin.ref.saved')); this.loadData(); },
      error: () => { this.saving.set(false); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }

  // ── Delete ────────────────────────────────────────────

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    const obs = target.type === 'cities' ? this.api.deleteCity(target.id) : this.api.deleteRegion(target.id);
    obs.subscribe({
      next: () => { this.deleteTarget.set(null); this.toast.success(this.i18n.t('admin.ref.deleted')); this.loadData(); },
      error: () => { this.deleteTarget.set(null); this.toast.error(this.i18n.t('admin.action_failed')); },
    });
  }
}
