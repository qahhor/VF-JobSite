import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-xl font-bold text-gray-900 mb-6">Saqlangan vakansiyalar</h1>
      <div class="text-center py-16 text-gray-400">
        <div class="text-4xl mb-3">&#9825;</div>
        <p class="text-sm mb-4">Saqlangan vakansiya yo'q</p>
        <a routerLink="/jobs" class="text-sm text-black hover:underline">Vakansiyalarni ko'rish &#8594;</a>
      </div>
    </div>
    <vjw-public-footer />
  `,
})
export class PublicFavoritesComponent {}
