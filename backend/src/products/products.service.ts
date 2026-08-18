import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }
  update(id: number, data: UpdateProductDto) {
  return this.prisma.product.update({
    where: { id },
    data,
  });
}
search(query: string) {
  return this.prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
}

 async remove(id: number) {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product #${id} not found.`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            "This product is used in one or more orders and can't be deleted.",
          );
        }
      }
      throw error;
    }
  }
}