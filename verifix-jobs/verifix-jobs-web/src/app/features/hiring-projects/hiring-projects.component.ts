import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'vjw-hiring-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Hiring Projects</h1>
          <p class="text-sm text-gray-400 mt-1">Yollash kampaniyalarini boshqarish</p>
        </div>
        <button (click)="showCreate.set(true)" class="h-10 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Yangi loyiha
        </button>
      </div>

      <!-- Projects grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (p of projects(); track p.id) {
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    [class]="p.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : p.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ p.status }}
              </span>
              @if (p.deadline) { <span class="text-xs text-gray-400">{{ p.deadline }}</span> }
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ p.name }}</h3>
            @if (p.description) { <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ p.description }}</p> }
            <div class="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div class="text-lg font-bold text-gray-900">{{ p.vacancyCount || 0 }}</div>
                <div class="text-[10px] text-gray-400">Vakansiya</div>
              </div>
              <div>
                <div class="text-lg font-bold text-gray-900">{{ p.applicationCount || 0 }}</div>
                <div class="text-[10px] text-gray-400">Ariza</div>
              </div>
              <div>
                <div class="text-lg font-bold text-green-600">{{ p.hiredCount || 0 }}/{{ p.targetHires || '∞' }}</div>
                <div class="text-[10px] text-gray-400">Yollangan</div>
              </div>
            </div>
            <!-- Link vacancy -->
            <div class="mt-4 pt-3 border-t border-gray-100">
              <select (change)="linkVacancy(p.id, $event)" class="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs bg-white">
                <option value="">Vakansiya qo'shish...</option>
                @for (v of vacancyOptions(); track v.id) {
                  <option [value]="v.id">{{ v.title }}</option>
                }
              </select>
            </div>
          </div>
        } @empty {
          <div class="col-span-full bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <div class="text-4xl mb-3">📋</div>
            <div class="text-sm text-gray-500 mb-2">Hali loyihalar yo'q</div>
            <div class="text-xs text-gray-400">Hiring project — bir nechta vakansiyani birlashtirib kampaniya yaratish</div>
          </div>
        }
      </div>

      <!-- Create modal -->
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showCreate.set(false)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Yangi loyiha</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nomi</label>
                <input type="text" [(ngModel)]="newProject.name" placeholder="Masalan: Q2 Kassirlar kampaniyasi" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                <textarea [(ngModel)]="newProject.description" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Qisqacha tavsif..."></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Maqsad (necha kishi)</label>
                  <input type="number" [(ngModel)]="newProject.targetHires" placeholder="50" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Muddat</label>
                  <input type="date" [(ngModel)]="newProject.deadline" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
                </div>
              </div>
              <div class="flex gap-2 justify-end pt-2">
                <button (click)="showCreate.set(false)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">Bekor</button>
                <button (click)="create()" [disabled]="!newProject.name" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">Yaratish</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class HiringProjectsComponent implements OnInit {
  projects = signal<any[]>([]);
  vacancyOptions = signal<any[]>([]);
  showCreate = signal(false);
  newProject = { name: '', description: '', targetHires: null as number | null, deadline: '' };

  constructor(private http: HttpClient, private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getVacancies(0, 100).subscribe({ next: (r: any) => this.vacancyOptions.set(r.content || []), error: () => {} });
  }

  load() {
    this.http.get<any[]>(`${environment.apiUrl}/hiring-projects`).subscribe({
      next: (r: any) => this.projects.set(r || []),
      error: () => {}
    });
  }

  create() {
    this.http.post<any>(`${environment.apiUrl}/hiring-projects`, this.newProject).subscribe({
      next: () => { this.showCreate.set(false); this.newProject = { name: '', description: '', targetHires: null, deadline: '' }; this.load(); },
      error: () => {}
    });
  }

  linkVacancy(projectId: string, event: Event) {
    const vacancyId = (event.target as HTMLSelectElement).value;
    if (!vacancyId) return;
    this.http.post(`${environment.apiUrl}/hiring-projects/${projectId}/vacancies`, { vacancyId }).subscribe({
      next: () => this.load(),
      error: () => {}
    });
  }
}
