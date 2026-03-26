import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PublicApiService } from '../../core/services/public-api.service';

type SavedSearchDraft = {
  name: string;
  query: string;
  city: string;
  category: string;
  minSalary: number | null;
  maxSalary: number | null;
  employmentType: string;
  shiftSchedule: string;
  benefits: string[];
  verifiedOnly: boolean;
  notifyEnabled: boolean;
};

@Component({
  selector: 'vjw-saved-searches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Saqlangan qidiruvlar</h1>
          <div class="text-sm text-gray-400 mt-1">Alertlar, qayta foydalanish va candidate continuity uchun search presets.</div>
        </div>
        <button
          (click)="showCreate.set(true)"
          [disabled]="!candidateId()"
          class="h-10 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
          + Yangi qidiruv
        </button>
      </div>

      @if (!candidateId()) {
        <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
          Saqlangan qidiruvlar uchun avval kamida bir marta ariza topshirib yoki quick apply orqali candidate profilingizni yarating.
        </div>
      }

      @if (candidateId() && searches().length) {
        <div class="space-y-3">
          @for (search of searches(); track search.id) {
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                SS
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800">{{ search.name }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ summarizeSearch(search) }}</div>
                <div class="flex flex-wrap gap-2 mt-3">
                  @for (benefit of search.benefits || []; track benefit) {
                    <span class="px-2 py-1 rounded-full bg-emerald-50 text-[11px] text-emerald-700">{{ benefit }}</span>
                  }
                  @if (search.verifiedOnly) {
                    <span class="px-2 py-1 rounded-full bg-blue-50 text-[11px] text-blue-700">Verified only</span>
                  }
                </div>
                <div class="text-[11px] mt-3" [class.text-emerald-600]="search.notifyEnabled" [class.text-gray-400]="!search.notifyEnabled">
                  {{ search.notifyEnabled ? 'Alertlar yoqilgan' : "Alertlar o'chirilgan" }}
                </div>
              </div>
              <button
                (click)="remove(search.id)"
                class="text-gray-300 hover:text-red-500 transition text-lg leading-none">
                x
              </button>
            </div>
          }
        </div>
      } @else if (candidateId()) {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div class="text-4xl mb-3">...</div>
          <div class="text-sm text-gray-500 mb-2">Saqlangan qidiruvlar yo'q</div>
          <div class="text-xs text-gray-400">Qidiruv saqlasangiz, yangi vakansiyalar haqida xabar olasiz</div>
        </div>
      }

      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="closeCreate()"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Qidiruvni saqlash</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomi</label>
                <input type="text" [(ngModel)]="newSearch.name" placeholder="Masalan: Toshkentda ertalabki oshpaz"
                       class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Kalit so'z</label>
                <input type="text" [(ngModel)]="newSearch.query" placeholder="Kasb yoki lavozim"
                       class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shahar</label>
                <select [(ngModel)]="newSearch.city" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Barcha shaharlar</option>
                  @for (city of cities; track city) {
                    <option [value]="city">{{ city }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                <select [(ngModel)]="newSearch.category" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Barcha kasblar</option>
                  @for (category of categories; track category.key) {
                    <option [value]="category.key">{{ category.label }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Minimal maosh</label>
                <input type="number" [(ngModel)]="newSearch.minSalary" placeholder="3000000"
                       class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Maksimal maosh</label>
                <input type="number" [(ngModel)]="newSearch.maxSalary" placeholder="7000000"
                       class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bandlik turi</label>
                <select [(ngModel)]="newSearch.employmentType" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Farqi yo'q</option>
                  <option value="FULL_TIME">To'liq stavka</option>
                  <option value="PART_TIME">Yarim stavka</option>
                  <option value="CONTRACT">Shartnoma</option>
                  <option value="TEMPORARY">Vaqtinchalik</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Smena</label>
                <select [(ngModel)]="newSearch.shiftSchedule" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Farqi yo'q</option>
                  <option value="MORNING">Ertalab</option>
                  <option value="EVENING">Kechki</option>
                  <option value="NIGHT">Tungi</option>
                  <option value="FLEXIBLE">Moslashuvchan</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Benefit filtrlar</label>
                <div class="flex flex-wrap gap-2">
                  @for (benefit of benefits; track benefit.key) {
                    <button
                      type="button"
                      (click)="toggleBenefit(benefit.key)"
                      class="h-9 px-3 rounded-full text-xs font-medium border transition"
                      [class]="newSearch.benefits.includes(benefit.key) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'">
                      {{ benefit.label }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <div class="space-y-2 mt-5">
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" [(ngModel)]="newSearch.verifiedOnly" class="rounded border-gray-300 text-black focus:ring-black">
                Faqat tasdiqlangan kompaniyalar
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" [(ngModel)]="newSearch.notifyEnabled" class="rounded border-gray-300 text-black focus:ring-black">
                Telegram/SMS alertlarni yoqish
              </label>
            </div>

            <div class="flex gap-2 justify-end pt-5">
              <button (click)="closeCreate()" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">Bekor</button>
              <button (click)="save()" [disabled]="!newSearch.name" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Saqlash
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SavedSearchesComponent implements OnInit {
  searches = signal<any[]>([]);
  showCreate = signal(false);
  candidateId = signal<string | null>(null);
  newSearch: SavedSearchDraft = this.createDraft();

  cities = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg\'ona', 'Nukus', 'Navoiy', 'Qarshi'];
  categories = [
    { key: 'COOK', label: 'Oshpaz' }, { key: 'DRIVER', label: 'Haydovchi' },
    { key: 'SALES', label: 'Sotuvchi' }, { key: 'BUILDER', label: 'Qurilishchi' },
    { key: 'SECURITY', label: 'Qo\'riqchi' }, { key: 'WAITER', label: 'Ofitsiant' },
    { key: 'CASHIER', label: 'Kassir' }, { key: 'WAREHOUSE', label: 'Omborchi' },
  ];
  benefits = [
    { key: 'ovqat', label: 'Ovqat' },
    { key: 'transport', label: 'Transport' },
    { key: 'turar-joy', label: 'Turar joy' },
    { key: 'forma', label: 'Forma' },
    { key: 'bonus', label: 'Bonus' },
    { key: 'oqitish', label: "O'qitish" },
  ];

  constructor(private publicApi: PublicApiService, private title: Title) {}

  ngOnInit() {
    this.title.setTitle('Saqlangan qidiruvlar | Verifix Jobs');
    this.candidateId.set(localStorage.getItem('vjw_candidate_id'));
    this.load();
  }

  load() {
    const candidateId = this.candidateId();
    if (!candidateId) {
      this.searches.set([]);
      return;
    }
    this.publicApi.getPublicSavedSearches(candidateId).subscribe({
      next: (response: any) => this.searches.set(response || []),
      error: () => {}
    });
  }

  save() {
    const candidateId = this.candidateId();
    if (!candidateId) {
      return;
    }
    this.publicApi.savePublicSearch({
      candidateId,
      name: this.newSearch.name,
      query: this.newSearch.query || undefined,
      city: this.newSearch.city || undefined,
      category: this.newSearch.category || undefined,
      minSalary: this.newSearch.minSalary ?? undefined,
      maxSalary: this.newSearch.maxSalary ?? undefined,
      employmentType: this.newSearch.employmentType || undefined,
      shiftSchedule: this.newSearch.shiftSchedule || undefined,
      benefits: this.newSearch.benefits.length ? this.newSearch.benefits : undefined,
      verifiedOnly: this.newSearch.verifiedOnly,
      notifyEnabled: this.newSearch.notifyEnabled
    }).subscribe({
      next: () => {
        this.closeCreate();
        this.load();
      },
      error: () => {}
    });
  }

  remove(id: string) {
    const candidateId = this.candidateId();
    if (!candidateId) {
      return;
    }
    this.publicApi.deletePublicSavedSearch(id, candidateId).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }

  toggleBenefit(benefit: string) {
    this.newSearch = {
      ...this.newSearch,
      benefits: this.newSearch.benefits.includes(benefit)
        ? this.newSearch.benefits.filter(item => item !== benefit)
        : [...this.newSearch.benefits, benefit]
    };
  }

  summarizeSearch(search: any): string {
    const parts = [
      search.query,
      search.city,
      search.category ? this.categoryLabel(search.category) : '',
      search.employmentType ? this.employmentLabel(search.employmentType) : '',
      search.shiftSchedule ? this.shiftLabel(search.shiftSchedule) : ''
    ].filter(Boolean);

    if (search.minSalary) {
      parts.push(`${search.minSalary}+ UZS`);
    }
    if (search.maxSalary) {
      parts.push(`up to ${search.maxSalary} UZS`);
    }

    return parts.length ? parts.join(' / ') : 'Umumiy search preset';
  }

  categoryLabel(key: string): string {
    return this.categories.find(category => category.key === key)?.label || key;
  }

  employmentLabel(value: string): string {
    return ({
      FULL_TIME: "To'liq stavka",
      PART_TIME: 'Yarim stavka',
      CONTRACT: 'Shartnoma',
      TEMPORARY: 'Vaqtinchalik'
    } as Record<string, string>)[value] || value;
  }

  shiftLabel(value: string): string {
    return ({
      MORNING: 'Ertalab',
      EVENING: 'Kechki',
      NIGHT: 'Tungi',
      FLEXIBLE: 'Moslashuvchan'
    } as Record<string, string>)[value] || value;
  }

  closeCreate() {
    this.showCreate.set(false);
    this.newSearch = this.createDraft();
  }

  private createDraft(): SavedSearchDraft {
    return {
      name: '',
      query: '',
      city: '',
      category: '',
      minSalary: null,
      maxSalary: null,
      employmentType: '',
      shiftSchedule: '',
      benefits: [],
      verifiedOnly: false,
      notifyEnabled: true
    };
  }
}
