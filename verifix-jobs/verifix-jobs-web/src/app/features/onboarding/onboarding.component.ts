import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'vjw-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b border-gray-100 h-14 flex items-center px-6">
        <img src="assets/logo-icon.svg" class="h-7 mr-2" />
        <span class="font-bold text-lg">Verifix Jobs</span>
        <span class="ml-auto text-sm text-gray-400">Boshlang'ich sozlash</span>
      </header>

      <div class="max-w-2xl mx-auto px-4 py-8">
        <!-- Progress -->
        <div class="flex items-center gap-2 mb-8">
          @for (s of steps; track s.key; let i = $index) {
            <div class="flex items-center gap-2 flex-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
                   [class]="step() >= i ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'">{{ i + 1 }}</div>
              <div class="text-xs font-medium hidden sm:block" [class]="step() >= i ? 'text-gray-900' : 'text-gray-400'">{{ s.label }}</div>
              @if (i < steps.length - 1) { <div class="flex-1 h-0.5 rounded" [class]="step() > i ? 'bg-black' : 'bg-gray-200'"></div> }
            </div>
          }
        </div>

        <!-- Step 1: Company Profile -->
        @if (step() === 0) {
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-1">🏢 Kompaniya profili</h2>
            <p class="text-sm text-gray-400 mb-6">Kompaniya haqida asosiy ma'lumotlarni kiriting</p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kompaniya nomi</label>
                <input type="text" [(ngModel)]="profile.name" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black outline-none">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Shahar</label>
                  <select [(ngModel)]="profile.city" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="">Tanlang</option>
                    @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Soha</label>
                  <select [(ngModel)]="profile.industry" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="">Tanlang</option>
                    @for (ind of industries; track ind) { <option [value]="ind">{{ ind }}</option> }
                  </select>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Step 2: First Vacancy -->
        @if (step() === 1) {
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-1">📋 Birinchi vakansiya</h2>
            <p class="text-sm text-gray-400 mb-6">Birinchi vakansiyangizni yarating — keyinroq o'zgartirish mumkin</p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vakansiya nomi</label>
                <input type="text" [(ngModel)]="vacancy.title" placeholder="Masalan: Oshpaz" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black outline-none">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                  <select [(ngModel)]="vacancy.category" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white">
                    @for (cat of categories; track cat.key) { <option [value]="cat.key">{{ cat.icon }} {{ cat.label }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Maosh (UZS)</label>
                  <input type="number" [(ngModel)]="vacancy.salaryFrom" placeholder="3000000" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black outline-none">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                <textarea [(ngModel)]="vacancy.description" rows="3" placeholder="Ish haqida qisqacha..." class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-black outline-none"></textarea>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Notifications -->
        @if (step() === 2) {
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-1">🔔 Bildirishnomalar</h2>
            <p class="text-sm text-gray-400 mb-6">Qanday xabarnomalarni olishni xohlaysiz?</p>
            <div class="space-y-4">
              @for (n of notifications; track n.key) {
                <label class="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer">
                  <div>
                    <div class="text-sm font-medium text-gray-700">{{ n.label }}</div>
                    <div class="text-xs text-gray-400">{{ n.desc }}</div>
                  </div>
                  <input type="checkbox" [(ngModel)]="n.enabled" class="w-5 h-5 rounded border-gray-300 text-black focus:ring-black">
                </label>
              }
            </div>
          </div>
        }

        <!-- Step 4: Done -->
        @if (step() === 3) {
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div class="text-5xl mb-4">🎉</div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Tabriklaymiz!</h2>
            <p class="text-sm text-gray-500 mb-6">Kompaniyangiz tayyor. Endi vakansiyalarni boshqarishingiz mumkin.</p>
            <a routerLink="/employer/dashboard" class="inline-flex h-12 px-8 bg-black text-white rounded-xl text-sm font-semibold items-center hover:bg-gray-800 transition">
              Dashboard ga o'tish
            </a>
          </div>
        }

        <!-- Navigation -->
        @if (step() < 3) {
          <div class="flex justify-between mt-6">
            <button (click)="prev()" [disabled]="step() === 0"
                    class="h-11 px-6 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-30">
              Orqaga
            </button>
            <button (click)="next()" [disabled]="saving()"
                    class="h-11 px-8 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {{ step() === 2 ? 'Tugatish' : 'Keyingi' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class OnboardingComponent implements OnInit {
  step = signal(0);
  saving = signal(false);

  steps = [
    { key: 'profile', label: 'Profil' },
    { key: 'vacancy', label: 'Vakansiya' },
    { key: 'notifications', label: 'Xabarnoma' },
    { key: 'done', label: 'Tayyor' },
  ];

  profile = { name: '', city: '', industry: '' };
  vacancy = { title: '', category: 'COOK', salaryFrom: null as number | null, description: '' };
  notifications = [
    { key: 'new_app', label: 'Yangi arizalar', desc: 'Yangi ariza kelganda xabar', enabled: true },
    { key: 'hired', label: 'Ishga olish', desc: 'Nomzod yollanganda xabar', enabled: true },
    { key: 'expiry', label: 'Vakansiya muddati', desc: 'Muddat tugaganda eslatma', enabled: true },
    { key: 'digest', label: 'Haftalik hisobot', desc: 'Haftalik analitika', enabled: false },
  ];

  cities = ['Toshkent','Samarqand','Buxoro','Andijon','Namangan','Farg\'ona','Nukus','Navoiy','Qarshi','Jizzax','Termiz','Urganch'];
  industries = ['Oziq-ovqat','Transport','Qurilish','Savdo','Xizmat ko\'rsatish','Ishlab chiqarish','IT','Ta\'lim','Sog\'liqni saqlash'];
  categories = [
    {key:'COOK',label:'Oshpaz',icon:'👨‍🍳'},{key:'DRIVER',label:'Haydovchi',icon:'🚗'},
    {key:'SALES',label:'Sotuvchi',icon:'🛒'},{key:'BUILDER',label:'Qurilishchi',icon:'🏗️'},
    {key:'WAITER',label:'Ofitsiant',icon:'🍽️'},{key:'SECURITY',label:'Qo\'riqchi',icon:'🛡️'},
    {key:'WAREHOUSE',label:'Omborchi',icon:'📦'},{key:'CASHIER',label:'Kassir',icon:'💰'},
  ];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (p: any) => {
        if (p.name) this.profile.name = p.name;
        if (p.city) this.profile.city = p.city;
        if (p.industry) this.profile.industry = p.industry;
      },
      error: () => {}
    });
  }

  prev() { if (this.step() > 0) this.step.update(s => s - 1); }

  next() {
    const s = this.step();
    if (s === 0) {
      // Save profile
      this.saving.set(true);
      this.api.updateProfile(this.profile as any).subscribe({
        next: () => { this.saving.set(false); this.step.set(1); },
        error: () => { this.saving.set(false); this.step.set(1); }
      });
    } else if (s === 1) {
      // Create vacancy
      if (this.vacancy.title) {
        this.saving.set(true);
        this.api.createVacancy({
          title: this.vacancy.title,
          category: this.vacancy.category,
          city: this.profile.city,
          salaryFrom: this.vacancy.salaryFrom || undefined,
          description: this.vacancy.description,
          employmentType: 'FULL_TIME',
        } as any).subscribe({
          next: () => { this.saving.set(false); this.step.set(2); },
          error: () => { this.saving.set(false); this.step.set(2); }
        });
      } else {
        this.step.set(2);
      }
    } else if (s === 2) {
      // Save notification prefs
      const prefs: Record<string, boolean> = {};
      this.notifications.forEach(n => prefs[n.key] = n.enabled);
      localStorage.setItem('vjw_notification_prefs', JSON.stringify(prefs));
      localStorage.setItem('vjw_onboarded', 'true');
      this.step.set(3);
    }
  }
}
