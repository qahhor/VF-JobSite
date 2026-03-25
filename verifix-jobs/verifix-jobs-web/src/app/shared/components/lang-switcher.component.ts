import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Lang } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button (click)="open.set(!open())" class="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition text-sm"
              aria-label="Tilni tanlash" aria-haspopup="listbox">
        <span>{{ currentFlag() }}</span>
        <span class="hidden sm:inline text-gray-600">{{ currentName() }}</span>
        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      @if (open()) {
        <div class="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]" role="listbox">
          @for (lang of i18n.languages; track lang.code) {
            <button (click)="selectLang(lang.code)" role="option" [attr.aria-selected]="lang.code === i18n.lang()"
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition"
                    [class]="lang.code === i18n.lang() ? 'bg-primary/5 text-black font-medium' : 'text-gray-700'">
              <span>{{ lang.flag }}</span>
              <span>{{ lang.nativeName }}</span>
              @if (lang.code === i18n.lang()) { <span class="ml-auto text-black text-xs">✓</span> }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LangSwitcherComponent {
  open = signal(false);

  constructor(public i18n: I18nService) {}

  get currentFlag() {
    return () => this.i18n.languages.find(l => l.code === this.i18n.lang())?.flag || '🌐';
  }

  get currentName() {
    return () => this.i18n.languages.find(l => l.code === this.i18n.lang())?.nativeName || '';
  }

  selectLang(code: Lang) {
    this.i18n.setLang(code);
    this.open.set(false);
    location.reload();
  }
}
