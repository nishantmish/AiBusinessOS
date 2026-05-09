import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="getButtonClass()"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      [type]="type"
    >
      <i *ngIf="icon" [class]="'ti ' + icon"></i>
      <span *ngIf="label">{{ label }}</span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      font-family: var(--font);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      font-weight: 500;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      i {
        font-size: 16px;
      }
    }
  `]
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() variant: ButtonVariant = 'secondary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() block: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClass(): string {
    const classes = ['btn'];

    // Variant
    if (this.variant === 'primary') classes.push('btn-primary');
    else if (this.variant === 'success') classes.push('btn-success');
    else if (this.variant === 'error') classes.push('btn-error');
    else if (this.variant === 'ghost') classes.push('btn-ghost');

    // Size
    if (this.size === 'sm') classes.push('btn-sm');
    else if (this.size === 'lg') classes.push('btn-lg');

    // Block
    if (this.block) classes.push('btn-block');

    return classes.join(' ');
  }
}
