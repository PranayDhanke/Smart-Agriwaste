"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  CheckCircle2,
  Home,
  Calendar,
  User,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { Order } from "@/components/types/orders";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { useNotification } from "@/components/hooks/useNotification";

/* ============ Helpers ============ */

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const calcOrderAmount = (items: Order["items"]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

const getStatusConfig = (order: Order) => {
  if (order.isDelivered) {
    return {
      badge: (
        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
          <CheckCircle2 className="h-3 w-3 mr-2" />
          Delivered
        </Badge>
      ),
      gradient: "from-emerald-500 to-teal-500",
    };
  }

  if (order.isOutForDelivery) {
    return {
      badge: (
        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
          <Truck className="h-3 w-3 mr-2" />
          {order.deliveryMode === "PICKUPBYBUYER"
            ? "Ready for Pickup"
            : "Out for Delivery"}
        </Badge>
      ),
      gradient: "from-blue-500 to-cyan-500",
    };
  }

  if (order.status === "cancelled") {
    return {
      badge: (
        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold">
          <XCircle className="h-3 w-3 mr-2" />
          Cancelled
        </Badge>
      ),
      gradient: "from-red-500 to-rose-500",
    };
  }

  if (order.status === "confirmed") {
    return {
      badge: (
        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold">
          <CheckCircle2 className="h-3 w-3 mr-2" />
          Confirmed
        </Badge>
      ),
      gradient: "from-purple-500 to-indigo-500",
    };
  }

  return {
    badge: (
      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
        <Clock className="h-3 w-3 mr-2" />
        Pending
      </Badge>
    ),
    gradient: "from-amber-500 to-orange-500",
  };
};

const getDeliveryModeBadge = (mode: string) => {
  if (mode === "DELIVERYBYFARMER") {
    return (
      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
        <Truck className="h-3 w-3" />
        Delivery
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
      <Home className="h-3 w-3" />
      Pickup
    </span>
  );
};

/* ============ Main Component ============ */

export default function BuyerPurchasesPage() {
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<
    "all" | "pending" | "delivered" | "cancelled"
  >("all");
  const { user } = useUser();

  const { sendNotification } = useNotification();

  useEffect(() => {
    const buyerId = user?.id.replace("user_", "buy_");

    const fetchOrderData = async () => {
      try {
        if (!buyerId) return;
        const res = await axios.get(`/api/order/getbuyer/${buyerId}`);
        if (res.status === 200) {
          setPurchases(res.data.orderdata);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your orders");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [user?.id]);


  const filteredOrders = useMemo(() => {
    let filtered = purchases.filter((order) => {
      const q = search.toLowerCase();
      return (
        order._id.toLowerCase().includes(q) ||
        order.items.some((i) => i.title.toLowerCase().includes(q)) ||
        order.items[0]?.sellerInfo.seller.farmerName.toLowerCase().includes(q)
      );
    });

    if (filterTab === "pending") {
      filtered = filtered.filter(
        (o) => !o.isDelivered && o.status !== "cancelled"
      );
    } else if (filterTab === "delivered") {
      filtered = filtered.filter((o) => o.isDelivered);
    } else if (filterTab === "cancelled") {
      filtered = filtered.filter((o) => o.status === "cancelled");
    }

    return filtered;
  }, [search, purchases, filterTab]);

  // Calculate statistics
  const stats = {
    total: purchases.length,
    pending: purchases.filter((o) => !o.isDelivered && o.status !== "cancelled")
      .length,
    delivered: purchases.filter((o) => o.isDelivered).length,
    cancelled: purchases.filter((o) => o.status === "cancelled").length,
  };

  const totalSpent = purchases.reduce((sum, order) => {
    return sum + calcOrderAmount(order.items);
  }, 0);

  const changeOrderStatus = async (
    id: string,
    status: "confirmed" | "cancelled",
    farmerId: string,
    buyerName: string
  ) => {
    try {
      const res = await axios.put("/api/order/changeStatus", { id, status });

      if (res.status === 200) {
        setPurchases((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status } : o))
        );
        toast.success(`Order has successfully ${status}`);
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: `Buyer has ${status} the Order`,
          message: `buyer ${buyerName} has ${status} order`,
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
        setPurchases((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isOutForDelivery: true } : o))
        );
        toast.success("Order marked out for delivery");
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: "Order is out for Pickup",
          message: `Buyer ${buyerName} is out for Pickup`,
          type: "Order",
        });
      }
    } catch {
      toast.error("Failed to set out for delivery");
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
        setPurchases((prev) =>
          prev.map((o) => (o._id === id ? { ...o, isDelivered: true } : o))
        );
        toast.success("Order successfully delivered");
        sendNotification({
          userId: farmerId.replace("fam_", "user_"),
          title: "Order is Picked Up",
          message: `Buyer ${buyerName} picked up order`,
          type: "Order",
        });
      }
    } catch {
      toast.error("Failed to mark delivery");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ============ Header Section ============ */}
        <div className="animate-fade-in">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  My Purchases
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Track and manage all your orders from local farmers
                </p>
              </div>

              <Link
                href="/profile/buyer/negotiations"
                className="animate-fade-in"
                style={{ animationDelay: "100ms" }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 h-11 px-6">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-semibold">Negotiations</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
            </div>
          </div>

          {/* ============ Statistics Cards ============ */}
          {!loading && purchases.length > 0 && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-fade-in"
              style={{ animationDelay: "50ms" }}
            >
              {/* Total Orders */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:via-blue-500 transition-all"></div>
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* In Transit */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:via-amber-500 transition-all"></div>
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">
                      In Transit
                    </p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.pending}
                    </p>
                    <div className="pt-2">
                      <div className="h-1.5 w-full bg-amber-200 dark:bg-amber-900/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{
                            width: `${
                              (stats.pending / stats.total) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivered */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:via-emerald-500 transition-all"></div>
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                      Delivered
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.delivered}
                    </p>
                    <div className="pt-2">
                      <div className="h-1.5 w-full bg-emerald-200 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{
                            width: `${
                              (stats.delivered / stats.total) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancelled */}
              <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500"></div>
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
                      Cancelled
                    </p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {stats.cancelled}
                    </p>
                    <div className="pt-2">
                      <div className="h-1.5 w-full bg-red-200 dark:bg-red-900/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-rose-500"
                          style={{
                            width: `${
                              (stats.cancelled / stats.total) * 100 || 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Spent - Highlighted */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:via-purple-500 transition-all"></div>
                <CardContent className="pt-5">
                  <div className="space-y-2">
                    <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold uppercase tracking-wide">
                      Total Spent
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      ₹{totalSpent.toLocaleString("en-IN")}
                    </p>
                    <div className="pt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Across all purchases</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ============ Search & Filters ============ */}
        <div
          className="space-y-4 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          {/* Search Bar */}
          <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-600 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order ID, product name, or farmer..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              {filteredOrders.length > 0 && search && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Found {filteredOrders.length} order
                  {filteredOrders.length !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          {!loading && purchases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(
                [
                  {
                    key: "all",
                    label: "All Orders",
                    icon: Package,
                    count: stats.total,
                  },
                  {
                    key: "pending",
                    label: "In Transit",
                    icon: Truck,
                    count: stats.pending,
                  },
                  {
                    key: "delivered",
                    label: "Delivered",
                    icon: CheckCircle2,
                    count: stats.delivered,
                  },
                  {
                    key: "cancelled",
                    label: "Cancelled",
                    icon: XCircle,
                    count: stats.cancelled,
                  },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = filterTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                      isActive
                        ? tab.key === "all"
                          ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg scale-105"
                          : tab.key === "pending"
                          ? "bg-amber-600 dark:bg-amber-700 text-white shadow-lg scale-105"
                          : tab.key === "delivered"
                          ? "bg-emerald-600 dark:bg-emerald-700 text-white shadow-lg scale-105"
                          : "bg-red-600 dark:bg-red-700 text-white shadow-lg scale-105"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <Badge
                      variant="secondary"
                      className={`ml-1 ${
                        isActive
                          ? "bg-white/30 text-white"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      {tab.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ============ Loading State ============ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader2 className="h-14 w-14 animate-spin text-emerald-600 dark:text-emerald-400 relative" />
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Loading your orders...
            </p>
          </div>
        )}

        {/* ============ Empty State ============ */}
        {!loading && purchases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-block p-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Package className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                No Orders Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto text-lg">
                Start shopping to see your orders here. Browse our marketplace
                and find great agricultural products from local farmers.
              </p>
              <Link href="/marketplace">
                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white mt-4 h-11 px-6">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ============ No Results ============ */}
        {!loading && purchases.length > 0 && filteredOrders.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Try adjusting your search or filter to find what you are looking
              for.
            </p>
          </div>
        )}

        {/* ============ Orders List ============ */}
        {!loading && purchases.length > 0 && filteredOrders.length > 0 && (
          <div
            className="space-y-4 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            {filteredOrders.map((order, idx) => {
              const canCancel =
                order.status !== "cancelled" &&
                !order.isDelivered &&
                !order.isOutForDelivery;
              const statusConfig = getStatusConfig(order);

              return (
                <Card
                  key={order._id}
                  className="border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  style={{ animationDelay: `${200 + idx * 50}ms` }}
                >
                  {/* Status Bar */}
                  <div
                    className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}
                  ></div>

                  {/* Header */}
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <CardTitle className="text-lg text-gray-900 dark:text-white">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </CardTitle>
                          {getDeliveryModeBadge(order.deliveryMode)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {order.items[0]?.sellerInfo.seller.farmerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="lg:flex-shrink-0">
                        {statusConfig.badge}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="space-y-4">
                    {/* Items Preview */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        Items ({order.items.length})
                      </p>
                      <div className="space-y-1.5">
                        {order.items.slice(0, 2).map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-start text-sm group/item"
                          >
                            <span className="font-medium text-gray-900 dark:text-white line-clamp-1 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2">
                              <span className="text-xs">x{item.quantity}</span>
                              <span className="font-semibold">
                                ₹
                                {(item.price * item.quantity).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic font-medium pt-1">
                            +{order.items.length - 2} more item
                            {order.items.length - 2 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total Amount & Payment */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center p-3.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          Total
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ₹
                          {calcOrderAmount(order.items).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 p-3.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex-shrink-0">
                          {order.hasPayment ? (
                            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold">
                            Payment
                          </p>
                          <p className="text-sm font-bold text-purple-900 dark:text-purple-200">
                            {order.hasPayment ? "Completed" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {/* View Details */}
                      <Link
                        href={`/profile/buyer/my-purchases/single-purchase?orderid=${order._id}`}
                        className="flex-1 sm:flex-initial"
                      >
                        <Button
                          size="sm"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>

                      {/* Cancel */}
                      {canCancel && !order.hasPayment && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center justify-center gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() =>
                            changeOrderStatus(
                              order._id,
                              "cancelled",
                              order.items[0].sellerInfo.seller.farmerId,
                              order.buyerInfo.buyerName
                            )
                          }
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Cancel</span>
                        </Button>
                      )}

                      {/* Pickup Actions */}
                      {order.deliveryMode === "PICKUPBYBUYER" &&
                        !order.isOutForDelivery &&
                        !order.isDelivered &&
                        order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                            onClick={() =>
                              setOutForPickup(
                                order._id,
                                order.items[0].sellerInfo.seller.farmerId,
                                order.buyerInfo.buyerName
                              )
                            }
                          >
                            <Truck className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Out for Pickup
                            </span>
                          </Button>
                        )}

                      {order.deliveryMode === "PICKUPBYBUYER" &&
                        order.isOutForDelivery &&
                        !order.isDelivered &&
                        order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all"
                            onClick={() =>
                              conformPickup(
                                order._id,
                                order.items[0].sellerInfo.seller.farmerId,
                                order.buyerInfo.buyerName
                              )
                            }
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span className="hidden sm:inline">
                              Confirm Pickup
                            </span>
                          </Button>
                        )}

                      {/* Payment */}
                      {order.status === "confirmed" && !order.hasPayment && (
                        <Button
                          size="sm"
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-all"
                          onClick={() =>
                            toast.success("Payment gateway coming soon!")
                          }
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="hidden sm:inline">Pay Now</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
    </main>
  );
}
