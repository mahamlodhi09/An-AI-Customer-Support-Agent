import { api } from "./client";
import type { Refund, RefundStatus } from "./types";

export type CreateRefundInput = {
  orderId: number;
  amount: number;
  reason: string;
};

export type UpdateRefundInput = Partial<{
  amount: number;
  reason: string;
  status: RefundStatus;
}>;

export const refundsApi = {
  list: () => api.get<Refund[]>("/refunds"),
  get: (id: number) => api.get<Refund>(`/refunds/${id}`),
  create: (data: CreateRefundInput) => api.post<Refund>("/refunds", data),
  update: (id: number, data: UpdateRefundInput) =>
    api.patch<Refund>(`/refunds/${id}`, data),
};
