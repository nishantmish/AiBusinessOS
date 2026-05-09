import { Component, Input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div
      [class]="getAvatarClass()"
      [style.background]="background"
    >
      {{ initials }}
    </div>
  `,
  styles: [`
    div {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
    }
  `]
})
export class AvatarComponent {
  @Input() name: string = '';
  @Input() size: AvatarSize = 'md';
  @Input() background: string = 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  get initials(): string {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarClass(): string {
    return `avatar avatar-${this.size}`;
  }
}
