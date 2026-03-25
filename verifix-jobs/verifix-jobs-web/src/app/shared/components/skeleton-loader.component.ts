import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vjw-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('card') {
        <div class="animate-pulse bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3" [attr.aria-label]="'Yuklanmoqda'">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-3 bg-gray-200 rounded w-full"></div>
          <div class="flex gap-2 mt-2">
            <div class="h-6 bg-gray-200 rounded-full w-16"></div>
            <div class="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
      }
      @case ('table-row') {
        <tr class="animate-pulse" [attr.aria-label]="'Yuklanmoqda'">
          @for (i of cols; track i) {
            <td class="px-5 py-3"><div class="h-3 bg-gray-200 rounded w-3/4"></div></td>
          }
        </tr>
      }
      @case ('kpi') {
        <div class="animate-pulse bg-white rounded-xl p-5 shadow-sm border border-gray-100" [attr.aria-label]="'Yuklanmoqda'">
          <div class="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      }
      @default {
        <div class="animate-pulse" [attr.aria-label]="'Yuklanmoqda'">
          <div class="h-4 bg-gray-200 rounded" [style.width]="width"></div>
        </div>
      }
    }
  `,
})
export class SkeletonLoaderComponent {
  @Input() variant: 'card' | 'table-row' | 'kpi' | 'line' = 'line';
  @Input() width = '100%';
  @Input() columns = 5;
  get cols() { return Array.from({ length: this.columns }, (_, i) => i); }
}
