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
  MessageCircle,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
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

const getStatusBadge = (order: Order) => {
  if (order.status === "cancelled") {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Cancelled
      </Badge>
    );
  }

  if (order.isDelivered) {
    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Delivered
      </Badge>
    );
  }

  if (order.isOutForDelivery) {
    return (
      <Badge className="bg-blue-100 text-blue-800">
        <Truck className="h-3 w-3 mr-1" />
        Out for Delivery
      </Badge>
    );
  }

  if (order.status === "confirmed") {
    return (
      <Badge className="bg-purple-100 text-purple-800">
        Confirmed
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-100 text-amber-800">
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
};

/* ------------------ Page ------------------ */

export default function FarmerOrdersPage() {
  const [search, setSearch] = useState("");
  const [orders] = useState<Order[]>([]); // replace with API

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q) ||
      o.items.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Incoming Orders
            </h1>
            <p className="text-sm text-muted-foreground">
              Orders placed by buyers for your products
            </p>
          </div>

          <Link href="/profile/farmer/negotiations">
            <Button size="sm" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Negotiations
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order, buyer, product"
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    Order #{order._id}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Buyer: <b>{order.buyerName}</b> •{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {getStatusBadge(order)}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Items */}
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.title} × {item.quantity} {item.unit}
                    </span>
                    <span className="font-medium">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-700">
                    ₹{calcOrderAmount(order.items)}
                  </span>
                </div>

                {/* Delivery Mode */}
                <div className="text-xs text-muted-foreground">
                  Delivery Mode:{" "}
                  <b>
                    {order.deliveryMode === "DELIVERYBYFARMER"
                      ? "Delivered by You"
                      : "Pickup by Buyer"}
                  </b>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {/* View */}
                  <Link href={`/farmer/orders/${order._id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>

                  {/* ACCEPT / REJECT (Only for DELIVERYBYFARMER & pending) */}
                  {order.deliveryMode === "DELIVERYBYFARMER" &&
                    order.status === "pending" && (
                      <>
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                  {/* Pickup by buyer info */}
                  {order.deliveryMode === "PICKUPBYBUYER" &&
                    !order.isDelivered && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Waiting for Buyer Pickup
                      </Badge>
                    )}

                  {/* Out for delivery */}
                  {order.deliveryMode === "DELIVERYBYFARMER" &&
                    order.status === "confirmed" &&
                    !order.isOutForDelivery && (
                      <Button size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        Out for Delivery
                      </Button>
                    )}

                  {/* Mark delivered */}
                  {order.deliveryMode === "DELIVERYBYFARMER" &&
                    order.isOutForDelivery &&
                    !order.isDelivered && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
