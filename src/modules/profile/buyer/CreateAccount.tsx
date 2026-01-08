"use client";


import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Leaf,
  CheckCircle2,
  MapPin,
  Upload,
  Phone,
  CreditCard,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";
import addressJson from "@/../public/Address.json";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface AddressType {
  states: string[];
  districts: { [key: string]: string[] };
  talukas: { [key: string]: string[] };
  villages: { [key: string]: string[] };
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateAccount() {

  const t = useTranslations("faq");

  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const Address: AddressType = addressJson;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const role = user?.unsafeMetadata.role;
  useEffect(() => {
    if (role === "farmer") {
      router.replace(`/create-account/farmer`);
    }
  }, [role , router]);

  const [form, setForm] = useState({
    phone: "",
    aadharnumber: "",
    houseBuildingName: "",
    roadarealandmarkName: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    role: "buyer",
    aadhar: null as File | null,
  });

  // Validation rules
  const validateField = (name: string, value: string | File | null) => {
    const newErrors = { ...errors };

    switch (name) {
      case "aadharnumber":
        const aadharClean = (value as string).replace(/\s/g, "");
        if (!/^\d{12}$/.test(aadharClean)) {
          newErrors.aadharnumber = "Aadhaar must be 12 digits";
        } else {
          delete newErrors.aadharnumber;
        }
        break;

      case "phone":
        const phoneClean = (value as string).replace(/[\s\-\+]/g, "");
        if (!/^\d{10}$/.test(phoneClean) && !/^91\d{10}$/.test(phoneClean)) {
          newErrors.phone = "Enter valid 10-digit phone number";
        } else {
          delete newErrors.phone;
        }
        break;

      case "aadhar":
        if (value && (value as File).size > 5 * 1024 * 1024) {
          newErrors.aadhar = "File size must be less than 5MB";
        } else {
          delete newErrors.aadhar;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Format Aadhaar number with spaces
  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ");
    }
    return cleaned;
  };

  // Format phone number
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.startsWith("91")) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7, 12)}`;
    }
    return (
      cleaned.slice(0, 5) +
      (cleaned.length > 5 ? " " + cleaned.slice(5, 10) : "")
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="text-green-600 text-lg font-medium">{t(
            "profile.loading"
          )}</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="p-8 shadow-xl max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t("profile.authRequired.title")}
            </h2>
            <p className="text-gray-600">{t("profile.authRequired.description")}</p>
            <Button
              onClick={() => router.push("/sign-up?role=buyer")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {t("profile.authRequired.signIn")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "aadharnumber") {
      formattedValue = formatAadhaar(value);
    } else if (name === "phone") {
      formattedValue = formatPhone(value);
    }

    setForm({ ...form, [name]: formattedValue });
    if (touched[name]) {
      validateField(name, formattedValue);
    }
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    validateField(name, form[name as keyof typeof form] as string);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setForm({ ...form, [e.target.name]: file });
      validateField(e.target.name, file);
    }
  };
  const uploadToImageKit = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", user.id.replace(/^user_/, "buy_"));
    formData.append("folder", folder);

    const res = await axios.post("/api/upload", formData);

    if (!res.data || !res.data.url) {
      throw new Error(`Failed to upload ${folder}`);
    }

    return res.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      let aadharUrl = "";
      if (form.aadhar) {
        toast.loading("Uploading Aadhaar...");
        aadharUrl = await uploadToImageKit(form.aadhar, "aadhar");
      }

      const formdata = new FormData();
      formdata.append("buyerId", user.id.replace(/^user_/, "buy_"));
      formdata.append("firstName", user.firstName || "");
      formdata.append("lastName", user.lastName || "");
      formdata.append("username", user.username || "");
      formdata.append("email", user.primaryEmailAddress?.emailAddress || "");
      formdata.append("phone", form.phone.replace(/\D/g, ""));
      formdata.append("aadharnumber", form.aadharnumber.replace(/\s/g, ""));
      formdata.append("state", form.state);
      formdata.append("district", form.district);
      formdata.append("taluka", form.taluka);
      formdata.append("village", form.village);
      formdata.append("houseBuildingName", form.houseBuildingName);
      formdata.append("roadarealandmarkName", form.roadarealandmarkName);
      formdata.append("aadharUrl", aadharUrl);

      const res = await axios.post("/api/profile/buyer", formdata);

      if (res.status >= 200 && res.status < 300) {
        router.push("/?success=profile-created");
      } else {
        toast.error("Failed to create profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-2xl border-0 overflow-hidden animate-in fade-in duration-500">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pb-10 pt-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <div className="text-center">
              <CardTitle className="text-3xl font-bold">
                {t("profile.buyer.createAccount.title")}
              </CardTitle>
              <CardDescription className="text-green-50 text-sm mt-1">
                {t("profile.buyer.createAccount.welcome", {
                  name: (user?.firstName as string) ?? "",
                })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {/* User Info Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-hidden">
              <div className=" transition-transform duration-500 ease-in-out">
                {/* STEP 1 - PERSONAL DETAILS */}
                <div className="w-full space-y-6">
                  {/* Section: Identity Verification */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.buyer.createAccount.section.identity")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        {t(
                          "profile.buyer.createAccount.labels.aadharnumber"
                        )} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="aadharnumber"
                        value={form.aadharnumber}
                        onChange={handleChange}
                        onBlur={() => handleBlur("aadharnumber")}
                        placeholder={t(
                          "profile.buyer.createAccount.placeholders.aadharnumber"
                        )}
                        maxLength={14}
                        className={`h-12 transition-all ${
                          form.aadharnumber
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        } ${
                          touched.aadharnumber && errors.aadharnumber
                            ? "border-red-500"
                            : ""
                        }`}
                        required
                      />
                      {touched.aadharnumber && errors.aadharnumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{" "}
                          {errors.aadharnumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        {t(
                          "profile.buyer.createAccount.labels.aadharPhoto"
                        )}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="file"
                          name="aadhar"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={`h-12 transition-all ${
                            form.aadhar ? "border-green-300 bg-green-50/30" : ""
                          }`}
                          required
                        />
                        {form.aadhar && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">
                              {form.aadhar.name.slice(0, 20)}...
                            </span>
                          </div>
                        )}
                      </div>
                      {errors.aadhar && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.aadhar}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t("profile.buyer.createAccount.hints.aadharHint")}
                      </p>
                    </div>
                  </div>

                  {/* Section: Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Phone className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.buyer.createAccount.section.contact")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {t("profile.buyer.createAccount.labels.phone")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur("phone")}
                        placeholder={t(
                          "profile.buyer.createAccount.placeholders.phone"
                        )}
                        maxLength={15}
                        className={`h-12 transition-all ${
                          form.phone ? "border-green-300 bg-green-50/30" : ""
                        } ${
                          touched.phone && errors.phone ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section: Location */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.buyer.createAccount.section.location")}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.buyer.createAccount.labels.state")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) =>
                            setForm({
                              ...form,
                              state: value,
                              district: "",
                              taluka: "",
                              village: "",
                            })
                          }
                          value={form.state}
                        >
                          <SelectTrigger
                            className={`h-12 transition-all ${
                              form.state
                                ? "border-green-300 bg-green-50/30"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder={t("profile.buyer.createAccount.placeholders.selectState")} />
                          </SelectTrigger>
                          <SelectContent>
                            {Address.states.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.buyer.createAccount.labels.district")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) =>
                            setForm({
                              ...form,
                              district: value,
                              taluka: "",
                              village: "",
                            })
                          }
                          disabled={!form.state}
                          value={form.district}
                        >
                          <SelectTrigger
                            className={`h-12 transition-all ${
                              form.district
                                ? "border-green-300 bg-green-50/30"
                                : ""
                            } ${!form.state ? "opacity-50" : ""}`}
                          >
                            <SelectValue
                              placeholder={
                                form.state
                                  ? t("profile.buyer.createAccount.placeholders.selectDistrict")
                                  : t("profile.buyer.createAccount.placeholders.selectStateFirst")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(Address.districts[form.state] || []).map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.buyer.createAccount.labels.taluka")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) =>
                            setForm({ ...form, taluka: value, village: "" })
                          }
                          disabled={!form.district}
                          value={form.taluka}
                        >
                          <SelectTrigger
                            className={`h-12 transition-all ${
                              form.taluka
                                ? "border-green-300 bg-green-50/30"
                                : ""
                            } ${!form.district ? "opacity-50" : ""}`}
                          >
                            <SelectValue
                              placeholder={
                                form.district
                                  ? t("profile.buyer.createAccount.placeholders.selectTaluka")
                                  : t("profile.buyer.createAccount.placeholders.selectDistrictFirst")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(Address.talukas[form.district] || []).map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.buyer.createAccount.labels.village")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) =>
                            setForm({ ...form, village: value })
                          }
                          disabled={!form.taluka}
                          value={form.village}
                        >
                          <SelectTrigger
                            className={`h-12 transition-all ${
                              form.village
                                ? "border-green-300 bg-green-50/30"
                                : ""
                            } ${!form.taluka ? "opacity-50" : ""}`}
                          >
                            <SelectValue
                              placeholder={
                                form.taluka
                                  ? t("profile.buyer.createAccount.placeholders.selectVillage")
                                  : t("profile.buyer.createAccount.placeholders.selectTalukaFirst")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(Address.villages[form.taluka] || []).map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section: Address Details (Optional) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Home className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.buyer.createAccount.section.address")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                        {t("profile.buyer.createAccount.labels.house")}
                      </Label>
                      <Input
                        name="houseBuildingName"
                        value={form.houseBuildingName}
                        onChange={handleChange}
                        placeholder={t(
                          "profile.buyer.createAccount.placeholders.houseExample"
                        )}
                        className={`h-12 transition-all ${
                          form.houseBuildingName
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                        {t("profile.buyer.createAccount.labels.road")}
                      </Label>
                      <Input
                        name="roadarealandmarkName"
                        value={form.roadarealandmarkName}
                        onChange={handleChange}
                        placeholder={t(
                          "profile.buyer.createAccount.placeholders.roadExample"
                        )}
                        className={`h-12 transition-all ${
                          form.roadarealandmarkName
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <div className="text-center pb-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || Object.keys(errors).length > 0}
                    className="w-full sm:w-1/2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("profile.buyer.createAccount.buttons.creating")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {t("profile.buyer.createAccount.buttons.complete")}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center text-xs text-gray-500">
                  {t("profile.legal.agreement", {
                    terms: t("profile.legal.terms"),
                    privacy: t("profile.legal.privacy"),
                  })}
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
