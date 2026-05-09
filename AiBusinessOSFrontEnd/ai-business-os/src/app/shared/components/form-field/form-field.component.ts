import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
export type FieldVariant = 'default' | 'success' | 'error' | 'warning';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FormFieldComponent,
      multi: true
    }
  ],
  template: `
    <div class="form-field" [class.form-field-error]="variant === 'error'">
      <label *ngIf="label" class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-error">*</span>
      </label>

      <div *ngIf="type === 'select'" class="form-select-wrapper">
        <select
          class="form-control"
          [class]="getInputClass()"
          [value]="value"
          (change)="onValueChange($event)"
          [disabled]="disabled"
        >
          <option value="">{{ placeholder }}</option>
          <option *ngFor="let opt of options" [value]="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <textarea
        *ngIf="type === 'textarea'"
        class="form-control"
        [class]="getInputClass()"
        [value]="value"
        (input)="onValueChange($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [rows]="rows"
      ></textarea>

      <input
        *ngIf="type !== 'textarea' && type !== 'select'"
        [type]="type"
        class="form-control"
        [class]="getInputClass()"
        [value]="value"
        (input)="onValueChange($event)"
        [placeholder]="placeholder"
        [disabled]="disabled"
      />

      <div *ngIf="error" class="form-error">{{ error }}</div>
      <div *ngIf="hint" class="form-hint">{{ hint }}</div>
    </div>
  `,
  styles: [`
    .form-field-error {
      .form-control {
        border-color: var(--color-error);

        &:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
      }
    }

    .form-select-wrapper {
      position: relative;
    }

    .form-error {
      font-size: var(--font-size-xs);
      color: var(--color-error);
      margin-top: 4px;
    }

    .form-hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      margin-top: 4px;
    }
  `]
})
export class FormFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: FieldType = 'text';
  @Input() variant: FieldVariant = 'default';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() error: string = '';
  @Input() hint: string = '';
  @Input() rows: number = 4;
  @Input() options: Array<{ label: string; value: any }> = [];
  @Output() valueChange = new EventEmitter<any>();

  value: any = '';
  onChange = (val: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  getInputClass(): string {
    const classes = [];
    if (this.variant === 'error') classes.push('form-control-error');
    else if (this.variant === 'success') classes.push('form-control-success');
    else if (this.variant === 'warning') classes.push('form-control-warning');
    return classes.join(' ');
  }
}
