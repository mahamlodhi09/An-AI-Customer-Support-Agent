import { api } from "./client";
import type { SupportTicket, TicketStatus } from "./types";

export type CreateTicketInput = {
  customerId: number;
  orderId?: number;
  message: string;
};

export type UpdateTicketInput = Partial<{
  message: string;
  status: TicketStatus;
}>;

export const supportTicketsApi = {
  list: () => api.get<SupportTicket[]>("/support-tickets"),
  get: (id: number) => api.get<SupportTicket>(`/support-tickets/${id}`),
  create: (data: CreateTicketInput) =>
    api.post<SupportTicket>("/support-tickets", data),
  update: (id: number, data: UpdateTicketInput) =>
    api.patch<SupportTicket>(`/support-tickets/${id}`, data),
};
