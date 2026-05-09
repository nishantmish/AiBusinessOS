import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onOverlayClick()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button
            class="btn btn-ghost"
            (click)="onClose()"
            style="margin-left: auto; width: 34px; padding: 0;"
          >
            <i class="ti ti-x"></i>
          </button>
        </div>

        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <div *ngIf="showFooter" class="modal-footer">
          <app-button
            *ngIf="showCancel"
            label="Cancel"
            variant="ghost"
            (onClick)="onClose()"
          ></app-button>
          <app-button
            *ngIf="showConfirm"
            [label]="confirmLabel"
            [variant]="confirmVariant"
            (onClick)="onConfirm()"
          ></app-button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showFooter: boolean = true;
  @Input() showCancel: boolean = true;
  @Input() showConfirm: boolean = true;
  @Input() confirmLabel: string = 'Confirm';
  @Input() confirmVariant: 'primary' | 'success' | 'error' | 'secondary' | 'ghost' = 'primary';
  @Input() closeOnOverlay: boolean = true;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onOverlayClick(): void {
    if (this.closeOnOverlay) {
      this.onClose();
    }
  }
}
