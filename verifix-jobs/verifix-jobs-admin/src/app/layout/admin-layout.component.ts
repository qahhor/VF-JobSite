import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AdminApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'vja-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside class="hidden md:flex fixed left-0 top-0 h-full w-60 bg-slate-800 text-white z-30 flex-col">
      <div class="p-4 border-b border-slate-700 flex items-center gap-3">
        <div class="w-9 h-9 flex items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-7" /></div>
        <span class="font-semibold text-sm">{{ i18n.t('admin.brand') }}</span>
      </div>
      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-slate-700/50 text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/30 hover:text-white transition text-sm">
            <span>{{ item.icon }}</span>
            <span>{{ i18n.t(item.label) }}</span>
          </a>
        }
      </nav>
      <div class="p-3 border-t border-slate-700">
        <button (click)="logout()" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30 text-sm transition">
          <span>{{ logoutIcon }}</span> {{ i18n.t('admin.logout') }}
        </button>
      </div>
    </aside>

    <div class="md:ml-60">
      <header class="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 px-4 md:px-6 flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <button class="md:hidden text-2xl text-slate-700" (click)="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle admin menu">&#9776;</button>
          <h2 class="text-sm font-semibold text-gray-700 truncate">{{ i18n.t('admin.panel') }}</h2>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden sm:block text-xs text-gray-400 truncate max-w-[220px]">{{ adminEmail }}</span>
        </div>
      </header>
      <main class="p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">
        <router-outlet />
      </main>
    </div>

    @if (mobileMenuOpen) {
      <div class="md:hidden fixed inset-0 z-40 flex">
        <div class="absolute inset-0 bg-black/40" (click)="mobileMenuOpen = false"></div>
        <aside class="relative w-72 max-w-[85vw] bg-slate-800 text-white h-full shadow-xl flex flex-col">
          <div class="p-4 border-b border-slate-700 flex items-center gap-3">
            <div class="w-9 h-9 flex items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-7" /></div>
            <span class="font-semibold text-sm">{{ i18n.t('admin.brand') }}</span>
          </div>
          <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="bg-slate-700/50 text-white"
                 (click)="mobileMenuOpen = false"
                 class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700/30 hover:text-white transition text-sm">
                <span>{{ item.icon }}</span>
                <span>{{ i18n.t(item.label) }}</span>
              </a>
            }
          </nav>
          <div class="p-3 border-t border-slate-700">
            <button (click)="logout()" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30 text-sm transition">
              <span>{{ logoutIcon }}</span> {{ i18n.t('admin.logout') }}
            </button>
          </div>
        </aside>
      </div>
    }
  `,
})
export class AdminLayoutComponent implements OnInit {
  adminEmail = '';
  mobileMenuOpen = false;
  logoutIcon = '\u{1F6AA}';

  navItems = [
    { path: '/dashboard', icon: '\u{1F4CA}', label: 'admin.dashboard' },
    { path: '/moderation', icon: '\u{1F6E1}\uFE0F', label: 'admin.moderation' },
    { path: '/users', icon: '\u{1F465}', label: 'admin.users' },
    { path: '/audit', icon: '\u{1F4DC}', label: 'admin.audit' },
    { path: '/analytics', icon: '\u{1F4C8}', label: 'admin.analytics' },
    { path: '/ab-testing', icon: '\u{1F52C}', label: 'admin.ab_testing' },
    { path: '/fraud', icon: '\u{1F6A8}', label: 'admin.fraud' },
    { path: '/settings', icon: '\u2699\uFE0F', label: 'admin.system' },
  ];

  constructor(private router: Router, private api: AdminApiService, public i18n: I18nService) {}

  ngOnInit() {
    this.api.getAdminProfile().subscribe({
      next: (profile: any) => this.adminEmail = profile.email || '',
    });
  }

  logout() {
    localStorage.removeItem('vja_token');
    this.router.navigate(['/login']);
  }
}
