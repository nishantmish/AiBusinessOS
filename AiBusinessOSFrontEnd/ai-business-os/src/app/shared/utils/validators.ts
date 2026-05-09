import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

/**
 * Custom validators for forms
 */

export class CustomValidators {
  /**
   * Validate email format
   */
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

  /**
   * Validate password strength (min 8 chars, 1 uppercase, 1 number)
   */
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const password = control.value;
      const errors: ValidationErrors = {};

      if (password.length < 8) errors['minLength'] = true;
      if (!/[A-Z]/.test(password)) errors['uppercase'] = true;
      if (!/\d/.test(password)) errors['number'] = true;
      if (!/[!@#$%^&*]/.test(password)) errors['special'] = true;

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Validate phone number
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
      const valid = phoneRegex.test(control.value.replace(/\s/g, ''));
      return valid ? null : { invalidPhone: true };
    };
  }

  /**
   * Validate URL
   */
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      try {
        new URL(control.value);
        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  /**
   * Validate that passwords match
   */
  static passwordMatch(passwordControl: string, confirmPasswordControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordControl);
      const confirmPassword = control.get(confirmPasswordControl);

      if (!password || !confirmPassword) return null;

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  /**
   * Min value validator
   */
  static minValue(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = parseFloat(control.value);
      return value >= min ? null : { minValue: { min, actual: value } };
    };
  }

  /**
   * Max value validator
   */
  static maxValue(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = parseFloat(control.value);
      return value <= max ? null : { maxValue: { max, actual: value } };
    };
  }

  /**
   * Validate no special characters
   */
  static noSpecialCharacters(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const regex = /^[a-zA-Z0-9\s\-]*$/;
      return regex.test(control.value) ? null : { specialCharacters: true };
    };
  }

  /**
   * Validate alphanumeric only
   */
  static alphanumeric(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const regex = /^[a-zA-Z0-9]*$/;
      return regex.test(control.value) ? null : { alphanumeric: true };
    };
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(errors: ValidationErrors | null, fieldName: string = 'Field'): string {
    if (!errors) return '';

    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength']) return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['invalidEmail']) return 'Please enter a valid email address';
    if (errors['minLength']) return `${fieldName} must be at least 8 characters`;
    if (errors['uppercase']) return `${fieldName} must contain at least one uppercase letter`;
    if (errors['number']) return `${fieldName} must contain at least one number`;
    if (errors['special']) return `${fieldName} must contain at least one special character`;
    if (errors['invalidPhone']) return 'Please enter a valid phone number';
    if (errors['invalidUrl']) return 'Please enter a valid URL';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    if (errors['minValue']) return `${fieldName} must be at least ${errors['minValue'].min}`;
    if (errors['maxValue']) return `${fieldName} cannot exceed ${errors['maxValue'].max}`;
    if (errors['specialCharacters']) return `${fieldName} cannot contain special characters`;
    if (errors['alphanumeric']) return `${fieldName} can only contain letters and numbers`;
    if (errors['pattern']) return `${fieldName} format is invalid`;

    return 'This field has an error';
  }
}
