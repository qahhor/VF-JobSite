/** Benefit keyword → emoji icon mapping for blue-collar job cards */
export const BENEFIT_ICONS: Record<string, string> = {
  // Food
  'ovqat': '🍜', 'food': '🍜', 'lunch': '🍜', 'tushlik': '🍜', 'еда': '🍜', 'обед': '🍜', 'питание': '🍜',
  // Transport
  'transport': '🚌', 'yo\'l kira': '🚌', 'shuttle': '🚌', 'транспорт': '🚌', 'развозка': '🚌',
  // Medical
  'tibbiy': '🏥', 'medical': '🏥', 'sug\'urta': '🏥', 'медицина': '🏥', 'страховка': '🏥', 'health': '🏥',
  // Housing
  'turar joy': '🏠', 'yotoqxona': '🏠', 'housing': '🏠', 'жилье': '🏠', 'общежитие': '🏠', 'accommodation': '🏠',
  // Uniform
  'forma': '👕', 'uniform': '👕', 'kiyim': '👕', 'форма': '👕', 'одежда': '👕',
  // Training
  'ta\'lim': '📚', 'training': '📚', 'o\'qitish': '📚', 'обучение': '📚', 'стажировка': '📚',
  // Bonus
  'bonus': '💰', 'mukofot': '💰', 'бонус': '💰', 'премия': '💰', 'prize': '💰',
  // Flexible
  'moslashuvchan': '⏰', 'flexible': '⏰', 'гибкий': '⏰',
};

export function getBenefitIcon(benefit: string): string {
  const lower = benefit.toLowerCase();
  for (const [key, icon] of Object.entries(BENEFIT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '✅';
}
