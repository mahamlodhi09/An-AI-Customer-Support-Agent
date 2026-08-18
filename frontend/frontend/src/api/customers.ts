import { api } from "./client";
import type { Customer } from "./types";

export type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export const customersApi = {
  list: () => api.get<Customer[]>("/customers"),
  get: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: CustomerInput) => api.post<Customer>("/customers", data),
  update: (id: number, data: Partial<CustomerInput>) =>
    api.patch<Customer>(`/customers/${id}`, data),
  remove: (id: number) => api.delete<Customer>(`/customers/${id}`),
};
