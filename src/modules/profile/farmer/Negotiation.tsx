"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Check,
  X,
  TrendingDown,
  Package,
  Droplets,
  User,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { Negotiation } from "@/components/types/orders";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useNotification } from "@/components/hooks/useNotification";

export default function FarmerNegotiationsPage() {
  const t = useTranslations("faq");
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]); // Replace with actual data fetching logic

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const { user } = useUser();

  const { refresh, sendNotification, changeNotificationStatus } =
    useNotification();

  useEffect(() => {
    const farmerId = user?.id.replace(/^user_/, "fam_");
    const loadNegotiations = async () => {
      try {
        const response = await axios.get(
          `/api/negotiate/getFarmer/${farmerId}`
        );
        if (response.data) {
          console.log(response.data);

          setNegotiations(response.data);
        }
      } catch {
        toast.error(t("negotiation.loadingFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadNegotiations();
  }, [user?.id]);

  async function handleAction(
    id: string,
    action: "accepted" | "rejected",
    data: {
      buyerId: string;
      farmerName: string;
      itemTitle: string;
    }
  ) {
      try {
      setLoadingId(id);

      changeNotificationStatus(id, action);

      toast.success(action === "accepted" ? t("negotiation.toasts.accepted") : t("negotiation.toasts.rejected"));

      setNegotiations((prev) =>
        prev.map((neg) => (neg._id === id ? { ...neg, status: action } : neg))
      );

      sendNotification({
        userId: data.buyerId.replace("buy_", "user_"), // farmer receives notification
        title: t("negotiation.notification.title", { action }),
        message: t("negotiation.notification.message", {
          farmer: data.farmerName,
          action,
          title: data.itemTitle,
        }),
        type: "negotiation",
      });
    } catch {
      toast.error(t("negotiation.toasts.actionFailed"));
    } finally {
      setLoadingId(null);
      refresh();
    }
  }

  const pendingCount = negotiations.filter(
    (n) => n.status === "pending"
  ).length;
  const priceChange = (neg: Negotiation) => {
    const diff = neg.negotiatedPrice - neg.item.price;
    const percent = ((diff / neg.item.price) * 100).toFixed(1);
    return { diff, percent };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("negotiation.title")}</h1>
            <p className="text-gray-600">{t("negotiation.description")}</p>
          </div>

          {pendingCount > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl px-6 py-3 shadow-sm">
              <p className="text-sm text-amber-700 font-medium">
                {t("negotiation.pendingRequests", { count: pendingCount, plural: pendingCount !== 1 ? "s" : "" })}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : negotiations.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">{t("negotiation.empty.title")}</p>
              <p className="text-gray-500">{t("negotiation.empty.body")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Negotiations List */}
            <div className="space-y-5">
              {negotiations.map((neg) => {
                const { diff, percent } = priceChange(neg);
                const isDiscount = diff < 0;

                return (
                  <Card
                    key={neg._id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2"
                  >
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-[300px_1fr] gap-0">
                        {/* Image Section */}
                        <div className="relative h-64 md:h-auto bg-gradient-to-br from-gray-100 to-gray-50">
                          <Image
                            src={neg.item.image}
                            alt={neg.item.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge
                              className="shadow-lg text-xs font-semibold"
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
                        </div>

                        {/* Content Section */}
                        <div className="p-6 space-y-5">
                          {/* Header */}
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                              {t("negotiation.labels.product")} <span className="font-normal">{neg.item.title}</span>
                            </h2>
                            <p className="text-gray-600 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {t("negotiation.labels.offerFrom")} <span className="font-semibold text-gray-900">{neg.buyerName}</span>
                            </p>
                          </div>

                          <Separator />

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Droplets className="h-4 w-4 text-cyan-600" />
                                <span className="text-xs font-medium text-cyan-900">
                                  {t("negotiation.labels.moisture")}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-cyan-900">
                                {neg.item.moisture}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <IndianRupee className="h-4 w-4 text-gray-600" />
                                <span className="text-xs font-medium text-gray-700">
                                  {t("negotiation.labels.yourPrice")}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                ₹{neg.item.price}
                              </p>
                            </div>

                            <div
                              className={`${
                                isDiscount
                                  ? "bg-red-50 border-red-200"
                                  : "bg-green-50 border-green-200"
                              } rounded-lg p-3 border`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingDown
                                  className={`h-4 w-4 ${
                                    isDiscount
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                />
                                <span className={`text-xs font-medium ${isDiscount ? "text-red-900" : "text-green-900"}`}>
                                  {t("negotiation.labels.theirOffer")}
                                </span>
                              </div>
                              <p
                                className={`text-lg font-bold ${
                                  isDiscount ? "text-red-900" : "text-green-900"
                                }`}
                              >
                                ₹{neg.negotiatedPrice}
                              </p>
                            </div>
                          </div>

                          {/* Price Comparison */}
                          {isDiscount && (
                            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4">
                              <p className="text-sm font-medium text-amber-900">
                                {t("negotiation.priceComparison.below", { percent, absDiff: Math.abs(diff) })}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {neg.status === "pending" && (
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                onClick={() =>
                                  handleAction(neg._id, "rejected", {
                                    buyerId: neg.buyerId,
                                    farmerName: user?.fullName || "Farmer",
                                    itemTitle: neg.item.title,
                                  })
                                }
                                disabled={loadingId === neg._id}
                              >
                                <X className="h-5 w-5 mr-2" />
                                {t("negotiation.actions.reject")}
                              </Button>

                              <Button
                                size="lg"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                                onClick={() =>
                                  handleAction(neg._id, "accepted", {
                                    buyerId: neg.buyerId,
                                    farmerName: user?.fullName || "Farmer",
                                    itemTitle: neg.item.title,
                                  })
                                }
                                disabled={loadingId === neg._id}
                              >
                                <Check className="h-5 w-5 mr-2" />
                                {t("negotiation.actions.accept")}
                              </Button>
                            </div>
                          )}

                          {neg.status !== "pending" && (
                            <div
                              className={`text-center py-3 rounded-lg ${
                                neg.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <p className="font-semibold">
                                {neg.status === "accepted" ? t("negotiation.status.accepted") : t("negotiation.status.rejected")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
