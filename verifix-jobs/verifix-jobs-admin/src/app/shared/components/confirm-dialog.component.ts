import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vjw-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-[9998] flex items-center justify-center" role="dialog" aria-modal="true" [attr.aria-label]="title">
        <div class="absolute inset-0 bg-black/40" (click)="onCancel()" aria-hidden="true"></div>
        <div class="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-xl mx-4">
          <h3 class="font-semibold text-gray-800 text-lg mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button (click)="onCancel()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                    aria-label="Bekor qilish">{{ cancelText }}</button>
            <button (click)="onConfirm()" class="px-4 py-2 rounded-lg text-sm font-medium transition"
                    [class]="variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary-600'"
                    [attr.aria-label]="confirmText">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Tasdiqlash';
  @Input() message = 'Bu amalni bajarishga ishonchingiz komilmi?';
  @Input() confirmText = 'Ha';
  @Input() cancelText = 'Bekor qilish';
  @Input() variant: 'default' | 'danger' = 'default';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}
