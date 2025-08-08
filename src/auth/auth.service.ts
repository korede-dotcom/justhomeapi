import { Injectable, Logger } from '@nestjs/common';
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
    if (user && await bcrypt.compare(password, user.password)) return user;
    return null;
  }



  async login({ username, password }: LoginDto) {
    try {
      const user = await this.validateUser(username, password);
      if (!user) return null;
      let payload = { sub: user.id, username: user.username, role: user.role, shopId: user.shopId };
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
        },
        message: 'Login successful',
      };
      
    } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.logger.error('Login failed', err.stack);
    throw new Error('Login failed');
    }
  }
}
