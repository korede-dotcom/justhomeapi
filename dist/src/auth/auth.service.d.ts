import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService);
    validateUser(username: string, password: string): Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        fullName: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        lastLogin: Date | null;
        createdBy: string;
        shopId: string | null;
        warehouseId: string | null;
    } | null>;
    login({ username, password }: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            fullName: string;
            isActive: boolean;
            shopId: string | null;
        };
        message: string;
    } | null>;
}
