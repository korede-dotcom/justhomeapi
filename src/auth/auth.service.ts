import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      this.logger.warn(`Login attempt with non-existent username: ${username}`);
      return null;
    }

    if (!user.isActive) {
      this.logger.warn(`Login attempt by inactive user: ${username} (ID: ${user.id})`);
      throw new UnauthorizedException('Account is deactivated. Please contact administrator.');
    }

    if (await bcrypt.compare(password, user.password)) {
      this.logger.log(`Successful login for user: ${username} (ID: ${user.id})`);
      return user;
    }

    this.logger.warn(`Login attempt with incorrect password for user: ${username}`);
    return null;
  }



  async login({ username, password }: LoginDto) {
    try {
      this.logger.debug(`Login attempt for username: ${username}`);

      const user = await this.validateUser(username, password);
      if (!user) {
        this.logger.warn(`Failed login attempt for username: ${username}`);
        return null;
      }

      // Double-check user is active (additional safety check)
      if (!user.isActive) {
        this.logger.error(`Inactive user somehow passed validation: ${username} (ID: ${user.id})`);
        throw new UnauthorizedException('Account is deactivated. Please contact administrator.');
      }

      // Update last login timestamp
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      let payload = { sub: user.id, username: user.username, role: user.role, shopId: user.shopId };

      this.logger.log(`Successful login completed for user: ${username} (ID: ${user.id}, Role: ${user.role})`);

      return {
        access_token: this.jwt.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          isActive: user.isActive,
          shopId: user.shopId,
          lastLogin: new Date(),
        },
        message: 'Login successful',
      };

    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Login failed for username: ${username}`, err.stack);
      throw new Error('Login failed');
    }
  }
}
