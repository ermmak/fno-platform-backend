import {
  IsString,
  MaxLength,
  IsOptional,
  IsEmail,
  IsUUID,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsValidIIN } from '../../common/validators';

/**
 * Policy for UpdateUserDto:
 * - `null` values are converted to `undefined` (no change) for required fields
 * - Empty strings are rejected with validation error for required fields
 * - `patronymic` exception: `null` clears it, empty string after trim becomes `null`
 */

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  @Transform(
    ({ value }: { value: unknown }) => {
      if (value === null) return undefined;
      return typeof value === 'string' ? value.toLowerCase().trim() : value;
    },
    { toClassOnly: true },
  )
  email?: string;

  @ApiPropertyOptional({ example: 'Иван' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'firstName cannot be empty' })
  @MaxLength(100)
  @Transform(
    ({ value }: { value: unknown }) => {
      if (value === null) return undefined;
      return typeof value === 'string' ? value.trim() : value;
    },
    { toClassOnly: true },
  )
  firstName?: string;

  @ApiPropertyOptional({ example: 'Иванов' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'lastName cannot be empty' })
  @MaxLength(100)
  @Transform(
    ({ value }: { value: unknown }) => {
      if (value === null) return undefined;
      return typeof value === 'string' ? value.trim() : value;
    },
    { toClassOnly: true },
  )
  lastName?: string;

  @ApiPropertyOptional({
    example: 'Иванович',
    nullable: true,
    description: 'Set to null to clear',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(
    ({ value }: { value: unknown }) => {
      if (value === null) return null; // Preserve null to allow clearing
      return typeof value === 'string' ? value.trim() || null : value;
    },
    { toClassOnly: true },
  )
  patronymic?: string | null;

  @ApiPropertyOptional({
    example: '880125301713',
    description: 'Kazakhstan IIN (12 digits)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{12}$/, { message: 'IIN must be exactly 12 digits' })
  @IsValidIIN()
  @Transform(
    ({ value }: { value: unknown }) => (value === null ? undefined : value),
    { toClassOnly: true },
  )
  iin?: string;

  @ApiPropertyOptional({ description: 'Role ID (UUID)' })
  @IsOptional()
  @IsUUID()
  @Transform(
    ({ value }: { value: unknown }) => (value === null ? undefined : value),
    { toClassOnly: true },
  )
  roleId?: string;
}
