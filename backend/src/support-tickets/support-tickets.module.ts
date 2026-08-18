import { Module } from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { SupportTicketsController } from './support-tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupportTicketsController],
  providers: [SupportTicketsService],
})
export class SupportTicketsModule {}