import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Candidate, Vacancy } from '../../core/models';

@Component({
  selector: 'vjw-talent-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Talent Hub</h1>
        <p class="mt-1 text-sm text-gray-500">Reusable candidate pool across all employer vacancies.</p>
      </div>

      @if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ error() }}
        </div>
      }

      <div class="flex gap-2">
        <input
          type="text"
          [(ngModel)]="query"
          placeholder="Search candidates by category, city, or skill"
          class="h-11 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-black"
          (keyup.enter)="search()"
        />
        <button
          (click)="search()"
          class="h-11 rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Search
        </button>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          (click)="setActiveList('all')"
          class="h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition"
          [class]="activeList() === 'all' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'"
        >
          All ({{ candidates().length }})
        </button>
        <button
          (click)="setActiveList('shortlisted')"
          class="h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition"
          [class]="activeList() === 'shortlisted' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'"
        >
          Shortlist ({{ shortlisted().length }})
        </button>
        <button
          (click)="setActiveList('hired')"
          class="h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition"
          [class]="activeList() === 'hired' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600'"
        >
          Hired ({{ hired().length }})
        </button>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @if (loading()) {
          <div class="col-span-full rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400">
            Loading candidates...
          </div>
        } @else {
          @for (candidate of filteredCandidates(); track candidate.id) {
            <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div class="mb-3 flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                  {{ initials(candidate) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-gray-800">{{ fullName(candidate) }}</div>
                  <div class="truncate text-xs text-gray-400">{{ candidate.city || 'City not set' }}<span *ngIf="candidate.phone"> | {{ candidate.phone }}</span></div>
                </div>
                @if (candidate.matchScore) {
                  <div
                    class="text-sm font-bold"
                    [class]="candidate.matchScore >= 70 ? 'text-green-600' : candidate.matchScore >= 40 ? 'text-yellow-600' : 'text-gray-400'"
                  >
                    {{ candidate.matchScore }}%
                  </div>
                }
              </div>

              <div class="mb-3 flex flex-wrap gap-1">
                @if (candidate.myidStatus === 'VERIFIED') {
                  <span class="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">MyID</span>
                }
                @for (skill of (candidate.skills || []).slice(0, 3); track skill) {
                  <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{{ skill }}</span>
                }
              </div>

              <div class="flex gap-2 border-t border-gray-100 pt-3">
                <button
                  (click)="toggleShortlist(candidate)"
                  class="h-8 flex-1 rounded-lg border text-xs font-medium transition"
                  [disabled]="busy()"
                  [class]="isShortlisted(candidate.id) ? 'border-yellow-200 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
                >
                  {{ isShortlisted(candidate.id) ? 'In shortlist' : 'Add to shortlist' }}
                </button>
                <button
                  (click)="openInvite(candidate)"
                  class="h-8 flex-1 rounded-lg bg-black text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  [disabled]="!vacancies().length"
                >
                  Invite
                </button>
              </div>
            </div>
          } @empty {
            <div class="col-span-full rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
              {{ emptyStateMessage() }}
            </div>
          }
        }
      </div>
    </div>

    @if (inviteTarget(); as candidate) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-5">
            <h2 class="text-lg font-semibold text-gray-800">Invite candidate</h2>
            <p class="mt-1 text-sm text-gray-500">{{ fullName(candidate) }}</p>
          </div>

          @if (inviteError()) {
            <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ inviteError() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Vacancy</label>
              <select
                [(ngModel)]="inviteVacancyId"
                class="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-black"
              >
                <option value="">Select vacancy</option>
                @for (vacancy of vacancies(); track vacancy.id) {
                  <option [value]="vacancy.id">{{ vacancy.title }}</option>
                }
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700">Recruiter note</label>
              <textarea
                [(ngModel)]="inviteNote"
                rows="4"
                class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Optional context for the candidate"
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button
              (click)="closeInvite()"
              class="h-10 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              (click)="submitInvite()"
              class="h-10 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              [disabled]="inviteBusy()"
            >
              {{ inviteBusy() ? 'Sending...' : 'Send invite' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`
  ]
})
export class TalentHubComponent implements OnInit {
  candidates = signal<Candidate[]>([]);
  shortlisted = signal<Candidate[]>([]);
  hired = signal<Candidate[]>([]);
  vacancies = signal<Vacancy[]>([]);
  activeList = signal<'all' | 'shortlisted' | 'hired'>('all');
  searched = signal(false);
  loading = signal(false);
  busy = signal(false);
  error = signal('');

  inviteTarget = signal<Candidate | null>(null);
  inviteBusy = signal(false);
  inviteError = signal('');

  query = '';
  inviteVacancyId = '';
  inviteNote = '';
  private shortlistListId: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadVacancies();
    this.ensureShortlist();
    this.loadHired();
  }

  setActiveList(list: 'all' | 'shortlisted' | 'hired') {
    this.activeList.set(list);
    this.error.set('');
    if (list === 'shortlisted' && this.shortlistListId) {
      this.loadShortlisted();
    }
    if (list === 'hired') {
      this.loadHired();
    }
  }

  search() {
    const query = this.query.trim();
    if (!query) {
      this.searched.set(false);
      this.candidates.set([]);
      this.activeList.set('all');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.activeList.set('all');
    this.searched.set(true);

    this.api.searchCandidates(query).subscribe({
      next: (response) => {
        this.candidates.set(response.content || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.extractMessage(err, 'Candidate search failed.'));
      }
    });
  }

  filteredCandidates(): Candidate[] {
    if (this.activeList() === 'shortlisted') {
      return this.shortlisted();
    }
    if (this.activeList() === 'hired') {
      return this.hired();
    }
    return this.candidates();
  }

  isShortlisted(candidateId: string): boolean {
    return this.shortlisted().some(candidate => candidate.id === candidateId);
  }

  toggleShortlist(candidate: Candidate) {
    if (!this.shortlistListId) {
      this.error.set('Shortlist is not ready yet. Try again in a moment.');
      return;
    }

    this.busy.set(true);
    this.error.set('');

    const request = this.isShortlisted(candidate.id)
      ? this.api.removeTalentListCandidate(this.shortlistListId, candidate.id)
      : this.api.addTalentListCandidate(this.shortlistListId, candidate.id);

    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.loadShortlisted();
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(this.extractMessage(err, 'Shortlist update failed.'));
      }
    });
  }

  openInvite(candidate: Candidate) {
    this.inviteTarget.set(candidate);
    this.inviteError.set('');
    this.inviteNote = '';
    this.inviteVacancyId = this.vacancies()[0]?.id ?? '';
  }

  closeInvite() {
    this.inviteTarget.set(null);
    this.inviteBusy.set(false);
    this.inviteError.set('');
    this.inviteVacancyId = '';
    this.inviteNote = '';
  }

  submitInvite() {
    const candidate = this.inviteTarget();
    if (!candidate) {
      return;
    }
    if (!this.inviteVacancyId) {
      this.inviteError.set('Select a vacancy first.');
      return;
    }

    this.inviteBusy.set(true);
    this.inviteError.set('');

    this.api.inviteCandidate(this.inviteVacancyId, candidate.id, this.inviteNote.trim() || undefined).subscribe({
      next: () => this.closeInvite(),
      error: (err) => {
        this.inviteBusy.set(false);
        this.inviteError.set(this.extractMessage(err, 'Invite could not be sent.'));
      }
    });
  }

  emptyStateMessage(): string {
    if (this.activeList() === 'shortlisted') {
      return 'Shortlist is empty.';
    }
    if (this.activeList() === 'hired') {
      return 'No hired candidates yet.';
    }
    return this.searched() ? 'No candidates matched this query.' : 'Enter a search query to start.';
  }

  fullName(candidate: Candidate): string {
    return [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Candidate';
  }

  initials(candidate: Candidate): string {
    const name = this.fullName(candidate);
    return name.charAt(0).toUpperCase() || '?';
  }

  private ensureShortlist() {
    this.api.createTalentList('Shortlist', 'Reusable candidates').subscribe({
      next: (list) => {
        this.shortlistListId = list.id;
        this.loadShortlisted();
      },
      error: (err) => {
        this.error.set(this.extractMessage(err, 'Shortlist could not be initialized.'));
      }
    });
  }

  private loadShortlisted() {
    if (!this.shortlistListId) {
      return;
    }
    this.api.getTalentListCandidates(this.shortlistListId).subscribe({
      next: (candidates) => this.shortlisted.set(candidates || []),
      error: (err) => {
        this.error.set(this.extractMessage(err, 'Shortlist could not be loaded.'));
      }
    });
  }

  private loadHired() {
    this.api.getTalentHubHired().subscribe({
      next: (candidates) => this.hired.set(candidates || []),
      error: (err) => {
        this.error.set(this.extractMessage(err, 'Hired candidates could not be loaded.'));
      }
    });
  }

  private loadVacancies() {
    this.api.getVacancies(0, 100, 'ACTIVE').subscribe({
      next: (response) => this.vacancies.set(response.content || []),
      error: (err) => {
        this.error.set(this.extractMessage(err, 'Active vacancies could not be loaded.'));
      }
    });
  }

  private extractMessage(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.error || fallback;
  }
}
