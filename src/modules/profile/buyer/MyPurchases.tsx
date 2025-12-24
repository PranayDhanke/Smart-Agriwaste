"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  Eye,
  Truck,
  Clock,
  XCircle,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { Order } from "@/components/types/orders";

/* ------------------ Helpers ------------------ */

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const calcOrderAmount = (items: Order["items"]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/* ------------------ Page ------------------ */

export default function BuyerPurchasesPage() {
  const [search, setSearch] = useState("");
  const [purchases] = useState<Order[]>([]); // fetch later

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="h-6 w-6" />
            My Orders
          </h1>

          <Link href="/profile/buyer/negotiations">
            <Button size="sm" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Negotiations
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or product"
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {purchases.map((order) => {
            const canCancel =
              order.status !== "cancelled" &&
              !order.isDelivered &&
              !order.isOutForDelivery;

            return (
              <Card key={order._id}>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      Order #{order._id}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Farmer:{" "}
                      <b>{order.items[0]?.sellerInfo.seller.farmerName}</b>{" "}
                      • {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Delivery Status */}
                  <div>
                    {order.isOutForDelivery ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Truck className="h-3 w-3 mr-1" />
                        {order.deliveryMode === "PICKUPBYBUYER"
                          ? "Out for Pickup"
                          : "Out for Delivery"}
                      </Badge>
                    ) : order.status === "cancelled" ? (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Processing
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Items */}
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.title} × {item.quantity} {item.unit}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-700">
                      ₹{calcOrderAmount(order.items)}
                    </span>
                  </div>

                  {/* Delivery Info */}
                  <div className="text-xs text-muted-foreground">
                    Delivery Mode:{" "}
                    <b>
                      {order.deliveryMode === "PICKUPBYBUYER"
                        ? "Pickup by You"
                        : "Delivered by Farmer"}
                    </b>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* View */}
                    <Link href={`/buyer/orders/${order._id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>

                    {/* Cancel */}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          console.log("Cancel order:", order._id)
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Order
                      </Button>
                    )}

                    {/* Out for Pickup */}
                    {order.deliveryMode === "PICKUPBYBUYER" &&
                      !order.isOutForDelivery &&
                      !order.isDelivered &&
                      order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() =>
                            console.log("Out for pickup:", order._id)
                          }
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Out for Pickup
                        </Button>
                      )}

                    {/* Complete Payment */}
                    {!order.hasPayment &&
                      order.transactionMode !== "COD" &&
                      order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() =>
                            console.log("Complete payment:", order._id)
                          }
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Complete Payment
                        </Button>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
