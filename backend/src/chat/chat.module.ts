import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { RefundsModule } from '../refunds/refunds.module';
import { CustomersModule } from '../customers/customers.module';
import { SupportTicketsModule } from '../support-tickets/support-tickets.module';

@Module({
  imports: [
    OrdersModule,
    ProductsModule,
    RefundsModule,
    CustomersModule,
    SupportTicketsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}