import { Injectable, computed, signal } from '@angular/core';
import { WEB_ADMIN_TRANSLATIONS } from './web-translations.admin';
import { WEB_EMPLOYER_TRANSLATIONS } from './web-translations.employer';
import { WEB_PUBLIC_TRANSLATIONS } from './web-translations.public';
import { WEB_SHARED_TRANSLATIONS } from './web-translations.shared';
import { LANGUAGES, Lang, LangOption, buildTranslations } from './web-translations.util';

const TRANSLATIONS = buildTranslations(
  WEB_SHARED_TRANSLATIONS,
  WEB_EMPLOYER_TRANSLATIONS,
  WEB_PUBLIC_TRANSLATIONS,
  WEB_ADMIN_TRANSLATIONS
);

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLang = signal<Lang>(this.loadLang());

  lang = this.currentLang.asReadonly();
  dir = computed(() => 'ltr');

  static readonly LANGUAGES: LangOption[] = LANGUAGES;

  constructor() {
    this.applyDocumentLang(this.currentLang());
  }

  get languages() {
    return I18nService.LANGUAGES;
  }

  setLang(lang: Lang) {
    this.currentLang.set(lang);
    localStorage.setItem('vjw_lang', lang);
    this.applyDocumentLang(lang);
  }

  t(key: string): string {
    const lang = this.currentLang();
    return TRANSLATIONS[lang][key] || TRANSLATIONS.uz_lat[key] || TRANSLATIONS.ru[key] || key;
  }

  private loadLang(): Lang {
    const saved = localStorage.getItem('vjw_lang') as Lang | null;
    if (saved && I18nService.LANGUAGES.some(language => language.code === saved)) {
      return saved;
    }

    const nav = navigator.language?.toLowerCase() || '';
    if (nav.startsWith('ru')) return 'ru';
    if (nav.startsWith('en')) return 'en';
    if (nav.startsWith('kk')) return 'kk';
    if (nav.startsWith('tg')) return 'tg';
    if (nav.startsWith('ky')) return 'ky';
    return 'uz_lat';
  }

  private applyDocumentLang(lang: Lang) {
    document.documentElement.lang = lang.replace('_', '-');
  }
}

export type { Lang, LangOption } from './web-translations.util';
