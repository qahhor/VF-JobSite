import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Lang } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggle()"
        (keydown)="onTriggerKey($event)"
        class="inline-flex h-10 items-center gap-2 rounded-xl border border-transparent px-3 text-sm transition hover:border-gray-200 hover:bg-gray-50"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        aria-label="Select language">
        <span class="inline-flex min-w-8 justify-center rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
          {{ currentFlag() }}
        </span>
        <span class="hidden text-gray-600 xl:inline">{{ currentName() }}</span>
        <svg class="h-3.5 w-3.5 text-gray-400 transition" [class.rotate-180]="open()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      @if (open()) {
        <div
          class="absolute right-0 top-full z-50 mt-1 min-w-[190px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
          aria-label="Languages">
          @for (lang of i18n.languages; track lang.code; let idx = $index) {
            <button
              (click)="selectLang(lang.code)"
              (keydown)="onOptionKey($event, idx)"
              role="option"
              [attr.aria-selected]="lang.code === i18n.lang()"
              [id]="'lang-option-' + idx"
              class="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-gray-50"
              [class]="lang.code === i18n.lang() ? 'bg-black/[0.03] font-medium text-black' : 'text-gray-700'">
              <span class="inline-flex min-w-8 justify-center rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                {{ lang.flag }}
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

  constructor(
    public i18n: I18nService,
    private elRef: ElementRef
  ) {}

  get currentFlag() {
    return () => this.i18n.languages.find(l => l.code === this.i18n.lang())?.flag || 'UZ';
  }

  get currentName() {
    return () => this.i18n.languages.find(l => l.code === this.i18n.lang())?.nativeName || '';
  }

  toggle() {
    this.open.set(!this.open());
  }

  selectLang(code: Lang) {
    this.i18n.setLang(code);
    this.open.set(false);
    location.reload();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.open() && !this.elRef.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open()) {
      this.open.set(false);
    }
  }

  onTriggerKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open.set(true);
      setTimeout(() => {
        const first = this.elRef.nativeElement.querySelector('[role="option"]');
        first?.focus();
      });
    }
  }

  onOptionKey(event: KeyboardEvent, index: number) {
    const options = this.elRef.nativeElement.querySelectorAll('[role="option"]');
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = options[index + 1] || options[0];
      next?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = options[index - 1] || options[options.length - 1];
      prev?.focus();
    } else if (event.key === 'Escape') {
      this.open.set(false);
    }
  }
}
