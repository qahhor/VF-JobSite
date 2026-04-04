export type Lang = 'uz_lat' | 'ru';

export interface LangOption {
  code: Lang;
  name: string;
  nativeName: string;
  flag: string;
}

export type TranslationRow = Partial<Record<Lang, string>>;
export type TranslationCatalog = Record<string, TranslationRow>;

export const LANGUAGES: LangOption[] = [
  { code: 'uz_lat', name: 'Uzbek (Latin)', nativeName: "O'zbekcha", flag: 'UZ' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
];

export function buildTranslations(...catalogs: TranslationCatalog[]): Record<Lang, Record<string, string>> {
  const translations: Record<Lang, Record<string, string>> = {
    uz_lat: {},
    ru: {},
  };

  for (const catalog of catalogs) {
    for (const [key, row] of Object.entries(catalog)) {
      const uz = row.uz_lat ?? row.ru ?? key;
      const ru = row.ru ?? uz;

      translations.uz_lat[key] = uz;
      translations.ru[key] = ru;
    }
  }

  return translations;
}
