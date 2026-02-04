import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserRoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'USER' })
  name!: string;
}

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Иван' })
  firstName!: string;

  @ApiProperty({ example: 'Иванов' })
  lastName!: string;

  @ApiPropertyOptional({ example: 'Иванович' })
  patronymic!: string | null;

  @ApiProperty({ example: 'Иванов Иван Иванович' })
  fullName!: string;

  @ApiProperty({ type: AuthUserRoleDto })
  role!: AuthUserRoleDto;
}
