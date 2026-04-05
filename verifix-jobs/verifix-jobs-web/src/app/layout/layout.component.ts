import { CommonModule } from '@angular/common';
import { Component, signal, computed, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { I18nService } from '../core/services/i18n.service';
import { LucideAngularModule, LayoutDashboard, Building2, Briefcase, Kanban,
  Users, CalendarClock, Clock, BarChart3, Sparkles, Settings, Plug, CreditCard,
  ChevronLeft, ChevronRight, Search, Globe, Bell, LogOut, Menu, X, Moon, Sun } from 'lucide-angular';
import { CommandPaletteComponent } from '../shared/components/command-palette.component';

interface NavItem {
  path: string;
  icon: any;
  label: string;
  badge?: number;
}

interface NavSection {
  title: string;
  titleKey: string;
  items: NavItem[];
}

@Component({
  selector: 'vjw-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, CommandPaletteComponent],
  template: `
    <!-- ═══ Desktop Sidebar ═══ -->
    <aside class="fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-sidebar text-white transition-all duration-200"
           [style.width.px]="collapsed() ? 68 : 256">

      <!-- Logo + Collapse -->
      <div class="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <lucide-icon [img]="Building2Icon" [size]="20" class="text-white"></lucide-icon>
          </div>
          @if (!collapsed()) {
            <div class="min-w-0">
              <div class="text-sm font-semibold truncate">Verifix Jobs</div>
              <div class="text-[10px] uppercase tracking-wider text-white/50">Employer Panel</div>
            </div>
          }
        </div>
        @if (!collapsed()) {
          <button (click)="collapsed.set(true)" class="rounded-md p-1 text-white/30 hover:text-white/60 transition">
            <lucide-icon [img]="ChevronLeftIcon" [size]="18"></lucide-icon>
          </button>
        }
      </div>

      <!-- Nav sections -->
      <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        @for (section of navSections; track section.title) {
          <div>
            @if (!collapsed()) {
              <div class="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
                {{ i18n.t(section.titleKey) }}
              </div>
            }
            <div class="space-y-0.5">
              @for (item of section.items; track item.path) {
                <a [routerLink]="item.path"
                   routerLinkActive="!bg-sidebar-hover !text-white !border-l-primary"
                   class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-all hover:bg-sidebar-hover hover:text-white border-l-[3px] border-transparent"
                   [class.justify-center]="collapsed()"
                   [class.px-0]="collapsed()"
                   [title]="collapsed() ? i18n.t(item.label) : ''">
                  <lucide-icon [img]="item.icon" [size]="20" class="shrink-0 opacity-70 group-hover:opacity-100"></lucide-icon>
                  @if (!collapsed()) {
                    <span class="truncate">{{ i18n.t(item.label) }}</span>
                    @if (item.badge) {
                      <span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-semibold text-white">
                        {{ item.badge }}
                      </span>
                    }
                  }
                </a>
              }
            </div>
          </div>
        }
      </nav>

      <!-- User + Collapse toggle -->
      <div class="shrink-0 border-t border-white/10 p-3 space-y-2">
        @if (!collapsed()) {
          <div class="flex items-center gap-3 px-2">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {{ userInitials() }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium text-white/90">{{ userName() }}</div>
              <div class="truncate text-[11px] text-white/40">HR Director</div>
            </div>
            <button (click)="auth.logout()" class="rounded-md p-1 text-white/40 hover:text-white/70 transition" title="Logout">
              <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
            </button>
          </div>
        }
        @if (collapsed()) {
          <button (click)="collapsed.set(false)"
                  class="flex w-full items-center justify-center rounded-lg py-1.5 text-white/40 hover:bg-sidebar-hover hover:text-white/70 transition">
            <lucide-icon [img]="ChevronRightIcon" [size]="16"></lucide-icon>
          </button>
        }
      </div>
    </aside>

    <!-- ═══ Main Content Area ═══ -->
    <div class="transition-all duration-200 min-h-screen bg-surface"
         [style.margin-left.px]="isDesktop() ? (collapsed() ? 68 : 256) : 0">

      <!-- Top Header -->
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
        <!-- Left: hamburger (mobile) + breadcrumbs -->
        <div class="flex items-center gap-3 min-w-0">
          <button class="lg:hidden rounded-md p-1.5 text-muted hover:text-gray-900 transition"
                  (click)="mobileMenuOpen.set(true)">
            <lucide-icon [img]="MenuIcon" [size]="22"></lucide-icon>
          </button>
          <div class="flex items-center gap-1.5 text-sm min-w-0">
            <span class="text-muted">Verifix Jobs</span>
            <span class="text-muted">/</span>
            <span class="font-medium text-gray-900 truncate">{{ i18n.t(pageTitleKey()) }}</span>
          </div>
        </div>

        <!-- Center: Command palette trigger -->
        <button class="hidden md:flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted hover:border-gray-300 transition max-w-xs"
                (click)="commandPaletteOpen.set(true)">
          <lucide-icon [img]="SearchIcon" [size]="16"></lucide-icon>
          <span>{{ i18n.t('employer.search_placeholder') }}</span>
          <kbd class="hidden lg:inline-flex ml-2 items-center rounded border border-border bg-white px-1.5 text-[10px] font-mono text-muted">⌘K</kbd>
        </button>

        <!-- Right: lang toggle, dark mode, notifications, user -->
        <div class="flex items-center gap-2">
          <!-- Lang switcher -->
          <button (click)="toggleLang()" class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted hover:text-gray-900 transition">
            <lucide-icon [img]="GlobeIcon" [size]="16"></lucide-icon>
            <span class="uppercase">{{ i18n.lang() }}</span>
          </button>

          <!-- Dark mode toggle -->
          <button (click)="toggleDarkMode()" class="rounded-lg p-1.5 text-muted hover:text-gray-900 transition" title="Toggle dark mode">
            <lucide-icon [img]="darkMode() ? SunIcon : MoonIcon" [size]="18"></lucide-icon>
          </button>

          <!-- Notifications -->
          <button class="relative rounded-lg p-1.5 text-muted hover:text-gray-900 transition">
            <lucide-icon [img]="BellIcon" [size]="18"></lucide-icon>
            <span class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">3</span>
          </button>

          <!-- User avatar -->
          <div class="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
            {{ userInitials() }}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="mx-auto max-w-content p-4 pb-24 lg:p-6 lg:pb-6">
        <router-outlet />
      </main>
    </div>

    <!-- ═══ Mobile Bottom Nav ═══ -->
    <nav class="safe-bottom fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-border bg-white py-2 lg:hidden">
      @for (item of mobileNavItems; track item.path) {
        <a [routerLink]="item.path" routerLinkActive="!text-primary"
           class="flex flex-col items-center gap-0.5 text-[10px] text-muted transition">
          <lucide-icon [img]="item.icon" [size]="20"></lucide-icon>
          <span>{{ i18n.t(item.label) }}</span>
        </a>
      }
    </nav>

    <!-- ═══ Mobile Drawer ═══ -->
    @if (mobileMenuOpen()) {
      <div class="fixed inset-0 z-50 flex lg:hidden">
        <div class="absolute inset-0 bg-black/40" (click)="mobileMenuOpen.set(false)"></div>
        <aside class="relative h-full w-72 bg-sidebar text-white shadow-xl overflow-y-auto">
          <!-- Close button -->
          <div class="flex items-center justify-between px-4 h-16 border-b border-white/10">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span class="text-sm font-bold text-white">V</span>
              </div>
              <div>
                <div class="text-sm font-semibold">Verifix Jobs</div>
                <div class="text-[10px] uppercase tracking-wider text-white/50">Employer Panel</div>
              </div>
            </div>
            <button (click)="mobileMenuOpen.set(false)" class="rounded-md p-1 text-white/50 hover:text-white">
              <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
            </button>
          </div>
          <!-- Nav -->
          <nav class="py-4 px-2 space-y-5">
            @for (section of navSections; track section.title) {
              <div>
                <div class="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
                  {{ i18n.t(section.titleKey) }}
                </div>
                <div class="space-y-0.5">
                  @for (item of section.items; track item.path) {
                    <a [routerLink]="item.path"
                       routerLinkActive="!bg-sidebar-hover !text-white"
                       (click)="mobileMenuOpen.set(false)"
                       class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-sidebar-hover hover:text-white transition">
                      <lucide-icon [img]="item.icon" [size]="20" class="opacity-70"></lucide-icon>
                      <span>{{ i18n.t(item.label) }}</span>
                      @if (item.badge) {
                        <span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-semibold text-white">
                          {{ item.badge }}
                        </span>
                      }
                    </a>
                  }
                </div>
              </div>
            }
          </nav>
          <!-- User at bottom -->
          <div class="border-t border-white/10 p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {{ userInitials() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium">{{ userName() }}</div>
                <div class="text-[11px] text-white/40">HR Director</div>
              </div>
              <button (click)="auth.logout()" class="text-white/40 hover:text-white/70 transition">
                <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
              </button>
            </div>
          </div>
        </aside>
      </div>
    }

    <!-- Floating AI Button (bottom-right) -->
    <a routerLink="/employer/ai-assistant"
       class="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-modal hover:bg-primary-600 transition-all hover:scale-105 lg:bottom-8 lg:right-8"
       title="AI Assistant — Sia">
      <lucide-icon [img]="SparklesIcon" [size]="24"></lucide-icon>
      <span class="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-white animate-pulse-soft"></span>
    </a>

    <!-- Command Palette -->
    @if (commandPaletteOpen()) {
      <vjw-command-palette (close)="commandPaletteOpen.set(false)"></vjw-command-palette>
    }
  `,
  styles: [`
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
    :host { display: block; }
  `]
})
export class LayoutComponent {
  // ── Icons (expose to template) ──
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  SearchIcon = Search;
  GlobeIcon = Globe;
  BellIcon = Bell;
  LogOutIcon = LogOut;
  MenuIcon = Menu;
  XIcon = X;
  MoonIcon = Moon;
  SunIcon = Sun;
  SparklesIcon = Sparkles;
  Building2Icon = Building2;

  // ── State ──
  collapsed = signal(false);
  mobileMenuOpen = signal(false);
  commandPaletteOpen = signal(false);
  darkMode = signal(false);
  pageTitleKey = signal('dashboard.title');
  windowWidth = signal(window.innerWidth);

  isDesktop = computed(() => this.windowWidth() >= 1024);
  user = this.auth.user;

  // ── Navigation sections (matching mockup) ──
  navSections: NavSection[] = [
    {
      title: 'MAIN',
      titleKey: 'employer.nav.section_main',
      items: [
        { path: '/employer/dashboard', icon: LayoutDashboard, label: 'employer.nav.dashboard' },
        { path: '/employer/profile', icon: Building2, label: 'employer.nav.profile' },
        { path: '/employer/vacancies', icon: Briefcase, label: 'employer.nav.vacancies' },
        { path: '/employer/pipeline', icon: Kanban, label: 'employer.nav.pipeline', badge: 12 },
      ]
    },
    {
      title: 'HR & OPERATIONS',
      titleKey: 'employer.nav.section_hr',
      items: [
        { path: '/employer/team', icon: Users, label: 'employer.nav.team' },
        { path: '/employer/shifts', icon: CalendarClock, label: 'employer.nav.shifts' },
        { path: '/employer/time-tracking', icon: Clock, label: 'employer.nav.time_tracking' },
      ]
    },
    {
      title: 'ANALYTICS & AI',
      titleKey: 'employer.nav.section_analytics',
      items: [
        { path: '/employer/analytics', icon: BarChart3, label: 'employer.nav.analytics' },
        { path: '/employer/ai-assistant', icon: Sparkles, label: 'employer.nav.ai_assistant' },
      ]
    },
    {
      title: 'SYSTEM',
      titleKey: 'employer.nav.section_system',
      items: [
        { path: '/employer/settings', icon: Settings, label: 'employer.nav.settings' },
        { path: '/employer/integrations', icon: Plug, label: 'employer.nav.integrations' },
        { path: '/employer/billing', icon: CreditCard, label: 'employer.nav.billing' },
      ]
    },
  ];

  mobileNavItems = [
    { path: '/employer/dashboard', icon: LayoutDashboard, label: 'employer.nav.dashboard' },
    { path: '/employer/vacancies', icon: Briefcase, label: 'employer.nav.vacancies' },
    { path: '/employer/pipeline', icon: Kanban, label: 'employer.nav.pipeline' },
    { path: '/employer/analytics', icon: BarChart3, label: 'employer.nav.analytics' },
    { path: '/employer/settings', icon: Settings, label: 'employer.nav.settings' },
  ];

  constructor(public auth: AuthService, public i18n: I18nService, private router: Router) {
    this.updatePageTitle(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mobileMenuOpen.set(false);
        this.updatePageTitle(event.urlAfterRedirects);
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.commandPaletteOpen.set(true);
    }
  }

  // ── Computed helpers ──
  userName = computed(() => {
    const u = this.user();
    return u?.email?.split('@')[0] || 'User';
  });

  userInitials = computed(() => {
    const name = this.userName();
    return name.substring(0, 2).toUpperCase();
  });

  toggleLang() {
    this.i18n.setLang(this.i18n.lang() === 'ru' ? 'uz_lat' : 'ru');
  }

  toggleDarkMode() {
    this.darkMode.set(!this.darkMode());
    document.documentElement.classList.toggle('dark', this.darkMode());
  }

  private updatePageTitle(url: string) {
    const cleanUrl = url.split('?')[0];
    const titles: Record<string, string> = {
      '/employer/dashboard': 'employer.nav.dashboard',
      '/employer/profile': 'employer.nav.profile',
      '/employer/vacancies': 'employer.nav.vacancies',
      '/employer/vacancies/new': 'employer.page.new_vacancy',
      '/employer/pipeline': 'employer.nav.pipeline',
      '/employer/team': 'employer.nav.team',
      '/employer/shifts': 'employer.nav.shifts',
      '/employer/time-tracking': 'employer.nav.time_tracking',
      '/employer/analytics': 'employer.nav.analytics',
      '/employer/ai-assistant': 'employer.nav.ai_assistant',
      '/employer/settings': 'employer.nav.settings',
      '/employer/integrations': 'employer.nav.integrations',
      '/employer/billing': 'employer.nav.billing',
    };

    if (cleanUrl.endsWith('/edit')) {
      this.pageTitleKey.set('employer.page.edit_vacancy');
      return;
    }
    if (cleanUrl.startsWith('/employer/vacancies/') && !titles[cleanUrl]) {
      this.pageTitleKey.set('employer.page.vacancy');
      return;
    }
    this.pageTitleKey.set(titles[cleanUrl] || 'employer.portal');
  }
}
