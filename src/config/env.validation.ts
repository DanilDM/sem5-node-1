import {
  IsInt,
  IsIn,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

import { plainToInstance, Type } from 'class-transformer';

export class EnvironmentVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  PORT: number;

  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @Type(() => Number)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors
        .map((error) =>
          Object.values(error.constraints ?? {}).join(', '),
        )
        .join('; ')}`,
    );
  }

  return validatedConfig;
}
