import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div *ngIf="header || title" class="card-header">
        <div>
          <div *ngIf="title" class="card-title">{{ title }}</div>
          <div *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</div>
        </div>
        <div class="ms-auto">
          <ng-content select="[card-actions]"></ng-content>
        </div>
      </div>
      <ng-content select="[card-header]"></ng-content>

      <div class="card-body">
        <ng-content></ng-content>
      </div>

      <div *ngIf="footer" class="card-footer">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .ms-auto {
      margin-left: auto;
    }
  `]
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() header: boolean = false;
  @Input() footer: boolean = false;
}
