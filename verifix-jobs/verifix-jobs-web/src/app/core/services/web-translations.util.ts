export type Lang = 'uz_lat' | 'uz_cyr' | 'ru' | 'en' | 'kk' | 'tg' | 'ky';

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
  { code: 'uz_cyr', name: 'Uzbek (Cyrillic)', nativeName: 'Узбекча', flag: 'UZ' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: 'KK' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', flag: 'TG' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', flag: 'KY' },
];

function transliterateUzbekToCyrillic(input: string): string {
  const digraphs: Array<[RegExp, string]> = [
    [/G‘/g, 'Ғ'], [/g‘/g, 'ғ'], [/G'/g, 'Ғ'], [/g'/g, 'ғ'],
    [/O‘/g, 'Ў'], [/o‘/g, 'ў'], [/O'/g, 'Ў'], [/o'/g, 'ў'],
    [/Sh/g, 'Ш'], [/sh/g, 'ш'], [/Ch/g, 'Ч'], [/ch/g, 'ч'],
    [/Ya/g, 'Я'], [/ya/g, 'я'], [/Yo/g, 'Ё'], [/yo/g, 'ё'],
    [/Yu/g, 'Ю'], [/yu/g, 'ю'],
  ];

  const chars: Record<string, string> = {
    A: 'А', a: 'а', B: 'Б', b: 'б', D: 'Д', d: 'д', E: 'Е', e: 'е',
    F: 'Ф', f: 'ф', G: 'Г', g: 'г', H: 'Ҳ', h: 'ҳ', I: 'И', i: 'и',
    J: 'Ж', j: 'ж', K: 'К', k: 'к', L: 'Л', l: 'л', M: 'М', m: 'м',
    N: 'Н', n: 'н', O: 'О', o: 'о', P: 'П', p: 'п', Q: 'Қ', q: 'қ',
    R: 'Р', r: 'р', S: 'С', s: 'с', T: 'Т', t: 'т', U: 'У', u: 'у',
    V: 'В', v: 'в', X: 'Х', x: 'х', Y: 'Й', y: 'й', Z: 'З', z: 'з',
  };

  let output = input;
  for (const [pattern, replacement] of digraphs) {
    output = output.replace(pattern, replacement);
  }

  return output
    .split('')
    .map(char => chars[char] ?? char)
    .join('');
}

export function buildTranslations(...catalogs: TranslationCatalog[]): Record<Lang, Record<string, string>> {
  const translations: Record<Lang, Record<string, string>> = {
    uz_lat: {},
    uz_cyr: {},
    ru: {},
    en: {},
    kk: {},
    tg: {},
    ky: {},
  };

  for (const catalog of catalogs) {
    for (const [key, row] of Object.entries(catalog)) {
      const uz = row.uz_lat ?? row.ru ?? row.en ?? key;
      const ru = row.ru ?? row.en ?? uz;
      const en = row.en ?? row.ru ?? uz;

      translations.uz_lat[key] = uz;
      translations.uz_cyr[key] = row.uz_cyr ?? transliterateUzbekToCyrillic(uz);
      translations.ru[key] = ru;
      translations.en[key] = en;
      translations.kk[key] = row.kk ?? ru;
      translations.tg[key] = row.tg ?? ru;
      translations.ky[key] = row.ky ?? ru;
    }
  }

  return translations;
}
