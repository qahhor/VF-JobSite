import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/services/admin-api.service';

@Component({
  selector: 'vjw-admin-employers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Kompaniyalar</h1>
      <select [(ngModel)]="statusFilter" (ngModelChange)="load()"
              class="h-9 px-3 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white">
        <option value="">Barchasi</option>
        <option value="PENDING">Kutilmoqda</option>
        <option value="ACTIVE">Faol</option>
        <option value="BLOCKED">Bloklangan</option>
      </select>
    </div>

    <div class="space-y-3">
      @for (e of employers(); track e.id) {
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold">{{ e.name }}</span>
                @if (e.isVerified) { <span class="text-xs px-2 py-0.5 bg-green-900 text-green-400 rounded">Tasdiqlangan</span> }
                <span class="text-xs px-2 py-0.5 rounded" [class]="statusCls(e.status)">{{ statusLbl(e.status) }}</span>
              </div>
              <div class="text-xs text-gray-500 mt-1 space-x-3">
                @if (e.inn) { <span>INN: {{ e.inn }}</span> }
                @if (e.city) { <span>{{ e.city }}</span> }
                @if (e.industry) { <span>{{ e.industry }}</span> }
                <span>Vakansiyalar: {{ e.activeVacancies || 0 }}</span>
              </div>
              @if (e.email) { <div class="text-xs text-gray-500 mt-0.5">{{ e.email }}</div> }
            </div>

            <div class="flex gap-2 shrink-0">
              @if (!e.isVerified) {
                <button (click)="verify(e.id)" class="h-8 px-3 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-500 transition">Tasdiqlash</button>
              }
              @if (e.status === 'PENDING') {
                <button (click)="activate(e.id)" class="h-8 px-3 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition">Faollashtirish</button>
              }
              @if (e.status === 'ACTIVE') {
                <button (click)="block(e.id)" class="h-8 px-3 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-500 transition">Bloklash</button>
              }
              @if (e.status === 'BLOCKED') {
                <button (click)="activate(e.id)" class="h-8 px-3 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition">Qayta faollashtirish</button>
              }
            </div>
          </div>
        </div>
      } @empty {
        <div class="text-center py-16 text-gray-500 text-sm">Kompaniyalar topilmadi</div>
      }
    </div>
  `,
})
export class AdminEmployersComponent implements OnInit {
  employers = signal<any[]>([]);
  statusFilter = '';

  constructor(private api: AdminApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getEmployers(0, 50, this.statusFilter || undefined).subscribe({
      next: (r: any) => this.employers.set(r.content || []),
      error: () => {}
    });
  }

  verify(id: string) { this.api.verifyEmployer(id).subscribe({ next: () => this.load(), error: () => {} }); }
  activate(id: string) { this.api.changeEmployerStatus(id, 'ACTIVE').subscribe({ next: () => this.load(), error: () => {} }); }
  block(id: string) { this.api.changeEmployerStatus(id, 'BLOCKED').subscribe({ next: () => this.load(), error: () => {} }); }

  statusCls(s: string): string {
    return ({ PENDING: 'bg-yellow-900 text-yellow-400', ACTIVE: 'bg-green-900 text-green-400', BLOCKED: 'bg-red-900 text-red-400' } as Record<string,string>)[s] || 'bg-gray-700 text-gray-400';
  }
  statusLbl(s: string): string {
    return ({ PENDING: 'Kutilmoqda', ACTIVE: 'Faol', BLOCKED: 'Bloklangan' } as Record<string,string>)[s] || s;
  }
}
