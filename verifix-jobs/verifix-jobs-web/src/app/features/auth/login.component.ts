import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vjw-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex flex-col">
      <!-- Mini header -->
      <header class="border-b border-gray-100">
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <a routerLink="/" class="flex items-center gap-2.5">
            <img src="assets/logo-icon.svg" alt="Verifix" class="h-7">
            <span class="font-semibold text-lg tracking-tight">Verifix Jobs</span>
          </a>
        </div>
      </header>

      <!-- Login form -->
      <div class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-sm">
          <div class="text-center mb-8">
            <img src="assets/logo-icon.svg" alt="Verifix" class="h-12 mx-auto mb-4">
            <h1 class="text-xl font-bold text-gray-900">Ish beruvchi portali</h1>
            <p class="text-sm text-gray-500 mt-1">Kirish yoki ro'yxatdan o'tish</p>
          </div>

          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{{ error() }}</div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     class="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                     placeholder="admin&#64;company.uz">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input type="password" [(ngModel)]="password" name="password" required
                     class="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                     placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;">
            </div>
            <button type="submit" [disabled]="loading()"
                    class="w-full h-12 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
              {{ loading() ? 'Kirish...' : 'Kirish' }}
            </button>
          </form>

          <p class="text-center text-xs text-gray-400 mt-8">&#169; 2024-2026 Verifix LLC</p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.http.post<any>(`${environment.apiUrl}/auth/employer/login`, { email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('vjw_access_token', res.accessToken);
        localStorage.setItem('vjw_refresh_token', res.refreshToken);
        location.href = '/employer/dashboard';
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email yoki parol noto\'g\'ri');
      }
    });
  }
}
