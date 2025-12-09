"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, Package, X, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { FarmerWasteFormData, WasteType } from "@/components/types/ListWaste";
import axios from "axios";
import { toast } from "sonner";

export default function MyListing() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<FarmerWasteFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<WasteType | "all">("all");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const farmerId = user.id.replace(/^user_/, "fam_");
        const res = await axios.get(`/api/waste/getid/${farmerId}`);

        if (!res.data || !res.data.wastedata) {
          throw new Error("Failed to fetch waste data");
        }

        const data = res.data.wastedata;
        setListings(data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      selectedType === "all" || item.wasteType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleEdit = (id: string) => {
    alert(`Edit listing ${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      // show loader if needed
      const res = await axios.delete(`/api/waste/delete/${id}`);

      if (res.status >= 200 && res.status < 300) {
        // remove from state (assumes item._id === id)
        setListings((prev) => prev.filter((item) => item._id !== id));
        toast.success("Listing deleted");
      } else {
        toast.error("Failed to delete listing. Please try again.");
      }
    } catch {
      toast.error("Delete failed. Please try again.");
    }
  };

  const wasteTypeBadgeColors = {
    crop: "bg-emerald-100 text-emerald-700 border-emerald-200",
    vegetable: "bg-blue-100 text-blue-700 border-blue-200",
    fruit: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Minimal Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
          <p className="text-gray-600">
            Manage your agricultural waste inventory
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search your listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200 focus:border-green-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("all")}
            className={
              selectedType === "all" ? "bg-green-600 hover:bg-green-700" : ""
            }
          >
            All
          </Button>
          <Button
            variant={selectedType === "crop" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("crop")}
            className={
              selectedType === "crop"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : ""
            }
          >
            Crops
          </Button>
          <Button
            variant={selectedType === "vegetable" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("vegetable")}
            className={
              selectedType === "vegetable"
                ? "bg-blue-600 hover:bg-blue-700"
                : ""
            }
          >
            Vegetables
          </Button>
          <Button
            variant={selectedType === "fruit" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("fruit")}
            className={
              selectedType === "fruit"
                ? "bg-orange-600 hover:bg-orange-700"
                : ""
            }
          >
            Fruits
          </Button>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {filteredListings.length}
            </span>{" "}
            of <span className="font-semibold">{listings.length}</span> listings
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle className="animate-spin w-12 h-12 mb-3" />
            <p className="text-gray-600 text-sm">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 text-sm">
              {search || selectedType !== "all"
                ? "Try adjusting your search or filters"
                : "Start by creating your first waste listing"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((item) => (
              <Card
                key={item._id}
                className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-200 bg-white"
              >
                {/* Image */}
                <div className="relative w-full h-40 overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      alt={item.title}
                      src={item.imageUrl}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`${
                        item.wasteType
                          ? wasteTypeBadgeColors[item.wasteType]
                          : "bg-gray-100 text-gray-700"
                      } border text-xs font-medium px-2 py-0.5`}
                    >
                      {item.wasteType || "Unknown"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="-mb-3">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.wasteProduct}
                  </p>
                </CardHeader>

                <CardContent className="space-y-2 -mb-3">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium text-gray-900">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Moisture</p>
                      <p className="font-medium text-gray-900">
                        {item.moisture}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-1">
                    <span className="text-lg font-bold text-green-600">
                      ₹{item.price}
                    </span>
                    <span className="text-xs text-gray-500"> /unit</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                    onClick={() => handleEdit(item._id)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs hover:bg-red-50 hover:border-red-500 hover:text-red-700"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
