import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'vjw-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-16 h-16 flex items-center justify-center mx-auto mb-4"><img src="assets/logo-icon.svg" alt="Verifix" class="h-14"></div>
          <h1 class="text-2xl font-bold text-gray-800">Verifix Jobs</h1>
          <p class="text-gray-500 mt-1">Ish beruvchi portali</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-6">Kirish</h2>

          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{{ error() }}</div>
          }

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-primary outline-none transition"
                     placeholder="admin&#64;company.uz">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Parol</label>
              <input type="password" [(ngModel)]="password" name="password" required
                     class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black/20 focus:border-primary outline-none transition"
                     placeholder="••••••••">
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" [(ngModel)]="remember" name="remember" class="rounded border-gray-300">
                Eslab qolish
              </label>
              <a class="text-sm text-black hover:underline cursor-pointer">Parolni unutdim</a>
            </div>
            <button type="submit" [disabled]="loading()"
                    class="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50">
              {{ loading() ? 'Kirish...' : 'Kirish' }}
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-gray-400 mt-6">Verifix Jobs © 2026. Barcha huquqlar himoyalangan.</p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  remember = false;
  loading = signal(false);
  error = signal('');

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {
    if (auth.isAuthenticated()) this.router.navigate(['/dashboard']);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.http.post<{ accessToken: string; refreshToken: string }>(
      `${environment.apiUrl}/auth/employer/login`, { email: this.email, password: this.password }
    ).subscribe({
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
