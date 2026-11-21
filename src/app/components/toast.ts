import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (service.toast(); as t) {
      <div class="fixed top-4 right-4 z-50 max-w-sm w-full animate-bounce duration-300">
        <div [class]="getToastClass(t.type) + ' flex items-center p-4 rounded-xl shadow-2xl border text-sm font-medium'">
          <span class="material-icons mr-3 text-xl">
            {{ t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info' }}
          </span>
          <div class="flex-1">{{ t.message }}</div>
        </div>
      </div>
    }
  `
})
export class Toast {
  readonly service = inject(JewelleryService);

  getToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-neutral-900 text-amber-300 border-amber-500/50 shadow-amber-900/20';
      case 'error':
        return 'bg-red-950 text-red-200 border-red-500/50 shadow-red-900/20';
      default:
        return 'bg-neutral-800 text-white border-neutral-700';
    }
  }
}
