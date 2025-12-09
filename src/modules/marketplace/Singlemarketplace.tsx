"use client";

import { JSX, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Package,
  Droplets,
  User,
  Phone,
  Mail,
  ShoppingCart,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle,
  Leaf,
  Recycle,
  Factory,
  TrendingUp,
  Scale,
} from "lucide-react";
import { WasteType } from "@/components/types/ListWaste";
import { SingleWasteItem } from "@/components/types/marketplace";
import axios from "axios";

const categoryMeta: Record<
  WasteType,
  { label: string; icon: JSX.Element; color: string; bgColor: string }
> = {
  crop: {
    label: "Crop Waste",
    icon: <Recycle className="h-5 w-5" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100/80",
  },
  fruit: {
    label: "Fruit Waste",
    icon: <Leaf className="h-5 w-5" />,
    color: "text-amber-700",
    bgColor: "bg-amber-100/80",
  },
  vegetable: {
    label: "Vegetable Waste",
    icon: <Factory className="h-5 w-5" />,
    color: "text-blue-700",
    bgColor: "bg-blue-100/80",
  },
};

export default function SingleMarketplace({ id }: { id: string }) {
  const [product, setProduct] = useState<SingleWasteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/waste/singlewaste/${id}`);

        // Axios auto-parses JSON → no res.json()
        const data = res.data;
        const singleData = data.singleWaste;

        setProduct(singleData);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      alert(`Added ${quantity} unit(s) of "${product.title}" to cart`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      alert(`Proceeding to checkout with ${quantity} unit(s)`);
      // Navigate to checkout page
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator
        .share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
        .catch((err) => console.log("Error sharing:", err));
    } else {
      alert("Share functionality not supported on this browser");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The product you are looking for does not exist or has been
              removed.
            </p>
            <Link href="/marketplace">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalPrice = parseFloat(product.price) * quantity;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        {/* Back Button */}
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-6 hover:bg-white/60 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}

              {/* Category Badge Overlay */}
              <div className="absolute top-4 left-4">
                <div
                  className={`${categoryMeta[product.wasteType].bgColor} ${
                    categoryMeta[product.wasteType].color
                  } backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-2 shadow-md`}
                >
                  {categoryMeta[product.wasteType].icon}
                  {categoryMeta[product.wasteType].label}
                </div>
              </div>

              {/* Stock Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold text-green-600 flex items-center gap-2 shadow-md">
                  <CheckCircle className="h-4 w-4" />
                  In Stock
                </div>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isFavorite ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white hover:bg-gray-50"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                {product.wasteProduct}
              </p>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  ₹{product.price}
                </span>
                <span className="text-lg text-gray-600">/unit</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Inclusive of all taxes
              </p>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Moisture</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.moisture}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Quantity</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {product.quantity}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {product.address.district}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {categoryMeta[product.wasteType].label.replace(
                        " Waste",
                        ""
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Product Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    -
                  </Button>
                  <span className="w-16 text-center font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    +
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12 bg-white hover:bg-gray-50 border-gray-300"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Seller Information */}
            {product.seller.name && (
              <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Seller Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {product.seller.name}
                        </p>
                        <p className="text-xs text-gray-600">Verified Seller</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a
                          href={`tel:${product.seller.phone}`}
                          className="text-gray-700 hover:text-green-600"
                        >
                          {product.seller.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${product.seller.email}`}
                          className="text-gray-700 hover:text-green-600"
                        >
                          {product.seller.email}
                        </a>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-2 border-green-300 hover:bg-green-50"
                    >
                      Contact Seller
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Important Information
                  </h4>
                  <p className="text-sm text-blue-800">
                    Please verify product quality and quantity upon delivery.
                    Contact the seller for any specific requirements or bulk
                    orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Similar Products
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                You might also be interested in these
              </p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="bg-white">
                View All
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Related products will appear here</p>
          </div>
        </div>
      </div>
    </main>
  );
}
