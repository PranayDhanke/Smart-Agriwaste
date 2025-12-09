"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 🧱 Import your WasteItem type
type WasteType = "crop" | "fruit" | "vegetable" | "livestock" | "plastic" | "organic";

interface SellerInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
  farmerId?: string; // Clerk or MongoDB reference
}

interface WasteItem {
  _id: string;
  title: string; // short title of listing
  wasteType: WasteType;
  wasteProduct: string; // e.g., "Banana Peels", "Paddy Straw"
  quantity: string; // e.g., "100 kg"
  moisture: string; // e.g., "20%"
  price: string; // per unit price (₹/kg or total)
  unit?: string; // e.g., "kg", "ton"
  totalPrice?: string; // optional (price × quantity)
  location: string;
  description: string;
  imageUrl: string;
  availability: "available" | "sold" | "reserved";
  qualityGrade?: "A" | "B" | "C"; // optional quality grade
  seller: SellerInfo;
  buyer?: {
    name: string;
    email: string;
    phone: string;
    buyerId?: string;
  };
  createdAt: string;
  updatedAt?: string;
  deliveryOptions?: {
    pickup: boolean;
    delivery: boolean;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

type CartItem = WasteItem & {
  quantitySelected: number; // buyer-selected quantity
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: WasteItem, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage (for persistence)
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (item: WasteItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);
      if (existing) {
        return prev.map((p) =>
          p._id === item._id
            ? { ...p, quantitySelected: p.quantitySelected + quantity }
            : p
        );
      } else {
        return [...prev, { ...item, quantitySelected: quantity }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // Clear all items
  const clearCart = () => setCart([]);

  // Update quantity manually
  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantitySelected: quantity } : item
      )
    );
  };

  // Calculate total amount
  const totalAmount = cart.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantitySelected,
    0
  );

  // Total number of items
  const totalItems = cart.reduce((acc, item) => acc + item.quantitySelected, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
