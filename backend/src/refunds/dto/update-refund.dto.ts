export class UpdateRefundDto {
  amount?: number;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}