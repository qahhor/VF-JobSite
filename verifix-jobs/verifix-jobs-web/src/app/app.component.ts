import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { I18nService } from './core/services/i18n.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'vjw-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastContainerComponent],
  template: `
    <router-outlet />
    <vjw-toast-container />

    <!-- PWA Install Prompt -->
    @if (showInstall()) {
      <div class="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-black text-white rounded-xl p-4 shadow-2xl z-50 flex items-center gap-3">
        <div class="flex-1">
          <div class="text-sm font-semibold">{{ i18n.t('pwa.install_title') }}</div>
          <div class="text-xs text-gray-400 mt-0.5">{{ i18n.t('pwa.install_desc') }}</div>
        </div>
        <button (click)="installPwa()" class="h-9 px-4 bg-white text-black rounded-lg text-xs font-semibold hover:bg-gray-100 transition shrink-0">{{ i18n.t('pwa.install_btn') }}</button>
        <button (click)="showInstall.set(false)" class="text-gray-500 hover:text-white text-lg leading-none shrink-0">✕</button>
      </div>
    }

    <!-- PWA Update Available -->
    @if (showUpdate()) {
      <div class="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-600 text-white rounded-xl p-4 shadow-2xl z-50 flex items-center gap-3">
        <div class="flex-1">
          <div class="text-sm font-semibold">{{ i18n.t('pwa.update_title') }}</div>
          <div class="text-xs text-blue-200 mt-0.5">{{ i18n.t('pwa.update_btn') }}</div>
        </div>
        <button (click)="reloadApp()" class="h-9 px-4 bg-white text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition shrink-0">{{ i18n.t('pwa.update_btn') }}</button>
      </div>
    }
  `,
})
export class AppComponent implements OnInit {
  showInstall = signal(false);
  showUpdate = signal(false);
  private deferredPrompt: any = null;

  constructor(private swUpdate: SwUpdate, public i18n: I18nService) {}

  ngOnInit() {
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      // Show after 30 seconds if user hasn't installed
      setTimeout(() => {
        if (this.deferredPrompt) this.showInstall.set(true);
      }, 30000);
    });

    // PWA update detection
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => this.showUpdate.set(true));
    }
  }

  installPwa() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(() => {
      this.deferredPrompt = null;
      this.showInstall.set(false);
    });
  }

  reloadApp() {
    document.location.reload();
  }
}
