import { Controller, Post, Body } from '@nestjs/common';
import { ChatService, ChatTurn } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body('message') message: string,
    @Body('history') history: ChatTurn[] = [],
  ) {
    const reply = await this.chatService.sendMessage(message, history);
    return { reply };
  }
}