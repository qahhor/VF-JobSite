import { Component, signal, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, ArrowRight, Briefcase, BarChart3, Settings, Users, Sparkles } from 'lucide-angular';

interface PaletteItem {
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  category: string;
}

@Component({
  selector: 'vjw-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" (click)="close.emit()">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-lg rounded-2xl bg-white shadow-modal border border-border overflow-hidden"
           (click)="$event.stopPropagation()">
        <!-- Search input -->
        <div class="flex items-center gap-3 border-b border-border px-4">
          <lucide-icon [img]="SearchIcon" [size]="20" class="text-muted shrink-0"></lucide-icon>
          <input type="text" [(ngModel)]="query" (ngModelChange)="onSearch()"
            autofocus placeholder="Search vacancies, pages, actions..."
            class="h-14 flex-1 text-base outline-none bg-transparent placeholder:text-muted">
          <kbd class="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted">ESC</kbd>
        </div>

        <!-- Results -->
        <div class="max-h-80 overflow-y-auto py-2">
          @if (filteredItems().length) {
            @for (item of filteredItems(); track item.label; let i = $index) {
              <button (click)="execute(item)"
                class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface transition"
                [class.bg-surface]="i === selectedIndex()">
                <lucide-icon [img]="item.icon" [size]="18" class="text-muted shrink-0"></lucide-icon>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900">{{ item.label }}</div>
                  @if (item.description) {
                    <div class="text-[11px] text-muted truncate">{{ item.description }}</div>
                  }
                </div>
                <span class="text-[10px] text-muted rounded-full border border-border px-2 py-0.5">{{ item.category }}</span>
              </button>
            }
          } @else {
            <div class="px-4 py-8 text-center text-sm text-muted">No results for "{{ query }}"</div>
          }
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  `,
})
export class CommandPaletteComponent implements OnInit, OnDestroy {
  SearchIcon = Search;

  @Output() close = new EventEmitter<void>();

  query = '';
  selectedIndex = signal(0);
  filteredItems = signal<PaletteItem[]>([]);

  allItems: PaletteItem[] = [];
  private keyHandler = (e: KeyboardEvent) => this.onKeydown(e);

  constructor(private router: Router) {}

  ngOnInit() {
    this.allItems = [
      { label: 'Dashboard', description: 'KPI overview and insights', icon: BarChart3, action: () => this.nav('/employer/dashboard'), category: 'Page' },
      { label: 'Vacancies', description: 'Manage job postings', icon: Briefcase, action: () => this.nav('/employer/vacancies'), category: 'Page' },
      { label: 'Create New Vacancy', description: 'Post a new job', icon: Briefcase, action: () => this.nav('/employer/vacancies/new'), category: 'Action' },
      { label: 'Pipeline', description: 'Recruitment Kanban board', icon: Users, action: () => this.nav('/employer/pipeline'), category: 'Page' },
      { label: 'Company Profile', description: 'Edit brand and info', icon: Settings, action: () => this.nav('/employer/profile'), category: 'Page' },
      { label: 'Team & Employees', description: 'Manage workforce', icon: Users, action: () => this.nav('/employer/team'), category: 'Page' },
      { label: 'Shift Planner', description: 'Weekly schedule', icon: Settings, action: () => this.nav('/employer/shifts'), category: 'Page' },
      { label: 'Time Tracking', description: 'Clock-in records', icon: Settings, action: () => this.nav('/employer/time-tracking'), category: 'Page' },
      { label: 'Analytics Hub', description: 'Charts and metrics', icon: BarChart3, action: () => this.nav('/employer/analytics'), category: 'Page' },
      { label: 'AI Assistant', description: 'Ask Sia anything', icon: Sparkles, action: () => this.nav('/employer/ai-assistant'), category: 'AI' },
      { label: 'Settings', description: 'General, notifications, privacy', icon: Settings, action: () => this.nav('/employer/settings'), category: 'Page' },
      { label: 'Billing & Plan', description: 'Subscription and payments', icon: Settings, action: () => this.nav('/employer/billing'), category: 'Page' },
      { label: 'Integrations', description: 'Connected services', icon: Settings, action: () => this.nav('/employer/integrations'), category: 'Page' },
    ];
    this.filteredItems.set(this.allItems);
    document.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }

  onSearch() {
    const q = this.query.toLowerCase().trim();
    this.selectedIndex.set(0);
    this.filteredItems.set(q
      ? this.allItems.filter(i => i.label.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
      : this.allItems
    );
  }

  execute(item: PaletteItem) {
    item.action();
    this.close.emit();
  }

  private nav(path: string) {
    this.router.navigate([path]);
  }

  private onKeydown(e: KeyboardEvent) {
    const items = this.filteredItems();
    if (e.key === 'Escape') { this.close.emit(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.selectedIndex.update(i => Math.min(i + 1, items.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.selectedIndex.update(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && items[this.selectedIndex()]) { this.execute(items[this.selectedIndex()]); }
  }
}
