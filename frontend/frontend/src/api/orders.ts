import { api } from "./client";
import type { Order } from "./types";

export type CreateOrderInput = {
  customerId: number;
  items: { productId: number; quantity: number }[];
};

export const ordersApi = {
  list: () => api.get<Order[]>("/orders"),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (data: CreateOrderInput) => api.post<Order>("/orders", data),
};
