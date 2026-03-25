import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicApiService } from '../../core/services/public-api.service';
import { PublicHeaderComponent } from '../../shared/components/public-header.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';

@Component({
  selector: 'vjw-public-company-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <vjw-public-header />

    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-xl font-bold text-gray-900 mb-6">Kompaniyalar</h1>

      <div class="flex gap-2 mb-6">
        <input type="text" [(ngModel)]="query" placeholder="Kompaniya nomi..."
               class="flex-1 h-12 px-4 border border-gray-300 rounded-lg text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
               (keyup.enter)="search()">
        <button (click)="search()" class="h-12 px-6 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">Qidirish</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (c of companies(); track c.id) {
          <a [routerLink]="['/companies', c.slug || c.id]" class="bg-white border border-gray-100 rounded-lg p-5 hover:shadow-md transition group">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm font-bold shrink-0">
                {{ (c.name || '?').charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-900 group-hover:text-black truncate">{{ c.name }}</div>
                @if (c.industry) { <div class="text-xs text-gray-400">{{ c.industry }}</div> }
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              @if (c.city) { <span>{{ c.city }}</span> }
              @if (c.isVerified) { <span class="text-green-600">&#10003; Tasdiqlangan</span> }
            </div>
          </a>
        } @empty {
          <div class="col-span-full text-center py-16 text-gray-400 text-sm">
            @if (loading()) { Yuklanmoqda... } @else { Kompaniya topilmadi }
          </div>
        }
      </div>
    </div>

    <vjw-public-footer />
  `,
})
export class PublicCompanyListComponent implements OnInit {
  companies = signal<any[]>([]);
  loading = signal(true);
  query = '';

  constructor(private api: PublicApiService) {}

  ngOnInit() { this.search(); }

  search() {
    this.loading.set(true);
    this.api.getCompanies({ q: this.query }).subscribe({
      next: (r: any) => { this.companies.set(r.content || r || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
