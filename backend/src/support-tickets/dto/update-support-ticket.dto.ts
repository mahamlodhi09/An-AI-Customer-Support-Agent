export class UpdateSupportTicketDto {
  message?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}