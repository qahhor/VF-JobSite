import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../core/services/public-api.service';

type ModalStep = 'phone' | 'otp' | 'info' | 'success' | 'error';

@Component({
  selector: 'vjw-public-apply-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="close()"></div>

      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Ariza topshirish</h2>
            <p class="text-xs text-gray-500 truncate max-w-[280px]">{{ vacancyTitle }}</p>
          </div>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="px-6 py-6">
          <!-- Step indicator -->
          <div class="flex items-center justify-center gap-2 mb-6">
            @for (s of ['phone', 'otp', 'info']; track s; let i = $index) {
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                     [class.bg-black]="getStepIndex(step()) >= i"
                     [class.text-white]="getStepIndex(step()) >= i"
                     [class.bg-gray-100]="getStepIndex(step()) < i"
                     [class.text-gray-400]="getStepIndex(step()) < i">
                  {{ i + 1 }}
                </div>
                @if (i < 2) {
                  <div class="w-8 h-0.5 rounded" [class.bg-black]="getStepIndex(step()) > i" [class.bg-gray-200]="getStepIndex(step()) <= i"></div>
                }
              </div>
            }
          </div>

          <!-- STEP: Phone -->
          @if (step() === 'phone') {
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Telefon raqamingiz</label>
              <div class="flex items-center gap-2">
                <span class="shrink-0 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 font-medium">+998</span>
                <input type="tel" [(ngModel)]="phone" placeholder="90 123 45 67" maxlength="12"
                       class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30 text-sm"
                       (keyup.enter)="sendOtp()" />
              </div>
              @if (phoneError()) {
                <p class="text-red-500 text-xs mt-2">{{ phoneError() }}</p>
              }
              <button (click)="sendOtp()" [disabled]="sendingOtp()"
                      class="w-full mt-4 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                @if (sendingOtp()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Yuborilmoqda...
                  </span>
                } @else {
                  SMS kod yuborish
                }
              </button>
            </div>
          }

          <!-- STEP: OTP -->
          @if (step() === 'otp') {
            <div>
              <p class="text-sm text-gray-600 mb-4">
                +998 {{ phone }} raqamiga SMS kod yuborildi
              </p>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tasdiqlash kodi</label>
              <input type="text" [(ngModel)]="otpCode" placeholder="123456" maxlength="6"
                     class="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 text-center text-lg tracking-[0.5em] font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30"
                     (keyup.enter)="verifyOtp()" />
              @if (otpError()) {
                <p class="text-red-500 text-xs mt-2">{{ otpError() }}</p>
              }
              <button (click)="verifyOtp()" [disabled]="verifyingOtp()"
                      class="w-full mt-4 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Tasdiqlash
              </button>
              <button (click)="step.set('phone')" class="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2">
                Raqamni o'zgartirish
              </button>
            </div>
          }

          <!-- STEP: Info -->
          @if (step() === 'info') {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ismingiz</label>
                <input type="text" [(ngModel)]="firstName" placeholder="Ismingizni kiriting"
                       class="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Shahringiz</label>
                <select [(ngModel)]="city"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/30 text-sm bg-white">
                  <option value="">Shaharni tanlang</option>
                  @for (c of cities; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>
              @if (submitError()) {
                <p class="text-red-500 text-xs">{{ submitError() }}</p>
              }
              <button (click)="submitApplication()" [disabled]="submitting()"
                      class="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                @if (submitting()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Yuborilmoqda...
                  </span>
                } @else {
                  Ariza yuborish
                }
              </button>
            </div>
          }

          <!-- STEP: Success -->
          @if (step() === 'success') {
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Ariza yuborildi!</h3>
              <p class="text-sm text-gray-500 mb-6">Ish beruvchi siz bilan tez orada bog'lanadi.</p>
              <button (click)="close()"
                      class="bg-black hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm">
                Yopish
              </button>
            </div>
          }

          <!-- STEP: Error -->
          @if (step() === 'error') {
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Xatolik yuz berdi</h3>
              <p class="text-sm text-gray-500 mb-6">Iltimos, qaytadan urinib ko'ring yoki Telegram bot orqali ariza topshiring.</p>
              <div class="flex gap-3 justify-center">
                <button (click)="step.set('phone')"
                        class="border border-gray-200 text-gray-600 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Qayta urinish
                </button>
                <a href="https://t.me/VerifixJobBot" target="_blank"
                   class="bg-[#0088cc] hover:bg-[#006daa] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm">
                  Telegram bot
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class PublicApplyModalComponent {
  @Input() vacancyId = '';
  @Input() vacancyTitle = '';
  @Output() closed = new EventEmitter<void>();

  step = signal<ModalStep>('phone');
  phone = '';
  otpCode = '';
  firstName = '';
  city = '';

  phoneError = signal('');
  otpError = signal('');
  submitError = signal('');
  sendingOtp = signal(false);
  verifyingOtp = signal(false);
  submitting = signal(false);

  cities = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Namangan', 'Andijon', 'Farg\'ona',
    'Nukus', 'Navoiy', 'Qarshi', 'Jizzax', 'Termiz', 'Urganch', 'Guliston'
  ];

  constructor(private publicApi: PublicApiService) {}

  close() {
    this.closed.emit();
  }

  getStepIndex(s: ModalStep): number {
    return ['phone', 'otp', 'info', 'success', 'error'].indexOf(s);
  }

  sendOtp() {
    const cleaned = this.phone.replace(/\s/g, '');
    if (cleaned.length < 9) {
      this.phoneError.set('Telefon raqamni to\'liq kiriting');
      return;
    }
    this.phoneError.set('');
    this.sendingOtp.set(true);
    const fullPhone = '+998' + cleaned;
    this.publicApi.sendOtp(fullPhone).subscribe({
      next: () => {
        this.sendingOtp.set(false);
        this.step.set('otp');
      },
      error: () => {
        this.sendingOtp.set(false);
        this.phoneError.set('SMS yuborishda xatolik. Qaytadan urinib ko\'ring.');
      },
    });
  }

  verifyOtp() {
    if (this.otpCode.length < 4) {
      this.otpError.set('Tasdiqlash kodini kiriting');
      return;
    }
    this.otpError.set('');
    this.verifyingOtp.set(true);
    // OTP is verified during application submission
    setTimeout(() => {
      this.verifyingOtp.set(false);
      this.step.set('info');
    }, 500);
  }

  submitApplication() {
    if (!this.firstName.trim()) {
      this.submitError.set('Ismingizni kiriting');
      return;
    }
    if (!this.city) {
      this.submitError.set('Shahringizni tanlang');
      return;
    }
    this.submitError.set('');
    this.submitting.set(true);

    this.publicApi.quickApply({
      vacancyId: this.vacancyId,
      phone: '+998' + this.phone.replace(/\s/g, ''),
      otpCode: this.otpCode,
      firstName: this.firstName.trim(),
      city: this.city,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set('success');
      },
      error: () => {
        this.submitting.set(false);
        this.step.set('error');
      },
    });
  }
}
