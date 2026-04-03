import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Lang } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="open.set(!open())"
        class="h-10 inline-flex items-center gap-2 rounded-xl border border-transparent px-3 text-sm transition hover:border-gray-200 hover:bg-gray-50"
        aria-label="Select language"
        aria-haspopup="listbox">
        <span class="inline-flex min-w-8 justify-center rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
          {{ currentCode() }}
        </span>
        <span class="hidden xl:inline text-gray-600">{{ currentName() }}</span>
        <svg class="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      @if (open()) {
        <div class="absolute right-0 top-full z-50 mt-1 min-w-[190px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg" role="listbox">
          @for (lang of i18n.languages; track lang.code) {
            <button
              (click)="selectLang(lang.code)"
              role="option"
              [attr.aria-selected]="lang.code === i18n.lang()"
              class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-gray-50"
              [class]="lang.code === i18n.lang() ? 'bg-black/[0.03] font-medium text-black' : 'text-gray-700'">
              <span class="inline-flex min-w-8 justify-center rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                {{ lang.code.replace('_', '-') }}
              </span>
              <span>{{ lang.nativeName }}</span>
              @if (lang.code === i18n.lang()) {
                <svg class="ml-auto h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              }
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

  get currentCode() {
    return () => this.i18n.lang().replace('_', '-');
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
