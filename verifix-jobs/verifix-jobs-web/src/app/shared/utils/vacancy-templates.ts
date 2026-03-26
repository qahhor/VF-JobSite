/** 12 system vacancy templates for blue-collar mass hiring */
export interface VacancyTemplate {
  name: string;
  icon: string;
  category: string;
  description: string;
  employmentType: string;
  benefits: string[];
}

export const SYSTEM_TEMPLATES: VacancyTemplate[] = [
  { name: 'Kassir', icon: '💰', category: 'CASHIER', description: 'Savdo nuqtasida kassirlik. Mahsulotlarni skanerlash, pul qabul qilish, chek chiqarish.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Forma'] },
  { name: 'Sotuvchi', icon: '🛒', category: 'SALES', description: 'Savdo zalida xaridorlarga xizmat ko\'rsatish. Mahsulotlar haqida maslahat berish.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Bonus'] },
  { name: 'Oshpaz', icon: '👨‍🍳', category: 'COOK', description: 'Taomlar tayyorlash, reseptlarga rioya qilish, tozalikni saqlash.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Forma', 'Transport'] },
  { name: 'Haydovchi', icon: '🚗', category: 'DRIVER', description: 'Yuk yoki yo\'lovchilarni tashish. B/C toifali haydovchilik guvohnomasi talab qilinadi.', employmentType: 'FULL_TIME', benefits: ['Transport', 'Bonus'] },
  { name: 'Yukchi', icon: '💪', category: 'LOADER', description: 'Yuklarni ortish va tushirish. Omborxonada yuklarni joylashtirish.', employmentType: 'FULL_TIME', benefits: ['Ovqat'] },
  { name: 'Tozalovchi', icon: '🧹', category: 'CLEANER', description: 'Bino va xonalarni tozalash, sanitariya normalariga rioya qilish.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Forma'] },
  { name: 'Qo\'riqchi', icon: '🛡️', category: 'SECURITY', description: 'Binoni qo\'riqlash, kirim-chiqimni nazorat qilish, xavfsizlikni ta\'minlash.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Forma'] },
  { name: 'Ofitsiant', icon: '🍽️', category: 'WAITER', description: 'Restoranda mehmonlarga xizmat ko\'rsatish, buyurtmalarni qabul qilish.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Forma', 'Bonus'] },
  { name: 'Ishchi', icon: '🔨', category: 'BUILDER', description: 'Qurilish ishlarida ishtirok etish. Tajriba afzallik.', employmentType: 'TEMPORARY', benefits: ['Ovqat', 'Transport'] },
  { name: 'Tikuvchi', icon: '🧵', category: 'TAILOR', description: 'Kiyim-kechak tikish, chizmalarga muvofiq ishlash.', employmentType: 'FULL_TIME', benefits: ['Ovqat'] },
  { name: 'Barmen', icon: '🍸', category: 'WAITER', description: 'Bar xizmati, ichimliklar tayyorlash, inventarizatsiya.', employmentType: 'PART_TIME', benefits: ['Ovqat', 'Bonus'] },
  { name: 'Omborchi', icon: '📦', category: 'WAREHOUSE', description: 'Omborda mahsulotlarni qabul qilish, joylashtirish va hisobini yuritish.', employmentType: 'FULL_TIME', benefits: ['Ovqat', 'Transport'] },
];
