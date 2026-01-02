"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  AlertCircle,
  IndianRupee,
  CalendarIcon,
  MapPin,
  ChevronRight,
  Filter,
  MoreVertical,
} from "lucide-react";
import { Order } from "@/components/types/orders";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { useNotification } from "@/components/hooks/useNotification";

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
      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 px-3 py-1">
        <XCircle className="h-3.5 w-3.5 mr-1.5" />
        Cancelled
      </Badge>
    );
  }

  if (order.isDelivered) {
    return (
      <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1">
        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        Delivered
      </Badge>
    );
  }

  if (order.isOutForDelivery) {
    return (
      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1">
        <Truck className="h-3.5 w-3.5 mr-1.5" />
        Out for Delivery
      </Badge>
    );
  }

  if (order.status === "confirmed") {
    return (
      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-1">
        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        Confirmed
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1">
      <Clock className="h-3.5 w-3.5 mr-1.5" />
      Pending
    </Badge>
  );
};

const getDeliveryModeBadge = (mode: string) => {
  if (mode === "DELIVERYBYFARMER") {
    return (
      <Badge
        variant="outline"
        className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 text-xs font-medium"
      >
        <Truck className="h-3 w-3 mr-1" />
        Delivery by You
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 text-xs font-medium"
    >
      <MapPin className="h-3 w-3 mr-1" />
      Pickup by Buyer
    </Badge>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card
    className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 ${color}`}
  >
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          {Icon}
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </CardContent>
  </Card>
);

/* ------------------ Page ------------------ */

export default function FarmerOrdersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
 
  const { user } = useUser();
 
  const { sendNotification } = useNotification();

  useEffect(() => {
    const farmerId = user?.id.replace("user_", "fam_");

    const fetchData = async () => {
      try {
        if (!farmerId) return;

        const res = await axios.get(`/api/order/getfarmer/${farmerId}`);

        if (res.status === 200) {
          setOrders(res.data.orderdata);
          setLoading(false);
        }
      } catch {
        toast.error("Error loading orders. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o._id.toLowerCase().includes(q) ||
      o.buyerInfo.buyerName.toLowerCase().includes(q) ||
      o.items.some((i) => i.title.toLowerCase().includes(q));

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "pending")
      return matchesSearch && o.status === "pending";
    if (filterStatus === "confirmed")
      return matchesSearch && o.status === "confirmed";
    if (filterStatus === "delivered") return matchesSearch && o.isDelivered;
    if (filterStatus === "cancelled")
      return matchesSearch && o.status === "cancelled";

    return matchesSearch;
  });

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.isDelivered).length,
    total: orders.length,
  };

  const changeOrderStatus = async (
    id: string,
    status: "confirmed" | "cancelled",
    buyerId: string,
    farmerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/changeStatus", { id, status });

      if (res.status === 200) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status } : o))
        );
        toast.success(`Order ${status} successfully`);
        sendNotification({
          userId: buyerId.replace("buy_", "user_"),
          title: `Your order has been ${status}`,
          message: `Farmer ${farmerName} has ${status} your order`,
          type: "order",
        });
      }
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const setOutForDelivery = async (
    id: string,
    buyerId: string,
    farmerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/outForDelivery", { id });
      if (res.status === 200) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isOutForDelivery: true } : o))
        );
        toast.success("Order marked as out for delivery");
        sendNotification({
          userId: buyerId.replace("buy_", "user_"),
          title: "Order is out for Delivery",
          message: `Farmer ${farmerName} has sent your order for delivery`,
          type: "Order",
        });
      }
    } catch {
      toast.error("Failed to update delivery status");
    }
  };

  const conformDelivery = async (
    id: string,
    buyerId: string,
    farmerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/confirmDelivered", { id });
      if (res.status === 200) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isDelivered: true } : o))
        );
        toast.success("Order marked as delivered");
        sendNotification({
          userId: buyerId.replace("buy_", "user_"),
          title: "Order Delivered",
          message: `Your order from farmer ${farmerName} has been delivered`,
          type: "Order",
        });
      }
    } catch {
      toast.error("Failed to confirm delivery");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-xl">
                  <Package className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Order Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Track and manage incoming orders
                  </p>
                </div>
              </div>
            </div>

            <Link href="/profile/farmer/negotiations">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 h-11 px-6">
                <MessageCircle className="h-4 w-4 mr-2" />
                Negotiations
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Section */}
        {!loading && orders.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            <StatCard
              label="Total Orders"
              value={stats.total}
              icon={
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
            <StatCard
              label="Confirmed"
              value={stats.confirmed}
              icon={
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
            <StatCard
              label="Delivered"
              value={stats.delivered}
              icon={
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              }
              color="bg-white/50 dark:bg-slate-800/50"
            />
          </div>
        )}

        {/* Search & Filter Section */}
        <div
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, buyers, or products..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {search && filteredOrders.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Found{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {filteredOrders.length}
              </span>{" "}
              result{filteredOrders.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader2 className="h-14 w-14 animate-spin text-amber-600 dark:text-amber-400 relative" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full">
                <Package className="h-14 w-14 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Orders Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Once buyers place orders for your products, they&apos;ll
                  appear here. Start by listing your products to receive orders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div
            className="space-y-4 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No orders match your search criteria
                </p>
              </div>
            ) : (
              filteredOrders.map((order, idx) => (
                <Card
                  key={order._id}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-white dark:bg-slate-800/80 backdrop-blur-sm"
                  style={{ animationDelay: `${200 + idx * 50}ms` }}
                >
                  {/* Status Bar */}
                  <div
                    className={`h-1.5 transition-all ${
                      order.isDelivered
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : order.status === "cancelled"
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : order.isOutForDelivery
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : order.status === "confirmed"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                    }`}
                  ></div>

                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          <CardTitle className="text-lg text-gray-900 dark:text-white truncate">
                            #{order._id.slice(-8).toUpperCase()}
                          </CardTitle>
                          {getDeliveryModeBadge(order.deliveryMode)}
                          {getStatusBadge(order)}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/30 px-3 py-1.5 rounded-full w-fit">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Buyer:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {order.buyerInfo.buyerName}
                            </span>
                          </div>

                          <span className="hidden sm:flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                      {order.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-start justify-between p-2.5 bg-gray-50 dark:bg-gray-700/20 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.quantity} × {item.unit} @ ₹
                              {item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right ml-3 flex-shrink-0">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              ₹
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="flex justify-between items-center p-3.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        Total Earning:
                      </span>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {calcOrderAmount(order.items).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Payment Status */}
                    {order.hasPayment && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                          Payment Verified
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/profile/farmer/my-orders/single-order?orderid=${order._id}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 h-9"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </Button>
                      </Link>

                      {/* Pending Actions */}
                      {order.status !== "cancelled" &&
                        !order.isDelivered &&
                        !order.isOutForDelivery && (
                          <>
                            {order.status !== "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  changeOrderStatus(
                                    order._id,
                                    "confirmed",
                                    order.buyerId,
                                    order.items[0].sellerInfo.seller.farmerName
                                  )
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white h-9"
                              >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Accept
                              </Button>
                            )}
                            {!order.hasPayment && (
                              <Button
                                onClick={() =>
                                  changeOrderStatus(
                                    order._id,
                                    "cancelled",
                                    order.buyerId,
                                    order.items[0].sellerInfo.seller.farmerName
                                  )
                                }
                                size="sm"
                                variant="outline"
                                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-9"
                              >
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Reject
                              </Button>
                            )}
                          </>
                        )}

                      {/* Out for Delivery Action */}
                      {order.deliveryMode === "DELIVERYBYFARMER" &&
                        order.status === "confirmed" &&
                        !order.isOutForDelivery && (
                          <Button
                            size="sm"
                            onClick={() =>
                              setOutForDelivery(
                                order._id,
                                order.buyerId,
                                order.items[0].sellerInfo.seller.farmerName
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white h-9"
                          >
                            <Truck className="h-4 w-4 mr-1.5" />
                            Out for Delivery
                          </Button>
                        )}

                      {/* Mark Delivered Action */}
                      {order.deliveryMode === "DELIVERYBYFARMER" &&
                        order.isOutForDelivery &&
                        !order.isDelivered && (
                          <Button
                            size="sm"
                            onClick={() =>
                              conformDelivery(
                                order._id,
                                order.buyerId,
                                order.items[0].sellerInfo.seller.farmerName
                              )
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white h-9"
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Delivered
                          </Button>
                        )}

                      {/* Pickup Status */}
                      {order.deliveryMode === "PICKUPBYBUYER" &&
                        !order.isDelivered &&
                        order.status === "confirmed" && (
                          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Waiting for Pickup
                          </Badge>
                        )}

                      {/* Complete Badge */}
                      {order.isDelivered && (
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}

                      {/* Cancelled Badge */}
                      {order.status === "cancelled" && (
                        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancelled
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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

        /* Smooth scrollbar for items list */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </main>
  );
}
