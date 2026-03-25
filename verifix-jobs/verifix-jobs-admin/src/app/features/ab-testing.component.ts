import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../core/api.service';

@Component({
  selector: 'vja-ab-testing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div role="main" class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-800">A/B Testlar</h1>
        <button (click)="showCreate.set(true)" class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">+ Yangi eksperiment</button>
      </div>

      <!-- Experiments list -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (exp of experiments(); track exp.id) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-800">{{ exp.name }}</h3>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-0.5 rounded-full" [class]="exp.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">
                  {{ exp.active ? 'Faol' : 'Nofaol' }}
                </span>
                <button (click)="toggleActive(exp)" class="text-xs text-black hover:underline">
                  {{ exp.active ? 'To\\'xtatish' : 'Boshlash' }}
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-500 mb-3">{{ exp.description }}</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-400">Ishtirokchilar: <b class="text-gray-700">{{ exp.totalParticipants }}</b></span>
              <span class="text-gray-400">Konversiyalar: <b class="text-gray-700">{{ exp.totalConversions }}</b></span>
            </div>
            <button (click)="loadStats(exp.name)" class="mt-3 text-xs text-black hover:underline">Statistikani ko'rish</button>

            @if (selectedStats()?.name === exp.name) {
              <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                  <div class="text-center">
                    <div class="text-lg font-bold text-black">A</div>
                    <div class="text-2xl font-bold">{{ selectedStats()?.variantA?.conversionRate || 0 }}%</div>
                    <div class="text-xs text-gray-400">{{ selectedStats()?.variantA?.converted || 0 }} / {{ selectedStats()?.variantA?.total || 0 }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-bold text-orange-500">B</div>
                    <div class="text-2xl font-bold">{{ selectedStats()?.variantB?.conversionRate || 0 }}%</div>
                    <div class="text-xs text-gray-400">{{ selectedStats()?.variantB?.converted || 0 }} / {{ selectedStats()?.variantB?.total || 0 }}</div>
                  </div>
                </div>
                <div class="mt-3 text-center">
                  <span class="text-xs px-3 py-1 rounded-full" [class]="selectedStats()?.winner === 'A' || selectedStats()?.winner === 'B' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">
                    @if (selectedStats()?.winner === 'INSUFFICIENT_DATA') { Ma'lumot yetarli emas }
                    @else if (selectedStats()?.winner === 'TIE') { Teng }
                    @else { G'olib: {{ selectedStats()?.winner }} ({{ selectedStats()?.confidenceLevel }}% ishonch) }
                  </span>
                </div>
              </div>
            }
          </div>
        } @empty {
          <div class="col-span-2 py-16 text-center text-gray-400">Eksperimentlar yo'q</div>
        }
      </div>

      <!-- Create dialog -->
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="font-semibold text-gray-800 mb-4">Yangi A/B eksperiment</h3>
            <div role="main" class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Nomi</label>
                <input type="text" [(ngModel)]="newName" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="masalan: cta_button_color">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Tavsif</label>
                <textarea [(ngModel)]="newDesc" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Eksperiment maqsadi..."></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-4">
              <button (click)="showCreate.set(false)" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Bekor</button>
              <button (click)="create()" class="px-4 py-2 bg-black text-white rounded-lg text-sm">Yaratish</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AbTestingComponent implements OnInit {
  experiments = signal<any[]>([]);
  selectedStats = signal<any>(null);
  showCreate = signal(false);
  newName = ''; newDesc = '';

  constructor(private api: AdminApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getExperiments().subscribe({
      next: (res: any) => this.experiments.set(res.content || res || []),
    });
  }

  loadStats(name: string) {
    this.api.getExperimentStats(name).subscribe(stats => this.selectedStats.set(stats));
  }

  toggleActive(exp: any) {
    const action = exp.active ? this.api.deactivateExperiment(exp.name) : this.api.activateExperiment(exp.name);
    action.subscribe(() => this.load());
  }

  create() {
    this.api.createExperiment(this.newName, this.newDesc).subscribe(() => {
      this.showCreate.set(false);
      this.newName = ''; this.newDesc = '';
      this.load();
    });
  }
}
