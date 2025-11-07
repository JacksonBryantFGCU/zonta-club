// zonta-server/src/types/order.d.ts

export interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

export interface PdfOrder {
  _id: string;
  customerName: string;
  customerEmail: string;
  createdAt: string | Date;
  total: number;
  items: OrderItem[];
}