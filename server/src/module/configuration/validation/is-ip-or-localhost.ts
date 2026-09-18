import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isIP } from 'validator';

function isHostname(value: string): boolean {
  const hostnamePattern =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/i;
  return hostnamePattern.test(value);
}

function isValidHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

@ValidatorConstraint({ name: 'isCorsOriginValue', async: false })
export class IsCorsOriginValueConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return false;
    }

    const trimmed = value.trim();

    if (trimmed === 'localhost') {
      return true;
    }

    if (isIP(trimmed)) {
      return true;
    }

    if (isHostname(trimmed)) {
      return true;
    }

    if (isValidHttpOrigin(trimmed)) {
      return true;
    }

    return false;
  }

  defaultMessage(): string {
    return (
      'Значение ($value) должно быть IP-адресом, "localhost", валидным ' +
      'хостнеймом (example.com) или полным origin (http://localhost:3000)'
    );
  }
}

export function IsCorsOriginValue(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      constraints: [],
      validator: IsCorsOriginValueConstraint,
    });
  };
}
