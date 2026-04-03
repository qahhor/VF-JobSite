import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b border-gray-100 h-14 flex items-center px-6">
        <img src="assets/logo-icon.svg" class="h-7 mr-2" />
        <span class="font-bold text-lg">Verifix Jobs</span>
        <span class="ml-auto text-sm text-gray-400">{{ i18n.t('onboarding.setup') }}</span>
      </header>

      <div class="max-w-2xl mx-auto px-4 py-8">
        <!-- Progress -->
        <div class="flex items-center gap-2 mb-8">
          @for (s of steps; track s.key; let i = $index) {
            <div class="flex items-center gap-2 flex-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
                   [class]="step() >= i ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'">{{ i + 1 }}</div>
              <div class="text-xs font-medium hidden sm:block" [class]="step() >= i ? 'text-gray-900' : 'text-gray-400'">{{ i18n.t(s.labelKey) }}</div>
              @if (i < steps.length - 1) { <div class="flex-1 h-0.5 rounded" [class]="step() > i ? 'bg-black' : 'bg-gray-200'"></div> }
            </div>
          }
        </div>

        <!-- Step 1: Company Profile -->
        @if (step() === 0) {
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-1">🏢 {{ i18n.t('onboarding.profile_title') }}</h2>
            <p class="text-sm text-gray-400 mb-6">{{ i18n.t('onboarding.profile_desc') }}</p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('auth.company_name') }}</label>
                <input type="text" [(ngModel)]="profile.name" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black outline-none">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.city') }}</label>
                  <select [(ngModel)]="profile.city" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="">{{ i18n.t('common.choose') }}</option>
                    @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.industry') }}</label>
                  <select [(ngModel)]="profile.industry" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="">{{ i18n.t('common.choose') }}</option>
                    @for (ind of industries; track ind) { <option [value]="ind">{{ industryLabel(ind) }}</option> }
                  </select>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Step 2: First Vacancy -->
        @if (step() === 1) {
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-1">📋 {{ i18n.t('onboarding.first_vacancy_title') }}</h2>
            <p class="text-sm text-gray-400 mb-6">{{ i18n.t('onboarding.first_vacancy_desc') }}</p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.vacancy') }}</label>
                <input type="text" [(ngModel)]="vacancy.title" [placeholder]="i18n.t('onboarding.vacancy_name_placeholder')" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black outline-none">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.category') }}</label>
                  <select [(ngModel)]="vacancy.category" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm bg-white">
                    @for (cat of categories; track cat.key) { <option [value]="cat.key">{{ cat.icon }} {{ i18n.t('category.' + cat.key) }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.salary') }} (UZS)</label>
                  <input type="number" [(ngModel)]="vacancy.salaryFrom" placeholder="3000000" class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black outline-none">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.description') }}</label>
                <textarea [(ngModel)]="vacancy.description" rows="3" [placeholder]="i18n.t('vacancy_form.description_placeholder')" class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-black outline-none"></textarea>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Notifications -->
        @if (step() === 2) {
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-bold text-gray-900 mb-1">🔔 {{ i18n.t('common.notifications') }}</h2>
            <p class="text-sm text-gray-400 mb-6">{{ i18n.t('onboarding.notifications_desc') }}</p>
            <div class="space-y-4">
              @for (n of notifications; track n.key) {
                <label class="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer">
                  <div>
                    <div class="text-sm font-medium text-gray-700">{{ i18n.t(n.labelKey) }}</div>
                    <div class="text-xs text-gray-400">{{ i18n.t(n.descKey) }}</div>
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
            <h2 class="text-xl font-bold text-gray-900 mb-2">{{ i18n.t('onboarding.done_title') }}</h2>
            <p class="text-sm text-gray-500 mb-6">{{ i18n.t('onboarding.done_desc') }}</p>
            <a routerLink="/employer/dashboard" class="inline-flex h-12 px-8 bg-black text-white rounded-xl text-sm font-semibold items-center hover:bg-gray-800 transition">
              {{ i18n.t('onboarding.go_dashboard') }}
            </a>
          </div>
        }

        <!-- Navigation -->
        @if (step() < 3) {
          @if (stepError()) {
            <div class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ stepError() }}
            </div>
          }
          <div class="flex justify-between mt-6">
            <button (click)="prev()" [disabled]="step() === 0"
                    class="h-11 px-6 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-30">
              {{ i18n.t('common.back') }}
            </button>
            <button (click)="next()" [disabled]="saving()"
                    class="h-11 px-8 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {{ step() === 2 ? i18n.t('onboarding.finish') : i18n.t('common.next') }}
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
  stepError = signal('');

  steps = [
    { key: 'profile', labelKey: 'onboarding.step.profile' },
    { key: 'vacancy', labelKey: 'onboarding.step.vacancy' },
    { key: 'notifications', labelKey: 'onboarding.step.notifications' },
    { key: 'done', labelKey: 'onboarding.step.done' },
  ];

  profile = { name: '', city: '', industry: '' };
  vacancy = { title: '', category: 'COOK', salaryFrom: null as number | null, description: '' };
  notifications = [
    { key: 'new_app', labelKey: 'settings.notification.new_application', descKey: 'settings.notification.new_application_desc', enabled: true },
    { key: 'hired', labelKey: 'settings.notification.hired', descKey: 'settings.notification.hired_desc', enabled: true },
    { key: 'expiry', labelKey: 'settings.notification.expired', descKey: 'settings.notification.expired_desc', enabled: true },
    { key: 'digest', labelKey: 'settings.notification.digest', descKey: 'settings.notification.digest_desc', enabled: false },
  ];

  cities = ['Toshkent','Samarqand','Buxoro','Andijon','Namangan','Farg\'ona','Nukus','Navoiy','Qarshi','Jizzax','Termiz','Urganch'];
  industries = ['FOOD', 'TRANSPORT', 'CONSTRUCTION', 'RETAIL', 'SERVICES', 'MANUFACTURING', 'IT', 'EDUCATION', 'HEALTHCARE'];
  categories = [
    {key:'COOK',icon:'👨‍🍳'},{key:'DRIVER',icon:'🚗'},
    {key:'SALES',icon:'🛒'},{key:'BUILDER',icon:'🏗️'},
    {key:'WAITER',icon:'🍽️'},{key:'SECURITY',icon:'🛡️'},
    {key:'WAREHOUSE',icon:'📦'},{key:'CASHIER',icon:'💰'},
  ];

  constructor(private api: ApiService, private router: Router, public i18n: I18nService) {}

  industryLabel(industry: string): string {
    return this.i18n.t(`industry.${industry}`) || industry;
  }

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
    this.stepError.set('');
    if (s === 0) {
      // Save profile
      this.saving.set(true);
      this.api.updateProfile(this.profile as any).subscribe({
        next: () => { this.saving.set(false); this.step.set(1); },
        error: () => {
          this.saving.set(false);
          this.stepError.set(this.i18n.t('onboarding.profile_error'));
        }
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
          error: () => {
            this.saving.set(false);
            this.stepError.set(this.i18n.t('onboarding.vacancy_error'));
          }
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
