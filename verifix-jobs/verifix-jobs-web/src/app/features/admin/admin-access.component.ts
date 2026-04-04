import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminApiService,
  AdminProfile,
  AdminUserRow,
  TotpSetupResponse,
} from '../../core/services/admin-api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';

interface IssuedAdminCredential {
  email: string;
  password: string;
  action: 'invite' | 'reset';
  emailSent: boolean;
}

@Component({
  selector: 'vjw-admin-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="text-sm uppercase tracking-[0.24em] text-cyan-300">{{ i18n.t('admin.access') }}</div>
            <h1 class="mt-3 text-3xl font-semibold">{{ i18n.t('admin.access_title') }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{{ i18n.t('admin.access_subtitle') }}</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.my_role') }}</div>
              <div class="mt-2 text-xl font-semibold">{{ roleLabel(profile()?.role) }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.2fa.title') }}</div>
              <div class="mt-2 text-xl font-semibold">{{ profile()?.totpEnabled ? i18n.t('admin.2fa.enabled') : i18n.t('admin.2fa.disabled') }}</div>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.active_admins') }}</div>
              <div class="mt-2 text-xl font-semibold">{{ mustChangePassword() ? '-' : admins().length }}</div>
            </div>
          </div>
        </div>
      </section>

      @if (mustChangePassword()) {
        <section class="rounded-[28px] border border-amber-200 bg-amber-50 p-6">
          <div class="text-sm uppercase tracking-[0.24em] text-amber-700">{{ i18n.t('admin.password_change_required') }}</div>
          <h2 class="mt-3 text-2xl font-semibold text-amber-950">{{ i18n.t('admin.complete_security_step') }}</h2>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-amber-900/80">{{ i18n.t('admin.password_change_required_hint') }}</p>
        </section>
      }

      <div class="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section class="space-y-6">
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-semibold">{{ i18n.t('admin.profile_security') }}</h2>
            <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.profile_security_hint') }}</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.email') }}</div>
                <div class="mt-2 text-sm font-medium">{{ profile()?.email || 'admin@verifix.uz' }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.created_at') }}</div>
                <div class="mt-2 text-sm font-medium">{{ profile()?.createdAt ? (profile()?.createdAt | date:'dd.MM.yyyy HH:mm') : '-' }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.last_login') }}</div>
                <div class="mt-2 text-sm font-medium">{{ profile()?.lastLoginAt ? (profile()?.lastLoginAt | date:'dd.MM.yyyy HH:mm') : '-' }}</div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.last_password_change') }}</div>
                <div class="mt-2 text-sm font-medium">{{ profile()?.passwordChangedAt ? (profile()?.passwordChangedAt | date:'dd.MM.yyyy HH:mm') : '-' }}</div>
              </div>
            </div>
          </div>

          @if (!mustChangePassword()) {
            <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 class="text-xl font-semibold">{{ i18n.t('admin.2fa.title') }}</h2>
                  <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.2fa.hint') }}</p>
                </div>
                <button
                  (click)="setupTwoFactor()"
                  [disabled]="settingUpTwoFactor()"
                  class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {{ settingUpTwoFactor() ? i18n.t('admin.2fa.setting_up') : i18n.t('admin.2fa.setup') }}
                </button>
              </div>
              @if (twoFactorSetup()) {
                <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="text-sm font-semibold text-slate-900">{{ i18n.t('admin.2fa.secret') }}</div>
                  <div class="mt-2 break-all rounded-xl bg-white px-3 py-3 font-mono text-sm border border-slate-200">{{ twoFactorSetup()?.secret }}</div>
                  <div class="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      (click)="copyValue(twoFactorSetup()?.secret || '')"
                      class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                      {{ i18n.t('admin.copy_secret') }}
                    </button>
                    <a
                      class="rounded-2xl bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                      [href]="twoFactorSetup()?.otpAuthUri"
                      target="_blank"
                      rel="noopener">
                      {{ i18n.t('admin.2fa.open_authenticator') }}
                    </a>
                  </div>
                </div>
              }
            </div>
          }

          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-xl font-semibold">{{ i18n.t('admin.change_password') }}</h2>
            <p class="mt-2 text-sm text-slate-500">
              {{ mustChangePassword() ? i18n.t('admin.change_password_required_hint') : i18n.t('admin.change_password_hint') }}
            </p>

            <form (ngSubmit)="changePassword()" class="mt-5 space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.current_password') }}</span>
                  <input [(ngModel)]="passwordForm.currentPassword" name="currentPassword" type="password" autocomplete="current-password" class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950" required />
                </label>
                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.new_password') }}</span>
                  <input [(ngModel)]="passwordForm.newPassword" name="newPassword" type="password" autocomplete="new-password" class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950" required />
                </label>
              </div>
              <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="text-xs leading-5 text-slate-500">{{ i18n.t('admin.password_policy') }}</div>
                <button type="button" (click)="fillGeneratedNewPassword()" class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                  {{ i18n.t('admin.generate_password') }}
                </button>
              </div>
              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.confirm_password') }}</span>
                <input [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950" required />
              </label>
              @if (passwordError()) {
                <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ passwordError() }}</div>
              }
              <button type="submit" [disabled]="savingPassword()" class="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {{ savingPassword() ? i18n.t('admin.saving_password') : i18n.t('admin.save_password') }}
              </button>
            </form>
          </div>
        </section>

        <section class="space-y-6">
          @if (issuedCredential()) {
            <div class="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-xl font-semibold text-emerald-100">{{ i18n.t('admin.latest_access') }}</h2>
                <span class="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {{ issuedCredentialLabel() }}
                </span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" [class]="issuedCredential()?.emailSent ? 'border border-slate-200 bg-white text-slate-700' : 'border border-amber-200 bg-amber-100 text-amber-800'">
                  {{ issuedCredential()?.emailSent ? i18n.t('admin.email_sent') : i18n.t('admin.email_not_configured') }}
                </span>
              </div>
              <p class="mt-2 text-sm text-emerald-900/80">{{ i18n.t('admin.latest_access_hint') }}</p>
              <div class="mt-5 grid gap-4 sm:grid-cols-2">
                <div class="rounded-2xl border border-emerald-200 bg-white p-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.email') }}</div>
                  <div class="mt-2 break-all text-sm font-medium">{{ issuedCredential()?.email }}</div>
                  <button type="button" (click)="copyValue(issuedCredential()?.email || '')" class="mt-3 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                    {{ i18n.t('admin.copy_email') }}
                  </button>
                </div>
                <div class="rounded-2xl border border-emerald-200 bg-white p-4">
                  <div class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ i18n.t('admin.temporary_password') }}</div>
                  <div class="mt-2 break-all font-mono text-sm font-medium">{{ issuedCredential()?.password }}</div>
                  <button type="button" (click)="copyValue(issuedCredential()?.password || '')" class="mt-3 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100">
                    {{ i18n.t('admin.copy_password') }}
                  </button>
                </div>
              </div>
              <div class="mt-4 text-xs leading-5 text-emerald-900/80">
                {{ issuedCredential()?.emailSent ? i18n.t('admin.invite_sent_hint') : i18n.t('admin.latest_access_warning') }}
              </div>
            </div>
          }

          @if (!mustChangePassword()) {
            <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 class="text-xl font-semibold">{{ i18n.t('admin.team_access') }}</h2>
                  <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.team_access_hint') }}</p>
                </div>
                <div class="w-full sm:w-72">
                  <label class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('common.search') }}</label>
                  <input [(ngModel)]="adminSearch" (ngModelChange)="loadAdmins()" type="text" class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950" [placeholder]="i18n.t('admin.search_admins')" />
                </div>
              </div>

              <div class="mt-5 space-y-3">
                @for (admin of admins(); track admin.id) {
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div class="flex flex-wrap items-center gap-2">
                      <div class="text-sm font-semibold">{{ admin.email }}</div>
                      @if (admin.currentUser) {
                        <span class="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">{{ i18n.t('admin.current_session') }}</span>
                      }
                      @if (admin.totpEnabled) {
                        <span class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">{{ i18n.t('admin.2fa.badge') }}</span>
                      }
                      @if (admin.mustChangePassword) {
                        <span class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">{{ i18n.t('admin.password_rotation_required') }}</span>
                      }
                    </div>
                    <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{{ roleLabel(admin.role) }}</span>
                      <span>{{ admin.createdAt | date:'dd.MM.yyyy HH:mm' }}</span>
                      <span>{{ i18n.t('admin.last_login') }}: {{ admin.lastLoginAt ? (admin.lastLoginAt | date:'dd.MM.yyyy HH:mm') : '-' }}</span>
                    </div>
                    @if (admin.inviteSentAt) {
                      <div class="mt-2 text-xs text-slate-500">{{ i18n.t('admin.invite_sent_at') }}: {{ admin.inviteSentAt | date:'dd.MM.yyyy HH:mm' }}</div>
                    }
                    <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <select [(ngModel)]="roleDrafts[admin.id]" [ngModelOptions]="{ standalone: true }" [disabled]="!canManageAdmins() || admin.currentUser" class="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
                        @for (role of roleOptions; track role) {
                          <option [value]="role">{{ roleLabel(role) }}</option>
                        }
                      </select>
                      <button (click)="updateRole(admin)" [disabled]="!canManageAdmins() || admin.currentUser || roleDrafts[admin.id] === admin.role" class="rounded-2xl border border-slate-200 px-4 text-sm font-medium transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ i18n.t('admin.update_role') }}
                      </button>
                    </div>
                    <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                      <input [(ngModel)]="resetPasswords[admin.id]" [ngModelOptions]="{ standalone: true }" type="password" [disabled]="!canManageAdmins()" class="h-11 rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950 disabled:cursor-not-allowed disabled:opacity-50" [placeholder]="i18n.t('admin.temporary_password')" />
                      <button type="button" (click)="fillGeneratedResetPassword(admin.id)" [disabled]="!canManageAdmins()" class="rounded-2xl border border-slate-200 px-4 text-sm font-medium transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ i18n.t('admin.generate_password') }}
                      </button>
                      <button (click)="resetPassword(admin)" [disabled]="!canManageAdmins() || !resetPasswords[admin.id]" class="rounded-2xl border border-slate-200 px-4 text-sm font-medium transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ i18n.t('admin.reset_password') }}
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{{ i18n.t('admin.team_empty') }}</div>
                }
              </div>
            </div>

            <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 class="text-xl font-semibold">{{ i18n.t('admin.invite_moderator') }}</h2>
                  <p class="mt-2 text-sm text-slate-500">{{ i18n.t('admin.invite_moderator_hint') }}</p>
                </div>
                @if (!canManageAdmins()) {
                  <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">{{ i18n.t('admin.super_admin_only') }}</span>
                }
              </div>
              <form (ngSubmit)="inviteAdmin()" class="mt-5 space-y-4">
                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('admin.email') }}</span>
                  <input [(ngModel)]="inviteForm.email" name="adminEmail" type="email" class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950" [disabled]="!canManageAdmins()" required />
                </label>
                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">{{ i18n.t('common.role') }}</span>
                  <select [(ngModel)]="inviteForm.role" name="adminRole" class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-950" [disabled]="!canManageAdmins()">
                    @for (role of roleOptions; track role) {
                      <option [value]="role">{{ roleLabel(role) }}</option>
                    }
                  </select>
                </label>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">{{ i18n.t('admin.invite_email_fallback_hint') }}</div>
                <button type="submit" [disabled]="creatingAdmin() || !canManageAdmins()" class="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {{ creatingAdmin() ? i18n.t('admin.sending_invite') : i18n.t('admin.send_invite') }}
                </button>
              </form>
            </div>
          }
        </section>
      </div>
    </div>
  `,
})
export class AdminAccessComponent implements OnInit {
  profile = signal<AdminProfile | null>(null);
  admins = signal<AdminUserRow[]>([]);
  twoFactorSetup = signal<TotpSetupResponse | null>(null);
  issuedCredential = signal<IssuedAdminCredential | null>(null);
  passwordError = signal('');
  savingPassword = signal(false);
  creatingAdmin = signal(false);
  settingUpTwoFactor = signal(false);

  adminSearch = '';
  roleOptions = ['MODERATOR', 'ANALYST', 'SUPPORT', 'SUPER_ADMIN'];
  roleDrafts: Record<string, string> = {};
  resetPasswords: Record<string, string> = {};

  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  inviteForm = { email: '', role: 'MODERATOR' };

  readonly canManageAdmins = computed(() => this.profile()?.role === 'SUPER_ADMIN');
  readonly mustChangePassword = computed(() => this.profile()?.mustChangePassword ?? false);
  readonly issuedCredentialLabel = computed(() => {
    const credential = this.issuedCredential();
    if (!credential) return '';
    return credential.action === 'invite'
      ? this.i18n.t('admin.invite_ready_for')
      : this.i18n.t('admin.reset_ready_for');
  });

  constructor(
    private adminApi: AdminApiService,
    private toast: ToastService,
    public i18n: I18nService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.adminApi.getCurrentAdminProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.syncMustChangePassword(profile.mustChangePassword);
        if (profile.mustChangePassword) {
          this.admins.set([]);
          this.roleDrafts = {};
        } else {
          this.loadAdmins();
        }
      },
      error: () => this.toast.error(this.i18n.t('admin.profile_load_failed')),
    });
  }

  loadAdmins() {
    if (this.mustChangePassword()) return;

    this.adminApi.getAdminUsers(0, 50, this.adminSearch || undefined).subscribe({
      next: (response) => {
        const admins = response.content || [];
        this.admins.set(admins);
        this.roleDrafts = admins.reduce<Record<string, string>>((acc, admin) => {
          acc[admin.id] = admin.role;
          return acc;
        }, {});
      },
      error: () => this.toast.error(this.i18n.t('admin.admins_load_failed')),
    });
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError.set(this.i18n.t('admin.passwords_do_not_match'));
      return;
    }

    const wasRequired = this.mustChangePassword();
    this.passwordError.set('');
    this.savingPassword.set(true);
    this.adminApi.changeAdminPassword(this.passwordForm.currentPassword, this.passwordForm.newPassword).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.syncMustChangePassword(profile.mustChangePassword);
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.savingPassword.set(false);
        if (!profile.mustChangePassword) {
          this.loadAdmins();
        }
        this.toast.success(this.i18n.t(wasRequired ? 'admin.password_change_required_done' : 'admin.password_updated'));
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.passwordError.set(err?.error?.message || this.i18n.t('admin.password_update_failed'));
      },
    });
  }

  setupTwoFactor() {
    if (this.mustChangePassword()) {
      this.toast.error(this.i18n.t('admin.password_change_first'));
      return;
    }

    this.settingUpTwoFactor.set(true);
    this.adminApi.setupAdminTwoFactor().subscribe({
      next: (setup) => {
        this.twoFactorSetup.set(setup);
        this.settingUpTwoFactor.set(false);
        this.loadProfile();
        this.toast.success(this.i18n.t('admin.2fa.setup_done'));
      },
      error: () => {
        this.settingUpTwoFactor.set(false);
        this.toast.error(this.i18n.t('admin.2fa.setup_failed'));
      },
    });
  }

  inviteAdmin() {
    this.creatingAdmin.set(true);
    const payload = { ...this.inviteForm };
    this.adminApi.inviteAdminUser(payload).subscribe({
      next: (response) => {
        this.creatingAdmin.set(false);
        this.inviteForm = { email: '', role: 'MODERATOR' };
        this.rememberIssuedCredential(response.email, response.temporaryPassword, 'invite', response.emailSent);
        this.loadAdmins();
        if (response.emailSent) {
          this.toast.success(this.i18n.t('admin.invite_sent'));
        } else {
          this.toast.warning(this.i18n.t('admin.invite_created_manual_delivery'));
        }
      },
      error: (err) => {
        this.creatingAdmin.set(false);
        this.toast.error(err?.error?.message || this.i18n.t('admin.invite_failed'));
      },
    });
  }

  updateRole(admin: AdminUserRow) {
    const role = this.roleDrafts[admin.id];
    if (!role || role === admin.role) return;

    this.adminApi.updateAdminRole(admin.id, role).subscribe({
      next: () => {
        this.loadAdmins();
        this.toast.success(this.i18n.t('admin.role_updated'));
      },
      error: (err) => this.toast.error(err?.error?.message || this.i18n.t('admin.role_update_failed')),
    });
  }

  resetPassword(admin: AdminUserRow) {
    const password = this.resetPasswords[admin.id];
    if (!password) return;

    this.adminApi.resetAdminPassword(admin.id, password).subscribe({
      next: () => {
        this.rememberIssuedCredential(admin.email, password, 'reset', false);
        this.resetPasswords[admin.id] = '';
        this.loadAdmins();
        this.toast.success(this.i18n.t('admin.password_reset_done'));
      },
      error: (err) => this.toast.error(err?.error?.message || this.i18n.t('admin.password_reset_failed')),
    });
  }

  fillGeneratedNewPassword() {
    const password = this.generateStrongPassword();
    this.passwordForm.newPassword = password;
    this.passwordForm.confirmPassword = password;
    this.passwordError.set('');
    this.toast.success(this.i18n.t('admin.password_generated'));
  }

  fillGeneratedResetPassword(adminId: string) {
    this.resetPasswords[adminId] = this.generateStrongPassword();
    this.toast.success(this.i18n.t('admin.password_generated'));
  }

  async copyValue(text: string) {
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.toast.success(this.i18n.t('admin.copied'));
    } catch {
      this.toast.error(this.i18n.t('admin.copy_failed'));
    }
  }

  roleLabel(role?: string | null): string {
    if (!role) return '-';
    const key = `admin.role.${role.toLowerCase()}`;
    const translated = this.i18n.t(key);
    return translated === key ? role : translated;
  }

  private rememberIssuedCredential(email: string, password: string, action: 'invite' | 'reset', emailSent: boolean) {
    this.issuedCredential.set({ email, password, action, emailSent });
  }

  private syncMustChangePassword(value: boolean) {
    localStorage.setItem('vjw_admin_must_change_password', value ? 'true' : 'false');
  }

  private generateStrongPassword(): string {
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*?';
    const all = lower + upper + digits + symbols;

    const chars = [
      lower[Math.floor(Math.random() * lower.length)],
      upper[Math.floor(Math.random() * upper.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    while (chars.length < 14) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  }
}
