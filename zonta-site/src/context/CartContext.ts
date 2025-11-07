// zonta-site/src/context/CartContext.ts

import { createContext } from "react";

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  decreaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  total: number;
  totalItems: number;
}

export const CartContext = createContext<CartContextType | null>(null);