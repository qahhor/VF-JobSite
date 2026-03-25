import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="w-14 h-14 flex items-center justify-center mx-auto mb-3"><img src="assets/logo-icon.svg" alt="Verifix" class="h-12"</div>
          <h1 class="text-xl font-bold text-white">Verifix Admin</h1>
          <p class="text-slate-400 text-sm mt-1">Boshqaruv paneli</p>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-2xl">
          @if (error()) {
            <div class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{{ error() }}</div>
          }
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Parol</label>
              <input type="password" [(ngModel)]="password" name="password" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 focus:border-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">TOTP kod</label>
              <input type="text" [(ngModel)]="totpCode" name="totp" maxlength="6" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center tracking-widest focus:ring-2 focus:ring-black/20 focus:border-blue-500 outline-none" placeholder="000000">
            </div>
            <button type="submit" [disabled]="loading()" class="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
              {{ loading() ? 'Kirish...' : 'Kirish' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  email = ''; password = ''; totpCode = '';
  loading = signal(false); error = signal('');

  constructor(private api: AdminApiService, private router: Router) {}

  onSubmit() {
    this.loading.set(true); this.error.set('');
    this.api.login(this.email, this.password, this.totpCode).subscribe({
      next: (res) => { localStorage.setItem('vja_token', res.accessToken); this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading.set(false); this.error.set(err.error?.message || 'Kirish xatosi'); }
    });
  }
}
