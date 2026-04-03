import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-800">{{ i18n.t('team.title') }}</h1>
        <button
          (click)="showInvite.set(true)"
          class="h-10 w-full rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto">
          + {{ i18n.t('team.invite') }}
        </button>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div class="divide-y divide-gray-100 md:hidden">
          @for (m of members(); track m.id) {
            <div class="space-y-3 p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="break-all text-sm font-medium text-gray-800">{{ m.email }}</div>
                  @if (m.phone) {
                    <div class="mt-1 text-xs text-gray-400">{{ m.phone }}</div>
                  }
                </div>
                <span class="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
                      [class]="m.role === 'ADMIN' ? 'bg-red-50 text-red-600' : m.role === 'RECRUITER' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'">
                  {{ roleLabel(m.role) }}
                </span>
              </div>

              @if (m.role !== 'ADMIN') {
                <div class="flex flex-col gap-2 sm:flex-row">
                  <select
                    (change)="changeRole(m.id, $event)"
                    [value]="m.role"
                    class="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm">
                    <option value="RECRUITER">Recruiter</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button
                    (click)="remove(m.id)"
                    class="h-10 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50">
                    {{ i18n.t('team.remove') }}
                  </button>
                </div>
              }
            </div>
          } @empty {
            <div class="px-5 py-12 text-center text-sm text-gray-400">{{ i18n.t('team.no_members') }}</div>
          }
        </div>

        <table class="hidden w-full md:table">
          <thead class="border-b border-gray-100 bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('team.employee') }}</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">{{ i18n.t('team.role') }}</th>
              <th class="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">{{ i18n.t('team.action') }}</th>
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
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium"
                        [class]="m.role === 'ADMIN' ? 'bg-red-50 text-red-600' : m.role === 'RECRUITER' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'">
                    {{ roleLabel(m.role) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-right">
                  @if (m.role !== 'ADMIN') {
                    <select (change)="changeRole(m.id, $event)" [value]="m.role" class="mr-2 rounded border border-gray-200 px-2 py-1 text-xs">
                      <option value="RECRUITER">Recruiter</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button (click)="remove(m.id)" class="text-xs text-red-500 hover:text-red-700">{{ i18n.t('team.remove') }}</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="px-5 py-12 text-center text-sm text-gray-400">{{ i18n.t('team.no_members') }}</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (showInvite()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="showInvite.set(false)"></div>
          <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 class="mb-4 text-lg font-bold text-gray-900">{{ i18n.t('team.invite_member') }}</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('auth.email') }}</label>
                <input type="email" [(ngModel)]="inviteEmail" class="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm">
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('auth.phone') }}</label>
                <input type="tel" [(ngModel)]="invitePhone" class="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" placeholder="+998...">
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700">{{ i18n.t('team.role') }}</label>
                <select [(ngModel)]="inviteRole" class="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
                  <option value="RECRUITER">{{ i18n.t('team.role_recruiter_desc') }}</option>
                  <option value="VIEWER">{{ i18n.t('team.role_viewer_desc') }}</option>
                </select>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button (click)="showInvite.set(false)" class="h-10 rounded-lg border border-gray-200 px-4 text-sm">{{ i18n.t('common.cancel') }}</button>
                <button (click)="invite()" [disabled]="!inviteEmail" class="h-10 rounded-lg bg-black px-6 text-sm font-medium text-white disabled:opacity-50">{{ i18n.t('team.invite') }}</button>
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

  constructor(private http: HttpClient, public i18n: I18nService) {}

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
      next: () => {
        this.showInvite.set(false);
        this.inviteEmail = '';
        this.invitePhone = '';
        this.load();
      },
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
    return ({
      ADMIN: this.i18n.t('team.admin'),
      RECRUITER: this.i18n.t('team.recruiter'),
      VIEWER: this.i18n.t('team.viewer')
    } as Record<string, string>)[r] || r;
  }
}
