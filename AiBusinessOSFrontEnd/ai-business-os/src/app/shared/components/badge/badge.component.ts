import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'primary' | 'gray' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClass()">
      <i *ngIf="icon" [class]="'ti ' + icon"></i>
      <span>{{ label }}</span>
    </span>
  `,
  styles: [`
    span {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-family: var(--font-family-mono);
      white-space: nowrap;
    }

    i {
      font-size: 12px;
    }
  `]
})
export class BadgeComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() variant: BadgeVariant = 'primary';

  getBadgeClass(): string {
    return `badge badge-${this.variant}`;
  }
}
