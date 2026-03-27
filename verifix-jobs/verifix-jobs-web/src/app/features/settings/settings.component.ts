import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployerProfile } from '../../core/models';

@Component({
  selector: 'vjw-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">Sozlamalar</h1>

      <!-- Profile -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Kompaniya profili</h3>
        @if (profile(); as p) {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kompaniya nomi</label>
                <input type="text" [(ngModel)]="p.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rasmiy nomi</label>
                <input type="text" [(ngModel)]="p.legalName" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 outline-none">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">INN</label>
                <input type="text" [value]="p.inn" disabled class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shahar</label>
                <input type="text" [(ngModel)]="p.city" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black/20 outline-none">
              </div>
            </div>
            <div class="flex items-center gap-4">
              @if (p.isVerified) {
                <span class="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">Tasdiqlangan</span>
              } @else {
                <span class="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full">Tasdiqlanmagan</span>
              }
              <div class="text-xs text-gray-400">Status: {{ p.status }}</div>
            </div>
            @if (saveMsg()) {
              <div class="text-sm text-green-600">{{ saveMsg() }}</div>
            }
            <div class="flex justify-end pt-4 border-t border-gray-100">
              <button (click)="saveProfile()" [disabled]="saving()"
                      class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
                {{ saving() ? 'Saqlanmoqda...' : 'Saqlash' }}
              </button>
            </div>
          </div>
        } @else {
          <div class="text-center py-8 text-gray-400">Yuklanmoqda...</div>
        }
      </div>

      <!-- Notifications (saved to localStorage) -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-800 mb-4">Bildirishnomalar</h3>
        <div class="space-y-3">
          @for (n of notifications; track n.key) {
            <div class="flex items-center justify-between py-2">
              <div>
                <div class="text-sm font-medium text-gray-700">{{ n.label }}</div>
                <div class="text-xs text-gray-400">{{ n.description }}</div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="n.enabled" (ngModelChange)="saveNotifications()" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-black after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          }
        </div>
      </div>

      <!-- Danger zone -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-red-100">
        <h3 class="font-semibold text-red-600 mb-2">Xavfli zona</h3>
        <p class="text-sm text-gray-500 mb-4">Bu amallar qaytarib bo'lmaydi.</p>
        @if (!confirmDelete()) {
          <button (click)="confirmDelete.set(true)" class="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition">
            Akkauntni o'chirish
          </button>
        } @else {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-700 mb-3">Haqiqatan ham akkauntingizni o'chirmoqchimisiz? Barcha ma'lumotlar o'chiriladi.</p>
            <div class="flex gap-2">
              <button (click)="deleteAccount()" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">Ha, o'chirish</button>
              <button (click)="confirmDelete.set(false)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Bekor qilish</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  profile = signal<EmployerProfile | null>(null);
  saving = signal(false);
  saveMsg = signal('');
  confirmDelete = signal(false);

  notifications: {key: string; label: string; description: string; enabled: boolean}[] = [];

  constructor(private api: ApiService, private auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (p: any) => this.profile.set(p),
      error: () => {}
    });
    this.loadNotifications();
  }

  saveProfile() {
    const p = this.profile();
    if (!p) return;
    this.saving.set(true);
    this.saveMsg.set('');
    this.api.updateProfile(p).subscribe({
      next: () => { this.saving.set(false); this.saveMsg.set('Muvaffaqiyatli saqlandi'); setTimeout(() => this.saveMsg.set(''), 3000); },
      error: () => this.saving.set(false),
    });
  }

  loadNotifications() {
    const defaults = [
      { key: 'new_application', label: 'Yangi ariza', description: 'Yangi ariza kelganda xabar berish', enabled: true },
      { key: 'application_hired', label: 'Yollash', description: 'Nomzod yollanganda xabar berish', enabled: true },
      { key: 'vacancy_expired', label: 'Vakansiya muddati', description: 'Vakansiya muddati tugaganda xabar berish', enabled: true },
      { key: 'weekly_digest', label: 'Haftalik hisobot', description: 'Haftalik analitika hisoboti', enabled: false },
    ];
    try {
      const saved = JSON.parse(localStorage.getItem('vjw_notification_prefs') || 'null');
      if (saved) {
        this.notifications = defaults.map(d => ({ ...d, enabled: saved[d.key] ?? d.enabled }));
      } else {
        this.notifications = defaults;
      }
    } catch { this.notifications = defaults; }
  }

  saveNotifications() {
    const prefs: Record<string, boolean> = {};
    this.notifications.forEach(n => prefs[n.key] = n.enabled);
    localStorage.setItem('vjw_notification_prefs', JSON.stringify(prefs));
  }

  deleteAccount() {
    // Request account deletion via API, then logout
    this.http.delete(`${environment.apiUrl}/employer/profile`).subscribe({
      next: () => this.auth.logout(),
      error: () => this.auth.logout()  // Logout regardless
    });
    this.router.navigate(['/']);
  }
}
