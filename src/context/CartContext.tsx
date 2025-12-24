"use client";

import { CartItem } from "@/components/types/orders";
import  { createContext } from "react";

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

export const CartContext = createContext<CartContextType | undefined>(undefined);
