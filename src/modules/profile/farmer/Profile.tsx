"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const formSchema = z.object({
  phone: z.string().optional(),
  aadharnumber: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  taluka: z.string().optional(),
  village: z.string().optional(),
  houseBuildingName: z.string().optional(),
  roadarealandmarkName: z.string().optional(),
  farmNumber: z.string().optional(),
  farmArea: z.string().optional(),
  farmUnit: z.string().optional(),
  aadharUrl: z.string().optional(),
  farmDocUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Field labels will be resolved via translations inside the component

export default function Profile() {
  const { user } = useUser();
  const router = useRouter();
  const t = useTranslations("faq");

  const labelFor = (key: string) =>
    t(`profile.farmer.profile.labels.${key}`);

  const placeholderFor = (key: string) =>
    t(`profile.farmer.profile.placeholders.${key}`);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [farmDocPreview, setFarmDocPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [files, setFiles] = useState<{
    aadharFile: File | null;
    farmdocFile: File | null;
  }>({
    aadharFile: null,
    farmdocFile: null,
  });

  const farmerId = user ? user.id.replace("user_", "fam_") : "";

  // Fetch data from API when component mounts
  useEffect(() => {
    if (!farmerId) return;

    async function fetchFarmerData() {
      try {
        const response = await axios.get(`/api/profile/farmer/get/${farmerId}`);
        const account = response.data?.accountdata;
        if (!account) {
          router.push("/create-account/farmer");
          return;
        }
        const data = account;

        form.reset({
          phone: data.phone || "",
          aadharnumber: data.aadharnumber || "",
          state: data.state || "",
          district: data.district || "",
          taluka: data.taluka || "",
          village: data.village || "",
          houseBuildingName: data.houseBuildingName || "",
          roadarealandmarkName: data.roadarealandmarkName || "",
          farmNumber: data.farmNumber || "",
          farmArea: data.farmArea || "",
          farmUnit: data.farmUnit || "",
          aadharUrl: data.aadharUrl || "",
          farmDocUrl: data.farmDocUrl || "",
        });

        if (data.aadharUrl) setAadharPreview(data.aadharUrl);
        if (data.farmDocUrl) setFarmDocPreview(data.farmDocUrl);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFarmerData();
  }, [farmerId, form, router]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    field: { onChange: (value: string | ArrayBuffer | null) => void }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles({ ...files, [e.target.name]: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      field.onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadToImageKit = async (file: File, folder: string) => {
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("id", farmerId);
    formdata.append("folder", folder);

    const res = await axios.post("/api/upload", formdata);

    if (!res.data || !res.data.url) {
      toast.error("Upload failed Please Try again");
    }

    const url: string = res.data.url;

    return url;
  };

  const onSubmit = async () => {
    try {

      // Upload Aadhar if present and update the form
      if (files.aadharFile) {
        const aadharUrl = await uploadToImageKit(files.aadharFile, "aadhar");
        form.setValue("aadharUrl", aadharUrl);
      }

      // Upload farm doc if present and update the form
      if (files.farmdocFile) {
        const farmDocUrl = await uploadToImageKit(files.farmdocFile, "farmdoc");
        form.setValue("farmDocUrl", farmDocUrl);
      }

      // IMPORTANT: read the latest form values (includes urls we set above)
      const payload = form.getValues; // or: { ...values, aadharUrl: ..., farmDocUrl: ... }

      // Optional: validate farmerId
      if (!farmerId) throw new Error("Missing farmerId");

      const res = await axios.put(
        `/api/profile/farmer/update/${farmerId}`,
        payload
      );

      if (res.status >= 200 && res.status < 300) {
        toast.success("Profile updated");
        // do any post-success actions (navigate/refresh)
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (!user) return <p className="text-center py-10">{t("profile.loading")}</p>;
  if (isLoading) return <p className="text-center py-10">{t("profile.farmer.profile.loading") || t("profile.loading")}</p>;

  return (
    <div className="container py-10">
      <Card className="max-w-4xl mx-auto border-gray-200 shadow-lg">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-2xl font-bold text-green-700">
            {t("profile.farmer.profile.title")}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {t("profile.farmer.profile.subtitle")}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Farmer ID */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm">
                  <span className="font-semibold text-green-700">
                    {t("profile.farmer.profile.labels.farmerId")}
                  </span>{" "}
                  <span className="text-gray-700">{farmerId}</span>
                </p>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("profile.farmer.profile.headings.accountInformation")}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <FormLabel className="text-gray-700">{t("profile.farmer.profile.labels.firstName")}</FormLabel>
                    <Input
                      value={user?.firstName || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-gray-700">{t("profile.farmer.profile.labels.lastName")}</FormLabel>
                    <Input
                      value={user?.lastName || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-gray-700">{t("profile.farmer.profile.labels.username")}</FormLabel>
                    <Input
                      value={user?.username || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <FormLabel className="text-gray-700">
                      {t("profile.farmer.profile.labels.emailAddress")}
                    </FormLabel>
                    <Input
                      value={user?.primaryEmailAddress?.emailAddress || ""}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("profile.farmer.profile.headings.contactPersonalDetails")}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{labelFor("phone")}</FormLabel>
                        <FormControl>
                          <Input placeholder={placeholderFor("phone") || ""} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aadharnumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{labelFor("aadharnumber")}</FormLabel>
                        <FormControl>
                          <Input placeholder={placeholderFor("aadharnumber") || ""} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Address Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("profile.farmer.profile.headings.addressDetails")}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "state",
                    "district",
                    "taluka",
                    "village",
                    "houseBuildingName",
                    "roadarealandmarkName",
                  ].map((key) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">{labelFor(key)}</FormLabel>
                          <FormControl>
                            <Input placeholder={placeholderFor(key) || ""} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Farm Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("profile.farmer.profile.headings.farmInfo")}
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {["farmNumber", "farmArea", "farmUnit"].map((key) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">{labelFor(key)}</FormLabel>
                          <FormControl>
                            <Input placeholder={placeholderFor(key) || ""} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("profile.farmer.profile.headings.documents")}
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="aadharUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t("profile.farmer.profile.labels.aadharUrl")}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            name="aadharFile"
                            onChange={(e) =>
                              handleFileChange(e, setAadharPreview, field)
                            }
                          />
                        </FormControl>
                        {aadharPreview && (
                          <div className="mt-3">
                            <Image
                              src={aadharPreview}
                              alt="Aadhar preview"
                              className="rounded-lg border-2 border-gray-200 shadow-sm"
                              width={200}
                              height={120}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="farmDocUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">{t("profile.farmer.profile.labels.farmDocUrl")}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            name="farmdocFile"
                            onChange={(e) =>
                              handleFileChange(e, setFarmDocPreview, field)
                            }
                          />
                        </FormControl>
                        {farmDocPreview && (
                          <div className="mt-3">
                            <Image
                              src={farmDocPreview}
                              alt="Farm document preview"
                              className="rounded-lg border-2 border-gray-200 shadow-sm"
                              width={200}
                              height={120}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base font-semibold"
                >
                  {t("profile.farmer.profile.actions.saveChanges")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
