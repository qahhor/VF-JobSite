import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { VacancyCreateRequest } from '../../core/models';
import { SYSTEM_TEMPLATES, VacancyTemplate } from '../../shared/utils/vacancy-templates';

@Component({
  selector: 'vjw-vacancy-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">{{ isEdit ? i18n.t('vacancy_form.edit_title') : i18n.t('vacancy_form.new_title') }}</h1>

      <form (submit)="handleSubmit($event)" class="space-y-6">
        @if (!isEdit && step() === 0) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-800 mb-3">{{ i18n.t('vacancy_form.template_title') }}</h3>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              @for (t of templates; track t.name) {
                <button
                  type="button"
                  (click)="useTemplate(t)"
                  class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition text-center">
                  <span class="text-2xl">{{ t.icon }}</span>
                  <span class="text-xs font-medium text-gray-600">{{ t.name }}</span>
                </button>
              }
            </div>
          </div>
        }

        <div class="flex items-center gap-2 overflow-x-auto pb-2">
          @for (s of steps; track s.id; let i = $index) {
            <div class="flex items-center gap-2 shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition"
                   [class]="step() === i ? 'bg-black text-white' : step() > i ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                {{ step() > i ? 'OK' : i + 1 }}
              </div>
              <span class="text-sm" [class]="step() === i ? 'text-gray-800 font-medium' : 'text-gray-400'">{{ i18n.t(s.labelKey) }}</span>
              @if (i < steps.length - 1) { <div class="w-6 h-px bg-gray-200"></div> }
            </div>
          }
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          @if (step() === 0) {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.vacancy') }} *</label>
                <input type="text" [(ngModel)]="form.title" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-primary outline-none" [placeholder]="i18n.t('vacancy_form.title_placeholder')" [attr.aria-label]="i18n.t('common.vacancy')" aria-required="true">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.category') }} *</label>
                  <select [(ngModel)]="form.category" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    @for (c of categories; track c) { <option [value]="c">{{ i18n.t('category.' + c) }}</option> }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.city') }} *</label>
                  <select [(ngModel)]="form.city" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    @for (c of cities; track c) { <option [value]="c">{{ c }}</option> }
                  </select>
                </div>
              </div>
            </div>
          }

          @if (step() === 1) {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.description') }} *</label>
                <textarea [(ngModel)]="form.description" [ngModelOptions]="{ standalone: true }" rows="6" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-primary outline-none" [placeholder]="i18n.t('vacancy_form.description_placeholder')"></textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('vacancy_form.work_type') }}</label>
                  <select [(ngModel)]="form.employmentType" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="FULL_TIME">{{ i18n.t('employment.full_time') }}</option>
                    <option value="PART_TIME">{{ i18n.t('employment.part_time') }}</option>
                    <option value="CONTRACT">{{ i18n.t('employment.contract') }}</option>
                    <option value="TEMPORARY">{{ i18n.t('employment.temporary') }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('filter.shift') }}</label>
                  <select [(ngModel)]="form.shiftSchedule" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="MORNING">{{ i18n.t('shift.morning_full') }}</option>
                    <option value="EVENING">{{ i18n.t('shift.evening_full') }}</option>
                    <option value="NIGHT">{{ i18n.t('shift.night_full') }}</option>
                    <option value="FLEXIBLE">{{ i18n.t('shift.flexible_full') }}</option>
                  </select>
                </div>
              </div>
            </div>
          }

          @if (step() === 2) {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('vacancy_form.benefits') }}</label>
                <input type="text" [(ngModel)]="benefitsStr" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" [placeholder]="i18n.t('vacancy_form.benefits_placeholder')">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('vacancy_form.positions') }}</label>
                  <input type="number" [(ngModel)]="form.positionsCount" [ngModelOptions]="{ standalone: true }" min="1" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
                </div>
                <div class="flex items-center gap-2 pt-6">
                  <input type="checkbox" [(ngModel)]="form.isMassHiring" [ngModelOptions]="{ standalone: true }" class="rounded border-gray-300">
                  <label class="text-sm text-gray-700">{{ i18n.t('vacancy_form.mass_hiring') }}</label>
                </div>
              </div>
            </div>
          }

          @if (step() === 3) {
            <div class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.salary_from') }} (UZS)</label>
                  <input type="number" [(ngModel)]="form.salaryFrom" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="2000000">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('common.salary_to') }} (UZS)</label>
                  <input type="number" [(ngModel)]="form.salaryTo" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" placeholder="5000000">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ i18n.t('vacancy_form.expiry') }}</label>
                <input type="date" [(ngModel)]="form.expiresAt" [ngModelOptions]="{ standalone: true }" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
              </div>
            </div>
          }

          @if (step() === 4) {
            <div class="space-y-3">
              <h3 class="font-semibold text-gray-800">{{ i18n.t('vacancy_form.review') }}</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <span class="text-gray-500">{{ i18n.t('common.name') }}:</span><span class="font-medium">{{ form.title }}</span>
                <span class="text-gray-500">{{ i18n.t('common.category') }}:</span><span>{{ i18n.t('category.' + form.category) }}</span>
                <span class="text-gray-500">{{ i18n.t('common.city') }}:</span><span>{{ form.city }}</span>
                <span class="text-gray-500">{{ i18n.t('vacancy_form.work_type') }}:</span><span>{{ employmentLabel(form.employmentType) }}</span>
                <span class="text-gray-500">{{ i18n.t('common.salary') }}:</span><span>{{ form.salaryFrom || '-' }} - {{ form.salaryTo || '-' }} UZS</span>
                <span class="text-gray-500">{{ i18n.t('vacancy_form.positions') }}:</span><span>{{ form.positionsCount }}</span>
              </div>
              @if (form.description) {
                <div class="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{{ form.description }}</div>
              }
            </div>
          }

          @if (formError()) {
            <div class="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{{ formError() }}</div>
          }

          <div class="flex justify-between mt-6 pt-4 border-t border-gray-100">
            <button type="button" (click)="prevStep()" [disabled]="step() === 0"
                    class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-30">{{ i18n.t('common.back') }}</button>
            @if (step() < 4) {
              <button type="button" (click)="nextStep()" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">{{ i18n.t('common.next') }}</button>
            } @else {
              <button type="submit" [disabled]="saving()" class="min-w-[140px] px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ saving() ? i18n.t('vacancy_form.saving') : (isEdit ? i18n.t('vacancy_form.update') : i18n.t('vacancy_form.create')) }}
              </button>
            }
          </div>
        </div>
      </form>
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
    { id: 0, labelKey: 'vacancy_form.step.basic' }, { id: 1, labelKey: 'vacancy_form.step.details' },
    { id: 2, labelKey: 'vacancy_form.step.requirements' }, { id: 3, labelKey: 'vacancy_form.step.salary' }, { id: 4, labelKey: 'vacancy_form.step.confirm' },
  ];

  categories = ['COOK','DRIVER','SALES','BUILDER','CLEANER','WAITER','CASHIER','WAREHOUSE','SECURITY','ELECTRICIAN','PLUMBER','TAILOR','COURIER','LOADER','MECHANIC','PAINTER','WELDER','CARPENTER','GARDENER','NANNY'];
  cities = ['Tashkent','Samarkand','Bukhara','Andijan','Namangan','Fergana','Nukus','Karshi','Navoi','Jizzakh','Gulistan','Termez','Urgench','Khiva','Chirchik','Almalyk'];

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, public i18n: I18nService) {}

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
    if (s === 0 && (!this.form.title?.trim() || !this.form.category || !this.form.city)) {
      this.formError.set(this.i18n.t('vacancy_form.validation_basic'));
      return;
    }
    if (s === 1 && (!this.form.description || this.form.description.trim().length < 10)) {
      this.formError.set(this.i18n.t('vacancy_form.validation_description'));
      return;
    }
    if (this.step() < 4) this.step.update(v => v + 1);
  }

  prevStep() {
    if (this.step() > 0) {
      this.step.update(s => s - 1);
    }
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (this.step() < 4) {
      this.nextStep();
      return;
    }
    this.submit();
  }

  submit() {
    if (!this.form.title?.trim()) {
      this.formError.set(this.i18n.t('vacancy_form.validation_title'));
      return;
    }
    this.saving.set(true);
    this.formError.set('');
    this.form.benefits = this.benefitsStr.split(',').map(s => s.trim()).filter(Boolean);
    const req = this.isEdit ? this.api.updateVacancy(this.vacancyId!, this.form) : this.api.createVacancy(this.form);
    req.subscribe({
      next: () => this.router.navigate(['/employer/vacancies']),
      error: (err: any) => {
        this.saving.set(false);
        this.formError.set(err.error?.message || this.i18n.t('vacancy_form.generic_error'));
      },
    });
  }

  employmentLabel(value: string): string {
    return ({
      FULL_TIME: this.i18n.t('employment.full_time'),
      PART_TIME: this.i18n.t('employment.part_time'),
      CONTRACT: this.i18n.t('employment.contract'),
      TEMPORARY: this.i18n.t('employment.temporary')
    } as Record<string, string>)[value] || value;
  }
}
