"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  MessageCircle,
} from "lucide-react";

/* ------------------ Helpers ------------------ */

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const calcOrderAmount = (items: any[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/* ------------------ Page ------------------ */

export default function BuyerPurchasesPage() {
  const [search, setSearch] = useState("");

  /* MOCK DATA — replace with API */
  const purchases = [
    {
      _id: "ORD101",
      farmerName: "Green Valley Farms",
      status: "confirmed",
      transactionMode: "ONLINE",
      deliveryMode: "PICKUPBYBUYER",
      hasPayment: false,
      isOutForDelivery: false,
      isDelivered: false,
      createdAt: "2025-09-01",
      items: [
        {
          title: "Cotton Waste",
          quantity: 2,
          unit: "ton",
          price: 2000,
        },
      ],
    },
    {
      _id: "ORD102",
      farmerName: "Sunrise Agro",
      status: "confirmed",
      transactionMode: "COD",
      deliveryMode: "DELIVERYBYFARMER",
      hasPayment: false,
      isOutForDelivery: true,
      isDelivered: false,
      createdAt: "2025-08-29",
      items: [
        {
          title: "Vegetable Waste",
          quantity: 800,
          unit: "kg",
          price: 15,
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Orders
            </h1>
          </div>

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
            placeholder="Search order or farmer"
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {purchases.map((order) => {
            /* ------------------ RULE ENGINE ------------------ */

            const canCancel =
              order.status === "pending" ||
              (order.deliveryMode === "PICKUPBYBUYER" && !order.isDelivered) ||
              (order.deliveryMode === "DELIVERYBYFARMER" &&
                !order.isOutForDelivery);

            const canMakePayment =
              !order.hasPayment &&
              order.status === "confirmed" &&
              order.transactionMode !== "COD";

            const canOutForPickup =
              order.deliveryMode === "PICKUPBYBUYER" &&
              order.hasPayment &&
              !order.isDelivered;

            /* ------------------ UI ------------------ */

            return (
              <Card key={order._id}>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      Order #{order._id}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Farmer: <b>{order.farmerName}</b> •{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  {/* Delivery Status */}
                  <div className="text-xs">
                    {order.isOutForDelivery ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Truck className="h-3 w-3 mr-1" />
                        {order.deliveryMode === "PICKUPBYBUYER"
                          ? "Out for Pickup"
                          : "Out for Delivery"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Not yet out for delivery
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.title} × {item.quantity} {item.unit}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}

                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span className="text-green-700">
                      ₹{calcOrderAmount(order.items)}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Delivery:{" "}
                    <b>
                      {order.deliveryMode === "PICKUPBYBUYER"
                        ? "Pickup by You"
                        : "Delivered by Farmer"}
                    </b>
                  </div>

                  {/* ACTIONS */}
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* View */}
                    <Link href={`/buyer/orders/${order._id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>

                    {/* ================= CANCEL ORDER ================= */}
                    {order.status !== "shipped" &&
                      order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            // TODO: cancel order API
                            console.log("Cancel order:", order._id);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel Order
                        </Button>
                      )}

                    {/* ================= OUT FOR PICKUP (ALWAYS FOR PICKUPBYBUYER) ================= */}
                    {order.deliveryMode === "PICKUPBYBUYER" &&
                      order.status !== "shipped" &&
                      order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            // TODO: mark as shipped / out for pickup
                            console.log("Out for pickup:", order._id);
                          }}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Out for Pickup
                        </Button>
                      )}

                    {/* ================= MARK DELIVERED ================= */}
                    {order.status === "shipped" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          // TODO: mark delivered API
                          console.log("Mark delivered:", order._id);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    )}

                    {/* ================= STATUS INFO (ONLY FOR FARMER DELIVERY) ================= */}
                    {order.deliveryMode === "DELIVERYBYFARMER" &&
                      order.status === "pending" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Waiting for Farmer Approval
                        </Badge>
                      )}

                    {order.status === "cancelled" && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                      </Badge>
                    )}

                    {/* ================= COMPLETE PAYMENT ================= */}
                    {!order.hasPayment &&
                      order.transactionMode !== "COD" &&
                      order.status !== "cancelled" &&
                      !order.isDelivered && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            // TODO: redirect to payment gateway
                            console.log("Complete payment:", order._id);
                          }}
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
