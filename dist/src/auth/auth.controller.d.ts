import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string;
            isActive: true;
            shopId: string | null;
            lastLogin: Date;
        };
        message: string;
    }>;
}
