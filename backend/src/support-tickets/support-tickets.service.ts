import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSupportTicketDto) {
    return this.prisma.supportTicket.create({ data });
  }

  findAll() {
    return this.prisma.supportTicket.findMany({
      include: { customer: true, order: true },
    });
  }

  findOne(id: number) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: { customer: true, order: true },
    });
  }

  update(id: number, data: UpdateSupportTicketDto) {
    return this.prisma.supportTicket.update({ where: { id }, data });
  }
}