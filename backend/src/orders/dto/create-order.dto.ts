import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  customerId: number;
  items: CreateOrderItemDto[];
}