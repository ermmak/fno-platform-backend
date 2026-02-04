import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserRoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'USER' })
  name!: string;
}

export class UserResponseDto {
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

  @ApiProperty({
    example: 'Иванов Иван Иванович',
    description: 'Computed full name (lastName firstName patronymic)',
  })
  fullName!: string;

  @ApiProperty({ example: '880125301713' })
  iin!: string;

  @ApiProperty({ type: UserRoleResponseDto })
  role!: UserRoleResponseDto;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
