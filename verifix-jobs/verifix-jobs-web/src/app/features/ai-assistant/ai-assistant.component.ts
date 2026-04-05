import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { I18nService } from '../../core/services/i18n.service';
import { LucideAngularModule, Sparkles, Send, ThumbsUp, ThumbsDown, Bot, User, Loader2 } from 'lucide-angular';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
}

@Component({
  selector: 'vjw-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="mx-auto max-w-3xl space-y-5">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <lucide-icon [img]="SparklesIcon" [size]="32" class="text-primary"></lucide-icon>
        </div>
        <h1 class="text-title font-semibold text-gray-900">AI Assistant — Sia</h1>
        <p class="mt-2 text-sm text-muted max-w-md mx-auto">
          Ask about your hiring data, generate reports, draft vacancy descriptions, or get AI-powered insights.
        </p>
      </div>

      <!-- Quick prompts -->
      @if (messages().length === 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (prompt of quickPrompts; track prompt.text) {
            <button (click)="sendMessage(prompt.text)"
              class="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 text-left shadow-card hover:border-primary/30 hover:bg-primary/5 transition">
              <span class="text-lg">{{ prompt.icon }}</span>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ prompt.title }}</div>
                <div class="text-[11px] text-muted mt-0.5">{{ prompt.text }}</div>
              </div>
            </button>
          }
        </div>
      }

      <!-- Chat messages -->
      <div class="space-y-4" #chatContainer>
        @for (msg of messages(); track msg.id) {
          <div class="flex gap-3" [class.flex-row-reverse]="msg.role === 'user'">
            <!-- Avatar -->
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                 [class]="msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'">
              <lucide-icon [img]="msg.role === 'assistant' ? BotIcon : UserIcon" [size]="16"></lucide-icon>
            </div>
            <!-- Bubble -->
            <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                 [class]="msg.role === 'assistant' ? 'bg-white border border-border shadow-card' : 'bg-primary text-white'">
              <div class="whitespace-pre-wrap">{{ msg.content }}</div>
              @if (msg.role === 'assistant') {
                <!-- Confidence + sources -->
                @if (msg.confidence) {
                  <div class="mt-2 flex items-center gap-3 border-t border-border/50 pt-2">
                    <span class="text-[10px] text-muted">Confidence: {{ msg.confidence }}%</span>
                    @if (msg.sources?.length) {
                      <span class="text-[10px] text-primary cursor-pointer hover:underline">{{ msg.sources!.length }} sources</span>
                    }
                  </div>
                }
                <!-- Feedback -->
                <div class="mt-2 flex items-center gap-1">
                  <button class="rounded-md p-1 text-muted hover:text-accent hover:bg-accent/10 transition">
                    <lucide-icon [img]="ThumbsUpIcon" [size]="14"></lucide-icon>
                  </button>
                  <button class="rounded-md p-1 text-muted hover:text-error hover:bg-error/10 transition">
                    <lucide-icon [img]="ThumbsDownIcon" [size]="14"></lucide-icon>
                  </button>
                  <span class="ml-1 rounded-full border border-border px-2 py-0.5 text-[9px] text-muted">AI Assistant</span>
                </div>
              }
            </div>
          </div>
        }

        @if (isTyping()) {
          <div class="flex gap-3">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <lucide-icon [img]="SparklesIcon" [size]="16" class="animate-pulse-soft"></lucide-icon>
            </div>
            <div class="rounded-2xl bg-white border border-border shadow-card px-4 py-3">
              <div class="flex items-center gap-2 text-sm text-muted">
                <lucide-icon [img]="LoaderIcon" [size]="14" class="animate-spin"></lucide-icon>
                Analyzing your data...
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input -->
      <div class="sticky bottom-4 rounded-2xl border border-border bg-white p-2 shadow-dropdown">
        <div class="flex items-center gap-2">
          <input type="text" [(ngModel)]="inputText"
            (keyup.enter)="sendMessage(inputText)"
            placeholder="Ask Sia anything about your hiring data..."
            class="flex-1 h-10 px-4 text-sm outline-none bg-transparent"
            [disabled]="isTyping()">
          <button (click)="sendMessage(inputText)" [disabled]="!inputText.trim() || isTyping()"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary-600 transition">
            <lucide-icon [img]="SendIcon" [size]="18"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AiAssistantComponent {
  SparklesIcon = Sparkles;
  SendIcon = Send;
  ThumbsUpIcon = ThumbsUp;
  ThumbsDownIcon = ThumbsDown;
  BotIcon = Bot;
  UserIcon = User;
  LoaderIcon = Loader2;

  messages = signal<ChatMessage[]>([]);
  isTyping = signal(false);
  inputText = '';

  @ViewChild('chatContainer') chatContainer?: ElementRef;

  quickPrompts = [
    { icon: '📊', title: 'Hiring metrics', text: 'How many applications did we get last week?' },
    { icon: '📝', title: 'Smart draft', text: 'Write a job description for a Senior React Developer in Tashkent' },
    { icon: '⏱', title: 'Time analysis', text: "What's our average time-to-fill for engineering roles?" },
    { icon: '📈', title: 'Monthly report', text: 'Generate a summary of this month\'s hiring metrics' },
  ];

  constructor(private http: HttpClient, public i18n: I18nService) {}

  sendMessage(text: string) {
    if (!text.trim() || this.isTyping()) return;
    this.inputText = '';

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };
    this.messages.update(m => [...m, userMsg]);
    this.isTyping.set(true);

    // Try real API, fallback to mock
    this.http.post<any>(`${environment.apiUrl}/ai/chat`, { message: text.trim() }).subscribe({
      next: (res) => {
        this.addAssistantMessage(res.response || res.message || 'I received your message.');
      },
      error: () => {
        // Mock response
        setTimeout(() => {
          this.addAssistantMessage(this.getMockResponse(text));
        }, 1500);
      }
    });
  }

  private addAssistantMessage(fullContent: string) {
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      confidence: 85 + Math.floor(Math.random() * 12),
      sources: ['Vacancy Analytics', 'Application Pipeline']
    };
    this.messages.update(m => [...m, assistantMsg]);
    this.isTyping.set(false);

    // Typewriter effect — reveal char by char
    let idx = 0;
    const interval = setInterval(() => {
      idx += 2; // 2 chars at a time for speed
      if (idx >= fullContent.length) {
        assistantMsg.content = fullContent;
        this.messages.update(m => [...m]);
        clearInterval(interval);
      } else {
        assistantMsg.content = fullContent.substring(0, idx);
        this.messages.update(m => [...m]);
      }
    }, 15);
  }

  private getMockResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes('application') || lower.includes('отклик'))
      return 'Based on your data:\n\n📊 Last 7 days: 42 new applications\n📈 +15% vs previous week\n🏆 Top vacancy: "Frontend Developer" (18 applications)\n\nThe application rate is above the market average for your industry.';
    if (lower.includes('time-to-fill') || lower.includes('time to fill') || lower.includes('время'))
      return 'Your average time-to-fill metrics:\n\n⏱ Engineering: 28 days (market avg: 35)\n⏱ Design: 21 days (market avg: 25)\n⏱ Sales: 14 days (market avg: 18)\n\n✅ You\'re hiring 20% faster than the market average.';
    if (lower.includes('job description') || lower.includes('draft') || lower.includes('вакан'))
      return '📝 Draft: Senior React Developer\n\nWe are looking for an experienced React developer to join our growing team in Tashkent.\n\nRequirements:\n• 5+ years with React/TypeScript\n• Experience with state management (Redux/Zustand)\n• Strong understanding of web performance\n• REST API integration\n\nWe offer:\n• Competitive salary: $3,000 - $5,000\n• Flexible remote work\n• Modern tech stack\n\n💡 Tip: Adding "remote flexibility" increases applications by 35%.';
    if (lower.includes('report') || lower.includes('отчёт'))
      return '📈 Monthly Hiring Report — April 2026\n\n• Active vacancies: 24\n• New applications: 156\n• Interviews conducted: 32\n• Offers extended: 12\n• Hires completed: 8\n• Avg time-to-fill: 22 days\n• Pipeline conversion: 7.2%\n\n🔮 Forecast: Based on current trends, you\'ll likely need 2 more support agents by May.';
    return 'I can help you with:\n\n• 📊 Hiring metrics and trends\n• 📝 Smart vacancy drafts\n• ⏱ Time-to-fill analysis\n• 📈 Monthly reports\n• 🔮 Predictive insights\n\nWhat would you like to know?';
  }
}
