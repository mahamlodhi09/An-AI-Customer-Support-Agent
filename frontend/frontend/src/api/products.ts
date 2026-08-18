import { api } from "./client";
import type { Product } from "./types";

export type ProductInput = {
  title: string;
  price: number;
  category: string;
  description: string;
};

export const productsApi = {
  list: () => api.get<Product[]>("/products"),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: ProductInput) => api.post<Product>("/products", data),
  update: (id: number, data: Partial<ProductInput>) =>
    api.patch<Product>(`/products/${id}`, data),
  remove: (id: number) => api.delete<Product>(`/products/${id}`),
};
