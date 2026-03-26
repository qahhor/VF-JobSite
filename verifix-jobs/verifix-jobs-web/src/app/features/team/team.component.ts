import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vjw-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">Jamoa</h1>
        <button (click)="showInvite.set(true)" class="h-10 px-4 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          + Taklif qilish
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Xodim</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Rol</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Amal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (m of members(); track m.id) {
              <tr>
                <td class="px-5 py-3">
                  <div class="text-sm font-medium text-gray-800">{{ m.email }}</div>
                  @if (m.phone) { <div class="text-xs text-gray-400">{{ m.phone }}</div> }
                </td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="m.role === 'ADMIN' ? 'bg-red-50 text-red-600' : m.role === 'RECRUITER' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'">
                    {{ roleLabel(m.role) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-right">
                  @if (m.role !== 'ADMIN') {
                    <select (change)="changeRole(m.id, $event)" [value]="m.role" class="text-xs border border-gray-200 rounded px-2 py-1 mr-2">
                      <option value="RECRUITER">Recruiter</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button (click)="remove(m.id)" class="text-xs text-red-500 hover:text-red-700">O'chirish</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="px-5 py-12 text-center text-gray-400 text-sm">Jamoa a'zolari yo'q</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Invite modal -->
      @if (showInvite()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showInvite.set(false)"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Xodim taklif qilish</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" [(ngModel)]="inviteEmail" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input type="tel" [(ngModel)]="invitePhone" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm" placeholder="+998...">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select [(ngModel)]="inviteRole" class="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="RECRUITER">Recruiter — vakansiya va arizalar</option>
                  <option value="VIEWER">Viewer — faqat ko'rish</option>
                </select>
              </div>
              <div class="flex gap-2 justify-end pt-2">
                <button (click)="showInvite.set(false)" class="h-10 px-4 border border-gray-200 rounded-lg text-sm">Bekor</button>
                <button (click)="invite()" [disabled]="!inviteEmail" class="h-10 px-6 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50">Taklif</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TeamComponent implements OnInit {
  members = signal<any[]>([]);
  showInvite = signal(false);
  inviteEmail = '';
  invitePhone = '';
  inviteRole = 'RECRUITER';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${environment.apiUrl}/managers`).subscribe({
      next: (r: any) => this.members.set(r || []),
      error: () => {}
    });
  }

  invite() {
    this.http.post<any>(`${environment.apiUrl}/managers`, {
      email: this.inviteEmail, phone: this.invitePhone, role: this.inviteRole
    }).subscribe({
      next: () => { this.showInvite.set(false); this.inviteEmail = ''; this.invitePhone = ''; this.load(); },
      error: () => {}
    });
  }

  changeRole(id: string, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.http.patch<any>(`${environment.apiUrl}/managers/${id}/role`, { role }).subscribe({ next: () => this.load(), error: () => {} });
  }

  remove(id: string) {
    this.http.delete(`${environment.apiUrl}/managers/${id}`).subscribe({ next: () => this.load(), error: () => {} });
  }

  roleLabel(r: string): string {
    return ({ ADMIN: 'Admin', RECRUITER: 'Recruiter', VIEWER: 'Viewer' } as Record<string, string>)[r] || r;
  }
}
