import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-public-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-gray-100 bg-white py-10">
      <div class="mx-auto max-w-6xl px-4">
        <div class="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <div class="mb-3 flex items-center gap-2">
              <img src="assets/logo-icon.svg" alt="Verifix" class="h-6">
              <span class="text-sm font-semibold">Verifix Jobs</span>
            </div>
            <p class="mb-3 text-xs text-gray-400">{{ i18n.t('footer.platform') }}</p>
            <a href="https://t.me/VerifixJobBot" target="_blank" class="inline-flex items-center gap-1.5 text-xs text-gray-500 transition hover:text-black">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.94 8.13l-2.01 9.47c-.15.68-.54.84-1.1.53l-3.03-2.24-1.46 1.41c-.16.16-.3.3-.61.3l.22-3.06 5.56-5.02c.24-.22-.05-.34-.38-.13L8.6 14.27l-2.98-.93c-.65-.2-.66-.65.14-.96l11.65-4.49c.54-.2 1.01.13.84.96l-.3 1.28z"/></svg>
              Telegram bot
            </a>
          </div>
          <div>
            <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-900">{{ i18n.t('footer.seekers') }}</h4>
            <div class="space-y-2 text-xs text-gray-500">
              <a routerLink="/jobs" class="block hover:text-black">{{ i18n.t('nav.vacancies') }}</a>
              <a routerLink="/categories" class="block hover:text-black">{{ i18n.t('footer.categories') }}</a>
              <a routerLink="/companies" class="block hover:text-black">{{ i18n.t('nav.companies') }}</a>
              <a routerLink="/favorites" class="block hover:text-black">{{ i18n.t('footer.saved') }}</a>
              <a routerLink="/saved-searches" class="block hover:text-black">{{ i18n.t('footer.searches') }}</a>
            </div>
          </div>
          <div>
            <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-900">{{ i18n.t('footer.employers') }}</h4>
            <div class="space-y-2 text-xs text-gray-500">
              <a routerLink="/login" class="block hover:text-black">{{ i18n.t('nav.login') }}</a>
              <a routerLink="/login" class="block hover:text-black">{{ i18n.t('footer.post_vacancy') }}</a>
            </div>
          </div>
          <div>
            <h4 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-900">{{ i18n.t('footer.contact') }}</h4>
            <div class="space-y-2 text-xs text-gray-500">
              <a href="mailto:info@verifix.uz" class="block hover:text-black">info&#64;verifix.uz</a>
              <a href="tel:+998712000000" class="block hover:text-black">+998 71 200 00 00</a>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p class="text-xs text-gray-400">&#169; 2024-2026 Verifix LLC. {{ i18n.t('footer.rights') }}</p>
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  constructor(public i18n: I18nService) {}
}
