import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'vjw-admin-experiments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ i18n.t('admin.experiments.title') }}</h1>
          <p class="mt-1 text-sm text-muted">{{ i18n.t('admin.experiments.hint') }}</p>
        </div>
        <button (click)="showCreate.set(true)" class="shrink-0 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600">
          {{ i18n.t('admin.experiments.new') }}
        </button>
      </div>

      @if (loading()) {
        <div class="py-12 text-center text-sm text-muted">{{ i18n.t('admin.logging_in') }}</div>
      } @else if (experiments().length === 0) {
        <div class="rounded-2xl border border-border bg-white p-12 text-center">
          <div class="text-3xl">&#x1F52C;</div>
          <div class="mt-3 text-sm text-muted">{{ i18n.t('admin.experiments.empty') }}</div>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
          @for (exp of experiments(); track exp.name || exp.id) {
            <div class="rounded-2xl border border-border bg-white p-4 transition hover:border-border">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-sm font-semibold">{{ exp.name }}</div>
                  @if (exp.description) {
                    <div class="mt-0.5 text-xs text-muted">{{ exp.description }}</div>
                  }
                </div>
                <span class="shrink-0 rounded-xl px-2.5 py-1 text-xs font-medium"
                  [class]="exp.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-muted'">
                  {{ exp.active ? i18n.t('admin.experiments.active') : i18n.t('admin.experiments.inactive') }}
                </span>
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{{ i18n.t('admin.experiments.participants') }}: {{ exp.totalParticipants || 0 }}</span>
                <span>{{ i18n.t('admin.experiments.conversions') }}: {{ exp.totalConversions || 0 }}</span>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                @if (exp.active) {
                  <button (click)="toggleActive(exp, false)" class="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-surface">
                    {{ i18n.t('admin.experiments.stop') }}
                  </button>
                } @else {
                  <button (click)="toggleActive(exp, true)" class="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50">
                    {{ i18n.t('admin.experiments.start') }}
                  </button>
                }
                <button (click)="viewStats(exp)" class="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-surface">
                  {{ i18n.t('admin.experiments.view_stats') }}
                </button>
              </div>

              <!-- Stats panel -->
              @if (selectedStats()?.name === exp.name) {
                <div class="mt-3 rounded-xl border border-border/50 bg-surface p-3">
                  @if (selectedStats()?.winner === 'INSUFFICIENT_DATA') {
                    <div class="text-xs text-muted">{{ i18n.t('admin.experiments.not_enough_data') }}</div>
                  } @else {
                    <div class="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div class="font-semibold text-slate-700">Variant A</div>
                        <div class="mt-1">{{ i18n.t('admin.experiments.participants') }}: {{ selectedStats()?.variantA?.total || 0 }}</div>
                        <div>{{ i18n.t('admin.experiments.conversions') }}: {{ selectedStats()?.variantA?.converted || 0 }}</div>
                        <div>Rate: {{ (selectedStats()?.variantA?.conversionRate * 100 || 0).toFixed(1) }}%</div>
                      </div>
                      <div>
                        <div class="font-semibold text-slate-700">Variant B</div>
                        <div class="mt-1">{{ i18n.t('admin.experiments.participants') }}: {{ selectedStats()?.variantB?.total || 0 }}</div>
                        <div>{{ i18n.t('admin.experiments.conversions') }}: {{ selectedStats()?.variantB?.converted || 0 }}</div>
                        <div>Rate: {{ (selectedStats()?.variantB?.conversionRate * 100 || 0).toFixed(1) }}%</div>
                      </div>
                    </div>
                    @if (selectedStats()?.winner && selectedStats()?.winner !== 'TIE') {
                      <div class="mt-2 text-xs font-semibold text-emerald-700">
                        {{ i18n.t('admin.experiments.winner') }}: {{ selectedStats()?.winner }}
                        ({{ i18n.t('admin.experiments.confidence') }}: {{ selectedStats()?.confidenceLevel }}%)
                      </div>
                    } @else if (selectedStats()?.winner === 'TIE') {
                      <div class="mt-2 text-xs text-muted">{{ i18n.t('admin.experiments.tie') }}</div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Create modal -->
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-primary/20" (click)="showCreate.set(false)">
          <div class="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-lg" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold">{{ i18n.t('admin.experiments.create_title') }}</h3>
            <div class="mt-4 space-y-3">
              <input
                [(ngModel)]="newName"
                [placeholder]="i18n.t('admin.experiments.name_placeholder')"
                class="h-11 w-full rounded-2xl border border-border px-4 text-sm outline-none focus:border-slate-950" />
              <input
                [(ngModel)]="newDesc"
                [placeholder]="i18n.t('admin.experiments.desc_placeholder')"
                class="h-11 w-full rounded-2xl border border-border px-4 text-sm outline-none focus:border-slate-950" />
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <button (click)="showCreate.set(false)" class="rounded-2xl border border-border px-4 py-2.5 text-sm transition hover:bg-surface">
                {{ i18n.t('admin.cancel') }}
              </button>
              <button
                (click)="create()"
                [disabled]="!newName.trim()"
                class="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50">
                {{ i18n.t('admin.experiments.create') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminExperimentsComponent implements OnInit {
  experiments = signal<any[]>([]);
  loading = signal(true);
  showCreate = signal(false);
  selectedStats = signal<any>(null);
  newName = '';
  newDesc = '';

  constructor(
    private api: AdminApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getExperiments().subscribe({
      next: (res) => {
        this.experiments.set(res.content || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error(this.i18n.t('admin.load_failed'));
      },
    });
  }

  create() {
    if (!this.newName.trim()) return;
    this.api.createExperiment(this.newName.trim(), this.newDesc.trim()).subscribe({
      next: () => {
        this.showCreate.set(false);
        this.newName = '';
        this.newDesc = '';
        this.load();
      },
      error: () => this.toast.error(this.i18n.t('admin.action_failed')),
    });
  }

  toggleActive(exp: any, activate: boolean) {
    const obs = activate ? this.api.activateExperiment(exp.name) : this.api.deactivateExperiment(exp.name);
    obs.subscribe({
      next: () => this.load(),
      error: () => this.toast.error(this.i18n.t('admin.action_failed')),
    });
  }

  viewStats(exp: any) {
    if (this.selectedStats()?.name === exp.name) {
      this.selectedStats.set(null);
      return;
    }
    this.api.getExperimentStats(exp.name).subscribe({
      next: (stats) => this.selectedStats.set(stats),
      error: () => this.toast.error(this.i18n.t('admin.load_failed')),
    });
  }
}
