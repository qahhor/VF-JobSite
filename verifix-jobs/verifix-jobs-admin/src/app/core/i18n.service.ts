import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'uz_lat' | 'uz_cyr' | 'ru' | 'en' | 'kk' | 'tg' | 'ky';

const TRANSLATIONS: Record<string, Record<Lang, string>> = {
  'admin.brand': { uz_lat: 'Verifix Admin', uz_cyr: 'Верификс Админ', ru: 'Verifix Admin', en: 'Verifix Admin', kk: 'Verifix Admin', tg: 'Verifix Admin', ky: 'Verifix Admin' },
  'admin.panel': { uz_lat: 'Admin panel', uz_cyr: 'Админ панел', ru: 'Админ-панель', en: 'Admin panel', kk: 'Админ панелі', tg: 'Панели админ', ky: 'Админ панели' },
  'admin.dashboard': { uz_lat: 'Dashboard', uz_cyr: 'Дашборд', ru: 'Панель', en: 'Dashboard', kk: 'Панель', tg: 'Панел', ky: 'Панель' },
  'admin.moderation': { uz_lat: 'Moderatsiya', uz_cyr: 'Модерация', ru: 'Модерация', en: 'Moderation', kk: 'Модерация', tg: 'Модератсия', ky: 'Модерация' },
  'admin.users': { uz_lat: 'Foydalanuvchilar', uz_cyr: 'Фойдаланувчилар', ru: 'Пользователи', en: 'Users', kk: 'Пайдаланушылар', tg: 'Корбарон', ky: 'Колдонуучулар' },
  'admin.audit': { uz_lat: 'Audit log', uz_cyr: 'Аудит лог', ru: 'Аудит лог', en: 'Audit log', kk: 'Аудит логы', tg: 'Аудит лог', ky: 'Аудит лог' },
  'admin.analytics': { uz_lat: 'Analitika', uz_cyr: 'Аналитика', ru: 'Аналитика', en: 'Analytics', kk: 'Аналитика', tg: 'Аналитика', ky: 'Аналитика' },
  'admin.ab_testing': { uz_lat: 'A/B testlar', uz_cyr: 'A/B тестлар', ru: 'A/B тесты', en: 'A/B tests', kk: 'A/B тесттер', tg: 'A/B тестҳо', ky: 'A/B тесттер' },
  'admin.fraud': { uz_lat: 'Fraud', uz_cyr: 'Фрауд', ru: 'Fraud', en: 'Fraud', kk: 'Fraud', tg: 'Fraud', ky: 'Fraud' },
  'admin.system': { uz_lat: 'Tizim', uz_cyr: 'Тизим', ru: 'Система', en: 'System', kk: 'Жүйе', tg: 'Низом', ky: 'Система' },
  'admin.logout': { uz_lat: 'Chiqish', uz_cyr: 'Чиқиш', ru: 'Выйти', en: 'Log out', kk: 'Шығу', tg: 'Баромадан', ky: 'Чыгуу' },
  'admin.email': { uz_lat: 'Email', uz_cyr: 'Email', ru: 'Email', en: 'Email', kk: 'Email', tg: 'Email', ky: 'Email' },
  'admin.password': { uz_lat: 'Parol', uz_cyr: 'Парол', ru: 'Пароль', en: 'Password', kk: 'Құпия сөз', tg: 'Рамз', ky: 'Сырсөз' },
  'admin.totp': { uz_lat: 'TOTP kod', uz_cyr: 'TOTP код', ru: 'TOTP код', en: 'TOTP code', kk: 'TOTP код', tg: 'TOTP код', ky: 'TOTP код' },
  'admin.login': { uz_lat: 'Kirish', uz_cyr: 'Кириш', ru: 'Войти', en: 'Sign in', kk: 'Кіру', tg: 'Ворид шудан', ky: 'Кирүү' },
  'admin.logging_in': { uz_lat: 'Kirish...', uz_cyr: 'Кириш...', ru: 'Входим...', en: 'Signing in...', kk: 'Кіру...', tg: 'Ворид шудан...', ky: 'Кирүү...' },
  'admin.login_error': { uz_lat: 'Kirish xatosi', uz_cyr: 'Кириш хатоси', ru: 'Ошибка входа', en: 'Login failed', kk: 'Кіру қатесі', tg: 'Хатои вуруд', ky: 'Кирүү катасы' },
  'admin.total_users': { uz_lat: 'Jami foydalanuvchilar', uz_cyr: 'Жами фойдаланувчилар', ru: 'Всего пользователей', en: 'Total users', kk: 'Барлық пайдаланушылар', tg: 'Ҳамаи корбарон', ky: 'Жалпы колдонуучулар' },
  'admin.active_vacancies': { uz_lat: 'Faol vakansiyalar', uz_cyr: 'Фаол вакансиялар', ru: 'Активные вакансии', en: 'Active vacancies', kk: 'Белсенді бос орындар', tg: 'Ҷойҳои кори фаъол', ky: 'Активдүү вакансиялар' },
  'admin.applications_today': { uz_lat: 'Bugungi arizalar', uz_cyr: 'Бугунги аризалар', ru: 'Отклики за сегодня', en: 'Applications today', kk: 'Бүгінгі өтінімдер', tg: 'Аризаҳои имрӯз', ky: 'Бүгүнкү арыздар' },
  'admin.monthly_revenue': { uz_lat: 'Oylik daromad', uz_cyr: 'Ойлик даромад', ru: 'Месячная выручка', en: 'Monthly revenue', kk: 'Айлық түсім', tg: 'Даромади моҳона', ky: 'Айлык киреше' },
  'admin.system_status': { uz_lat: 'Tizim holati', uz_cyr: 'Тизим ҳолати', ru: 'Состояние системы', en: 'System status', kk: 'Жүйе күйі', tg: 'Ҳолати низом', ky: 'Системанын абалы' },
  'admin.running': { uz_lat: 'Ishlayapti', uz_cyr: 'Ишлаяпти', ru: 'Работает', en: 'Running', kk: 'Жұмыс істеп тұр', tg: 'Кор мекунад', ky: 'Иштеп жатат' },
  'admin.error': { uz_lat: 'Xato', uz_cyr: 'Хато', ru: 'Ошибка', en: 'Error', kk: 'Қате', tg: 'Хато', ky: 'Ката' },
  'admin.quick_links': { uz_lat: 'Tezkor havolalar', uz_cyr: 'Тезкор ҳаволалар', ru: 'Быстрые ссылки', en: 'Quick links', kk: 'Жылдам сілтемелер', tg: 'Пайвандҳои зуд', ky: 'Тез шилтемелер' },
  'admin.activity': { uz_lat: "So'nggi faoliyat", uz_cyr: 'Сўнгги фаолият', ru: 'Последняя активность', en: 'Recent activity', kk: 'Соңғы белсенділік', tg: 'Фаъолияти охирин', ky: 'Акыркы активдүүлүк' },
  'admin.queue': { uz_lat: 'Moderatsiya navbati', uz_cyr: 'Модерация навбати', ru: 'Очередь модерации', en: 'Moderation queue', kk: 'Модерация кезегі', tg: 'Навбати модератсия', ky: 'Модерация кезеги' },
  'admin.no_items': { uz_lat: "Navbatda element yo'q", uz_cyr: 'Навбатда элемент йўқ', ru: 'В очереди нет элементов', en: 'Queue is empty', kk: 'Кезекте элемент жоқ', tg: 'Дар навбат чизе нест', ky: 'Кезекте элемент жок' },
  'common.cancel': { uz_lat: 'Bekor qilish', uz_cyr: 'Бекор қилиш', ru: 'Отмена', en: 'Cancel', kk: 'Бас тарту', tg: 'Бекор кардан', ky: 'Жокко чыгаруу' },
  'common.approve': { uz_lat: 'Tasdiqlash', uz_cyr: 'Тасдиқлаш', ru: 'Одобрить', en: 'Approve', kk: 'Растау', tg: 'Тасдиқ', ky: 'Ырастоо' },
  'common.reject': { uz_lat: 'Rad etish', uz_cyr: 'Рад этиш', ru: 'Отклонить', en: 'Reject', kk: 'Қабылдамау', tg: 'Рад кардан', ky: 'Четке кагуу' },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLang = signal<Lang>(this.loadLang());

  lang = this.currentLang.asReadonly();
  dir = computed(() => 'ltr');

  constructor() {
    document.documentElement.lang = this.currentLang().replace('_', '-');
  }

  t(key: string): string {
    const lang = this.currentLang();
    return TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.ru || TRANSLATIONS[key]?.en || key;
  }

  private loadLang(): Lang {
    const saved = localStorage.getItem('vjw_lang') as Lang | null;
    if (saved) {
      return saved;
    }
    const nav = navigator.language?.toLowerCase() || '';
    if (nav.startsWith('ru')) return 'ru';
    if (nav.startsWith('en')) return 'en';
    return 'uz_lat';
  }
}
