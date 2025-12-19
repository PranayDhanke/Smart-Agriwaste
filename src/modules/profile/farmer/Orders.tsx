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

/* ------------------ Helpers ------------------ */

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={map[status] || "bg-gray-100 text-gray-700"}>
      {status.toUpperCase()}
    </Badge>
  );
};

const calcOrderAmount = (items: any[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/* ------------------ Page ------------------ */

export default function FarmerOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* MOCK DATA — replace with API */
  const orders = [
    {
      _id: "ORD123",
      buyerName: "Amit Kumar",
      status: "pending",
      deliveryMode: "DELIVERYBYFARMER",
      isDelivered: false,
      createdAt: "2025-09-01",
      items: [
        {
          title: "Cotton Crop Residues",
          quantity: 2,
          unit: "ton",
          price: 2000,
        },
      ],
    },
    {
      _id: "ORD124",
      buyerName: "Priya Sharma",
      status: "confirmed",
      deliveryMode: "PICKUPBYBUYER",
      isDelivered: false,
      createdAt: "2025-08-28",
      items: [
        {
          title: "Vegetable Waste (Tomato)",
          quantity: 1.5,
          unit: "ton",
          price: 1500,
        },
      ],
    },
    {
      _id: "ORD125",
      buyerName: "Rahul Patil",
      status: "shipped",
      deliveryMode: "DELIVERYBYFARMER",
      isDelivered: false,
      createdAt: "2025-08-20",
      items: [
        {
          title: "Fruit Waste (Mango)",
          quantity: 800,
          unit: "kg",
          price: 18,
        },
      ],
    },
  ];

  /* ------------------ Filters ------------------ */

  const filteredOrders = orders.filter((o) => {
    const matchStatus =
      statusFilter === "all" ? true : o.status === statusFilter;

    const matchSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i: any) =>
        i.title.toLowerCase().includes(search.toLowerCase())
      );

    return matchStatus && matchSearch;
  });

  /* ------------------ UI ------------------ */

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
              Orders placed by buyers for your waste products
            </p>
          </div>

          <Link href="/profile/farmer/negotiations">
            <Button size="sm" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Negotiations
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID, buyer, or product"
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </CardContent>
        </Card>

        {/* Orders List */}
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

                {/* Hide approval badges for pickup-by-buyer */}
                {!(
                  order.deliveryMode === "PICKUPBYBUYER" &&
                  (order.status === "pending" ||
                    order.status === "confirmed")
                ) && getStatusBadge(order.status)}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Items */}
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
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

                  {/* ACCEPT / REJECT — ONLY FARMER, ONLY DELIVERYBYFARMER */}
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

                  {/* PICKUP BY BUYER INFO */}
                  {order.deliveryMode === "PICKUPBYBUYER" &&
                    !order.isDelivered && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Waiting for Buyer Pickup
                      </Badge>
                    )}

                  {/* OUT FOR DELIVERY */}
                  {order.deliveryMode === "DELIVERYBYFARMER" &&
                    order.status === "confirmed" && (
                      <Button size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        Out for Delivery
                      </Button>
                    )}

                  {/* MARK DELIVERED */}
                  {order.deliveryMode === "DELIVERYBYFARMER" &&
                    order.status === "shipped" && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    )}

                  {/* CANCELLED */}
                  {order.status === "cancelled" && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancelled
                    </Badge>
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
