"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { FiShoppingCart } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import CartDrawer from "../marketplace/CartDrawer";
import { useCart } from "@/components/hooks/useCart";
import { cn } from "@/lib/utils";

export default function FloatingCart() {
  const { isSignedIn, user } = useUser();
  const { cartItems } = useCart();
  const [open, setOpen] = useState(false);

  const role = user?.unsafeMetadata?.role;

  if (!isSignedIn || role !== "buyer") return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Floating Button */}
      <SheetTrigger asChild>
        <button
          className={cn(
            "fixed bottom-5 right-5 z-[100] flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white shadow-lg transition",
            open ? "opacity-0 pointer-events-none" : "hover:bg-green-700"
          )}
          aria-label="Open cart"
        >
          <FiShoppingCart className="h-6 w-6" />

          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-xs flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </SheetTrigger>

      {/* Cart Drawer */}
      <SheetContent side="right" className="p-2 w-[340px] sm:w-[500px]">
        <SheetTitle>Your Cart</SheetTitle>
        <CartDrawer />
      </SheetContent>
    </Sheet>
  );
}
