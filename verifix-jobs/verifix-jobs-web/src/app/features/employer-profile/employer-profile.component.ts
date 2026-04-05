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

      <!-- Tab: Brand Page Constructor -->
      @if (activeTab() === 'brand') {
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <!-- Block editor -->
          <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-heading font-semibold text-gray-900">Brand Blocks</h3>
              <span class="text-xs text-muted">{{ brandBlocks().length }} / 30 blocks</span>
            </div>
            <!-- Block list -->
            <div class="space-y-2 mb-4 min-h-[200px]">
              @for (block of brandBlocks(); track block.id; let i = $index) {
                <div class="flex items-center gap-2 rounded-xl border border-border p-3 bg-surface hover:border-primary/30 transition group">
                  <span class="cursor-grab text-muted">⋮⋮</span>
                  <span class="text-lg">{{ blockTypeIcon(block.type) }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900">{{ block.type }}</div>
                    <div class="text-[11px] text-muted truncate">{{ block.content || 'Empty block' }}</div>
                  </div>
                  <button (click)="removeBrandBlock(i)" class="opacity-0 group-hover:opacity-100 rounded-md p-1 text-error hover:bg-error/10 transition">✕</button>
                </div>
              }
              @if (brandBlocks().length === 0) {
                <div class="flex flex-col items-center justify-center py-8 text-center">
                  <div class="text-3xl mb-2">🎨</div>
                  <div class="text-sm font-medium text-gray-900">No blocks yet</div>
                  <div class="text-xs text-muted mt-1">Add blocks to build your brand page</div>
                </div>
              }
            </div>
            <!-- Add block buttons -->
            <div class="border-t border-border pt-3">
              <div class="text-caption font-medium text-muted mb-2">ADD BLOCK</div>
              <div class="flex flex-wrap gap-2">
                @for (type of blockTypes; track type.id) {
                  <button (click)="addBrandBlock(type.id)"
                    class="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-primary/30 hover:bg-primary/5 transition">
                    <span>{{ type.icon }}</span> {{ type.label }}
                  </button>
                }
              </div>
            </div>
          </div>
          <!-- Preview -->
          <div class="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
            <div class="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 class="text-sm font-semibold text-gray-900">Preview</h3>
              <div class="flex gap-2">
                <button class="rounded-lg border border-border px-3 py-1 text-[11px] font-medium text-muted hover:bg-surface transition">Generate Link</button>
                <button class="rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:bg-primary-600 transition">Publish</button>
              </div>
            </div>
            <div class="p-5 space-y-4 max-h-[600px] overflow-y-auto">
              @for (block of brandBlocks(); track block.id) {
                <div class="rounded-xl border border-border/50 p-4">
                  @switch (block.type) {
                    @case ('Rich Text') { <p class="text-sm text-gray-700 whitespace-pre-line">{{ block.content || 'Your company description here...' }}</p> }
                    @case ('Photo Gallery') { <div class="grid grid-cols-2 gap-2"><div class="h-24 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center text-muted text-xs">📷 Photo 1</div><div class="h-24 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center text-muted text-xs">📷 Photo 2</div></div> }
                    @case ('Video') { <div class="h-32 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center text-muted text-sm">▶ Video embed</div> }
                    @case ('Office Map') { <div class="h-32 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center text-muted text-sm">📍 Office location map</div> }
                    @case ('Team Spotlight') { <div class="flex gap-3"><div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JS</div><div><div class="text-sm font-semibold">Team Member</div><div class="text-xs text-muted">Role — "Quote about working here"</div></div></div> }
                    @case ('Infographic') { <div class="h-24 rounded-lg bg-surface border border-dashed border-border flex items-center justify-center text-muted text-sm">📊 Infographic</div> }
                  }
                </div>
              }
              @if (brandBlocks().length === 0) {
                <div class="text-center text-sm text-muted py-12">Add blocks to see preview</div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Tab: Reviews & Reputation -->
      @if (activeTab() === 'reviews') {
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <!-- Reviews feed -->
          <div class="xl:col-span-2 space-y-3">
            @for (review of demoReviews; track review.id) {
              <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="flex gap-0.5">
                      @for (s of [1,2,3,4,5]; track s) {
                        <span class="text-sm" [class]="s <= review.rating ? 'text-warning' : 'text-border'">★</span>
                      }
                    </div>
                    <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          [class]="review.sentiment === 'Positive' ? 'bg-accent/10 text-accent border border-accent/20' :
                                   review.sentiment === 'Neutral' ? 'bg-info/10 text-info border border-info/20' :
                                   'bg-error/10 text-error border border-error/20'">
                      {{ review.sentiment }}
                    </span>
                  </div>
                  <span class="text-[11px] text-muted">{{ review.date }}</span>
                </div>
                <div class="text-xs text-muted mb-1">{{ review.author }}</div>
                <p class="text-sm text-gray-700">{{ review.text }}</p>
                <div class="mt-3 flex gap-2">
                  <button class="rounded-lg border border-border px-3 py-1 text-[11px] font-medium text-muted hover:bg-surface transition">Reply</button>
                  <button class="rounded-lg border border-primary/30 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/5 transition">AI Suggest Reply</button>
                </div>
              </div>
            }
          </div>
          <!-- Sentiment panel -->
          <div class="space-y-4">
            <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
              <h3 class="text-caption font-medium uppercase tracking-wider text-muted mb-4">Sentiment Score</h3>
              <div class="text-center mb-4">
                <div class="relative inline-block h-28 w-28">
                  <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" stroke-width="10"></circle>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" stroke-width="10"
                      stroke-dasharray="264" stroke-dashoffset="42" stroke-linecap="round"></circle>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="text-2xl font-bold text-accent">84%</div>
                    <div class="text-[9px] text-muted">Positive</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Keyword cloud -->
            <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
              <h3 class="text-caption font-medium uppercase tracking-wider text-muted mb-3">Keyword Cloud</h3>
              <div class="flex flex-wrap gap-2">
                @for (kw of keywordCloud; track kw.word) {
                  <span class="rounded-full border border-border px-2.5 py-1 font-medium transition hover:border-primary/30"
                        [style.font-size.px]="kw.size">{{ kw.word }}</span>
                }
              </div>
            </div>
            <div class="rounded-2xl border border-border bg-white p-5 shadow-card">
              <h3 class="text-caption font-medium uppercase tracking-wider text-muted mb-2">Industry Benchmark</h3>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted">Your score</span>
                <span class="font-bold text-accent">84%</span>
              </div>
              <div class="flex items-center justify-between text-sm mt-1">
                <span class="text-muted">Industry avg</span>
                <span class="font-bold text-gray-700">72%</span>
              </div>
              <div class="mt-2 text-xs text-accent">+12% above average</div>
            </div>
          </div>
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
  brandBlocks = signal<{ id: string; type: string; content: string }[]>([]);

  tabs = [
    { id: 'profile' as const, label: 'Profile', icon: Building2 },
    { id: 'brand' as const, label: 'Brand Page', icon: Star },
    { id: 'reviews' as const, label: 'Reviews', icon: MessageSquare },
  ];

  blockTypes = [
    { id: 'Rich Text', icon: '📝', label: 'Rich Text' },
    { id: 'Photo Gallery', icon: '📷', label: 'Photos' },
    { id: 'Video', icon: '🎬', label: 'Video' },
    { id: 'Office Map', icon: '📍', label: 'Office Map' },
    { id: 'Team Spotlight', icon: '👤', label: 'Team' },
    { id: 'Infographic', icon: '📊', label: 'Infographic' },
  ];

  demoReviews = [
    { id: '1', rating: 5, sentiment: 'Positive', author: 'Anonymous Employee', date: '2026-03-15', text: 'Great company culture and supportive management. Work-life balance is excellent.' },
    { id: '2', rating: 4, sentiment: 'Positive', author: 'Former Employee', date: '2026-02-28', text: 'Good salary and benefits. Office is modern. Would recommend to friends.' },
    { id: '3', rating: 3, sentiment: 'Neutral', author: 'Current Employee', date: '2026-02-10', text: 'Average experience. Some departments are better organized than others.' },
    { id: '4', rating: 2, sentiment: 'Negative', author: 'Former Employee', date: '2026-01-20', text: 'Long working hours and unclear promotion path. Management could improve communication.' },
  ];

  keywordCloud = [
    { word: 'Culture', size: 16 }, { word: 'Salary', size: 14 }, { word: 'Management', size: 18 },
    { word: 'Growth', size: 12 }, { word: 'Office', size: 15 }, { word: 'Remote', size: 11 },
    { word: 'Benefits', size: 13 }, { word: 'Team', size: 16 }, { word: 'Balance', size: 14 },
    { word: 'Learning', size: 11 }, { word: 'Flexible', size: 12 },
  ];

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  blockTypeIcon(type: string): string {
    return this.blockTypes.find(b => b.id === type)?.icon || '📄';
  }

  addBrandBlock(type: string) {
    if (this.brandBlocks().length >= 30) return;
    this.brandBlocks.update(b => [...b, { id: crypto.randomUUID(), type, content: '' }]);
  }

  removeBrandBlock(index: number) {
    this.brandBlocks.update(b => b.filter((_, i) => i !== index));
  }

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (p: any) => this.profile.set(p),
      error: () => {}
    });
  }
}
