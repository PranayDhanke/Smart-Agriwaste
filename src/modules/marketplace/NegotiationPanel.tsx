"use client";

import React, { useState } from "react";
import { WasteItem } from "@/components/types/marketplace";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IndianRupee, Handshake } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useNotification } from "@/components/hooks/useNotification";
import { useTranslations } from "next-intl";

const NegotiationPanel = ({
  item,
  onClose,
}: {
  item: WasteItem;
  onClose: () => void;
}) => {
  const t = useTranslations("faq");
  const [price, setPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();

  const { refresh, sendNotification } = useNotification();

  const handleSubmit = async () => {
    if (!price || price <= 0) {
      toast.error(t("negotiation.errors.invalidPrice"));
      return;
    }

    if (price >= item.price) {
      toast.error(t("negotiation.errors.mustBeLower"));
      return;
    }

    const payload = {
      buyerId: user?.id.replace(/^user_/, "buy_") || "",
      buyerName: user?.fullName || "buyer",
      farmerId: item.seller.farmerId,
      negotiatedPrice: price,
      item: {
        prodId: item._id,
        title: item.title,
        wasteType: item.wasteType,
        wasteProduct: item.wasteProduct,
        moisture: item.moisture,
        quantity: 1,
        maxQuantity: item.quantity,
        price: item.price,
        unit: item.unit,
        description: item.description,
        image: item.imageUrl,
        sellerInfo: {
          seller: {
            farmerId: item.seller.farmerId,
            farmerName: item.seller.name,
          },
          address: item.address,
        },
      },
      status: "pending",
    };

    try {
      setLoading(true);

      const response = await axios.post("/api/negotiate/list", payload);

      if (response.status === 200) {
        sendNotification({
          userId: item.seller.farmerId.replace("fam_", "user_"), // farmer receives notification
          title: t("negotiation.notificationTitle"),
          message: t("negotiation.notificationMessage", {
            buyer: user?.fullName || "buyer",
            title: item.title,
          }),
          type: "negotiation",
        });

        toast.success(t("negotiation.success"));
      }

      onClose();
    } catch {
      toast.error(t("negotiation.failure"));
    } finally {
      setLoading(false);
      refresh()
    }
  };

  return (
    <Card
      className="fixed left-1/2 top-1/2 z-50 w-full max-w-md
  -translate-x-1/2 -translate-y-1/2
  border border-amber-200/60 shadow-lg bg-white"
    >
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-amber-600" />
          {t("negotiation.title")}
        </CardTitle>

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          {t("negotiation.close")}
        </Button>

        <CardDescription>{t("negotiation.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="rounded-md bg-gray-50 p-3 text-sm">
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-gray-500">
            {t("negotiation.listedPrice", { price: item.price, unit: item.unit })}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <Label>{t("negotiation.yourOffer")}</Label>
          <div className="relative">
            <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              min={1}
              max={item.price - 1}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="pl-8"
            />
          </div>
        </div>

        <Button
          className="w-full bg-amber-500 hover:bg-amber-600"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t("negotiation.sending") : t("negotiation.submit")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NegotiationPanel;
