import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    // Guard extracts values before validation pipe runs
    // Handle potential undefined/non-string gracefully
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.authService.validateUser(
      email.toLowerCase().trim(),
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
