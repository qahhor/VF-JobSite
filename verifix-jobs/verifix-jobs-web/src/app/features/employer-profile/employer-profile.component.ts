import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { LucideAngularModule, Building2, Globe, MapPin, Users, Calendar, Pen,
  ExternalLink, Star, TrendingUp, MessageSquare } from 'lucide-angular';

@Component({
  selector: 'vjw-employer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-title font-semibold text-gray-900">Company Profile & Brand</h1>
        <a href="/companies/{{ profile()?.slug }}" target="_blank"
           class="flex items-center gap-2 rounded-xl border border-primary bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition">
          <lucide-icon [img]="ExternalLinkIcon" [size]="16"></lucide-icon>
          View Public Page
        </a>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-border">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab.set(tab.id)"
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
            [class]="activeTab() === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-gray-700'">
            <lucide-icon [img]="tab.icon" [size]="16"></lucide-icon>
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab: Profile -->
      @if (activeTab() === 'profile') {
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Main profile card -->
          <div class="xl:col-span-2 rounded-2xl border border-border bg-white shadow-card overflow-hidden">
            <!-- Cover + Logo -->
            <div class="relative h-40 bg-gradient-to-r from-primary/20 to-accent/10">
              <div class="absolute -bottom-8 left-6">
                <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-card border-4 border-white">
                  {{ profile()?.name?.charAt(0) || 'V' }}
                </div>
              </div>
            </div>

            <!-- Company Info Grid -->
            <div class="px-6 pt-12 pb-6 space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">Company Name</label>
                  <div class="mt-1 text-base font-semibold text-gray-900">{{ profile()?.name || '—' }}</div>
                </div>
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">Website</label>
                  <div class="mt-1 flex items-center gap-1.5">
                    <lucide-icon [img]="GlobeIcon" [size]="14" class="text-primary"></lucide-icon>
                    <a [href]="profile()?.websiteUrl" target="_blank" class="text-sm text-primary hover:underline">
                      {{ profile()?.websiteUrl || '—' }}
                    </a>
                  </div>
                </div>
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">Industry</label>
                  <div class="mt-1 text-sm text-gray-700">{{ profile()?.industry || '—' }}</div>
                </div>
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">Location</label>
                  <div class="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                    <lucide-icon [img]="MapPinIcon" [size]="14" class="text-muted"></lucide-icon>
                    {{ profile()?.city || '—' }}{{ profile()?.region ? ', ' + profile()?.region : '' }}
                  </div>
                </div>
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">INN (Tax ID)</label>
                  <div class="mt-1 text-sm font-mono text-gray-700">{{ profile()?.inn || '—' }}</div>
                </div>
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">Employee Count</label>
                  <div class="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                    <lucide-icon [img]="UsersIcon" [size]="14" class="text-muted"></lucide-icon>
                    {{ profile()?.employeeCountRange || '—' }} employees
                  </div>
                </div>
              </div>
              @if (profile()?.description) {
                <div>
                  <label class="text-caption font-medium uppercase tracking-wider text-muted">About</label>
                  <p class="mt-1 text-sm text-gray-600 whitespace-pre-line">{{ profile()?.description }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Sidebar: Review Intelligence -->
          <div class="space-y-4">
            <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
              <h3 class="text-caption font-medium uppercase tracking-wider text-muted mb-4">Review Intelligence</h3>
              <div class="text-center">
                <div class="text-3xl font-bold text-accent">84%</div>
                <div class="mt-1 text-sm text-muted">Overall Sentiment</div>
                <div class="mt-3 h-2 w-full rounded-full bg-surface overflow-hidden">
                  <div class="h-full bg-accent rounded-full" style="width: 84%"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2 text-sm">
                <lucide-icon [img]="TrendingUpIcon" [size]="16" class="text-accent"></lucide-icon>
                <span class="text-gray-700">Trending Up</span>
              </div>
              <div class="mt-1 text-xs text-muted">Sentiment increased by 5% this month</div>
              <div class="mt-4 flex flex-wrap gap-1.5">
                @for (tag of ['Management', 'Office', 'Salary', 'Culture', 'Growth']; track tag) {
                  <span class="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-muted">{{ tag }}</span>
                }
              </div>
            </div>

            <div class="rounded-2xl border border-coral/20 bg-coral/5 p-5">
              <div class="text-sm font-semibold text-coral">AI Tip</div>
              <p class="mt-2 text-xs text-gray-600">
                Companies with a complete Brand Page receive 3.5x more high-quality applications. Consider adding a video of your office.
              </p>
              <a class="mt-2 inline-block text-xs font-medium text-coral hover:underline cursor-pointer">Learn more</a>
            </div>
          </div>
        </div>
      }

      <!-- Tab: Brand Page -->
      @if (activeTab() === 'brand') {
        <div class="rounded-2xl border border-border bg-white p-8 shadow-card text-center">
          <div class="text-4xl mb-4">🎨</div>
          <h2 class="text-lg font-semibold text-gray-900">Brand Page Constructor</h2>
          <p class="mt-2 text-sm text-muted max-w-md mx-auto">
            Drag-and-drop block editor for your public company page. Add text blocks, photo galleries, videos, office maps, and team spotlights.
          </p>
          <div class="mt-4 text-xs text-muted">Coming soon</div>
        </div>
      }

      <!-- Tab: Reviews -->
      @if (activeTab() === 'reviews') {
        <div class="rounded-2xl border border-border bg-white p-8 shadow-card text-center">
          <div class="text-4xl mb-4">⭐</div>
          <h2 class="text-lg font-semibold text-gray-900">Reviews & Reputation</h2>
          <p class="mt-2 text-sm text-muted max-w-md mx-auto">
            Aggregated reviews with AI-powered sentiment analysis, keyword clouds, and AI-suggested response templates.
          </p>
          <div class="mt-4 text-xs text-muted">Coming soon</div>
        </div>
      }
    </div>
  `,
})
export class EmployerProfileComponent implements OnInit {
  // Icons
  ExternalLinkIcon = ExternalLink;
  GlobeIcon = Globe;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  TrendingUpIcon = TrendingUp;

  activeTab = signal<'profile' | 'brand' | 'reviews'>('profile');
  profile = signal<any>(null);

  tabs = [
    { id: 'profile' as const, label: 'Profile', icon: Building2 },
    { id: 'brand' as const, label: 'Brand Page', icon: Star },
    { id: 'reviews' as const, label: 'Reviews', icon: MessageSquare },
  ];

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (p: any) => this.profile.set(p),
      error: () => {}
    });
  }
}
