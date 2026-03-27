import { Component, OnInit, HostListener, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vjw-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Conversations list -->
      <div class="w-80 border-r border-gray-100 flex flex-col shrink-0" [class.hidden]="selectedCandidate() && isMobile" [class.sm:flex]="true">
        <div class="px-4 py-3 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">Xabarlar</h2>
          @if (unreadCount()) { <span class="text-xs text-red-500 ml-1">{{ unreadCount() }} yangi</span> }
        </div>
        <div class="flex-1 overflow-y-auto">
          @for (c of conversations(); track c.candidateId) {
            <button (click)="selectConversation(c.candidateId)"
                    class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left border-b border-gray-50"
                    [class.bg-gray-50]="selectedCandidate() === c.candidateId">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm font-bold shrink-0">
                {{ c.candidateName?.charAt(0) || '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800 truncate">{{ c.candidateName }}</div>
                <div class="text-xs text-gray-400 truncate">{{ c.lastMessage }}</div>
              </div>
            </button>
          } @empty {
            <div class="px-4 py-12 text-center text-gray-400 text-sm">Hali xabarlar yo'q</div>
          }
        </div>
      </div>

      <!-- Chat area -->
      <div class="flex-1 flex flex-col" [class.hidden]="!selectedCandidate() && isMobile">
        @if (selectedCandidate()) {
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <button (click)="selectedCandidate.set(null)" class="sm:hidden text-gray-400 mr-1">←</button>
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
              {{ selectedName()?.charAt(0) || '?' }}
            </div>
            <div class="text-sm font-semibold text-gray-800">{{ selectedName() }}</div>
          </div>

          <!-- Messages -->
          <div #chatScroll class="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
            @for (m of messages(); track m.id) {
              <div class="flex" [class.justify-end]="m.senderType === 'EMPLOYER'">
                <div class="max-w-[70%] px-4 py-2 rounded-2xl text-sm"
                     [class]="m.senderType === 'EMPLOYER' ? 'bg-black text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'">
                  {{ m.message }}
                  <div class="text-[10px] mt-1" [class]="m.senderType === 'EMPLOYER' ? 'text-gray-400' : 'text-gray-300'">
                    {{ m.createdAt | date:'HH:mm' }}
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Input -->
          <div class="px-4 py-3 border-t border-gray-100 flex gap-2">
            <input type="text" [(ngModel)]="newMessage" placeholder="Xabar yozing..."
                   class="flex-1 h-10 px-4 border border-gray-200 rounded-full text-sm focus:border-black outline-none"
                   (keyup.enter)="send()">
            <button (click)="send()" [disabled]="!newMessage.trim()"
                    class="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition disabled:opacity-30">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
        } @else {
          <div class="flex-1 flex items-center justify-center text-gray-400 text-sm">
            <div class="text-center">
              <div class="text-4xl mb-3">💬</div>
              <div>Suhbatni tanlang</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ChatComponent implements OnInit {
  @ViewChild('chatScroll') chatScroll!: ElementRef;

  conversations = signal<any[]>([]);
  messages = signal<any[]>([]);
  selectedCandidate = signal<string | null>(null);
  unreadCount = signal(0);
  newMessage = '';
  isMobile = window.innerWidth < 640;

  @HostListener('window:resize')
  onResize() { this.isMobile = window.innerWidth < 640; }

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadConversations(); }

  loadConversations() {
    this.http.get<any>(`${this.base}/chat/conversations`).subscribe({
      next: (d: any) => { this.conversations.set(d.conversations || []); this.unreadCount.set(d.unreadCount || 0); },
      error: () => {}
    });
  }

  selectConversation(candidateId: string) {
    this.selectedCandidate.set(candidateId);
    this.http.get<any>(`${this.base}/chat/messages/${candidateId}`).subscribe({
      next: (d: any) => {
        this.messages.set(d.messages || []);
        this.loadConversations();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {}
    });
  }

  private scrollToBottom() {
    try {
      if (this.chatScroll?.nativeElement) {
        this.chatScroll.nativeElement.scrollTop = 0; // flex-col-reverse: top = newest
      }
    } catch {}
  }

  selectedName(): string {
    return this.conversations().find(c => c.candidateId === this.selectedCandidate())?.candidateName || '';
  }

  send() {
    if (!this.newMessage.trim() || !this.selectedCandidate()) return;
    this.http.post<any>(`${this.base}/chat/send`, {
      candidateId: this.selectedCandidate(), message: this.newMessage.trim()
    }).subscribe({
      next: () => {
        this.newMessage = '';
        this.selectConversation(this.selectedCandidate()!);
      },
      error: () => {}
    });
  }
}
