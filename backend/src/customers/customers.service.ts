import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCustomerDto) {
    return this.prisma.customer.create({ data });
  }

  findAll() {
    return this.prisma.customer.findMany();
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async remove(id: number) {
    try {
      return await this.prisma.customer.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Customer #${id} not found.`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            "This customer has existing orders or support tickets and can't be deleted.",
          );
        }
      }
      throw error;
    }
  }
}