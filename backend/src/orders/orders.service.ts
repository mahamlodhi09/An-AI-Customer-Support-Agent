import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        customerId: dto.customerId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        customer: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
      },
    });
  }
}