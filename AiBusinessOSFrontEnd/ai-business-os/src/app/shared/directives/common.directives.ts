import { Directive, Input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

/**
 * Directive to show/hide element based on permission
 * Usage: *appHasPermission="'module_name'"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  @Input() set appHasPermission(module: string) {
    this.updateView(module);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissions: PermissionService
  ) {}

  private updateView(module: string): void {
    if (this.permissions.canAccess(module)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

/**
 * Directive to enable/disable based on permission
 * Usage: [appCanCreate]="'module_name'"
 */
@Directive({
  selector: '[appCanCreate]',
  standalone: true
})
export class CanCreateDirective {
  @Input() set appCanCreate(module: string) {
    const canCreate = this.permissions.canCreate(module);
    this.updateElement(canCreate);
  }

  constructor(
    private viewContainer: ViewContainerRef,
    private permissions: PermissionService
  ) {}

  private updateElement(canCreate: boolean): void {
    const element = this.viewContainer.element.nativeElement;
    if (!canCreate) {
      element.disabled = true;
      element.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      element.disabled = false;
      element.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

/**
 * Directive for click outside
 * Usage: (appClickOutside)="onClickOutside()"
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:touchstart)': 'onDocumentClick($event)'
  }
})
export class ClickOutsideDirective {
  @Input() appClickOutside?: () => void;

  constructor(private viewContainer: ViewContainerRef) {}

  onDocumentClick(event: MouseEvent | TouchEvent): void {
    const element = this.viewContainer.element.nativeElement;

    if (!element.contains(event.target) && this.appClickOutside) {
      this.appClickOutside();
    }
  }
}

/**
 * Export all directives
 */
export const SHARED_DIRECTIVES = [HasPermissionDirective, CanCreateDirective, ClickOutsideDirective];
