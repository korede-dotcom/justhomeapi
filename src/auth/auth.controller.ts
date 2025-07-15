import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
// ✅ Correct relative import
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.auth.login(dto);
    if (!result) throw new UnauthorizedException();
    return result;
  }
}
