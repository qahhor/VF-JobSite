import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'uz_lat' | 'uz_cyr' | 'ru' | 'en' | 'kk' | 'tg' | 'ky';

type TranslationRow = Partial<Record<Lang, string>>;

const TRANSLATIONS: Record<string, TranslationRow> = {
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
  'admin.history_unavailable': { uz_lat: "Tarix ko'rinishi hali ulanmagan", uz_cyr: 'Тарих кўриниши ҳали уланмаган', ru: 'История пока не подключена', en: 'History view is not connected yet', kk: 'Тарих көрінісі әлі қосылмаған', tg: 'Намоиши таърих ҳоло пайваст нест', ky: 'Тарых көрүнүшү азырынча туташкан эмес' },
  'admin.type': { uz_lat: 'Turi', uz_cyr: 'Тури', ru: 'Тип', en: 'Type', kk: 'Түрі', tg: 'Навъ', ky: 'Түрү' },
  'admin.item': { uz_lat: 'Element', uz_cyr: 'Элемент', ru: 'Элемент', en: 'Item', kk: 'Элемент', tg: 'Элемент', ky: 'Элемент' },
  'admin.status': { uz_lat: 'Status', uz_cyr: 'Статус', ru: 'Статус', en: 'Status', kk: 'Күйі', tg: 'Ҳолат', ky: 'Статус' },
  'admin.date': { uz_lat: 'Sana', uz_cyr: 'Сана', ru: 'Дата', en: 'Date', kk: 'Күні', tg: 'Сана', ky: 'Дата' },
  'admin.actions': { uz_lat: 'Amallar', uz_cyr: 'Амаллар', ru: 'Действия', en: 'Actions', kk: 'Әрекеттер', tg: 'Амалҳо', ky: 'Аракеттер' },
  'admin.reason_placeholder': { uz_lat: 'Sababni kiriting...', uz_cyr: 'Сабабни киритинг...', ru: 'Введите причину...', en: 'Enter a reason...', kk: 'Себебін енгізіңіз...', tg: 'Сабабро ворид кунед...', ky: 'Себебин жазыңыз...' },
  'common.cancel': { uz_lat: 'Bekor qilish', uz_cyr: 'Бекор қилиш', ru: 'Отмена', en: 'Cancel', kk: 'Бас тарту', tg: 'Бекор кардан', ky: 'Жокко чыгаруу' },
  'common.approve': { uz_lat: 'Tasdiqlash', uz_cyr: 'Тасдиқлаш', ru: 'Одобрить', en: 'Approve', kk: 'Растау', tg: 'Тасдиқ', ky: 'Ырастоо' },
  'common.reject': { uz_lat: 'Rad etish', uz_cyr: 'Рад этиш', ru: 'Отклонить', en: 'Reject', kk: 'Қабылдамау', tg: 'Рад кардан', ky: 'Четке кагуу' },
  'common.confirm': { uz_lat: 'Tasdiqlash', uz_cyr: 'Тасдиқлаш', ru: 'Подтвердить', en: 'Confirm', kk: 'Растау', tg: 'Тасдиқ', ky: 'Ырастоо' },
  'common.confirmation_message': { uz_lat: 'Bu amalni bajarishga ishonchingiz komilmi?', uz_cyr: 'Бу амални бажаришга ишончингиз комилми?', ru: 'Вы уверены, что хотите выполнить это действие?', en: 'Are you sure you want to continue?', kk: 'Бұл әрекетті орындауға сенімдісіз бе?', tg: 'Оё мутмаинед, ки мехоҳед ин амалро иҷро кунед?', ky: 'Бул аракетти аткаргыңыз келерине ишенесизби?' },
  'common.close': { uz_lat: 'Yopish', uz_cyr: 'Ёпиш', ru: 'Закрыть', en: 'Close', kk: 'Жабу', tg: 'Пӯшидан', ky: 'Жабуу' },
  'status.pending': { uz_lat: 'Kutilmoqda', uz_cyr: 'Кутилмоқда', ru: 'Ожидает', en: 'Pending', kk: 'Күтілуде', tg: 'Интизор', ky: 'Күтүүдө' },
  'status.approved': { uz_lat: 'Tasdiqlangan', uz_cyr: 'Тасдиқланган', ru: 'Одобрено', en: 'Approved', kk: 'Мақұлданды', tg: 'Тасдиқ шуд', ky: 'Жактырылды' },
  'status.rejected': { uz_lat: 'Rad etilgan', uz_cyr: 'Рад этилган', ru: 'Отклонено', en: 'Rejected', kk: 'Қабылданбады', tg: 'Рад шуд', ky: 'Четке кагылды' },
  'users.title': { uz_lat: 'Foydalanuvchilar', ru: 'Пользователи', en: 'Users' },
  'users.search': { uz_lat: 'Qidirish...', ru: 'Поиск...', en: 'Search...' },
  'users.records': { uz_lat: 'ta yozuv', ru: 'записей', en: 'records' },
  'users.registered': { uz_lat: "Ro'yxatdan", ru: 'Зарегистрирован', en: 'Registered' },
  'users.read_only': { uz_lat: 'Faqat o`qish', ru: 'Только чтение', en: 'Read only' },
  'users.not_found': { uz_lat: 'Foydalanuvchilar topilmadi', ru: 'Пользователи не найдены', en: 'Users not found' },
  'users.user': { uz_lat: 'Foydalanuvchi', ru: 'Пользователь', en: 'User' },
  'users.status': { uz_lat: 'Status', ru: 'Статус', en: 'Status' },
  'users.action': { uz_lat: 'Amal', ru: 'Действие', en: 'Action' },
  'users.suspend': { uz_lat: "To'xtatish", ru: 'Приостановить', en: 'Suspend' },
  'users.activate': { uz_lat: 'Faollashtirish', ru: 'Активировать', en: 'Activate' },
  'users.candidates': { uz_lat: 'Nomzodlar', ru: 'Кандидаты', en: 'Candidates' },
  'users.employers': { uz_lat: 'Ish beruvchilar', ru: 'Работодатели', en: 'Employers' },
  'users.admins': { uz_lat: 'Adminlar', ru: 'Администраторы', en: 'Admins' },
  'audit.title': { uz_lat: 'Audit log', ru: 'Аудит лог', en: 'Audit log' },
  'audit.time': { uz_lat: 'Vaqt', ru: 'Время', en: 'Time' },
  'audit.admin': { uz_lat: 'Admin', ru: 'Админ', en: 'Admin' },
  'audit.action': { uz_lat: 'Amal', ru: 'Действие', en: 'Action' },
  'audit.item': { uz_lat: 'Element', ru: 'Объект', en: 'Item' },
  'audit.ip': { uz_lat: 'IP', ru: 'IP', en: 'IP' },
  'audit.details': { uz_lat: 'Batafsil', ru: 'Подробнее', en: 'Details' },
  'audit.close': { uz_lat: 'Yopish', ru: 'Закрыть', en: 'Close' },
  'audit.not_found': { uz_lat: 'Loglar topilmadi', ru: 'Логи не найдены', en: 'Logs not found' },
  'analytics.title': { uz_lat: 'Platforma analitikasi', ru: 'Аналитика платформы', en: 'Platform analytics' },
  'analytics.user_growth': { uz_lat: "Foydalanuvchi o'sishi", ru: 'Рост пользователей', en: 'User growth' },
  'analytics.top_cities': { uz_lat: 'Top shaharlar', ru: 'Топ городов', en: 'Top cities' },
  'analytics.months_ago': { uz_lat: '12 oy oldin', ru: '12 месяцев назад', en: '12 months ago' },
  'analytics.today': { uz_lat: 'Bugun', ru: 'Сегодня', en: 'Today' },
  'analytics.total_candidates': { uz_lat: 'Jami nomzodlar', ru: 'Всего кандидатов', en: 'Total candidates' },
  'analytics.total_employers': { uz_lat: 'Jami ish beruvchilar', ru: 'Всего работодателей', en: 'Total employers' },
  'analytics.total_vacancies': { uz_lat: 'Jami vakansiyalar', ru: 'Всего вакансий', en: 'Total vacancies' },
  'analytics.monthly_revenue': { uz_lat: 'Oylik daromad', ru: 'Месячная выручка', en: 'Monthly revenue' },
  'ab.title': { uz_lat: 'A/B testlar', ru: 'A/B тесты', en: 'A/B tests' },
  'ab.new': { uz_lat: 'Yangi eksperiment', ru: 'Новый эксперимент', en: 'New experiment' },
  'ab.active': { uz_lat: 'Faol', ru: 'Активен', en: 'Active' },
  'ab.inactive': { uz_lat: 'Nofaol', ru: 'Неактивен', en: 'Inactive' },
  'ab.stop': { uz_lat: "To'xtatish", ru: 'Остановить', en: 'Stop' },
  'ab.start': { uz_lat: 'Boshlash', ru: 'Запустить', en: 'Start' },
  'ab.participants': { uz_lat: 'Ishtirokchilar', ru: 'Участники', en: 'Participants' },
  'ab.conversions': { uz_lat: 'Konversiyalar', ru: 'Конверсии', en: 'Conversions' },
  'ab.view_stats': { uz_lat: "Statistikani ko'rish", ru: 'Посмотреть статистику', en: 'View stats' },
  'ab.not_enough_data': { uz_lat: "Ma'lumot yetarli emas", ru: 'Недостаточно данных', en: 'Not enough data' },
  'ab.tie': { uz_lat: 'Teng', ru: 'Ничья', en: 'Tie' },
  'ab.winner': { uz_lat: "G'olib", ru: 'Победитель', en: 'Winner' },
  'ab.confidence': { uz_lat: 'ishonch', ru: 'доверие', en: 'confidence' },
  'ab.empty': { uz_lat: "Eksperimentlar yo'q", ru: 'Экспериментов нет', en: 'No experiments' },
  'ab.create_title': { uz_lat: 'Yangi A/B eksperiment', ru: 'Новый A/B эксперимент', en: 'New A/B experiment' },
  'ab.name_placeholder': { uz_lat: 'masalan: cta_button_color', ru: 'например: cta_button_color', en: 'for example: cta_button_color' },
  'ab.description_placeholder': { uz_lat: 'Eksperiment maqsadi...', ru: 'Цель эксперимента...', en: 'Experiment goal...' },
  'fraud.title': { uz_lat: 'Fraud alertlar', ru: 'Fraud-алерты', en: 'Fraud alerts' },
  'fraud.new': { uz_lat: 'Yangi', ru: 'Новые', en: 'New' },
  'fraud.reviewed': { uz_lat: "Ko'rilgan", ru: 'Просмотренные', en: 'Reviewed' },
  'fraud.suspicious': { uz_lat: 'Shubhali faoliyat', ru: 'Подозрительная активность', en: 'Suspicious activity' },
  'fraud.score': { uz_lat: 'fraud score', ru: 'fraud score', en: 'fraud score' },
  'fraud.mark_reviewed': { uz_lat: "Ko'rildi", ru: 'Отметить просмотренным', en: 'Mark reviewed' },
  'fraud.empty': { uz_lat: "Fraud alertlar yo'q", ru: 'Fraud-алертов нет', en: 'No fraud alerts' },
  'system.title': { uz_lat: 'Tizim sozlamalari', ru: 'Системные настройки', en: 'System settings' },
  'system.services': { uz_lat: 'Xizmatlar', ru: 'Сервисы', en: 'Services' },
  'system.rate_limits': { uz_lat: 'Rate limitlar', ru: 'Лимиты запросов', en: 'Rate limits' },
  'system.general_rate': { uz_lat: 'Umumiy (req/min)', ru: 'Общий (req/min)', en: 'General (req/min)' },
  'system.employer_rate': { uz_lat: 'Ish beruvchi (req/min)', ru: 'Работодатель (req/min)', en: 'Employer (req/min)' },
  'system.moderation_rules': { uz_lat: 'Moderatsiya qoidalari', ru: 'Правила модерации', en: 'Moderation rules' },
  'system.minimum_wage': { uz_lat: 'Minimal maosh (UZS)', ru: 'Минимальная зарплата (UZS)', en: 'Minimum wage (UZS)' },
  'system.banned_words': { uz_lat: "Taqiqlangan so'zlar (vergul bilan)", ru: 'Запрещённые слова (через запятую)', en: 'Banned words (comma-separated)' },
  'system.sms_status': { uz_lat: 'SMS provayder holati', ru: 'Статус SMS-провайдеров', en: 'SMS provider status' },
  'system.primary': { uz_lat: 'asosiy', ru: 'основной', en: 'primary' },
  'system.backup': { uz_lat: 'zaxira', ru: 'резервный', en: 'backup' },
  'system.save_success': { uz_lat: 'Sozlamalar saqlandi', ru: 'Настройки сохранены', en: 'Settings saved' },
  'system.active': { uz_lat: 'Faol', ru: 'Активен', en: 'Active' },
  'system.kafka_desc': { uz_lat: 'Xabar brokeri', ru: 'Брокер сообщений', en: 'Message broker' },
  'system.search_desc': { uz_lat: 'Qidiruv tizimi', ru: 'Поисковый движок', en: 'Search engine' },
  'system.storage_desc': { uz_lat: 'Fayl saqlash', ru: 'Файловое хранилище', en: 'File storage' },
  'system.ml_desc': { uz_lat: "Mashinali o'rganish", ru: 'Машинное обучение', en: 'Machine learning' },
  'system.gov_desc': { uz_lat: 'Davlat sinxronizatsiyasi', ru: 'Государственная синхронизация', en: 'Government sync' },
  'system.banned_placeholder': { uz_lat: 'mlm, piramida, depozit...', ru: 'млм, пирамида, депозит...', en: 'mlm, pyramid, deposit...' },
  'quick.moderation': { uz_lat: 'Moderatsiya', ru: 'Модерация', en: 'Moderation' },
  'quick.fraud': { uz_lat: 'Fraud alertlar', ru: 'Fraud-алерты', en: 'Fraud alerts' },
  'quick.users': { uz_lat: 'Foydalanuvchilar', ru: 'Пользователи', en: 'Users' },
  'quick.ab': { uz_lat: 'A/B testlar', ru: 'A/B тесты', en: 'A/B tests' },
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
    return TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.uz_lat || TRANSLATIONS[key]?.ru || TRANSLATIONS[key]?.en || key;
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
