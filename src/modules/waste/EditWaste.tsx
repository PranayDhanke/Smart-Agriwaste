"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import {
  wasteFormDataType,
  wasteFormSchema,
} from "@/components/types/zod.waste";

// UI components you used earlier:
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import ProductList from "@/../public/Products/Product.json";
import { Loader2, Upload, Leaf } from "lucide-react";
import { toast } from "sonner";

export default function EditWaste() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const formdata = useForm({
    resolver: zodResolver(wasteFormSchema),
    defaultValues: {
      address: {
        district: "",
        houseBuildingName: "",
        roadarealandmarkName: "",
        state: "",
        taluka: "",
        village: "",
      },
      description: "",
      imageUrl: "",
      moisture: "",
      price: 0,
      quantity: 0,
      seller: {
        email: "",
        farmerId: "",
        name: "",
        phone: "",
      },
      title: "",
      unit: "",
      wasteProduct: "",
      wasteType:"",
    },
  });

  const { register, handleSubmit, reset, watch, control, formState } = formdata;
  const values = watch();

  // Local state for file/image preview
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load waste to edit
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function fetchWaste() {
      try {
        const res = await axios.get(`/api/waste/singlewaste/${id}`);
        if (!mounted) return;
        if (res?.data?.singleWaste) {
          const data = res.data.singleWaste;

          console.log(data);

          reset({
            ...data,
            image: data.image ?? data.image ?? "",
          });

          setImagePreview(data.imageUrl ?? data.image ?? null);
        } else {
          // not found
          alert("Could not load waste item");
        }
      } catch (err) {
        console.error("Failed to fetch waste:", err);
        alert("Failed to load waste data");
      }
    }

    fetchWaste();

    return () => {
      mounted = false;
    };
  }, [id, reset]);

  // Handle file selection (optional replace)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setNewImageFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(f);
    } else {
      // if user cleared file input, revert to form imageUrl
      setImagePreview(values.imageUrl || null);
    }
  };

  // Submit: upload image if newImageFile present, then PUT update
  const onSubmit = async (formValues: wasteFormDataType) => {
    if (!id) {
      alert("Missing id");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = formValues.imageUrl || "";

      // If user selected a new file, upload it
      if (newImageFile) {
        // convert file to base64 (same approach you used)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newImageFile);
        });

        toast.loading("Uploading Image");

        // upload
        const uploadRes = await axios.post("/api/waste/upload", {
          base64,
          fileName: `waste_${id}`,
        });

        if (uploadRes?.data?.url) {
          finalImageUrl = uploadRes.data.url;
        } else {
          throw new Error("Image upload failed");
        }

        toast.dismiss();
      }

      // prepare payload (ensure shape matches your backend)
      const payload: Partial<wasteFormDataType> = {
        ...formValues,
        imageUrl: finalImageUrl,
      };

      // call update endpoint (PUT)
      const updateRes = await axios.put(`/api/waste/update/${id}`, payload);

      if (updateRes.status >= 200 && updateRes.status < 300) {
        toast.success("Waste updated successfully");
        router.push("/profile/farmer/my-listing");
      } else {
        toast.error("Waste update Failed");
      }
    } catch {
      toast.error("An error occurred while updating. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-green-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900">Edit Waste</h1>
              <p className="text-sm text-green-700/80">
                Update your listing details
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>Waste Details</CardTitle>
            <CardDescription>Edit fields and save</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Listing Title</Label>
                <Input id="title" {...register("title")} className="mt-2" />
                {formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {(formState.errors.title).message}
                  </p>
                )}
              </div>

              {/* Type & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Waste Category</Label>
                  <Controller
                    control={control}
                    name="wasteType"
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v)}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">crop</SelectItem>
                          <SelectItem value="fruit">fruit</SelectItem>
                          <SelectItem value="vegetable">vegetable</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.wasteType && (
                    <p className="text-sm text-red-500">
                      {(formState.errors.wasteType).message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Specific Product</Label>
                  <Controller
                    control={control}
                    name="wasteProduct"
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v)}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue
                            placeholder={
                              values.wasteType
                                ? "Select product"
                                : "Select category first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {values.wasteType &&
                            (ProductList as Record<string, string[]>)[
                              values.wasteType
                            ].map((prod, _indx) => (
                              <SelectItem key={_indx} value={prod}>
                                {prod}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.wasteProduct && (
                    <p className="text-sm text-red-500">
                      {(formState.errors.wasteProduct).message}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                    className="mt-2"
                  />
                  {formState.errors.quantity && (
                    <p className="text-sm text-red-500">
                      {(formState.errors.quantity).message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Unit</Label>
                  <Controller
                    control={control}
                    name="unit"
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v)}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="ton">ton</SelectItem>
                          <SelectItem value="gram">gram</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.unit && (
                    <p className="text-sm text-red-500">
                      {(formState.errors.unit).message}
                    </p>
                  )}
                </div>
              </div>

              {/* Moisture & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Moisture</Label>
                  <Controller
                    name="moisture"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v)}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select moisture" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry">dry</SelectItem>
                          <SelectItem value="semiwet">semiwet</SelectItem>
                          <SelectItem value="wet">wet</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {formState.errors.moisture && (
                    <p className="text-sm text-red-500">
                      {(formState.errors.moisture ).message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="mt-2"
                  />
                  {formState.errors.price && (
                    <p className="text-sm text-red-500">
                      {(formState.errors.price ).message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Textarea
                  {...register("description")}
                  className="mt-2"
                  rows={4}
                />
                {formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {(formState.errors.description ).message}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label>Product Image</Label>

                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                      {/* next/image can accept data URL for preview */}
                      <Image
                        src={imagePreview}
                        alt="preview"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg border-dashed border-2 border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="mx-auto mb-2" />
                        <p className="text-sm">No image selected</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose file to replace existing image (optional)
                </p>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Leaf className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
