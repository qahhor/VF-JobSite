import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, UserPlus, Mail, Phone, MoreVertical, X } from 'lucide-angular';

@Component({
  selector: 'vjw-team',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-title font-semibold text-gray-900">Team & Employees</h1>
          <p class="mt-1 text-sm text-muted">Manage your workforce and onboarding</p>
        </div>
        <button (click)="showInvite.set(true)"
          class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-primary-600 transition">
          <lucide-icon [img]="UserPlusIcon" [size]="18"></lucide-icon>
          Add Employee
        </button>
      </div>

      <!-- Search + Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="filter()"
          placeholder="Search by name, role, or ID..."
          class="flex-1 h-10 rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary">
        <select [(ngModel)]="statusFilterVal" (ngModelChange)="filter()"
          class="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
      </div>

      <!-- Table -->
      <div class="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-left">
                <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Employee</th>
                <th class="hidden md:table-cell px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Role & Dept</th>
                <th class="hidden lg:table-cell px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Hire Date</th>
                <th class="px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Status</th>
                <th class="hidden sm:table-cell px-5 py-3 text-caption font-medium uppercase tracking-wider text-muted">Contact</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (m of filtered(); track m.id) {
                <tr class="border-b border-border/50 hover:bg-surface/50 transition">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                           [class]="m.role === 'ADMIN' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'">
                        {{ (m.email || '??').substring(0,2).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <div class="font-medium text-gray-900 truncate">{{ m.email?.split('@')[0] || m.email }}</div>
                        <div class="text-[11px] text-muted font-mono">EMP-{{ (m.id || '').substring(0,3).toUpperCase() }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden md:table-cell px-5 py-3.5">
                    <div class="text-gray-700">{{ roleLabel(m.role) }}</div>
                    <div class="text-[11px] text-muted">{{ m.department || 'General' }}</div>
                  </td>
                  <td class="hidden lg:table-cell px-5 py-3.5 text-muted">{{ m.createdAt | date:'yyyy-MM-dd' }}</td>
                  <td class="px-5 py-3.5">
                    <span class="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                          [class]="m.role === 'ADMIN' ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' :
                                   'border border-emerald-200 bg-emerald-50 text-emerald-700'">
                      ACTIVE
                    </span>
                  </td>
                  <td class="hidden sm:table-cell px-5 py-3.5">
                    <div class="flex items-center gap-2">
                      @if (m.email) {
                        <a [href]="'mailto:' + m.email" class="rounded-md p-1 text-muted hover:text-primary hover:bg-primary/5 transition">
                          <lucide-icon [img]="MailIcon" [size]="16"></lucide-icon>
                        </a>
                      }
                      @if (m.phone) {
                        <a [href]="'tel:' + m.phone" class="rounded-md p-1 text-muted hover:text-primary hover:bg-primary/5 transition">
                          <lucide-icon [img]="PhoneIcon" [size]="16"></lucide-icon>
                        </a>
                      }
                    </div>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    @if (m.role !== 'ADMIN') {
                      <div class="relative inline-block">
                        <button (click)="toggleMenu(m.id)" class="rounded-md p-1.5 text-muted hover:bg-surface hover:text-gray-700 transition">
                          <lucide-icon [img]="MoreVertIcon" [size]="16"></lucide-icon>
                        </button>
                        @if (openMenuId() === m.id) {
                          <div class="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-border bg-white py-1 shadow-dropdown">
                            <button (click)="changeRoleTo(m.id, 'RECRUITER')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-surface transition">Set Recruiter</button>
                            <button (click)="changeRoleTo(m.id, 'VIEWER')" class="w-full text-left px-3 py-1.5 text-xs hover:bg-surface transition">Set Viewer</button>
                            <button (click)="remove(m.id)" class="w-full text-left px-3 py-1.5 text-xs text-error hover:bg-error/5 transition">Remove</button>
                          </div>
                        }
                      </div>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-5 py-16 text-center text-muted">{{ i18n.t('team.no_members') }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Invite Modal -->
      @if (showInvite()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" (click)="showInvite.set(false)"></div>
          <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-modal">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-heading font-semibold text-gray-900">{{ i18n.t('team.invite_member') }}</h3>
              <button (click)="showInvite.set(false)" class="rounded-lg p-1 text-muted hover:text-gray-700 transition">
                <lucide-icon [img]="XIcon" [size]="20"></lucide-icon>
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('auth.email') }} *</label>
                <input type="email" [(ngModel)]="inviteEmail"
                  class="h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary">
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('auth.phone') }}</label>
                <input type="tel" [(ngModel)]="invitePhone" placeholder="+998..."
                  class="h-10 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary">
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-muted">{{ i18n.t('team.role') }}</label>
                <select [(ngModel)]="inviteRole"
                  class="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary">
                  <option value="RECRUITER">Recruiter</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button (click)="showInvite.set(false)"
                  class="h-10 rounded-xl border border-border px-4 text-sm font-medium hover:bg-surface transition">Cancel</button>
                <button (click)="invite()" [disabled]="!inviteEmail"
                  class="h-10 rounded-xl bg-primary px-6 text-sm font-semibold text-white disabled:opacity-40 hover:bg-primary-600 transition">
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TeamComponent implements OnInit {
  UserPlusIcon = UserPlus;
  MailIcon = Mail;
  PhoneIcon = Phone;
  MoreVertIcon = MoreVertical;
  XIcon = X;

  members = signal<any[]>([]);
  filtered = signal<any[]>([]);
  showInvite = signal(false);
  openMenuId = signal<string | null>(null);
  inviteEmail = '';
  invitePhone = '';
  inviteRole = 'RECRUITER';
  searchQuery = '';
  statusFilterVal = '';

  constructor(private http: HttpClient, public i18n: I18nService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${environment.apiUrl}/managers`).subscribe({
      next: (r: any) => { this.members.set(r || []); this.filter(); },
      error: () => {}
    });
  }

  filter() {
    let list = this.members();
    const q = this.searchQuery.trim().toLowerCase();
    if (q) list = list.filter(m => (m.email || '').toLowerCase().includes(q) || (m.phone || '').includes(q));
    this.filtered.set(list);
  }

  toggleMenu(id: string) { this.openMenuId.set(this.openMenuId() === id ? null : id); }

  invite() {
    this.http.post<any>(`${environment.apiUrl}/managers`, {
      email: this.inviteEmail, phone: this.invitePhone, role: this.inviteRole
    }).subscribe({
      next: () => { this.showInvite.set(false); this.inviteEmail = ''; this.invitePhone = ''; this.load(); },
      error: () => {}
    });
  }

  changeRoleTo(id: string, role: string) {
    this.openMenuId.set(null);
    this.http.patch<any>(`${environment.apiUrl}/managers/${id}/role`, { role }).subscribe({ next: () => this.load() });
  }

  changeRole(id: string, event: Event) {
    this.changeRoleTo(id, (event.target as HTMLSelectElement).value);
  }

  remove(id: string) {
    this.openMenuId.set(null);
    this.http.delete(`${environment.apiUrl}/managers/${id}`).subscribe({ next: () => this.load() });
  }

  roleLabel(r: string): string {
    return ({ ADMIN: 'HR Director', RECRUITER: 'Recruiter', VIEWER: 'Viewer' } as Record<string, string>)[r] || r;
  }
}
