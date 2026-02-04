import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { RegisterUserDto } from './dto/register-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { computeFullName } from '../common/utils/compute-full-name';
import { isUniqueConstraintOn } from '../common/utils/prisma-errors';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

// Select fields that exclude passwordHash, include role relation
const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  patronymic: true,
  iin: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type UserFromDb = Prisma.UserGetPayload<{ select: typeof userSelect }>;

function toUserResponse(user: UserFromDb): UserResponseDto {
  return {
    ...user,
    fullName: computeFullName(user),
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDefaultRoleId(): Promise<string> {
    const userRole = await this.prisma.userRole.findUnique({
      where: { name: 'USER' },
    });
    if (!userRole) {
      throw new InternalServerErrorException(
        'Default USER role not found. Please run database seed: npx prisma db seed',
      );
    }
    return userRole.id;
  }

  private handleUniqueConstraintError(
    error: Prisma.PrismaClientKnownRequestError,
  ): never {
    if (isUniqueConstraintOn(error, 'email')) {
      throw new ConflictException('Email already exists');
    }
    if (isUniqueConstraintOn(error, 'iin')) {
      throw new ConflictException('IIN already exists');
    }
    throw new ConflictException('User with this data already exists');
  }

  async register(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(registerUserDto.password, 10);
    const roleId = await this.getDefaultRoleId();

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerUserDto.email,
          passwordHash,
          firstName: registerUserDto.firstName,
          lastName: registerUserDto.lastName,
          patronymic: registerUserDto.patronymic,
          iin: registerUserDto.iin,
          roleId,
        },
        select: userSelect,
      });
      return toUserResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.handleUniqueConstraintError(error);
      }
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const roleId = createUserDto.roleId ?? (await this.getDefaultRoleId());

    // Validate roleId exists if provided
    if (createUserDto.roleId) {
      const roleExists = await this.prisma.userRole.findUnique({
        where: { id: createUserDto.roleId },
      });
      if (!roleExists) {
        throw new NotFoundException(
          `Role with ID ${createUserDto.roleId} not found`,
        );
      }
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          passwordHash,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          patronymic: createUserDto.patronymic,
          iin: createUserDto.iin,
          roleId,
        },
        select: userSelect,
      });
      return toUserResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.handleUniqueConstraintError(error);
      }
      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: userSelect,
    });
    return users.map(toUserResponse);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return toUserResponse(user);
  }

  async findById(id: string): Promise<UserFromDb | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  }

  async findByEmail(email: string): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    patronymic: string | null;
    iin: string;
    role: { id: string; name: string };
    isActive: boolean;
  } | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        patronymic: true,
        iin: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    await this.findOne(id); // Verify exists

    // Validate roleId exists if provided
    if (updateUserDto.roleId) {
      const roleExists = await this.prisma.userRole.findUnique({
        where: { id: updateUserDto.roleId },
      });
      if (!roleExists) {
        throw new NotFoundException(
          `Role with ID ${updateUserDto.roleId} not found`,
        );
      }
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: userSelect,
      });
      return toUserResponse(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.handleUniqueConstraintError(error);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<UserResponseDto> {
    await this.findOne(id); // Verify exists
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelect,
    });
    return toUserResponse(user);
  }
}
