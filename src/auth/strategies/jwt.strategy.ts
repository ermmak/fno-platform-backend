import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { computeFullName } from '../../common/utils/compute-full-name';

export interface JwtPayload {
  sub: string;
  email: string;
  // Note: role is included for convenience but NOT used for authorization.
  // The authoritative role is always loaded from the database via findById().
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const issuer = configService.get<string>('JWT_ISSUER') ?? 'fno-platform';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer,
    });
  }

  async validate(payload: JwtPayload) {
    // Always fetch fresh user data from DB to ensure role changes are reflected
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      patronymic: user.patronymic,
      fullName: computeFullName(user),
      role: user.role,
    };
  }
}
