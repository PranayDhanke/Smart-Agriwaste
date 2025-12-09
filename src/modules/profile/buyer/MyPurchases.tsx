"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Clock,
  ChevronDown,
  Download,
  Eye,
} from "lucide-react";
import { useState } from "react";

export default function MyPurchases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const purchases = [
    {
      id: "ORD123",
      item: "Cotton Crop Residues",
      type: "Crop",
      quantity: "2 tons",
      price: 2000,
      unitPrice: "₹2,000 / ton",
      status: "Pending",
      date: "2025-09-01",
      estimatedDelivery: "2025-09-10",
      seller: "Rajesh Farms",
      location: "Pune, Maharashtra",
      contact: "+91 98765 43210",
      paymentMethod: "UPI",
      trackingId: "TRACK123456",
    },
    {
      id: "ORD124",
      item: "Vegetable Waste (Tomato, Cabbage)",
      type: "Vegetable",
      quantity: "1.5 tons",
      price: 2250,
      unitPrice: "₹1,500 / ton",
      status: "Shipped",
      date: "2025-08-28",
      estimatedDelivery: "2025-09-05",
      seller: "Green Valley Produce",
      location: "Nashik, Maharashtra",
      contact: "+91 98765 43211",
      paymentMethod: "Card",
      trackingId: "TRACK123457",
    },
    {
      id: "ORD125",
      item: "Fruit Waste (Mango Pulp)",
      type: "Fruit",
      quantity: "3 tons",
      price: 7500,
      unitPrice: "₹2,500 / ton",
      status: "Completed",
      date: "2025-08-20",
      estimatedDelivery: "2025-08-28",
      deliveredDate: "2025-08-27",
      seller: "Sunshine Orchards",
      location: "Ratnagiri, Maharashtra",
      contact: "+91 98765 43212",
      paymentMethod: "Net Banking",
      trackingId: "TRACK123458",
    },
    {
      id: "ORD126",
      item: "Vegetable Waste (Onion Peels)",
      type: "Vegetable",
      quantity: "500 kg",
      price: 500,
      unitPrice: "₹1,000 / ton",
      status: "Cancelled",
      date: "2025-08-10",
      seller: "Farm Fresh Supplies",
      location: "Solapur, Maharashtra",
      contact: "+91 98765 43213",
      paymentMethod: "UPI",
      cancelReason: "Item unavailable",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 border">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "Shipped":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 border">
            <Truck className="h-3 w-3 mr-1" />
            Shipped
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 border">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 border">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusProgress = (status: string) => {
    const steps = [
      { label: "Order Placed", icon: CheckCircle },
      { label: "Processing", icon: Package },
      { label: "Shipped", icon: Truck },
      { label: "Delivered", icon: CheckCircle },
    ];

    const currentStep =
      status === "Pending"
        ? 1
        : status === "Shipped"
        ? 2
        : status === "Completed"
        ? 3
        : 0;

    return (
      <div className="flex items-center justify-between mt-4 px-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative flex-1">
            {index > 0 && (
              <div
                className={`absolute top-4 -left-1/2 w-full h-0.5 -z-10 ${
                  index <= currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <step.icon className="h-4 w-4" />
            </div>
            <span
              className={`text-xs mt-2 text-center ${
                index <= currentStep ? "text-green-700 font-medium" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Filter purchases based on search and status
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.seller.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || purchase.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: purchases.length,
    pending: purchases.filter((p) => p.status === "Pending").length,
    shipped: purchases.filter((p) => p.status === "Shipped").length,
    completed: purchases.filter((p) => p.status === "Completed").length,
    totalSpent: purchases
      .filter((p) => p.status !== "Cancelled")
      .reduce((sum, p) => sum + p.price, 0),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-2 flex items-center gap-2">
            <Package className="h-8 w-8" />
            My Purchases
          </h1>
          <p className="text-gray-600">
            Track and manage all your agricultural waste purchases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-xs text-gray-500 mt-1">Total Orders</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-700">
                {stats.pending}
              </div>
              <div className="text-xs text-amber-600 mt-1">Pending</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-700">
                {stats.shipped}
              </div>
              <div className="text-xs text-blue-600 mt-1">In Transit</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700">
                {stats.completed}
              </div>
              <div className="text-xs text-green-600 mt-1">Delivered</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-emerald-600 text-white col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                ₹{stats.totalSpent.toLocaleString()}
              </div>
              <div className="text-xs opacity-90 mt-1">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID, item, or seller..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredPurchases.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No purchases found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPurchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {purchase.item}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Order #{purchase.id}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {purchase.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(purchase.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quantity</p>
                      <p className="font-semibold text-gray-900">
                        {purchase.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                      <p className="font-semibold text-gray-900">
                        {purchase.unitPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                      <p className="font-semibold text-green-600 text-lg">
                        ₹{purchase.price.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment</p>
                      <p className="font-semibold text-gray-900">
                        {purchase.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span>
                        <span className="font-medium">Seller:</span>{" "}
                        {purchase.seller}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{purchase.location}</span>
                    </div>
                  </div>

                  {/* Progress Tracker - Only for active orders */}
                  {purchase.status !== "Cancelled" &&
                    purchase.status !== "Completed" && (
                      <div className="border-t pt-4">
                        {getStatusProgress(purchase.status)}
                      </div>
                    )}

                  {/* Delivery Information */}
                  {purchase.status === "Shipped" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 mb-1">
                            Your order is on the way!
                          </p>
                          <p className="text-sm text-blue-700">
                            Expected delivery: {purchase.estimatedDelivery}
                          </p>
                          {purchase.trackingId && (
                            <p className="text-xs text-blue-600 mt-2">
                              Tracking ID: {purchase.trackingId}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Order Info */}
                  {purchase.status === "Completed" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900 mb-1">
                            Order delivered successfully!
                          </p>
                          <p className="text-sm text-green-700">
                            Delivered on {purchase.deliveredDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Order Info */}
                  {purchase.status === "Cancelled" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900 mb-1">
                            Order cancelled
                          </p>
                          {purchase.cancelReason && (
                            <p className="text-sm text-red-700">
                              Reason: {purchase.cancelReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expandable Details */}
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === purchase.id ? null : purchase.id
                      )
                    }
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    {expandedOrder === purchase.id
                      ? "Hide Details"
                      : "View More Details"}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedOrder === purchase.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === purchase.id && (
                    <div className="border-t pt-4 space-y-3 animate-in slide-in-from-top-2">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Seller Contact</p>
                          <p className="font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {purchase.contact}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Order Type</p>
                          <p className="font-medium">{purchase.type} Waste</p>
                        </div>
                        {purchase.trackingId && (
                          <div className="md:col-span-2">
                            <p className="text-gray-500 mb-1">Tracking Number</p>
                            <p className="font-mono font-medium">
                              {purchase.trackingId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {purchase.status === "Pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Seller
                        </Button>
                      </>
                    )}

                    {purchase.status === "Shipped" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Track Shipment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Seller
                        </Button>
                      </>
                    )}

                    {purchase.status === "Completed" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Rate Order
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      </>
                    )}

                    {purchase.status === "Cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
