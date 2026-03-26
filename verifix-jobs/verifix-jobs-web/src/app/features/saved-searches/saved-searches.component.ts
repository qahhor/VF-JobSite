import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vjw-saved-searches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Saqlangan qidiruvlar</h1>
        <button (click)="showCreate.set(true)" class="h-10 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Yangi qidiruv
        </button>
      </div>

      <!-- Saved searches list -->
      @if (searches().length) {
        <div class="space-y-3">
          @for (s of searches(); track s.id) {
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🔔</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800">{{ s.name }}</div>
                <div class="text-xs text-gray-400 mt-0.5">
                  @if (s.city) { 📍 {{ s.city }} }
                  @if (s.category) { · {{ categoryLabel(s.category) }} }
                  @if (s.minSalary) { · {{ s.minSalary }}+ UZS }
                </div>
              </div>
              <button (click)="remove(s.id)" class="text-gray-300 hover:text-red-500 transition text-lg">✕</button>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div class="text-4xl mb-3">🔍</div>
          <div class="text-sm text-gray-500 mb-2">Saqlangan qidiruvlar yo'q</div>
          <div class="text-xs text-gray-400">Qidiruv saqlasangiz, yangi vakansiyalar haqida xabar olasiz</div>
        </div>
      }

      <!-- Create modal -->
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showCreate.set(false)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Qidiruvni saqlash</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomi</label>
                <input type="text" [(ngModel)]="newSearch.name" placeholder="Masalan: Toshkentda oshpaz" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shahar</label>
                <select [(ngModel)]="newSearch.city" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Barcha shaharlar</option>
                  @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                <select [(ngModel)]="newSearch.category" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Barcha kasblar</option>
                  @for (cat of categories; track cat.key) { <option [value]="cat.key">{{ cat.label }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Minimal maosh (UZS)</label>
                <input type="number" [(ngModel)]="newSearch.minSalary" placeholder="3000000" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>
              <div class="flex gap-2 justify-end pt-2">
                <button (click)="showCreate.set(false)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">Bekor</button>
                <button (click)="save()" [disabled]="!newSearch.name" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">Saqlash</button>
              </div>
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
  newSearch = { name: '', city: '', category: '', minSalary: null as number | null };

  cities = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', 'Farg\'ona', 'Nukus', 'Navoiy', 'Qarshi'];
  categories = [
    { key: 'COOK', label: 'Oshpaz' }, { key: 'DRIVER', label: 'Haydovchi' },
    { key: 'SALES', label: 'Sotuvchi' }, { key: 'BUILDER', label: 'Qurilishchi' },
    { key: 'SECURITY', label: 'Qo\'riqchi' }, { key: 'WAITER', label: 'Ofitsiant' },
    { key: 'CASHIER', label: 'Kassir' }, { key: 'WAREHOUSE', label: 'Omborchi' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${environment.apiUrl}/candidates/saved-searches`).subscribe({
      next: (r: any) => this.searches.set(r || []),
      error: () => {}
    });
  }

  save() {
    this.http.post<any>(`${environment.apiUrl}/candidates/saved-searches`, this.newSearch).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newSearch = { name: '', city: '', category: '', minSalary: null };
        this.load();
      },
      error: () => {}
    });
  }

  remove(id: string) {
    this.http.delete(`${environment.apiUrl}/candidates/saved-searches/${id}`).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }

  categoryLabel(key: string): string {
    return this.categories.find(c => c.key === key)?.label || key;
  }
}
