import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminApiService, AdminProfile } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { LangSwitcherComponent } from '../../shared/components/lang-switcher.component';

@Component({
  selector: 'vjw-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LangSwitcherComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-950">
      <div class="flex min-h-screen">
        <!-- Desktop Sidebar -->
        <aside class="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div class="flex items-center gap-2.5 px-5 py-4">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-bold text-white">VJ</div>
            <div>
              <div class="text-sm font-semibold leading-tight">Verifix Jobs</div>
              <div class="text-[11px] text-slate-400">{{ i18n.t('admin.panel') }}</div>
            </div>
          </div>

          <nav class="flex-1 overflow-y-auto px-3 py-2">
            <div class="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ i18n.t('admin.nav_main') }}</div>
            @for (item of mainNavItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-slate-900 text-white [&>svg]:text-slate-300"
                [routerLinkActiveOptions]="{exact: false}"
                class="group mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <svg class="h-[18px] w-[18px] shrink-0 text-slate-400 transition group-hover:text-slate-600" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" [innerHTML]="navIcons[item.icon]"></svg>
                {{ i18n.t(item.label) }}
              </a>
            }

            <div class="mb-1.5 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ i18n.t('admin.nav_risk') }}</div>
            @for (item of riskNavItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-slate-900 text-white [&>svg]:text-slate-300"
                [routerLinkActiveOptions]="{exact: false}"
                class="group mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <svg class="h-[18px] w-[18px] shrink-0 text-slate-400 transition group-hover:text-slate-600" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" [innerHTML]="navIcons[item.icon]"></svg>
                {{ i18n.t(item.label) }}
              </a>
            }

            <div class="mb-1.5 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ i18n.t('admin.nav_system') }}</div>
            @for (item of systemNavItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-slate-900 text-white [&>svg]:text-slate-300"
                [routerLinkActiveOptions]="{exact: false}"
                class="group mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <svg class="h-[18px] w-[18px] shrink-0 text-slate-400 transition group-hover:text-slate-600" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" [innerHTML]="navIcons[item.icon]"></svg>
                {{ i18n.t(item.label) }}
              </a>
            }
          </nav>

          <div class="border-t border-slate-100 px-3 py-3">
            @if (profile()) {
              <div class="mb-2 flex items-center gap-2.5 px-2">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {{ (profile()?.email || '?')[0].toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-[13px] font-medium leading-tight">{{ profile()?.email }}</div>
                  <div class="text-[11px] text-slate-400">{{ profile()?.role }}</div>
                </div>
              </div>
            }
            <button
              (click)="logout()"
              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
              <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {{ i18n.t('admin.logout') }}
            </button>
          </div>
        </aside>

        <div class="flex min-w-0 flex-1 flex-col">
          <!-- Header -->
          <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div class="flex h-14 items-center justify-between px-4 md:px-5">
              <div class="flex items-center gap-3">
                <button
                  (click)="mobileNav.set(!mobileNav())"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
                  aria-label="Open navigation">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                </button>
                <div class="text-sm font-semibold text-slate-700">{{ i18n.t('admin.control_center') }}</div>
              </div>

              <div class="flex items-center gap-2">
                <vjw-lang-switcher />
                @if (profile()) {
                  <a routerLink="/admin/access"
                    class="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 md:flex">
                    <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                    </svg>
                    {{ i18n.t('admin.access') }}
                  </a>
                }
              </div>
            </div>

            @if (requiresPasswordChange()) {
              <div class="border-t border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 md:px-5">
                <div class="flex items-center justify-between gap-3">
                  <div class="text-[13px]">
                    <span class="font-semibold">{{ i18n.t('admin.password_change_required') }}</span>
                    <span class="ml-1 text-amber-700">{{ i18n.t('admin.password_change_required_hint') }}</span>
                  </div>
                  <a routerLink="/admin/access" class="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-slate-800">
                    {{ i18n.t('admin.open_access_center') }}
                  </a>
                </div>
              </div>
            }
          </header>

          <!-- Mobile Nav Overlay -->
          @if (mobileNav()) {
            <div class="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px] md:hidden" (click)="mobileNav.set(false)">
              <div class="flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-[9px] font-bold text-white">VJ</div>
                    <span class="text-sm font-semibold">Verifix Jobs</span>
                  </div>
                  <button (click)="mobileNav.set(false)" class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">&times;</button>
                </div>

                <nav class="flex-1 overflow-y-auto px-3 py-2">
                  @for (item of visibleNavItems(); track item.path) {
                    <a
                      [routerLink]="item.path"
                      (click)="mobileNav.set(false)"
                      routerLinkActive="bg-slate-900 text-white [&>svg]:text-slate-300"
                      class="group mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                      <svg class="h-[18px] w-[18px] shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24" [innerHTML]="navIcons[item.icon]"></svg>
                      {{ i18n.t(item.label) }}
                    </a>
                  }
                </nav>

                <div class="border-t border-slate-100 px-3 py-3">
                  <div class="mb-2 flex items-center justify-between px-2">
                    <span class="text-[11px] font-medium text-slate-400">{{ profile()?.email || 'admin' }}</span>
                    <vjw-lang-switcher />
                  </div>
                  <button
                    (click)="logout()"
                    class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                    <svg class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    {{ i18n.t('admin.logout') }}
                  </button>
                </div>
              </div>
            </div>
          }

          <main class="min-w-0 flex-1 px-4 py-5 md:px-6 md:py-6">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  mobileNav = signal(false);
  profile = signal<AdminProfile | null>(null);
  requiresPasswordChange = computed(() => {
    const profile = this.profile();
    if (profile) {
      return profile.mustChangePassword;
    }
    return localStorage.getItem('vjw_admin_must_change_password') === 'true';
  });
  visibleNavItems = computed(() =>
    this.requiresPasswordChange()
      ? this.navItems.filter(item => item.path === '/admin/access')
      : this.navItems
  );

  mainNavItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'admin.dashboard' },
    { path: '/admin/employers', icon: 'company', label: 'admin.companies' },
    { path: '/admin/users', icon: 'users', label: 'admin.users_nav' },
    { path: '/admin/analytics', icon: 'analytics', label: 'admin.analytics_nav' },
  ];

  riskNavItems = [
    { path: '/admin/moderation', icon: 'moderation', label: 'admin.moderation' },
    { path: '/admin/fraud', icon: 'fraud', label: 'admin.fraud' },
    { path: '/admin/audit', icon: 'audit', label: 'admin.audit_nav' },
  ];

  systemNavItems = [
    { path: '/admin/experiments', icon: 'experiments', label: 'admin.experiments_nav' },
    { path: '/admin/gov-sync', icon: 'gov', label: 'admin.gov' },
    { path: '/admin/references', icon: 'references', label: 'admin.references_nav' },
    { path: '/admin/settings', icon: 'settings', label: 'admin.settings_nav' },
    { path: '/admin/access', icon: 'access', label: 'admin.access' },
  ];

  navItems = [...this.mainNavItems, ...this.riskNavItems, ...this.systemNavItems];

  navIcons: Record<string, string> = {
    dashboard: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-3a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"/>',
    company: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
    moderation: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
    users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>',
    audit: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>',
    analytics: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
    experiments: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>',
    fraud: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
    gov: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>',
    settings: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
    references: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>',
    access: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>',
  };

  constructor(
    private router: Router,
    private adminApi: AdminApiService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.adminApi.getCurrentAdminProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        localStorage.setItem('vjw_admin_must_change_password', profile.mustChangePassword ? 'true' : 'false');
        if (profile.mustChangePassword && !this.router.url.startsWith('/admin/access')) {
          this.router.navigate(['/admin/access']);
        }
      },
      error: () => {
        this.profile.set(null);
        localStorage.removeItem('vjw_admin_must_change_password');
      },
    });
  }

  logout() {
    localStorage.removeItem('vjw_admin_token');
    localStorage.removeItem('vjw_admin_role');
    localStorage.removeItem('vjw_admin_must_change_password');
    this.mobileNav.set(false);
    this.router.navigate(['/admin/login']);
  }
}
