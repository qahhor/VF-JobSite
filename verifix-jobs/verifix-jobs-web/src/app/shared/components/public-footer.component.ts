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
            <p class="text-xs text-gray-400">Markaziy Osiyodagi ish qidirish platformasi</p>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ish qidiruvchilar</h4>
            <div class="space-y-2 text-xs text-gray-500"><a routerLink="/jobs" class="block hover:text-black">Vakansiyalar</a><a routerLink="/companies" class="block hover:text-black">Kompaniyalar</a></div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ish beruvchilar</h4>
            <div class="space-y-2 text-xs text-gray-500"><a routerLink="/login" class="block hover:text-black">Kirish</a></div>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Aloqa</h4>
            <div class="space-y-2 text-xs text-gray-500"><div>info&#64;verifix.uz</div><div>+998 71 200 00 00</div></div>
          </div>
        </div>
        <div class="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-xs text-gray-400">&#169; 2024-2026 Verifix LLC</p>
          <div class="flex gap-4 text-xs text-gray-400"><a href="#" class="hover:text-black">Maxfiylik</a><a href="#" class="hover:text-black">Shartlar</a></div>
        </div>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {}
