import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { RefundsModule } from '../refunds/refunds.module';

@Module({
  imports: [OrdersModule, ProductsModule, RefundsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}