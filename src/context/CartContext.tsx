"use client";

import { CartItem } from "@/components/types/orders";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

/* ------------------ Types ------------------ */

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (prodId: string) => void;
  updateQuantity: (
    prodId: string,
    quantity: number,
    maxQuantity: number
  ) => void;
  clearCart: () => void;

  getTotalAmount: () => number;
  getTotalItems: () => number;
}

/* ------------------ Context ------------------ */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ------------------ Provider ------------------ */

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* ---------- Add ---------- */
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.prodId === item.prodId);

      // If already exists → update quantity
      if (exists) {
        return prev.map((i) =>
          i.prodId === item.prodId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });
  };

  /* ---------- Remove ---------- */
  const removeFromCart = (prodId: string) => {
    setCartItems((prev) => prev.filter((i) => i.prodId !== prodId));
  };

  /* ---------- Update Quantity ---------- */
  const updateQuantity = (
    prodId: string,
    quantity: number,
    maxQuantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(prodId);
      return;
    }

    if (quantity > maxQuantity) {
      toast.error(`Cannot exceed available stock of ${maxQuantity}.`);
      return;
    }

    setCartItems((prev) =>
      prev.map((i) => (i.prodId === prodId ? { ...i, quantity } : i))
    );
  };

  /* ---------- Clear ---------- */
  const clearCart = () => {
    setCartItems([]);
  };

  /* ---------- Derived Values ---------- */
  const getTotalAmount = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getTotalItems = () =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalAmount,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ------------------ Hook ------------------ */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
