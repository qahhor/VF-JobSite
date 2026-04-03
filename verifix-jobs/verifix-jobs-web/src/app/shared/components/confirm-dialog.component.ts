import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'vjw-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-[9998] flex items-center justify-center" role="dialog" aria-modal="true" [attr.aria-label]="resolvedTitle">
        <div class="absolute inset-0 bg-black/40" (click)="onCancel()" aria-hidden="true"></div>
        <div class="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-xl mx-4">
          <h3 class="font-semibold text-gray-800 text-lg mb-2">{{ resolvedTitle }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ resolvedMessage }}</p>
          <div class="flex justify-end gap-3">
            <button (click)="onCancel()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                    [attr.aria-label]="resolvedCancelText">{{ resolvedCancelText }}</button>
            <button (click)="onConfirm()" class="px-4 py-2 rounded-lg text-sm font-medium transition"
                    [class]="variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-black text-white hover:bg-gray-800'"
                    [attr.aria-label]="resolvedConfirmText">{{ resolvedConfirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = '';
  @Input() cancelText = '';
  @Input() variant: 'default' | 'danger' = 'default';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(private i18n: I18nService) {}

  get resolvedTitle() {
    return this.title || this.i18n.t('common.confirm');
  }

  get resolvedMessage() {
    return this.message || this.i18n.t('common.confirmation_message');
  }

  get resolvedConfirmText() {
    return this.confirmText || this.i18n.t('common.confirm');
  }

  get resolvedCancelText() {
    return this.cancelText || this.i18n.t('common.cancel');
  }

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}
