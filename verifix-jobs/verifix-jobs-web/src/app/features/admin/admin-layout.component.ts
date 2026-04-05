import { Component, OnInit, HostListener, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminApiService, AdminProfile } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, LayoutDashboard, Building2, Shield, Users, ClipboardList,
  BarChart3, FlaskConical, AlertTriangle, Landmark, Settings, Database, KeyRound,
  ChevronLeft, ChevronRight, Globe, Bell, LogOut, Menu, X, Search } from 'lucide-angular';
import { CommandPaletteComponent } from '../../shared/components/command-palette.component';

interface NavSection {
  titleKey: string;
  items: { path: string; icon: any; label: string }[];
}

@Component({
  selector: 'vjw-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, CommandPaletteComponent],
  template: `
    <div class="min-h-screen bg-surface">
      <!-- ═══ Desktop Sidebar ═══ -->
      <aside class="fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-sidebar text-white transition-all duration-200"
             [style.width.px]="collapsed() ? 68 : 256">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500">
            <span class="text-sm font-bold text-white">A</span>
          </div>
          @if (!collapsed()) {
            <div class="min-w-0">
              <div class="text-sm font-semibold truncate">Verifix Jobs</div>
              <div class="text-[10px] uppercase tracking-wider text-white/50">Admin Panel</div>
            </div>
          }
        </div>

        <!-- Nav sections -->
        <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          @for (section of navSections; track section.titleKey) {
            <div>
              @if (!collapsed()) {
                <div class="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
                  {{ i18n.t(section.titleKey) }}
                </div>
              }
              <div class="space-y-0.5">
                @for (item of section.items; track item.path) {
                  <a [routerLink]="item.path"
                     routerLinkActive="!bg-sidebar-hover !text-white !border-l-red-400"
                     [routerLinkActiveOptions]="{exact: false}"
                     class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-all hover:bg-sidebar-hover hover:text-white border-l-[3px] border-transparent"
                     [class.justify-center]="collapsed()"
                     [class.px-0]="collapsed()"
                     [title]="collapsed() ? i18n.t(item.label) : ''">
                    <lucide-icon [img]="item.icon" [size]="20" class="shrink-0 opacity-70 group-hover:opacity-100"></lucide-icon>
                    @if (!collapsed()) {
                      <span class="truncate">{{ i18n.t(item.label) }}</span>
                    }
                  </a>
                }
              </div>
            </div>
          }
        </nav>

        <!-- User + Collapse -->
        <div class="shrink-0 border-t border-white/10 p-3 space-y-2">
          @if (!collapsed() && profile()) {
            <div class="flex items-center gap-3 px-2">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-semibold text-red-400">
                {{ (profile()?.email || '?')[0].toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium text-white/90">{{ profile()?.email }}</div>
                <div class="truncate text-[11px] text-white/40">{{ profile()?.role }}</div>
              </div>
              <button (click)="logout()" class="rounded-md p-1 text-white/40 hover:text-white/70 transition" title="Logout">
                <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
              </button>
            </div>
          }
          <button (click)="collapsed.set(!collapsed())"
                  class="flex w-full items-center justify-center rounded-lg py-1.5 text-white/40 hover:bg-sidebar-hover hover:text-white/70 transition">
            <lucide-icon [img]="collapsed() ? ChevronRightIcon : ChevronLeftIcon" [size]="16"></lucide-icon>
          </button>
        </div>
      </aside>

      <!-- ═══ Main Content ═══ -->
      <div class="transition-all duration-200" [style.margin-left.px]="isDesktop() ? (collapsed() ? 68 : 256) : 0">
        <!-- Header -->
        <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
          <div class="flex items-center gap-3 min-w-0">
            <button class="lg:hidden rounded-md p-1.5 text-muted hover:text-gray-900 transition" (click)="mobileNav.set(true)">
              <lucide-icon [img]="MenuIcon" [size]="22"></lucide-icon>
            </button>
            <div class="flex items-center gap-1.5 text-sm min-w-0">
              <span class="text-muted">Admin</span>
              <span class="text-muted">/</span>
              <span class="font-medium text-gray-900 truncate">{{ i18n.t('admin.control_center') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="toggleLang()" class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted hover:text-gray-900 transition">
              <lucide-icon [img]="GlobeIcon" [size]="16"></lucide-icon>
              <span class="uppercase">{{ i18n.lang() }}</span>
            </button>
            <button class="relative rounded-lg p-1.5 text-muted hover:text-gray-900 transition">
              <lucide-icon [img]="BellIcon" [size]="18"></lucide-icon>
            </button>
          </div>
        </header>

        @if (requiresPasswordChange()) {
          <div class="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 lg:px-6">
            <div class="flex items-center justify-between gap-3">
              <span class="font-semibold">{{ i18n.t('admin.password_change_required') }}</span>
              <a routerLink="/admin/access" class="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-primary-600">
                {{ i18n.t('admin.open_access_center') }}
              </a>
            </div>
          </div>
        }

        <main class="mx-auto max-w-content p-4 pb-24 lg:p-6 lg:pb-6">
          <router-outlet />
        </main>
      </div>

      <!-- ═══ Mobile Drawer ═══ -->
      @if (mobileNav()) {
        <div class="fixed inset-0 z-50 flex lg:hidden">
          <div class="absolute inset-0 bg-black/40" (click)="mobileNav.set(false)"></div>
          <aside class="relative h-full w-72 bg-sidebar text-white shadow-xl overflow-y-auto">
            <div class="flex items-center justify-between px-4 h-16 border-b border-white/10">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500">
                  <span class="text-sm font-bold text-white">A</span>
                </div>
                <div>
                  <div class="text-sm font-semibold">Verifix Jobs</div>
                  <div class="text-[10px] uppercase tracking-wider text-white/50">Admin Panel</div>
                </div>
              </div>
              <button (click)="mobileNav.set(false)" class="rounded-md p-1 text-white/50 hover:text-white">
                <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
              </button>
            </div>
            <nav class="py-4 px-2 space-y-5">
              @for (section of navSections; track section.titleKey) {
                <div>
                  <div class="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">{{ i18n.t(section.titleKey) }}</div>
                  @for (item of section.items; track item.path) {
                    <a [routerLink]="item.path" routerLinkActive="!bg-sidebar-hover !text-white"
                       (click)="mobileNav.set(false)"
                       class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-sidebar-hover hover:text-white transition">
                      <lucide-icon [img]="item.icon" [size]="20" class="opacity-70"></lucide-icon>
                      <span>{{ i18n.t(item.label) }}</span>
                    </a>
                  }
                </div>
              }
            </nav>
            <div class="border-t border-white/10 p-4">
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-xs font-semibold text-red-400">
                  {{ (profile()?.email || '?')[0].toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-medium">{{ profile()?.email }}</div>
                  <div class="text-[11px] text-white/40">{{ profile()?.role }}</div>
                </div>
              </div>
              <button (click)="logout()" class="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-sidebar-hover hover:text-white transition">
                <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
                {{ i18n.t('admin.logout') }}
              </button>
            </div>
          </aside>
        </div>
      }

      <!-- Command Palette -->
      @if (commandPaletteOpen()) {
        <vjw-command-palette (close)="commandPaletteOpen.set(false)"></vjw-command-palette>
      }
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  // Icons
  ChevronLeftIcon = ChevronLeft;
  ChevronRightIcon = ChevronRight;
  GlobeIcon = Globe;
  BellIcon = Bell;
  LogOutIcon = LogOut;
  MenuIcon = Menu;
  XIcon = X;

  // State
  collapsed = signal(false);
  mobileNav = signal(false);
  commandPaletteOpen = signal(false);
  windowWidth = signal(window.innerWidth);
  profile = signal<AdminProfile | null>(null);

  isDesktop = computed(() => this.windowWidth() >= 1024);
  requiresPasswordChange = computed(() => {
    const p = this.profile();
    return p ? p.mustChangePassword : localStorage.getItem('vjw_admin_must_change_password') === 'true';
  });

  navSections: NavSection[] = [
    {
      titleKey: 'admin.nav_monitoring',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'admin.dashboard' },
        { path: '/admin/moderation', icon: Shield, label: 'admin.moderation' },
        { path: '/admin/fraud', icon: AlertTriangle, label: 'admin.fraud' },
      ]
    },
    {
      titleKey: 'admin.nav_manage',
      items: [
        { path: '/admin/employers', icon: Building2, label: 'admin.companies' },
        { path: '/admin/users', icon: Users, label: 'admin.users_nav' },
        { path: '/admin/references', icon: Database, label: 'admin.references_nav' },
        { path: '/admin/access', icon: KeyRound, label: 'admin.access' },
      ]
    },
    {
      titleKey: 'admin.nav_analytics',
      items: [
        { path: '/admin/analytics', icon: BarChart3, label: 'admin.analytics_nav' },
        { path: '/admin/experiments', icon: FlaskConical, label: 'admin.experiments_nav' },
        { path: '/admin/audit', icon: ClipboardList, label: 'admin.audit_nav' },
      ]
    },
    {
      titleKey: 'admin.nav_system',
      items: [
        { path: '/admin/gov-sync', icon: Landmark, label: 'admin.gov' },
        { path: '/admin/settings', icon: Settings, label: 'admin.settings_nav' },
      ]
    },
  ];

  constructor(private router: Router, private adminApi: AdminApiService, public i18n: I18nService) {}

  @HostListener('window:resize')
  onResize() { this.windowWidth.set(window.innerWidth); }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.commandPaletteOpen.set(true);
    }
  }

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

  toggleLang() {
    this.i18n.setLang(this.i18n.lang() === 'ru' ? 'uz_lat' : 'ru');
  }

  logout() {
    localStorage.removeItem('vjw_admin_token');
    localStorage.removeItem('vjw_admin_role');
    localStorage.removeItem('vjw_admin_must_change_password');
    this.mobileNav.set(false);
    this.router.navigate(['/admin/login']);
  }
}
