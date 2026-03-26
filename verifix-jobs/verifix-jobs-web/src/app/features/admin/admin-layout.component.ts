import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'vjw-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-900 text-white flex">
      <!-- Sidebar -->
      <aside class="w-56 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 hidden md:flex">
        <div class="h-14 px-4 flex items-center border-b border-gray-700">
          <span class="font-bold text-lg">Admin</span>
          <span class="ml-2 text-xs px-2 py-0.5 bg-red-500 rounded text-white">Panel</span>
        </div>
        <nav class="flex-1 py-3 space-y-0.5 px-2">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-gray-700 text-white"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition">
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="p-3 border-t border-gray-700">
          <button (click)="logout()" class="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-400 transition">Chiqish</button>
        </div>
      </aside>

      <!-- Mobile header -->
      <div class="md:hidden fixed top-0 left-0 right-0 h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 z-50 justify-between">
        <span class="font-bold">Admin Panel</span>
        <button (click)="mobileNav.set(!mobileNav())" class="text-gray-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      @if (mobileNav()) {
        <div class="md:hidden fixed inset-0 z-40 bg-black/50" (click)="mobileNav.set(false)">
          <div class="w-56 h-full bg-gray-800 p-3 space-y-1" (click)="$event.stopPropagation()">
            <div class="font-bold text-lg px-3 py-3 border-b border-gray-700 mb-2">Admin Panel</div>
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" (click)="mobileNav.set(false)" routerLinkActive="bg-gray-700"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition">
                <span>{{ item.icon }}</span><span>{{ item.label }}</span>
              </a>
            }
          </div>
        </div>
      }

      <!-- Content -->
      <main class="flex-1 min-w-0 md:p-6 p-4 pt-16 md:pt-6 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  mobileNav = signal(false);

  navItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/employers', icon: '🏢', label: 'Kompaniyalar' },
    { path: '/admin/moderation', icon: '🔍', label: 'Moderatsiya' },
    { path: '/admin/fraud', icon: '🚨', label: 'Frod nazorati' },
    { path: '/admin/gov-sync', icon: '🏛️', label: 'Davlat sinx.' },
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('vjw_admin_token');
    localStorage.removeItem('vjw_admin_role');
    this.router.navigate(['/admin/login']);
  }
}
