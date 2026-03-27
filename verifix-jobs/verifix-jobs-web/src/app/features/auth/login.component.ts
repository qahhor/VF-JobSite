import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'vjw-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Mini header -->
      <header class="bg-white border-b border-gray-100">
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <a routerLink="/" class="flex items-center gap-2.5">
            <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
            <span class="font-semibold text-lg tracking-tight">Verifix Jobs</span>
          </a>
        </div>
      </header>

      <div class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-sm">
          <div class="bg-white rounded-xl border border-gray-200 p-8">
            <!-- Tab switcher -->
            <div class="flex border border-gray-200 rounded-lg p-1 mb-6">
              <button (click)="mode.set('login')" class="flex-1 py-2 text-sm font-medium rounded-md transition"
                      [class]="mode() === 'login' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'">Kirish</button>
              <button (click)="mode.set('register')" class="flex-1 py-2 text-sm font-medium rounded-md transition"
                      [class]="mode() === 'register' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'">Ro'yxatdan o'tish</button>
            </div>

            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{{ error() }}</div>
            }
            @if (success()) {
              <div class="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg">{{ success() }}</div>
            }

            <!-- LOGIN FORM -->
            @if (mode() === 'login') {
              <form (ngSubmit)="onLogin()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" [(ngModel)]="email" name="email" required autocomplete="email"
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="admin&#64;company.uz">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Parol</label>
                  <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password"
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;">
                </div>
                <button type="submit" [disabled]="loading()"
                        class="w-full h-11 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
                  {{ loading() ? 'Kirish...' : 'Kirish' }}
                </button>
              </form>
            }

            <!-- REGISTER FORM -->
            @if (mode() === 'register') {
              <form (ngSubmit)="onRegister()" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Kompaniya nomi</label>
                  <input type="text" [(ngModel)]="regName" name="regName" required
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="Kompaniya nomi">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">INN (STIR)</label>
                  <input type="text" [(ngModel)]="regInn" name="regInn" required maxlength="9"
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="123456789">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" [(ngModel)]="regEmail" name="regEmail" required
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="admin&#64;company.uz">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input type="tel" [(ngModel)]="regPhone" name="regPhone" required
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="+998 90 123 45 67">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Parol</label>
                  <input type="password" [(ngModel)]="regPassword" name="regPassword" required
                         class="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                         placeholder="Kamida 8 ta belgi (A-z, 0-9)">
                  <p class="text-xs text-gray-400 mt-1">Katta va kichik harf hamda raqam bo'lishi kerak</p>
                </div>
                <button type="submit" [disabled]="loading()"
                        class="w-full h-11 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
                  {{ loading() ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish" }}
                </button>
              </form>
            }
          </div>

          <p class="text-center text-xs text-gray-400 mt-6">
            <a routerLink="/" class="hover:text-black">Bosh sahifaga qaytish</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  regName = '';
  regInn = '';
  regEmail = '';
  regPhone = '';
  regPassword = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  onLogin() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.http.post<any>(`${environment.apiUrl}/auth/employer/login`, { email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.auth.setAuthFromTokens(res.accessToken, res.refreshToken);
        this.router.navigate(['/employer/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email yoki parol noto\'g\'ri');
      }
    });
  }

  onRegister() {
    if (this.regPassword.length < 8 || !/[A-Z]/.test(this.regPassword) || !/[a-z]/.test(this.regPassword) || !/\d/.test(this.regPassword)) {
      this.error.set('Parol kamida 8 ta belgi, katta harf, kichik harf va raqam bo\'lishi kerak');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.http.post<any>(`${environment.apiUrl}/auth/employer/register`, {
      companyName: this.regName,
      inn: this.regInn,
      email: this.regEmail,
      phone: this.regPhone,
      password: this.regPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Ro\'yxatdan muvaffaqiyatli o\'tdingiz! Endi tizimga kirishingiz mumkin.');
        this.mode.set('login');
        this.email = this.regEmail;
        this.password = '';
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    });
  }
}
