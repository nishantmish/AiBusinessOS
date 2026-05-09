import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="empty-state">
      <div *ngIf="icon" class="empty-state-icon">
        <i [class]="'ti ' + icon"></i>
      </div>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p *ngIf="description" class="empty-state-description">
        {{ description }}
      </p>
      <app-button
        *ngIf="actionLabel"
        [label]="actionLabel"
        variant="primary"
        (onClick)="onAction()"
      ></app-button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      text-align: center;
    }

    .empty-state-icon {
      font-size: 64px;
      color: var(--color-text-tertiary);
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 8px;
    }

    .empty-state-description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: 16px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '';
  @Input() title: string = 'No items found';
  @Input() description: string = '';
  @Input() actionLabel: string = '';

  onAction(): void {
    // Action handler can be overridden by parent
  }
}
