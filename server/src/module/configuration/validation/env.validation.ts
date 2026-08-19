import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { EnvironmentVariables } from '../model';

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const variables = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(variables, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    const errorCount = errors.length;
    console.log(`Found ${errorCount} errors`);

    for (const error of errors) {
      console.log('Property', error.property, 'received value', error.value);
      if (!error.constraints) {
        continue;
      }

      for (const constraint of Object.keys(error.constraints)) {
        console.log(' - ', error.constraints[constraint]);
      }
    }

    throw new Error(`Validation is not successful`);
  }
  return variables;
}
