import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Kazakhstan IIN (Individual Identification Number) Validator
 *
 * Validates the checksum using the official two-pass modulo 11 algorithm.
 * Reference: https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/Kazakhstan-TIN.pdf
 *
 * Note: This validates format and checksum only. It does NOT validate:
 * - Birth date validity (first 6 digits = YYMMDD)
 * - Gender/century digit validity (7th digit)
 * - Whether the IIN is actually assigned to a real person
 */
@ValidatorConstraint({ name: 'isValidIIN', async: false })
export class IsValidIINConstraint implements ValidatorConstraintInterface {
  validate(iin: string): boolean {
    // Format check: exactly 12 digits
    if (typeof iin !== 'string' || !/^\d{12}$/.test(iin)) {
      return false;
    }

    const digits = iin.split('').map(Number);
    const controlDigit = digits[11];

    // First pass weights: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let sum1 = 0;
    for (let i = 0; i < 11; i++) {
      sum1 += digits[i] * weights1[i];
    }
    const remainder1 = sum1 % 11;

    // If remainder is 0-9, it should equal the control digit
    if (remainder1 < 10) {
      return remainder1 === controlDigit;
    }

    // Second pass (only if remainder1 === 10)
    // Weights: 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    let sum2 = 0;
    for (let i = 0; i < 11; i++) {
      sum2 += digits[i] * weights2[i];
    }
    const remainder2 = sum2 % 11;

    // If second pass also yields 10, the IIN is invalid
    // (control digit must be 0-9)
    if (remainder2 === 10) {
      return false;
    }

    return remainder2 === controlDigit;
  }

  defaultMessage(): string {
    return 'IIN must be a valid 12-digit Kazakhstan Individual Identification Number';
  }
}

export function IsValidIIN(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidIINConstraint,
    });
  };
}
