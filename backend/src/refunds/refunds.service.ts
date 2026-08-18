import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';

@Injectable()
export class RefundsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRefundDto) {
    return this.prisma.refund.create({ data });
  }

  findAll() {
    return this.prisma.refund.findMany({ include: { order: true } });
  }

  findOne(id: number) {
    return this.prisma.refund.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  update(id: number, data: UpdateRefundDto) {
    return this.prisma.refund.update({ where: { id }, data });
  }
}