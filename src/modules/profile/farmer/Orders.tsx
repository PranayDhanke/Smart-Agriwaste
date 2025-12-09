"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";

export default function Orders() {
  const orders = [
    {
      id: "ORD123",
      item: "Cotton Crop Residues",
      type: "Crop",
      quantity: "2 tons",
      price: "₹2000 / ton",
      status: "Pending",
      date: "2025-09-01",
    },
    {
      id: "ORD124",
      item: "Vegetable Waste (Tomato, Cabbage)",
      type: "Vegetable",
      quantity: "1.5 tons",
      price: "₹1500 / ton",
      status: "Shipped",
      date: "2025-08-28",
    },
    {
      id: "ORD125",
      item: "Fruit Waste (Mango Pulp)",
      type: "Fruit",
      quantity: "3 tons",
      price: "₹2500 / ton",
      status: "Completed",
      date: "2025-08-20",
    },
    {
      id: "ORD126",
      item: "Vegetable Waste (Onion Peels)",
      type: "Vegetable",
      quantity: "500 kg",
      price: "₹1000 / ton",
      status: "Cancelled",
      date: "2025-08-10",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">⏳ Pending</Badge>
        );
      case "Shipped":
        return <Badge className="bg-blue-100 text-blue-700">🚚 Shipped</Badge>;
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-700">✅ Completed</Badge>
        );
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-700">❌ Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-green-700 mb-6 flex items-center gap-2">
        <Package className="h-7 w-7" /> My Orders
      </h1>

      {/* Orders List */}
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="shadow-md border-0 bg-white hover:shadow-lg transition"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {order.item}
              </CardTitle>
              {getStatusBadge(order.status)}
            </CardHeader>
            <CardContent className="grid gap-2 text-gray-700 md:grid-cols-2">
              <p>
                <span className="font-medium">Order ID:</span> {order.id}
              </p>
              <p>
                <span className="font-medium">Quantity:</span> {order.quantity}
              </p>
              <p>
                <span className="font-medium">Price:</span> {order.price}
              </p>
              <p>
                <span className="font-medium">Date:</span> {order.date}
              </p>

              <div className="md:col-span-2 flex gap-3 mt-3">
                {order.status === "Pending" && (
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancel Order
                  </Button>
                )}
                {order.status === "Shipped" && (
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark as Received
                  </Button>
                )}
                {order.status === "Completed" && (
                  <Button variant="outline">
                    <Truck className="h-4 w-4 mr-2" /> Track Shipment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
