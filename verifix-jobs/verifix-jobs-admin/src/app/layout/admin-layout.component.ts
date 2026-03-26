import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'vja-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Dark sidebar -->
    <aside class="fixed left-0 top-0 h-full w-60 bg-slate-800 text-white z-30 flex flex-col">
      <div class="p-4 border-b border-slate-700 flex items-center gap-3">
        <div class="w-9 h-9 flex items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-7" /></div>
        <span class="font-semibold text-sm">Verifix Admin</span>
      </div>
      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-slate-700/50 text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/30 hover:text-white transition text-sm">
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>
      <div class="p-3 border-t border-slate-700">
        <button (click)="logout()" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30 text-sm transition">
          <span>🚪</span> Chiqish
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="ml-60">
      <header class="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 px-6 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700">Admin Panel</h2>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400">{{ adminEmail }}</span>
        </div>
      </header>
      <main class="p-6 min-h-[calc(100vh-3.5rem)]">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  adminEmail = 'admin@verifix.uz';

  navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/moderation', icon: '🛡️', label: 'Moderatsiya' },
    { path: '/users', icon: '👥', label: 'Foydalanuvchilar' },
    { path: '/audit', icon: '📜', label: 'Audit log' },
    { path: '/analytics', icon: '📈', label: 'Analitika' },
    { path: '/ab-testing', icon: '🔬', label: 'A/B Testlar' },
    { path: '/fraud', icon: '🚨', label: 'Fraud' },
    { path: '/settings', icon: '⚙️', label: 'Tizim' },
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
