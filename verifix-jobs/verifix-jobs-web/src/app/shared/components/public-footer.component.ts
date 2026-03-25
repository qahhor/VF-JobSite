import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vjw-public-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-white border-t border-gray-100 py-10">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-3"><img src="assets/logo-icon.svg" alt="Verifix" class="h-6"><span class="font-semibold text-sm">Verifix Jobs</span></div>
            <p class="text-xs text-gray-400 mb-3">Markaziy Osiyodagi ish qidirish platformasi</p>
            <a href="https://t.me/VerifixJobBot" target="_blank" class="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-2.01 9.47c-.15.68-.54.84-1.1.53l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.06 5.56-5.02c.24-.22-.05-.34-.38-.13L8.6 14.27l-2.98-.93c-.65-.2-.66-.65.14-.96l11.65-4.49c.54-.2 1.01.13.84.96l-.3 1.28z"/></svg>
              Telegram bot
            </a>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ish qidiruvchilar</h4>
            <div class="space-y-2 text-xs text-gray-500">
              <a routerLink="/jobs" class="block hover:text-black">Vakansiyalar</a>
              <a routerLink="/companies" class="block hover:text-black">Kompaniyalar</a>
              <a routerLink="/favorites" class="block hover:text-black">Saqlangan</a>
            </div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ish beruvchilar</h4>
            <div class="space-y-2 text-xs text-gray-500">
              <a routerLink="/login" class="block hover:text-black">Kirish</a>
              <a routerLink="/login" class="block hover:text-black">Vakansiya joylash</a>
            </div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Aloqa</h4>
            <div class="space-y-2 text-xs text-gray-500">
              <a href="mailto:info@verifix.uz" class="block hover:text-black">info&#64;verifix.uz</a>
              <a href="tel:+998712000000" class="block hover:text-black">+998 71 200 00 00</a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-gray-400">&#169; 2024-2026 Verifix LLC. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {}
