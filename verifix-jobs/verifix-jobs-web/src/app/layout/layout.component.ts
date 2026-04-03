import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { I18nService } from '../core/services/i18n.service';

@Component({
  selector: 'vjw-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <aside class="fixed h-full w-64 flex-col border-r border-gray-200 bg-white z-30 hidden lg:flex"
           [class.w-20]="collapsed" [class.w-64]="!collapsed">
      <div class="flex items-center gap-3 border-b border-gray-100 p-4">
        <div class="flex h-10 w-10 items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-8"></div>
        <span *ngIf="!collapsed" class="text-lg font-semibold text-gray-800">Verifix Jobs</span>
      </div>
      <nav class="flex-1 space-y-1 px-3 py-4">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="bg-gray-100 text-black"
             class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 transition-colors hover:bg-gray-50">
            <span class="text-xl">{{ item.icon }}</span>
            <span *ngIf="!collapsed" class="text-sm font-medium">{{ i18n.t(item.label) }}</span>
          </a>
        }
      </nav>
      <div class="border-t border-gray-100 p-3">
        <button (click)="collapsed = !collapsed"
                class="flex w-full items-center justify-center rounded-lg py-2 text-gray-400 hover:bg-gray-50">
          {{ collapsed ? '>' : '<' }}
        </button>
      </div>
    </aside>

    <div class="lg:transition-all" [class.lg:ml-64]="!collapsed" [class.lg:ml-20]="collapsed">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
        <div class="min-w-0 flex items-center gap-4">
          <button class="text-2xl text-gray-600 lg:hidden" (click)="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">&#9776;</button>
          <h2 class="truncate text-lg font-semibold text-gray-800">{{ i18n.t(pageTitleKey) }}</h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden max-w-[240px] truncate text-sm text-gray-500 sm:block">{{ user()?.email }}</span>
          <button (click)="auth.logout()"
                  class="text-sm text-gray-500 transition-colors hover:text-red-500">{{ i18n.t('employer.logout') }}</button>
        </div>
      </header>

      <main class="min-h-[calc(100vh-4rem)] p-4 pb-24 lg:p-6 lg:pb-6">
        <router-outlet />
      </main>
    </div>

    <nav class="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-gray-200 bg-white py-2 lg:hidden">
      @for (item of mobileNavItems; track item.path) {
        <a [routerLink]="item.path" routerLinkActive="text-black"
           class="flex flex-col items-center gap-0.5 text-xs text-gray-400">
          <span class="text-lg">{{ item.icon }}</span>
          <span>{{ i18n.t(item.label) }}</span>
        </a>
      }
    </nav>

    @if (mobileMenuOpen) {
      <div class="fixed inset-0 z-40 flex lg:hidden">
        <div class="absolute inset-0 bg-black/30" (click)="mobileMenuOpen = false"></div>
        <aside class="relative h-full w-72 bg-white shadow-xl">
          <div class="border-b p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center"><img src="assets/logo-icon.svg" alt="Verifix" class="h-8"></div>
              <span class="font-semibold text-gray-800">Verifix Jobs</span>
            </div>
          </div>
          <nav class="space-y-1 px-3 py-4">
            @for (item of navItems; track item.path) {
              <a [routerLink]="item.path" routerLinkActive="bg-gray-100 text-black"
                 (click)="mobileMenuOpen = false"
                 class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 hover:bg-gray-50">
                <span class="text-xl">{{ item.icon }}</span>
                <span class="text-sm font-medium">{{ i18n.t(item.label) }}</span>
              </a>
            }
          </nav>
        </aside>
      </div>
    }
  `,
  styles: [`
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
  `]
})
export class LayoutComponent {
  collapsed = false;
  mobileMenuOpen = false;
  pageTitleKey = 'dashboard.title';

  user = this.auth.user;

  navItems = [
    { path: '/employer/dashboard', icon: '\u{1F4CA}', label: 'employer.nav.dashboard' },
    { path: '/employer/vacancies', icon: '\u{1F4CB}', label: 'employer.nav.vacancies' },
    { path: '/employer/pipeline', icon: '\u{1F504}', label: 'employer.nav.pipeline' },
    { path: '/employer/candidates', icon: '\u{1F465}', label: 'employer.nav.candidates' },
    { path: '/employer/talent-hub', icon: '\u{1F3AF}', label: 'employer.nav.talent_hub' },
    { path: '/employer/hiring-projects', icon: '\u{1F680}', label: 'employer.nav.projects' },
    { path: '/employer/analytics', icon: '\u{1F4C8}', label: 'employer.nav.analytics' },
    { path: '/employer/chat', icon: '\u{1F4AC}', label: 'employer.nav.chat' },
    { path: '/employer/billing', icon: '\u{1F4B3}', label: 'employer.nav.billing' },
    { path: '/employer/ai-agent', icon: '\u{1F916}', label: 'employer.nav.ai' },
    { path: '/employer/org-memory', icon: '\u{1F9E0}', label: 'employer.nav.memory' },
    { path: '/employer/integrations', icon: '\u{1F517}', label: 'employer.nav.integrations' },
    { path: '/employer/settings', icon: '\u2699\uFE0F', label: 'employer.nav.settings' },
  ];

  mobileNavItems = this.navItems.slice(0, 5);

  constructor(public auth: AuthService, public i18n: I18nService, private router: Router) {
    this.updatePageTitle(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mobileMenuOpen = false;
        this.updatePageTitle(event.urlAfterRedirects);
      }
    });
  }

  private updatePageTitle(url: string) {
    const cleanUrl = url.split('?')[0];
    const explicitTitles: Record<string, string> = {
      '/employer/dashboard': 'dashboard.title',
      '/employer/vacancies': 'vacancy.list.title',
      '/employer/vacancies/new': 'employer.page.new_vacancy',
      '/employer/pipeline': 'employer.nav.pipeline',
      '/employer/candidates': 'employer.nav.candidates',
      '/employer/talent-hub': 'employer.nav.talent_hub',
      '/employer/hiring-projects': 'employer.nav.projects',
      '/employer/analytics': 'employer.nav.analytics',
      '/employer/chat': 'employer.nav.chat',
      '/employer/billing': 'employer.nav.billing',
      '/employer/ai-agent': 'employer.nav.ai',
      '/employer/org-memory': 'employer.nav.memory',
      '/employer/integrations': 'employer.nav.integrations',
      '/employer/settings': 'employer.nav.settings',
      '/employer/automations': 'employer.nav.automations',
      '/employer/saved-searches': 'employer.nav.saved_searches',
      '/employer/team': 'employer.nav.team',
      '/employer/churn-alerts': 'employer.nav.churn'
    };

    if (cleanUrl.endsWith('/edit')) {
      this.pageTitleKey = 'employer.page.edit_vacancy';
      return;
    }

    if (cleanUrl.startsWith('/employer/vacancies/')) {
      this.pageTitleKey = explicitTitles[cleanUrl] || 'employer.page.vacancy';
      return;
    }

    this.pageTitleKey = explicitTitles[cleanUrl] || 'employer.portal';
  }
}
