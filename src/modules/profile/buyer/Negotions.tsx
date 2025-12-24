"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  TrendingDown,
  Droplets,
  User,
  IndianRupee,
  Package,
  Clock,
} from "lucide-react";
import { CartItem, Negotiation } from "@/components/types/orders";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { WasteItem } from "@/components/types/marketplace";
import NegotiationPanel from "@/modules/marketplace/NegotiationPanel";
import { useCart } from "@/components/hooks/useCart";

/* ---------------- Helper ---------------- */

function StatBox({
  icon,
  label,
  value,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "default" | "success" | "danger";
}) {
  const styles = {
    default: "bg-muted border-border",
    success: "bg-green-50 border-green-200 text-green-900",
    danger: "bg-red-50 border-red-200 text-red-900",
  };

  return (
    <div className={`rounded-lg border p-3 ${styles[variant]}`}>
      <div className="flex items-center gap-2 text-xs font-medium">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function BuyerNegotiationsPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const { user } = useUser();

  const [negotiationItem, setNegotiationItem] = useState<WasteItem | null>(
    null
  );

  const { addToCart } = useCart();

  const handleNegotiate = (item: WasteItem) => {
    setNegotiationItem(item);
  };

  const handleCart = (item: Negotiation) => {
    const cartItem: CartItem = {
      description: item.item.description,
      image: item.item.image,
      maxQuantity: item.item.maxQuantity,
      moisture: item.item.moisture,
      prodId: item.item.prodId,
      quantity: item.item.quantity,
      sellerInfo: item.item.sellerInfo,
      title: item.item.title,
      unit: item.item.unit,
      wasteProduct: item.item.wasteProduct,
      wasteType: item.item.wasteType,
      price: item.negotiatedPrice,
    };

    addToCart(cartItem);
    toast.success("Item added to cart");
  };

  useEffect(() => {
    const buyerId = user?.id.replace(/^user_/, "buy_");

    const loadNegotiations = async () => {
      try {
        const res = await axios.get(`/api/negotiate/getBuyer/${buyerId}`);
        setNegotiations(res.data || []);
      } catch {
        toast.error("Failed to load negotiations");
      }
    };

    if (buyerId) loadNegotiations();
  }, [user?.id]);

  const priceChange = (neg: Negotiation) => {
    const diff = neg.negotiatedPrice - neg.item.price;
    const percent = ((diff / neg.item.price) * 100).toFixed(1);
    return { diff, percent };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Negotiations
          </h1>
          <p className="text-muted-foreground">
            Track farmer responses and take action when available
          </p>
        </div>

        {/* Empty State */}
        {negotiations.length === 0 && (
          <Card className="border-dashed border-2">
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No negotiations yet</p>
              <p className="text-sm text-muted-foreground">
                Your negotiation requests will appear here
              </p>
            </div>
          </Card>
        )}

        {/* List */}
        <div className="space-y-6">
          {negotiations.map((neg) => {
            const { diff, percent } = priceChange(neg);
            const isDiscount = diff < 0;

            return (
              <Card
                key={neg._id}
                className="overflow-hidden border hover:shadow-md transition"
              >
                <div className="grid md:grid-cols-[260px_1fr]">
                  {/* Image */}
                  <div className="relative h-56 md:h-full bg-muted">
                    <Image
                      src={neg.item.image}
                      alt={neg.item.title}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className="absolute top-3 right-3 shadow"
                      variant={
                        neg.status === "pending"
                          ? "secondary"
                          : neg.status === "accepted"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {neg.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold">{neg.item.title}</h2>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Farmer:{" "}
                        <span className="font-medium text-foreground">
                          {neg.item.sellerInfo.seller.farmerName}
                        </span>
                      </p>
                    </div>

                    <Separator />

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <StatBox
                        icon={<IndianRupee className="h-4 w-4" />}
                        label="Listed Price"
                        value={`₹${neg.item.price}`}
                      />
                      <StatBox
                        icon={<TrendingDown className="h-4 w-4" />}
                        label="Your Offer"
                        value={`₹${neg.negotiatedPrice}`}
                        variant={isDiscount ? "danger" : "success"}
                      />
                      <StatBox
                        icon={<Droplets className="h-4 w-4" />}
                        label="Moisture"
                        value={neg.item.moisture}
                      />
                    </div>

                    {/* Info */}
                    {isDiscount && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                        You requested{" "}
                        <span className="font-bold text-amber-800">
                          {percent}%
                        </span>{" "}
                        lower price
                        <span className="ml-1 text-muted-foreground">
                          (₹{Math.abs(diff)} difference)
                        </span>
                      </div>
                    )}

                    {/* Buyer Actions */}
                    <div className="pt-4 border-t">
                      {neg.status === "pending" && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Waiting for farmer response
                        </div>
                      )}

                      {neg.status === "accepted" && (
                        <Button
                          onClick={() => handleCart(neg)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Place Order
                        </Button>
                      )}

                      {neg.status === "rejected" && (
                        <Button
                          onClick={() =>
                            handleNegotiate({
                              _id: neg.item.prodId,
                              title: neg.item.title,
                              wasteType: neg.item.wasteType || "crop",
                              wasteProduct: neg.item.wasteProduct,
                              quantity: neg.item.quantity,
                              unit: neg.item.unit || "kg",
                              address: neg.item.sellerInfo.address,
                              moisture: neg.item.moisture,
                              price: neg.item.price,
                              description: neg.item.description,
                              imageUrl: neg.item.image,
                              seller: {
                                farmerId: neg.item.sellerInfo.seller.farmerId,
                                name: neg.item.sellerInfo.seller.farmerName,
                              },
                            })
                          }
                          variant="outline"
                          className="w-full"
                        >
                          Send New Negotiation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <section>
        {negotiationItem && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setNegotiationItem(null)}
            />

            {/* Modal */}
            <NegotiationPanel
              item={negotiationItem}
              onClose={() => setNegotiationItem(null)}
            />
          </>
        )}
      </section>
    </div>
  );
}
