import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'vjw-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none" role="alert" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="pointer-events-auto rounded-lg px-4 py-3 shadow-lg border flex items-start gap-3 animate-slide-in"
             [class]="getClass(toast.type)" role="status">
          <span class="text-lg shrink-0" aria-hidden="true">{{ getIcon(toast.type) }}</span>
          <p class="text-sm flex-1">{{ toast.message }}</p>
          <button (click)="toastService.dismiss(toast.id)" class="text-current opacity-50 hover:opacity-100 shrink-0"
                  aria-label="Yopish">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-slide-in { animation: slide-in 0.3s ease-out; }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  getClass(type: string): string {
    return {
      'success': 'bg-green-50 border-green-200 text-green-800',
      'error': 'bg-red-50 border-red-200 text-red-800',
      'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'info': 'bg-blue-50 border-blue-200 text-blue-800',
    }[type] || 'bg-gray-50 border-gray-200 text-gray-800';
  }

  getIcon(type: string): string {
    return { 'success': '\u2705', 'error': '\u274C', 'warning': '\u26A0\uFE0F', 'info': '\u2139\uFE0F' }[type] || '\u2139\uFE0F';
  }
}
