import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { VacancyCreateRequest } from '../../core/models';
import { SYSTEM_TEMPLATES, VacancyTemplate } from '../../shared/utils/vacancy-templates';

@Component({
  selector: 'vjw-vacancy-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? 'Vakansiyani tahrirlash' : 'Yangi vakansiya' }}</h1>

      <!-- Template picker (only for new vacancies) -->
      @if (!isEdit && step() === 0) {
        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 class="text-sm font-semibold text-gray-800 mb-3">Shablondan yaratish</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            @for (t of templates; track t.name) {
              <button (click)="useTemplate(t)" class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition text-center">
                <span class="text-2xl">{{ t.icon }}</span>
                <span class="text-xs font-medium text-gray-600">{{ t.name }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step indicator -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        @for (s of steps; track s.id; let i = $index) {
          <div class="flex items-center gap-2 shrink-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition"
                 [class]="step() === i ? 'bg-black text-white' : step() > i ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
              {{ step() > i ? '✓' : i + 1 }}
            </div>
            <span class="text-sm" [class]="step() === i ? 'text-gray-800 font-medium' : 'text-gray-400'">{{ s.label }}</span>
            @if (i < steps.length - 1) { <div class="w-6 h-px bg-gray-200"></div> }
          </div>
        }
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <!-- Step 1: Basics -->
        @if (step() === 0) {
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Vakansiya nomi *</label>
              <input type="text" [(ngModel)]="form.title" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-primary outline-none" placeholder="Masalan: Bosh oshpaz" aria-label="Vakansiya nomi" aria-required="true">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategoriya *</label>
                <select [(ngModel)]="form.category" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                  @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shahar *</label>
                <select [(ngModel)]="form.city" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                  @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Step 2: Details -->
        @if (step() === 1) {
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tavsif *</label>
              <textarea [(ngModel)]="form.description" rows="6" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-primary outline-none" placeholder="Ish haqida batafsil..."></textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ish turi</label>
                <select [(ngModel)]="form.employmentType" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                  <option value="FULL_TIME">To'liq vaqt</option>
                  <option value="PART_TIME">Qisman vaqt</option>
                  <option value="CONTRACT">Shartnoma</option>
                  <option value="TEMPORARY">Vaqtinchalik</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Smena</label>
                <select [(ngModel)]="form.shiftSchedule" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                  <option value="MORNING">Ertalabki</option>
                  <option value="EVENING">Kechki</option>
                  <option value="NIGHT">Tungi</option>
                  <option value="FLEXIBLE">Erkin</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Requirements -->
        @if (step() === 2) {
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Imtiyozlar (vergul bilan)</label>
              <input type="text" [(ngModel)]="benefitsStr" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="Ovqat, transport, uy-joy...">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">O'rinlar soni</label>
                <input type="number" [(ngModel)]="form.positionsCount" min="1" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              </div>
              <div class="flex items-center gap-2 pt-6">
                <input type="checkbox" [(ngModel)]="form.isMassHiring" class="rounded border-gray-300">
                <label class="text-sm text-gray-700">Ommaviy yollash</label>
              </div>
            </div>
          </div>
        }

        <!-- Step 4: Salary -->
        @if (step() === 3) {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Maosh dan (UZS)</label>
                <input type="number" [(ngModel)]="form.salaryFrom" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="2000000">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Maosh gacha (UZS)</label>
                <input type="number" [(ngModel)]="form.salaryTo" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="5000000">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amal qilish muddati</label>
              <input type="date" [(ngModel)]="form.expiresAt" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
            </div>
          </div>
        }

        <!-- Step 5: Review -->
        @if (step() === 4) {
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-800">Ko'rib chiqish</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <span class="text-gray-500">Nomi:</span><span class="font-medium">{{ form.title }}</span>
              <span class="text-gray-500">Kategoriya:</span><span>{{ form.category }}</span>
              <span class="text-gray-500">Shahar:</span><span>{{ form.city }}</span>
              <span class="text-gray-500">Ish turi:</span><span>{{ form.employmentType }}</span>
              <span class="text-gray-500">Maosh:</span><span>{{ form.salaryFrom || '—' }} — {{ form.salaryTo || '—' }} UZS</span>
              <span class="text-gray-500">O'rinlar:</span><span>{{ form.positionsCount }}</span>
            </div>
            @if (form.description) {
              <div class="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{{ form.description }}</div>
            }
          </div>
        }

        @if (formError()) {
          <div class="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{{ formError() }}</div>
        }

        <!-- Navigation -->
        <div class="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button (click)="prevStep()" [disabled]="step() === 0"
                  class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30">Orqaga</button>
          @if (step() < 4) {
            <button (click)="nextStep()" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">Keyingi</button>
          } @else {
            <button (click)="submit()" [disabled]="saving()" class="px-6 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-600 disabled:opacity-50">
              {{ saving() ? 'Saqlanmoqda...' : 'Yaratish' }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class VacancyFormComponent implements OnInit {
  isEdit = false;
  vacancyId: string | null = null;
  step = signal(0);
  saving = signal(false);
  benefitsStr = '';

  templates = SYSTEM_TEMPLATES;

  form: VacancyCreateRequest & { shiftSchedule?: string; positionsCount?: number; isMassHiring?: boolean; salaryTo?: number; expiresAt?: string } = {
    title: '', description: '', category: 'COOK', city: 'Tashkent',
    employmentType: 'FULL_TIME', shiftSchedule: 'MORNING', positionsCount: 1,
  };

  useTemplate(t: VacancyTemplate) {
    this.form.title = t.name;
    this.form.category = t.category;
    this.form.description = t.description;
    this.form.employmentType = t.employmentType;
    this.benefitsStr = t.benefits.join(', ');
    this.step.set(0);
  }

  steps = [
    { id: 0, label: 'Asosiy' }, { id: 1, label: 'Tafsilot' },
    { id: 2, label: 'Talablar' }, { id: 3, label: 'Maosh' }, { id: 4, label: 'Tasdiqlash' },
  ];

  categories = ['COOK','DRIVER','SALES','BUILDER','CLEANER','WAITER','CASHIER','WAREHOUSE','SECURITY','ELECTRICIAN','PLUMBER','TAILOR','COURIER','LOADER','MECHANIC','PAINTER','WELDER','CARPENTER','GARDENER','NANNY'];
  cities = ['Tashkent','Samarkand','Bukhara','Andijan','Namangan','Fergana','Nukus','Karshi','Navoi','Jizzakh','Gulistan','Termez','Urgench','Khiva','Chirchik','Almalyk'];

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.vacancyId = this.route.snapshot.params['id'] || null;
    if (this.vacancyId) {
      this.isEdit = true;
      this.api.getVacancy(this.vacancyId).subscribe(v => {
        this.form = { ...v, benefits: v.benefits, salaryFrom: v.salaryFrom ?? undefined, salaryTo: v.salaryTo ?? undefined } as any;
        this.benefitsStr = v.benefits?.join(', ') || '';
      });
    }
  }

  formError = signal('');

  nextStep() {
    this.formError.set('');
    const s = this.step();
    // Validate before advancing
    if (s === 0 && (!this.form.title?.trim() || !this.form.category || !this.form.city)) {
      this.formError.set('Sarlavha, kategoriya va shaharni kiriting');
      return;
    }
    if (s === 1 && (!this.form.description || this.form.description.trim().length < 10)) {
      this.formError.set('Tavsifni kamida 10 belgi kiriting');
      return;
    }
    if (this.step() < 4) this.step.update(v => v + 1);
  }
  prevStep() { if (this.step() > 0) this.step.update(s => s - 1); }

  submit() {
    if (!this.form.title?.trim()) { this.formError.set('Sarlavha kiritilmagan'); return; }
    this.saving.set(true);
    this.formError.set('');
    this.form.benefits = this.benefitsStr.split(',').map(s => s.trim()).filter(Boolean);
    const req = this.isEdit ? this.api.updateVacancy(this.vacancyId!, this.form) : this.api.createVacancy(this.form);
    req.subscribe({
      next: () => this.router.navigate(['/employer/vacancies']),
      error: (err: any) => { this.saving.set(false); this.formError.set(err.error?.message || 'Xatolik yuz berdi'); },
    });
  }
}
