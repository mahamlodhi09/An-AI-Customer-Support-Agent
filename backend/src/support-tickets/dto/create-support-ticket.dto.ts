export class CreateSupportTicketDto {
  customerId: number;
  orderId?: number;
  message: string;
}