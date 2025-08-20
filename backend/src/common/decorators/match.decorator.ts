import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Simple decorator to check if two fields match.
 * Usage: @Match('newPassword', { message: 'Passwords do not match' })
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const relatedPropertyName = args.constraints[0] as string; // ✅ explicitly cast
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          return value === relatedValue;
        },
      },
    });
  };
}
