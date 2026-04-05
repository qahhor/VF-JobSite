import { Component } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-employer-profile',
  standalone: true,
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-card text-center">
      <div class="text-4xl mb-4">🏢</div>
      <h1 class="text-xl font-semibold text-gray-900">Company Profile & Brand</h1>
      <p class="mt-2 text-sm text-muted">Coming soon — this feature is under development</p>
    </div>
  `,
})
export class EmployerProfileComponent {
  constructor(public i18n: I18nService) {}
}
