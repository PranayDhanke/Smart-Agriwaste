"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/components/hooks/useCart";

export default function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, getTotalAmount } =
    useCart();

  /* ---------------- Empty State ---------------- */
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Add products to place an order
        </p>

        <Link href="/marketplace">
          <Button className="px-6">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ---------------- Cart Items ---------------- */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {cartItems.map((item) => (
          <div key={item.prodId} className="space-y-3">
            <div className="flex gap-3">
              {/* Product Image */}
              <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden border bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight line-clamp-2">
                  {item.title}
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                  ₹{item.price} / {item.unit}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      updateQuantity(item.prodId, item.quantity - 1 , item.maxQuantity)
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span className="min-w-[24px] text-center text-sm font-medium">
                    {item.quantity}
                  </span>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.prodId, item.quantity + 1 , item.maxQuantity)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Remove */}
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-red-500"
                onClick={() => removeFromCart(item.prodId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Separator />
          </div>
        ))}
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="sticky bottom-0 bg-background pt-4 space-y-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-base font-semibold text-green-700">
            ₹{getTotalAmount()}
          </span>
        </div>

        <Button size="lg" className="w-full">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
