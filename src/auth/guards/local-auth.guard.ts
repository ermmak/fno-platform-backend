import {
  Injectable,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ body: unknown }>();

    // Validate request body before Passport processes it
    // Match global ValidationPipe behavior
    const loginDto = plainToInstance(LoginDto, request.body);
    const errors = await validate(loginDto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('; ');
      throw new BadRequestException(messages);
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
