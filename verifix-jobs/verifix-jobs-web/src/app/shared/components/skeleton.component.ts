import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vjw-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('card') {
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card overflow-hidden">
          <div class="shimmer h-4 w-24 rounded mb-3"></div>
          <div class="shimmer h-8 w-32 rounded mb-2"></div>
          <div class="shimmer h-3 w-20 rounded mb-4"></div>
          <div class="shimmer h-8 w-full rounded"></div>
        </div>
      }
      @case ('table-row') {
        <tr>
          @for (_ of cols; track $index) {
            <td class="px-5 py-3.5"><div class="shimmer h-4 rounded" [style.width.%]="40 + $index * 10"></div></td>
          }
        </tr>
      }
      @case ('chart') {
        <div class="rounded-2xl border border-border bg-white p-5 shadow-card overflow-hidden">
          <div class="shimmer h-4 w-32 rounded mb-4"></div>
          <div class="shimmer h-48 w-full rounded"></div>
        </div>
      }
      @default {
        <div class="shimmer rounded" [style.height.px]="height" [style.width]="width"></div>
      }
    }
  `,
  styles: [`
    .shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite linear;
    }
    :host-context(.dark) .shimmer {
      background: linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%);
      background-size: 200% 100%;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() variant: 'card' | 'table-row' | 'chart' | 'line' = 'line';
  @Input() height = 16;
  @Input() width = '100%';
  @Input() columns = 4;

  get cols(): number[] { return Array.from({ length: this.columns }); }
}
