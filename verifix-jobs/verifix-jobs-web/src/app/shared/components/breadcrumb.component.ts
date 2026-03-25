import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

@Component({
  selector: 'vjw-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav aria-label="Navigatsiya yo'li" class="mb-4">
      <ol class="flex items-center gap-1.5 text-sm text-gray-400">
        @for (item of items; track $index; let last = $last) {
          <li class="flex items-center gap-1.5">
            @if (item.link && !last) {
              <a [routerLink]="item.link" class="hover:text-black transition" [attr.aria-label]="item.label">{{ item.label }}</a>
            } @else {
              <span [class]="last ? 'text-gray-700 font-medium' : ''" [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
            }
            @if (!last) { <span aria-hidden="true">/</span> }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
