import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <div
        *ngFor="let item of Array(count)"
        class="loading-skeleton"
        [style.height.px]="height"
        [style.border-radius.px]="8"
      ></div>
    </div>
  `,
  styles: [`
    .space-y-3 {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .loading-skeleton {
      background: linear-gradient(
        90deg,
        var(--color-surface-2) 25%,
        var(--color-surface-3) 50%,
        var(--color-surface-2) 75%
      );
      background-size: 200% 100%;
      animation: loading-pulse 2s infinite;
    }

    @keyframes loading-pulse {
      0% {
        background-position: 200% 0;
      }

      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() count: number = 3;
  @Input() height: number = 16;

  Array = Array;
}
