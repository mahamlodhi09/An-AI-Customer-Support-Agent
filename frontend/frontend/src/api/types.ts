export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: number;
  customerId: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  customer?: Customer;
}

export interface Refund {
  id: number;
  orderId: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  order?: Order;
}

export interface SupportTicket {
  id: number;
  customerId: number;
  orderId: number | null;
  message: string;
  status: TicketStatus;
  createdAt: string;
  customer?: Customer;
  order?: Order | null;
}
