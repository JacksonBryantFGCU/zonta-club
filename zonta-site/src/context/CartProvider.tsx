// zonta-site/src/context/CartProvider.tsx

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { CartContext } from "./CartContext";

export interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  //  Persist cart between reloads
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  //  Add or update item
  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        // Increment quantity if item already exists
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Otherwise add as new item
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const decreaseItem = (id: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i._id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i._id !== id));

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const toggleCart = () => setIsCartOpen((p) => !p);

  //  Compute total cost
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  //  Compute total item count (sum of quantities)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const value = {
    items,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
    isCartOpen,
    toggleCart,
    total,
    totalItems, //  new field
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
