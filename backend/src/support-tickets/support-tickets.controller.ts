import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { SupportTicketsService } from './support-tickets.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';

@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  create(@Body() createSupportTicketDto: CreateSupportTicketDto) {
    return this.supportTicketsService.create(createSupportTicketDto);
  }

  @Get()
  findAll() {
    return this.supportTicketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supportTicketsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupportTicketDto: UpdateSupportTicketDto,
  ) {
    return this.supportTicketsService.update(id, updateSupportTicketDto);
  }
}