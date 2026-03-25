import { Component, Input } from '@angular/core';

@Component({
  selector: 'vjw-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center" role="status">
      <div class="text-4xl mb-3" aria-hidden="true">{{ icon }}</div>
      <h3 class="text-lg font-medium text-gray-700 mb-1">{{ title }}</h3>
      <p class="text-sm text-gray-400 max-w-xs">{{ description }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '\uD83D\uDCED';
  @Input() title = 'Ma\'lumot topilmadi';
  @Input() description = '';
}
