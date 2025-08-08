import { Injectable, NotFoundException,Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShopService {
     private readonly logger = new Logger(ShopService.name);
  constructor(private prisma: PrismaService) {}


  async create(data: any) {
    try {
      this.logger.debug(`Creating shop: ${JSON.stringify(data)}`);

      // Filter out invalid fields that don't exist in the Shop model
      const validData: any = {
        name: data.name,
        location: data.location,
        description: data.description,
        managerId: data.managerId,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      // Remove undefined fields
      Object.keys(validData).forEach(key => {
        if (validData[key] === undefined) {
          delete validData[key];
        }
      });

      this.logger.debug(`Filtered shop data: ${JSON.stringify(validData)}`);

      return this.prisma.shop.create({
        data: validData,
        include: {
          manager: {
            select: { id: true, username: true, fullName: true, role: true }
          },
          users: {
            select: { id: true, username: true, fullName: true, role: true }
          }
        }
      });
    } catch (error: any) {
      this.logger.error(`Failed to create shop: ${error.message}`);
      throw new BadRequestException(`Failed to create shop: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.shop.findMany({
      include: {
        manager: {
          select: { id: true, username: true, fullName: true, role: true }
        },
        users: {
          select: { id: true, username: true, fullName: true, role: true }
        },
        productAssignments: {
          include: {
            product: {
              include: { category: true }
            }
          }
        },
        _count: {
          select: { users: true, productAssignments: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, username: true, fullName: true, role: true }
        },
        users: {
          select: { id: true, username: true, fullName: true, role: true }
        },
        productAssignments: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(id: string, data: Prisma.ShopUpdateInput) {
    return this.prisma.shop.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.shop.delete({ where: { id } });
  }

  async getShopReport(shopId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        users: true,
        productAssignments: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!shop) throw new NotFoundException('Shop not found');

    return {
      shop,
      totalUsers: shop.users?.length || 0,
      totalProductAssignments: shop.productAssignments?.length || 0
    };
  }
}
