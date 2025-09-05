import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export class ValidationService {
  
  // Custom validator for minimum and maximum selectable services
  static minMaxServiceValidator(minControl: string, maxControl: string): ValidatorFn {
    return (controls: AbstractControl): ValidationErrors | null => {
      const min = controls.get(minControl);
      const max = controls.get(maxControl);

      if (min?.errors && !min.errors['minMaxInvalid']) {
        return null;
      }

      if (max?.errors && !max.errors['minMaxInvalid']) {
        return null;
      }

      if (min?.value && max?.value && min.value > max.value) {
        const error = { minMaxInvalid: true };
        min.setErrors(error);
        max.setErrors(error);
        return error;
      } else {
        if (min?.hasError('minMaxInvalid')) {
          min.setErrors(null);
        }
        if (max?.hasError('minMaxInvalid')) {
          max.setErrors(null);
        }
        return null;
      }
    };
  }

  // Custom validator for extension fee when complimentary is selected
  static extensionFeeValidator(complimentaryControl: string, feeControl: string): ValidatorFn {
    return (controls: AbstractControl): ValidationErrors | null => {
      const complimentary = controls.get(complimentaryControl);
      const fee = controls.get(feeControl);

      // Add null checks before calling setErrors
      if (complimentary?.value && fee?.value > 0 && fee) {
        fee.setErrors({ shouldBeZero: true });
        return { shouldBeZero: true };
      } else {
        if (fee?.hasError('shouldBeZero') && fee) {
          fee.setErrors(null);
        }
        return null;
      }
    };
  }

  // Package name validator (no special characters)
  static packageNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      return hasSpecialChar ? { hasSpecialChar: true } : null;
    };
  }

  // Sequence number validator
  static sequenceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      return value > 0 && value <= 100 ? null : { invalidSequence: true };
    };
  }
}
