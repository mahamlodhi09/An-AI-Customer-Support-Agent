export class CreateRefundDto {
  orderId: number;
  amount: number;
  reason: string;
}