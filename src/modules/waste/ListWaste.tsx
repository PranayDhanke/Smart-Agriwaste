"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Leaf,
  Upload,
  CheckCircle2,
  Info,
  ImageIcon,
  Loader2,
} from "lucide-react";
import ProductList from "@/../public/Products/Product.json";
import Image from "next/image";
import { toast } from "sonner";
import { Unit, WasteFormData, WasteType } from "@/components/types/ListWaste";
import { FarmerAccount } from "@/components/types/farmerAccount";
import axios from "axios";

export default function ListWaste() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<WasteFormData>({
    title: "",
    wasteType: "",
    wasteProduct: "",
    quantity: 0,
    moisture: "",
    price: 0,
    description: "",
    image: null,
    seller: {
      farmerId: "",
      name: "",
      email: "",
      phone: "",
    },
    address: {
      district: "",
      houseBuildingName: "",
      roadarealandmarkName: "",
      state: "",
      taluka: "",
      village: "",
    },
    unit: "",
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate form completion percentage
  const calculateProgress = () => {
    const keysToCheck = [
      "title",
      "wasteType",
      "wasteProduct",
      "quantity",
      "moisture",
      "price",
      "description",
      "image",
    ] as const;

    const isFilled = (key: (typeof keysToCheck)[number]) => {
      const value = formData[key];

      if (key === "image") {
        return value !== null;
      }

      if (typeof value === "string") {
        return value.trim() !== "";
      }

      return Boolean(value);
    };

    const filled = keysToCheck.filter(isFilled).length;
    return (filled / keysToCheck.length) * 100;
  };

  if (isLoaded && !user) {
    redirect("/sign-in");
  }
  useEffect(() => {
    const sellerInfo = async () => {
      if (!user) return;
      const res = await axios.get(
        `/api/profile/farmer/get/${user.id.replace(/^user_/, "fam_")}`
      );

      if (!res.data) return;

      const farmerData: FarmerAccount = res.data.accountdata;

      console.log(farmerData);
      

      setFormData((prev) => ({
        ...prev,
        address: {
          district: farmerData.district,
          houseBuildingName: farmerData.houseBuildingName,
          roadarealandmarkName: farmerData.roadarealandmarkName,
          state: farmerData.state,
          taluka: farmerData.taluka,
          village: farmerData.village,
        },
        seller: {
          farmerId: farmerData.farmerId,
          email: farmerData.email,
          name: `${farmerData.firstName} ${farmerData.lastName}`,
          phone: farmerData.phone,
        },
      }));
    };

    sellerInfo();
  }, [user]);

  // Inline validation
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "title":
        if (value.length < 3) {
          newErrors.title = "Title must be at least 3 characters";
        } else {
          delete newErrors.title;
        }
        break;
      case "quantity":
        if (value.length <= 0) {
          newErrors.quantity = "Please Entre quantity";
        } else {
          delete newErrors.quantity;
        }
        break;
      case "price":
        if (value.length <= 0) {
          newErrors.price = "Please Entre price";
        } else {
          delete newErrors.price;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image) {
      setErrors({ ...errors, image: "Please upload an image" });
      return;
    }

    setLoading(true);

    try {
      const imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(formData.image!);
        reader.onload = () => resolve(reader.result as string);
      });

      toast.loading("Uploading image...");
      const uploadRes = await axios.post("/api/waste/upload", {
        base64: imageBase64,
        fileName: `${user?.id.replace(/^user_/, "fam_")}_${
          formData.wasteProduct
        }`,
      });

      const uploadData = uploadRes.data;
      toast.dismiss();

      if (!uploadData || !uploadData.url) {
        toast.error("Image upload failed. Please try again.");
      }

      const payload = {
        title: formData.title,
        wasteType: formData.wasteType,
        wasteProduct: formData.wasteProduct,
        quantity: formData.quantity,
        moisture: formData.moisture,
        price: formData.price,
        description: formData.description,
        seller: formData.seller,
        address: formData.address,
        imageUrl: uploadData.url,
        unit: formData.unit,
      };

      const res = await axios.post("/api/waste/list", payload);

      if (res.status >= 200 && res.status < 300) {
        toast.success("Waste listed successfully!");
        router.push("/profile/farmer/my-listing");
      } else {
        toast.error("Failed to list waste. Please try again.");
      }
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <main className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-900">
                List Your Agricultural Waste
              </h1>
              <p className="text-green-700/70 text-sm mt-1">
                Connect with buyers and turn your waste into value
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">
                Form Completion
              </span>
              <span className="text-sm font-semibold text-green-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-green-900">
              Waste Details
            </CardTitle>
            <CardDescription className="text-base">
              Fill in the information below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                  <Info className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Basic Information
                  </h3>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Listing Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g., Fresh Cotton Crop Residues Available"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      validateField("title", e.target.value);
                    }}
                    className={`h-12 transition-all ${
                      formData.title ? "border-green-300 bg-green-50/30" : ""
                    } ${errors.title ? "border-red-500" : ""}`}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.title}
                    </p>
                  )}
                </div>

                {/* Type & Product - Side by Side */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wasteType" className="text-sm font-medium">
                      Waste Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      onValueChange={(value: WasteType) =>
                        setFormData({
                          ...formData,
                          wasteType: value,
                          wasteProduct: "",
                        })
                      }
                      value={formData.wasteType}
                    >
                      <SelectTrigger
                        id="wasteType"
                        className={`h-12 transition-all ${
                          formData.wasteType
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crop">🌾 Crop Residues</SelectItem>
                        <SelectItem value="fruit">🍓 Fruits</SelectItem>
                        <SelectItem value="vegetable">🥬 Vegetables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product" className="text-sm font-medium">
                      Specific Product <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      disabled={!formData.wasteType}
                      required
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, wasteProduct: value })
                      }
                      value={formData.wasteProduct}
                    >
                      <SelectTrigger
                        id="product"
                        className={`h-12 transition-all ${
                          formData.wasteProduct
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        } ${!formData.wasteType ? "opacity-50" : ""}`}
                      >
                        <SelectValue
                          placeholder={
                            formData.wasteType
                              ? "Select product"
                              : "Select category first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.wasteType &&
                          ProductList[formData.wasteType].map(
                            (item: string) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 2: Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Specifications
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">
                      Available Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      required
                      placeholder="e.g., 2 tons or 500 kg"
                      value={formData.quantity}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          quantity: e.target.valueAsNumber,
                        });
                        validateField("quantity", e.target.value);
                      }}
                      className={`h-12 transition-all ${
                        formData.quantity
                          ? "border-green-300 bg-green-50/30"
                          : ""
                      } ${errors.quantity ? "border-red-500" : ""}`}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.quantity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moisture" className="text-sm font-medium">
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      onValueChange={(value: Unit) =>
                        setFormData({ ...formData, unit: value })
                      }
                      value={formData.unit}
                    >
                      <SelectTrigger
                        id="moisture"
                        className={`h-12 transition-all ${
                          formData.unit ? "border-green-300 bg-green-50/30" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select Unit For Quantity" />
                      </SelectTrigger>
                      <SelectContent>
                        {["kg", "ton", "gram"].map((item, _idx) => (
                          <SelectItem key={_idx} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* moisture and Price */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Expected Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      id="price"
                      required
                      placeholder="e.g., ₹2000 per ton"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          price: e.target.valueAsNumber,
                        });
                        validateField("price", e.target.value);
                      }}
                      className={`h-12 transition-all ${
                        formData.price ? "border-green-300 bg-green-50/30" : ""
                      } ${errors.price ? "border-red-500" : ""}`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Provide your expected price with unit (per ton, per kg,
                      etc.)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moisture" className="text-sm font-medium">
                      Moisture Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, moisture: value })
                      }
                      value={formData.moisture}
                    >
                      <SelectTrigger
                        id="moisture"
                        className={`h-12 transition-all ${
                          formData.moisture
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select moisture level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry">☀️ Dry</SelectItem>
                        <SelectItem value="semiwet">🌤️ Semi-wet</SelectItem>
                        <SelectItem value="wet">💧 Wet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    required
                    placeholder="Describe the condition, storage, location, and any other relevant details about your agricultural waste..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={5}
                    className={`resize-none transition-all ${
                      formData.description
                        ? "border-green-300 bg-green-50/30"
                        : ""
                    }`}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {formData.description.length} characters
                  </p>
                </div>
              </div>

              {/* Section 3: Upload Image */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                  <ImageIcon className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Product Image
                  </h3>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="image" className="text-sm font-medium">
                    Upload Photo <span className="text-red-500">*</span>
                  </Label>

                  {imagePreview ? (
                    <div className="relative group w-full h-64 object-cover rounded-lg border-2 border-green-200">
                      <Image src={imagePreview} alt="Preview" fill />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Label
                          htmlFor="image"
                          className="cursor-pointer bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
                        >
                          Change Image
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <Label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50/50 transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-12 w-12 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or JPEG (MAX. 5MB)
                        </p>
                      </div>
                    </Label>
                  )}

                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {errors.image && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.image}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-semibold bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Listing Your Waste...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-2 h-5 w-5" />
                    List Waste Now
                  </>
                )}
              </Button>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-500">
                By submitting, you agree to our terms of service and privacy
                policy
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
