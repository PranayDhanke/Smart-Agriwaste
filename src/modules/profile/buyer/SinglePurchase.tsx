"use client";

import { Order } from "@/components/types/orders";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Copy,
  User,
  ShoppingBag,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
  Calendar,
  IndianRupee,
  Share2,
  CreditCard,
  Home,
  Phone,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useNotification } from "@/components/hooks/useNotification";

const BuyerOrderView = () => {
  const searchParams = useSearchParams();
  const orderid = searchParams.get("orderid");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderid) return;

      try {
        const res = await axios.get(`/api/order/view/${orderid}`);
        if (res.status === 200) {
          setOrder(res.data.orderdata);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderid]);

  const farmerName = order?.items?.[0]?.sellerInfo?.seller?.farmerName;
  const farmerAddress = order?.items?.[0]?.sellerInfo?.address;
  const isPickupByBuyer = order?.deliveryMode === "PICKUPBYBUYER";
  const isDeliveryByFarmer = order?.deliveryMode === "DELIVERYBYFARMER";
  const isConfirmed = order?.status === "confirmed";
  const isCancelled = order?.status === "cancelled";
  const isDelivered = order?.isDelivered;
  const isOutForDelivery = order?.isOutForDelivery;

  const canCancel =
    !isCancelled && !order?.isDelivered && !order?.isOutForDelivery;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800",
          text: "text-yellow-700 dark:text-yellow-300",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
          dotColor: "bg-yellow-500",
          icon: Clock,
          gradient: "from-yellow-400 to-amber-400",
        };
      case "confirmed":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-700 dark:text-emerald-300",
          bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
          dotColor: "bg-emerald-500",
          icon: CheckCircle2,
          gradient: "from-emerald-400 to-green-400",
        };
      case "cancelled":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800",
          text: "text-red-700 dark:text-red-300",
          bgColor: "bg-red-100 dark:bg-red-900/40",
          dotColor: "bg-red-500",
          icon: AlertCircle,
          gradient: "from-red-400 to-rose-400",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          border: "border-gray-200 dark:border-gray-800",
          text: "text-gray-700 dark:text-gray-300",
          bgColor: "bg-gray-100 dark:bg-gray-900/40",
          dotColor: "bg-gray-500",
          icon: AlertCircle,
          gradient: "from-gray-400 to-slate-400",
        };
    }
  };

  const statusConfig = getStatusColor(order?.status || "");
  const copyToClipboard = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { sendNotification } = useNotification();

  const changeOrderStatus = async (
    id: string,
    status: "confirmed" | "cancelled",
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/changeStatus", { id, status });

      if (res.status === 200) {
        setOrder((prev) => {
          if (!prev) return prev;
          return { ...prev, status };
        });
        toast.success(`Order has been ${status} successfully`);
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: `Buyer has ${status} the Order`,
          message: `Buyer ${buyerName} has ${status} the order`,
          type: "order",
        });
      }
    } catch {
      toast.error("Failed to change order status");
    }
  };

  const setOutForPickup = async (
    id: string,
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/outForDelivery", { id });
      if (res.status === 200) {
        setOrder((prev) => {
          if (!prev) return prev;
          return { ...prev, isOutForDelivery: true };
        });
        toast.success("Order marked as out for pickup");
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: "Order is out for Pickup",
          message: `Buyer ${buyerName} is out for pickup`,
          type: "Order",
        });
      }
    } catch {
      toast.error("Failed to mark order out for pickup");
    }
  };

  const conformPickup = async (
    id: string,
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/confirmDelivered", { id });
      if (res.status === 200) {
        setOrder((prev) => {
          if (!prev) return prev;
          return { ...prev, isDelivered: true };
        });
        toast.success("Order pickup confirmed");
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: "Order Picked Up",
          message: `Buyer ${buyerName} has picked up the order`,
          type: "Order",
        });
      }
    } catch {
      toast.error("Failed to confirm pickup");
    }
  };

  const totalAmount =
    order?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 h-9"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orders
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader2 className="h-14 w-14 animate-spin text-emerald-600 dark:text-emerald-400 relative" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading order details...
            </p>
          </div>
        )}

        {/* Main Content */}
        {!loading && order && (
          <>
            {/* Header Card - Enhanced Status Display */}
            <div className="animate-fade-in">
              <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-900/50 backdrop-blur-sm overflow-hidden">
                <div
                  className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}
                ></div>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 bg-gradient-to-br ${statusConfig.gradient} rounded-lg shadow-md`}
                        >
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            My Order Details
                          </h1>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Order placed on{" "}
                            <span className="font-semibold">
                              {new Intl.DateTimeFormat("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }).format(new Date(order.createdAt))}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Order ID */}
                      <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 w-fit px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Order ID:
                        </span>
                        <code className="font-mono font-bold text-gray-900 dark:text-white">
                          {order._id.slice(-12).toUpperCase()}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copy Order ID"
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        {copied && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Copied!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge - Enhanced with Progress */}
                    <div className="space-y-3 w-full md:w-fit">
                      <div
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border} w-fit shadow-md`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full ${
                            statusConfig.dotColor
                          } ${!isCancelled ? "animate-pulse" : ""}`}
                        ></div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                            Order Status
                          </span>
                          <span
                            className={`font-bold text-lg ${statusConfig.text}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics Grid (2x2) */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in"
              style={{ animationDelay: "50ms" }}
            >
              {/* Order Date */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Order Date
                    </span>
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Intl.DateTimeFormat("en-IN", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(order.createdAt))}
                  </p>
                </CardContent>
              </Card>

              {/* Items Count */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Items
                    </span>
                    <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {order.items.length}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Payment
                    </span>
                    <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p
                    className={`font-bold ${
                      order.hasPayment
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {order.hasPayment ? "Paid" : "Pending"}
                  </p>
                </CardContent>
              </Card>

              {/* Total Amount - Highlighted */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      Total Amount
                    </span>
                    <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Delivery/Pickup Progress - For Delivery by Farmer */}
            {isDeliveryByFarmer && (
              <Card
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Delivery Progress
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="flex justify-between relative px-2">
                      {/* Timeline Background */}
                      <div className="absolute top-5 left-4 right-4 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></div>

                      {/* Timeline Steps */}
                      {[
                        {
                          status: "pending",
                          label: "Order Confirmed",
                          icon: CheckCircle2,
                        },
                        {
                          status: "confirmed",
                          label: "Out for Delivery",
                          icon: Truck,
                        },
                        { status: "confirmed", label: "Delivered", icon: Home },
                      ].map((step, idx) => {
                        const isCompleted =
                          (isConfirmed && idx <= 0) ||
                          (isConfirmed && isOutForDelivery && idx <= 1) ||
                          (isConfirmed && isDelivered && idx <= 2);
                        const StepIcon = step.icon;

                        return (
                          <div
                            key={`${step.status}-${idx}`}
                            className="flex flex-col items-center relative z-10"
                          >
                            <div
                              className={`h-11 w-11 rounded-full border-3 flex items-center justify-center transition-all duration-500 ${
                                isCompleted
                                  ? "bg-gradient-to-br from-emerald-400 to-teal-400 border-emerald-500 text-white shadow-lg shadow-emerald-400/40"
                                  : "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-400"
                              }`}
                            >
                              <StepIcon className="h-5 w-5" />
                            </div>
                            <p
                              className={`text-xs font-bold mt-3 whitespace-nowrap transition-colors ${
                                isCompleted
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-gray-500 dark:text-gray-500"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pickup Progress - For Pickup by Buyer */}
            {isPickupByBuyer && (
              <Card
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Pickup Progress
                      </p>
                    </div>

                    {/* Simple Status for Pickup */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {/* Awaiting for Farmer Confirmation */}

                        {isCancelled && (
                          <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-400">
                                  Current Status
                                </p>
                                <p className="font-bold mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                  Order Cancelled
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                              Order has been cancelled
                            </p>
                          </div>
                        )}

                        {!isConfirmed &&
                          !isCancelled &&
                          !isOutForDelivery &&
                          !isDelivered && (
                            <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-400">
                                    Current Status
                                  </p>
                                  <p className="font-bold mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                    ⏳ Awaiting Farmer Confirmation
                                  </p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                              </div>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                                Farmer is preparing your items for pickup.
                              </p>
                            </div>
                          )}

                        {isConfirmed && !isOutForDelivery && !isDelivered && (
                          <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-yellow-700 dark:text-yellow-400">
                                  Current Status
                                </p>
                                <p className="font-bold mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                  ⏳ Order has been confirmed
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            </div>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-3">
                              Farmer has prepared your items for pickup.
                            </p>
                          </div>
                        )}

                        {/* Ready for Pickup */}
                        {isOutForDelivery && !isDelivered && (
                          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
                                  Current Status
                                </p>
                                <p className="font-bold mt-1 text-sm text-blue-700 dark:text-blue-300">
                                  🎯 Out for Your Pickup
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
                              Heading to the {"farmer's"} location to collect them.
                            </p>
                          </div>
                        )}

                        {/* Pickup Complete */}
                        {isDelivered && (
                          <div className="p-4 rounded-lg border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                                  Current Status
                                </p>
                                <p className="font-bold mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                                  ✅ Pickup Complete
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pickup Location Card */}
            {isPickupByBuyer && (
              <Card
                className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800 overflow-hidden animate-fade-in"
                style={{ animationDelay: "150ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 dark:text-blue-100">
                      📍 Pickup Location Details
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      Please coordinate with the farmer for pickup timing. Items
                      will be ready once the farmer confirms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Two Column Layout - Farmer Info & Order Summary */}
            <div
              className="grid md:grid-cols-2 gap-6 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              {/* Farmer Details */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Farmer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Farmer Name */}
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                      Farmer Name
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {farmerName || "N/A"}
                    </p>
                  </div>

                  {/* Farmer Location */}
                  {farmerAddress && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">
                        Farmer Location
                      </p>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {farmerAddress.houseBuildingName},{" "}
                          {farmerAddress.roadarealandmarkName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {farmerAddress.village}, {farmerAddress.taluka}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {farmerAddress.district}, {farmerAddress.state}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white h-10 flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Contact</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-200 dark:border-blue-800 h-10 flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {/* Payment Method */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Payment Method
                    </p>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                      Delivery Method
                    </p>
                    <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {order.deliveryMode === "PICKUPBYBUYER"
                          ? "Pickup by You"
                          : "Delivered by Farmer"}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Total Amount Highlight */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase mb-1">
                      Order Total
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card
              className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 overflow-hidden animate-fade-in"
              style={{ animationDelay: "250ms" }}
            >
              <div className="h-1.5 bg-gradient-to-r from-purple-400 to-pink-400"></div>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Order Items ({order.items.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.prodId}
                      className="flex gap-4 p-3.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
                    >
                      {/* Product Image */}
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0 shadow-sm">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                              {item.wasteType}
                            </span>
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                              {item.moisture}% moisture
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1.5">
                          ₹{item.price} × {item.quantity} {item.unit}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg border border-purple-200 dark:border-purple-800 h-fit">
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Verified Badge */}
            {order.hasPayment && (
              <Card
                className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800 overflow-hidden animate-fade-in"
                style={{ animationDelay: "300ms" }}
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
                <CardContent className="pt-5 flex items-center gap-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                      ✓ Payment Verified
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      Payment confirmed. Your order is being processed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Section - Sticky */}
            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in sticky bottom-6 bg-gradient-to-t from-white dark:from-slate-800 pt-4"
              style={{ animationDelay: "350ms" }}
            >
              {isCancelled && (
                <Card className="border-0 shadow-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 w-full">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                      This order has been cancelled
                    </p>
                  </CardContent>
                </Card>
              )}

              {isDelivered && (
                <Card className="border-0 shadow-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 w-full">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                      Order completed successfully ✅
                    </p>
                  </CardContent>
                </Card>
              )}

              {canCancel && !order.hasPayment && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all h-11"
                  onClick={() =>
                    changeOrderStatus(
                      order._id,
                      "cancelled",
                      order.items[0].sellerInfo.seller.farmerId,
                      order.buyerInfo.buyerName
                    )
                  }
                >
                  <XCircle className="h-5 w-5" />
                  Cancel Order
                </Button>
              )}

              {isConfirmed &&
                isPickupByBuyer &&
                !isOutForDelivery &&
                !isDelivered && (
                  <Button
                    size="lg"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all h-11"
                    onClick={() =>
                      setOutForPickup(
                        order._id,
                        order.items[0].sellerInfo.seller.farmerId,
                        order.buyerInfo.buyerName
                      )
                    }
                  >
                    <Truck className="h-5 w-5" />
                    Out for Pickup
                  </Button>
                )}

              {isConfirmed &&
                isPickupByBuyer &&
                isOutForDelivery &&
                !isDelivered && (
                  <Button
                    size="lg"
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all h-11"
                    onClick={() =>
                      conformPickup(
                        order._id,
                        order.items[0].sellerInfo.seller.farmerId,
                        order.buyerInfo.buyerName
                      )
                    }
                  >
                    <CheckCircle className="h-5 w-5" />
                    Confirm Pickup
                  </Button>
                )}

              {isConfirmed && !order.hasPayment && (
                <Button
                  size="lg"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all h-11"
                  onClick={() => toast.success("soooonnn")}
                >
                  <CheckCircle className="h-5 w-5" />
                  Proceed Payment
                </Button>
              )}
            </div>
          </>
        )}

        {/* Not Found State */}
        {!loading && !order && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <AlertCircle className="h-14 w-14 text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm text-sm">
                We {"couldn't"} find the order {"you're"} looking for. Please check the
                order ID and try again.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default BuyerOrderView;
