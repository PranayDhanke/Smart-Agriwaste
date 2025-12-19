"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Filter,
  MapPin,
  Leaf,
  Recycle,
  Factory,
  Search,
  ChevronRight,
  Droplets,
  X,
  TrendingUp,
  Clock,
  Package,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { WasteType } from "@/components/types/ListWaste";
import { FilterState, WasteItem } from "@/components/types/marketplace";
import axios from "axios";
import { CartItem } from "@/components/types/orders";
import { useCart } from "@/context/CartContext";
import { useUser } from "@clerk/nextjs";
import NegotiationPanel from "./NegotiationPanel";

const categoryMeta: Record<
  WasteType,
  { label: string; icon: JSX.Element; color: string; bgColor: string }
> = {
  crop: {
    label: "Crop",
    icon: <Recycle className="h-3 w-3" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100/80",
  },
  fruit: {
    label: "Fruit",
    icon: <Leaf className="h-3 w-3" />,
    color: "text-amber-700",
    bgColor: "bg-amber-100/80",
  },
  vegetable: {
    label: "Vegetable",
    icon: <Factory className="h-3 w-3" />,
    color: "text-blue-700",
    bgColor: "bg-blue-100/80",
  },
};

export default function Marketplace() {
  const [wastes, setWastes] = useState<WasteItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    address: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "recent",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const { user } = useUser();

  const role = user?.unsafeMetadata.role;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/waste/get");
        if (res.data) {
          const data = await res.data.wastedata;
          setWastes(data);
        } else {
          console.error("Failed to fetch waste listings");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        key === "sortBy" ||
        value === "" ||
        (key === "category" && value === "all")
      )
        return acc;
      return acc + 1;
    }, 0);
    setActiveFiltersCount(count);
  }, [filters]);

  const filtered = useMemo(() => {
    let list = [...wastes];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.wasteProduct.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.category !== "all") {
      list = list.filter((p) => p.wasteType === filters.category);
    }

    if (filters.address.trim()) {
      const locq = filters.address.toLowerCase();
      list = list.filter((p) => p.address.village.toLowerCase().includes(locq));
    }

    const min = filters.minPrice ? Number(filters.minPrice) : undefined;
    const max = filters.maxPrice ? Number(filters.maxPrice) : undefined;
    list = list.filter((p) => {
      const price = p.price;
      if (min !== undefined && price < min) return false;
      if (max !== undefined && price > max) return false;
      return true;
    });

    if (filters.sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filters.sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (filters.sortBy === "name")
      list.sort((a, b) => a.title.localeCompare(b.title));

    return list;
  }, [wastes, filters]);

  const [openNegotiateModal, setOpenNegotiateModal] = useState(false);

  const [negotiationItem, setNegotiationItem] = useState<WasteItem | null>(
    null
  );
  const handleNegotiate = (item: WasteItem) => {
    setNegotiationItem(item);
    setOpenNegotiateModal(true);
  };

  const handleAddToCart = (item: WasteItem) => {
    const cartItem: CartItem = {
      prodId: item._id,
      title: item.title,

      wasteType: item.wasteType,
      wasteProduct: item.wasteProduct,
      moisture: item.moisture,

      quantity: 1,
      unit: item.unit,
      price: Number(item.price),
      maxQuantity: item.quantity,

      description: item.description,
      image: item.imageUrl,

      sellerInfo: {
        seller: {
          farmerId: item.seller.farmerId,
          farmerName: item.seller.farmerId,
        },
        address: item.address,
      },
    };

    console.log(cartItems);

    addToCart(cartItem);

    toast.success(`${item.title} added to cart`);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      address: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "recent",
    });
    setShowFilters(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50">
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Marketplace
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Connect with sustainable solutions. Buy and sell agricultural
                waste products responsibly.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-green-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              {filtered.length} listings active
            </div>
          </div>
        </div>

        {/* Main Search */}
        <div className="mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <Input
              placeholder="Search waste products, categories, or sellers..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-12 h-14 bg-white border-2 border-gray-200 focus:border-green-500 rounded-lg text-base shadow-sm focus:shadow-md transition-all"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filters.category === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("category", "all")}
            className={`rounded-full ${
              filters.category === "all"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-gray-200 hover:border-green-300"
            }`}
          >
            All Products
          </Button>
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <Button
              key={key}
              variant={filters.category === key ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("category", key)}
              className={`rounded-full flex items-center gap-2 ${
                filters.category === key
                  ? key === "crop"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : key === "fruit"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-blue-600 hover:bg-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {meta.icon}
              {meta.label}
            </Button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`${
                showFilters
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "border-gray-200"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear all
              </Button>
            )}
          </div>

          <Select
            value={filters.sortBy}
            onValueChange={(value: string) =>
              handleFilterChange("sortBy", value)
            }
          >
            <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-200">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Location
                </Label>
                <Input
                  placeholder="City / District"
                  value={filters.address}
                  onChange={(e) =>
                    handleFilterChange("address", e.target.value)
                  }
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Min Price (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Max Price (₹)
                </Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="h-10 border-gray-200 focus:border-green-500"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Sort By
                </Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: string) =>
                    handleFilterChange("sortBy", value)
                  }
                >
                  <SelectTrigger className="h-10 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="name">Name (A–Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-900 text-base">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "product" : "products"}
          </p>
          {activeFiltersCount > 0 && (
            <div className="text-sm text-gray-600">
              Filters applied:{" "}
              <span className="font-semibold text-green-600">
                {activeFiltersCount}
              </span>
            </div>
          )}
        </div>

        {/* Compact Product Grid */}
        {!loading ? (
          filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <Card
                  key={p._id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm transition-all duration-300 hover:border-green-300/50 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-36 w-full overflow-hidden">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.title}
                        fill
                        sizes="auto"
                        priority
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Package className="h-10 w-10 text-gray-300" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Category */}
                    <div className="absolute top-2 right-2">
                      <div
                        className={`${categoryMeta[p.wasteType].bgColor} ${
                          categoryMeta[p.wasteType].color
                        }
              rounded-md px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm`}
                      >
                        {categoryMeta[p.wasteType].icon}
                        {categoryMeta[p.wasteType].label}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-2 left-2">
                      <div className="rounded-lg bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                        <span className="text-base font-bold text-green-600">
                          ₹{p.price}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          /{p.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-500">{p.wasteProduct}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="line-clamp-1">
                        {p.address.district.toString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span>{p.moisture}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <Package className="h-3 w-3" />
                        <span>
                          {p.quantity} {p.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {/* Not logged in */}
                    {!user?.id && (
                      <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        Login as Buyer to buy item
                      </p>
                    )}

                    {/* Buyer actions */}
                    {role === "buyer" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-gray-200 hover:bg-gray-50"
                          onClick={() => handleAddToCart(p)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          Cart
                        </Button>

                        <Button
                          size="sm"
                          className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => handleNegotiate(p)}
                        >
                          🤝 Negotiate
                        </Button>
                      </>
                    )}

                    {/* View (always aligned at end naturally) */}
                    <Link href={`/marketplace/view/?product=${p._id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-green-700 hover:bg-green-50"
                      >
                        View
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl bg-white p-16 text-center border border-gray-200">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
                <Leaf className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search filters or explore other categories
              </p>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="border-gray-300 hover:border-green-300"
              >
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-gray-200">
                <div className="h-36 bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        {negotiationItem && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setNegotiationItem(null)}
            />

            {/* Modal */}
            <NegotiationPanel
              item={negotiationItem}
              onClose={() => setNegotiationItem(null)}
            />
          </>
        )}
      </section>
    </main>
  );
}
