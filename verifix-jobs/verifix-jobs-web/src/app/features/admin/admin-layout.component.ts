import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex min-h-screen bg-gray-900 text-white">
      <aside class="hidden w-56 shrink-0 flex-col border-r border-gray-700 bg-gray-800 md:flex">
        <div class="flex h-14 items-center border-b border-gray-700 px-4">
          <span class="text-lg font-bold">Admin</span>
          <span class="ml-2 rounded bg-red-500 px-2 py-0.5 text-xs text-white">Panel</span>
        </div>
        <nav class="flex-1 space-y-0.5 px-2 py-3">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-gray-700 text-white"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-gray-700/50 hover:text-white">
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-[10px] font-semibold text-gray-200">
                {{ item.badge }}
              </span>
              <span>{{ i18n.t(item.label) }}</span>
            </a>
          }
        </nav>
        <div class="border-t border-gray-700 p-3">
          <button (click)="logout()" class="w-full px-3 py-2 text-left text-sm text-gray-500 transition hover:text-red-400">{{ i18n.t('admin.logout') }}</button>
        </div>
      </aside>

      <div class="fixed left-0 right-0 top-0 z-50 flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4 md:hidden">
        <span class="font-bold">{{ i18n.t('admin.panel') }}</span>
        <button (click)="mobileNav.set(!mobileNav())" class="text-gray-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      @if (mobileNav()) {
        <div class="fixed inset-0 z-40 bg-black/50 md:hidden" (click)="mobileNav.set(false)">
          <div class="h-full w-56 space-y-1 bg-gray-800 p-3" (click)="$event.stopPropagation()">
            <div class="mb-2 border-b border-gray-700 px-3 py-3 text-lg font-bold">{{ i18n.t('admin.panel') }}</div>
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                (click)="mobileNav.set(false)"
                routerLinkActive="bg-gray-700"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:text-white">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-[10px] font-semibold text-gray-200">
                  {{ item.badge }}
                </span>
                <span>{{ i18n.t(item.label) }}</span>
              </a>
            }
          </div>
        </div>
      }

      <main class="min-w-0 flex-1 overflow-y-auto p-4 pt-16 md:p-6 md:pt-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  mobileNav = signal(false);

  navItems = [
    { path: '/admin/dashboard', badge: 'DB', label: 'admin.dashboard' },
    { path: '/admin/employers', badge: 'CO', label: 'admin.companies' },
    { path: '/admin/moderation', badge: 'MOD', label: 'admin.moderation' },
    { path: '/admin/fraud', badge: 'FRD', label: 'admin.fraud' },
    { path: '/admin/gov-sync', badge: 'GOV', label: 'admin.gov' },
  ];

  constructor(private router: Router, public i18n: I18nService) {}

  logout() {
    localStorage.removeItem('vjw_admin_token');
    localStorage.removeItem('vjw_admin_role');
    this.router.navigate(['/admin/login']);
  }
}
