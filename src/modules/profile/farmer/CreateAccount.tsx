"use client";

import { useUser } from "@clerk/nextjs";
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
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  CheckCircle2,
  User,
  MapPin,
  FileText,
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
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const t = useTranslations("faq");
  const Address: AddressType = addressJson;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    phone: "",
    aadharnumber: "",
    houseBuildingName: "",
    roadarealandmarkName: "",
    state: "",
    district: "",
    taluka: "",
    village: "",
    role: "farmer",
    aadhar: null as File | null,
    farmdoc: null as File | null,
    farmNumber: "",
    farmArea: "",
    farmUnit: "hectare",
  });

  const role = user?.unsafeMetadata.role;
  useEffect(() => {
    if (role === "buyer") {
      router.replace(`/create-account/buyer`);
    }
  }, [role , router]);

  // Validation rules
  const validateField = (name: string, value: string | File | null) => {
    const newErrors = { ...errors };

    switch (name) {
      case "aadharnumber": {
        const aadharClean = (value as string).replace(/\s/g, "");
        if (!aadharClean) {
          newErrors.aadharnumber = t("profile.farmer.createAccount.errors.aadharnumber.required");
        } else if (!/^\d{12}$/.test(aadharClean)) {
          newErrors.aadharnumber = t("profile.farmer.createAccount.errors.aadharnumber.invalid");
        } else {
          delete newErrors.aadharnumber;
        }
        break;
      }

      case "phone": {
        const phoneClean = (value as string).replace(/[\s\-\+]/g, "");
        if (!phoneClean) {
          newErrors.phone = t("profile.farmer.createAccount.errors.phone.required");
        } else if (
          !/^\d{10}$/.test(phoneClean) &&
          !/^91\d{10}$/.test(phoneClean)
        ) {
          newErrors.phone = t("profile.farmer.createAccount.errors.phone.invalid");
        } else {
          delete newErrors.phone;
        }
        break;
      }

      case "farmArea": {
        if (!value || String(value).trim() === "") {
          newErrors.farmArea = t("profile.farmer.createAccount.errors.farmArea.required");
        } else if (isNaN(Number(value))) {
          newErrors.farmArea = t("profile.farmer.createAccount.errors.farmArea.invalidNumber");
        } else if (parseFloat(value as string) <= 0) {
          newErrors.farmArea = t("profile.farmer.createAccount.errors.farmArea.greaterThanZero");
        } else {
          delete newErrors.farmArea;
        }
        break;
      }

      case "state":
        if (!value || (value as string).trim() === "") {
          newErrors.state = t("profile.farmer.createAccount.errors.state.required");
        } else {
          delete newErrors.state;
        }
        break;

      case "district":
        if (!value || (value as string).trim() === "") {
          newErrors.district = t("profile.farmer.createAccount.errors.district.required");
        } else {
          delete newErrors.district;
        }
        break;

      case "taluka":
        if (!value || (value as string).trim() === "") {
          newErrors.taluka = t("profile.farmer.createAccount.errors.taluka.required");
        } else {
          delete newErrors.taluka;
        }
        break;

      case "village":
        if (!value || (value as string).trim() === "") {
          newErrors.village = t("profile.farmer.createAccount.errors.village.required");
        } else {
          delete newErrors.village;
        }
        break;

      case "farmNumber":
        if (!value || (value as string).trim() === "") {
          newErrors.farmNumber = t("profile.farmer.createAccount.errors.farmNumber.required");
        } else {
          delete newErrors.farmNumber;
        }
        break;

      case "aadhar":
        // UI says max 5MB for Aadhaar
        if (!value) {
          newErrors.aadhar = t("profile.farmer.createAccount.errors.aadhar.required");
        } else if ((value as File).size > 1 * 1024 * 1024) {
          newErrors.aadhar = t("profile.farmer.createAccount.errors.aadhar.maxSize");
        } else {
          delete newErrors.aadhar;
        }
        break;

      case "farmdoc":
        // UI says max 10MB for farm doc
        if (!value) {
          newErrors.farmdoc = t("profile.farmer.createAccount.errors.farmdoc.required");
        } else if ((value as File).size > 1 * 1024 * 1024) {
          newErrors.farmdoc = t("profile.farmer.createAccount.errors.farmdoc.maxSize");
        } else {
          delete newErrors.farmdoc;
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
          <span className="text-green-600 text-lg font-medium">{t("profile.loading")}</span>
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
              onClick={() => router.push("/sign-up?role=farmer")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {t("profile.farmer.createAccount.authSignUp")}
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
    validateField(
      name,
      form[name as keyof typeof form] as string | File | null
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setForm({ ...form, [e.target.name]: file });
      setTouched({ ...touched, [e.target.name]: true });
      validateField(e.target.name, file);
    }
  };

  const uploadToImageKit = async (file: File, folder: string) => {
    const data = new FormData();
    data.append("file", file);
    data.append("id", user.id.replace(/^user_/, "fam_"));
    data.append("folder", folder);

    const res = await axios.post(`/api/upload`, data);

    // basic validation
    if (!res.data || !res.data.url) {
      throw new Error(`Failed to upload ${folder}`);
    }

    return res.data.url; // <-- no await needed
  };

  const validateStepFields = (stepToValidate: number) => {
    // returns boolean whether step is valid
    const requiredForStep1 = [
      "aadharnumber",
      "aadhar",
      "phone",
      "state",
      "district",
      "taluka",
      "village",
    ];
    const requiredForStep2 = ["farmNumber", "farmdoc", "farmArea", "farmUnit"];

    const prevErrors = { ...errors };

    if (stepToValidate === 1) {
      requiredForStep1.forEach((f) => {
        const val = form[f as keyof typeof form] as string | File | null;
        validateField(f, val);
      });
    } else if (stepToValidate === 2) {
      requiredForStep2.forEach((f) => {
        const val = form[f as keyof typeof form] as string | File | null;
        validateField(f, val);
      });
    }

    // after validateField runs (which sets errors), check errors relevant to this step
    const hasErrorInStep =
      stepToValidate === 1
        ? requiredForStep1.some((f) => Boolean(errors[f]))
        : requiredForStep2.some((f) => Boolean(errors[f]));

    // but validateField setErrors asynchronously, so double-check by deriving local checks
    const localHasError =
      stepToValidate === 1
        ? requiredForStep1.some((f) => {
            const val = form[f as keyof typeof form];
            if (f === "aadhar" || f === "farmdoc") return !(val as File | null);
            return !val || String(val).trim() === "" || Boolean(prevErrors[f]);
          })
        : requiredForStep2.some((f) => {
            const val = form[f as keyof typeof form];
            if (f === "aadhar" || f === "farmdoc") return !(val as File | null);
            return !val || String(val).trim() === "" || Boolean(prevErrors[f]);
          });

    return !localHasError && !hasErrorInStep;
  };

  const canProceedToStep2 = () => {
    // check presence for all step1 fields and no current errors
    const requiredForStep1 = [
      "aadharnumber",
      "aadhar",
      "phone",
      "state",
      "district",
      "taluka",
      "village",
    ];

    const missing = requiredForStep1.some((f) => {
      const val = form[f as keyof typeof form];
      if (f === "aadhar" || f === "farmdoc") return !(val as File | null);
      return !val || String(val).trim() === "";
    });

    return !missing && Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    // mark touched for step 1
    const fieldsToTouch = [
      "aadharnumber",
      "aadhar",
      "phone",
      "state",
      "district",
      "taluka",
      "village",
    ];
    const newTouched = { ...touched };
    fieldsToTouch.forEach((f) => (newTouched[f] = true));
    setTouched(newTouched);

    // validate step 1 fields
    fieldsToTouch.forEach((field) =>
      validateField(
        field,
        form[field as keyof typeof form] as string | File | null
      )
    );

    // decide if we can proceed
    const ok = validateStepFields(1);
    if (ok) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // touch all fields
    const allFields = [
      "aadharnumber",
      "aadhar",
      "phone",
      "state",
      "district",
      "taluka",
      "village",
      "farmNumber",
      "farmdoc",
      "farmArea",
      "farmUnit",
    ];
    const newTouched = { ...touched };
    allFields.forEach((f) => (newTouched[f] = true));
    setTouched(newTouched);

    // validate all
    allFields.forEach((field) =>
      validateField(
        field,
        form[field as keyof typeof form] as string | File | null
      )
    );

    // local presence + error check
    const missing = allFields.some((f) => {
      const val = form[f as keyof typeof form];
      if (f === "aadhar" || f === "farmdoc") return !(val as File | null);
      return !val || String(val).trim() === "";
    });

    if (missing || Object.keys(errors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please fill all required fields correctly before submitting.",
      }));
      setLoading(false);
      return;
    }

    try {
      let aadharUrl = "";
      let farmDocUrl = "";

      if (form.aadhar) {
        toast.loading(t("profile.farmer.createAccount.uploading.aadhar"));
        aadharUrl = await uploadToImageKit(form.aadhar, "aadhar");
      }

      if (form.farmdoc) {
        toast.loading(t("profile.farmer.createAccount.uploading.farmdoc"));
        farmDocUrl = await uploadToImageKit(form.farmdoc, "farmdoc");
      }

      const formdata = new FormData();
      formdata.append("farmerId", user.id.replace(/^user_/, "fam_"));
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
      formdata.append("farmNumber", form.farmNumber);
      formdata.append("farmArea", form.farmArea);
      formdata.append("farmUnit", form.farmUnit);
      formdata.append("aadharUrl", aadharUrl);
      formdata.append("farmDocUrl", farmDocUrl);

      const res = await axios.post("/api/profile/farmer", formdata);

      if (res.status >= 200 && res.status < 300) {
        router.push("/?success=profile-created");
      } else {
        toast.error(t("profile.farmer.createAccount.toasts.createFailed"));
      }
    } catch {
      setErrors({ submit: t("profile.farmer.createAccount.errors.submit") });
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
                {t("profile.farmer.createAccount.title")}
              </CardTitle>
              <CardDescription className="text-green-50 text-sm mt-1">
                {t("profile.farmer.createAccount.welcome", { name: user.firstName ?? "" })}
              </CardDescription>
            </div>
          </div>

          {/* Enhanced Progress Indicator */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between relative">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 w-full  h-1 bg-white/20 -translate-y-1/2 -z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 transition-all duration-500 -z-0"
                style={{ width: step >= 2 ? "100%" : "0%" }}
              ></div>

              {/* Step 1 */}
              <div className="flex flex-col pr-10 items-center gap-2 z-10 relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= 2
                      ? "bg-white text-green-600 scale-100"
                      : step === 1
                      ? "bg-white text-green-600 scale-110 shadow-lg"
                      : "bg-white/30 text-white"
                  }`}
                >
                  {step >= 2 ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="absolute -bottom-8 left-1/2 pr-10 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`text-xs font-medium ${
                      step >= 1 ? "text-white" : "text-green-200"
                    }`}
                  >
                    {t("profile.farmer.createAccount.stepLabels.personal")}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col pl-10 items-center gap-2 z-10 relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= 2
                      ? "bg-white text-green-600 scale-110 shadow-lg"
                      : "bg-white/30 text-white scale-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-8 pl-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`text-xs font-medium ${
                      step >= 2 ? "text-white" : "text-green-200"
                    }`}
                  >
                    {t("profile.farmer.createAccount.stepLabels.farm")}
                  </span>
                </div>
              </div>
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
              <Badge className="ml-auto bg-green-600">{t("profile.farmer.createAccount.step", { step })}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
              >
                {/* STEP 1 - PERSONAL DETAILS */}
                <div className="w-full flex-shrink-0 space-y-6">
                  {/* Section: Identity Verification */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.farmer.createAccount.section.identity")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        {t("profile.farmer.createAccount.labels.aadharnumber")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="aadharnumber"
                        value={form.aadharnumber}
                        onChange={handleChange}
                        onBlur={() => handleBlur("aadharnumber")}
                        placeholder="XXXX XXXX XXXX"
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
                        {t("profile.farmer.createAccount.labels.aadharPhoto")} <span className="text-red-500">*</span>
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
                        {t("profile.farmer.createAccount.hints.aadharHint")}
                      </p>
                    </div>
                  </div>

                  {/* Section: Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Phone className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.farmer.createAccount.section.contact")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        {t("profile.farmer.createAccount.labels.phone")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur("phone")}
                        placeholder="+91 XXXXX XXXXX"
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
                        {t("profile.farmer.createAccount.section.location")}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.farmer.createAccount.labels.state")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) => {
                            setForm({
                              ...form,
                              state: value,
                              district: "",
                              taluka: "",
                              village: "",
                            });
                            validateField("state", value);
                          }}
                          value={form.state}
                        >
                          <SelectTrigger
                            className={`h-12 transition-all ${
                              form.state
                                ? "border-green-300 bg-green-50/30"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder={t("profile.farmer.createAccount.placeholders.selectState")} />
                          </SelectTrigger>
                          <SelectContent>
                            {Address.states.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.state && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.state}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.farmer.createAccount.labels.district")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) => {
                            setForm({
                              ...form,
                              district: value,
                              taluka: "",
                              village: "",
                            });
                            validateField("district", value);
                          }}
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
                                  ? t("profile.farmer.createAccount.placeholders.selectDistrict")
                                  : t("profile.farmer.createAccount.placeholders.selectStateFirst")
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
                        {errors.district && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{" "}
                            {errors.district}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.farmer.createAccount.labels.taluka")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) => {
                            setForm({ ...form, taluka: value, village: "" });
                            validateField("taluka", value);
                          }}
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
                                  ? t("profile.farmer.createAccount.placeholders.selectTaluka")
                                  : t("profile.farmer.createAccount.placeholders.selectDistrictFirst")
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
                        {errors.taluka && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.taluka}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.farmer.createAccount.labels.village")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) => {
                            setForm({ ...form, village: value });
                            validateField("village", value);
                          }}
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
                                  ? t("profile.farmer.createAccount.placeholders.selectVillage")
                                  : t("profile.farmer.createAccount.placeholders.selectTalukaFirst")
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
                        {errors.village && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {errors.village}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Address Details (Optional visually, but required per request) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Home className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.farmer.createAccount.section.address")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t("profile.farmer.createAccount.labels.houseBuildingName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="houseBuildingName"
                        value={form.houseBuildingName}
                        onChange={handleChange}
                        onBlur={() => handleBlur("houseBuildingName")}
                        placeholder="e.g., House No. 123, Residential Complex"
                        className={`h-12 transition-all ${
                          form.houseBuildingName
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t("profile.farmer.createAccount.labels.roadarealandmarkName")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="roadarealandmarkName"
                        value={form.roadarealandmarkName}
                        onChange={handleChange}
                        onBlur={() => handleBlur("roadarealandmarkName")}
                        placeholder="e.g., Near Town Hall, MG Road"
                        className={`h-12 transition-all ${
                          form.roadarealandmarkName
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!canProceedToStep2()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("profile.farmer.createAccount.actions.continueToFarmDetails")}
                    <CheckCircle2 className="ml-2 h-5 w-5" />
                  </Button>

                  {!canProceedToStep2() && (
                    <p className="text-sm text-center text-amber-600 flex items-center justify-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {t("profile.farmer.createAccount.validation.fillRequired")}
                    </p>
                  )}
                </div>

                {/* STEP 2 - FARM DETAILS */}
                <div className="w-full flex-shrink-0 space-y-6 pl-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <FileText className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {t("profile.farmer.createAccount.section.farmDocumentation")}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        {t("profile.farmer.createAccount.labels.farmNumber")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        name="farmNumber"
                        value={form.farmNumber}
                        onChange={handleChange}
                        onBlur={() => handleBlur("farmNumber")}
                        placeholder="Enter your land document number"
                        className={`h-12 transition-all ${
                          form.farmNumber
                            ? "border-green-300 bg-green-50/30"
                            : ""
                        }`}
                        required
                      />
                      {errors.farmNumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{" "}
                          {errors.farmNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t("profile.farmer.createAccount.hints.farmNumberNote")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        {t("profile.farmer.createAccount.labels.uploadFarmDoc")} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type="file"
                          name="farmdoc"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className={`h-12 transition-all ${
                            form.farmdoc
                              ? "border-green-300 bg-green-50/30"
                              : ""
                          }`}
                          required
                        />
                        {form.farmdoc && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 text-sm font-medium">
                              {form.farmdoc.name.slice(0, 15)}...
                            </span>
                          </div>
                        )}
                      </div>
                      {errors.farmdoc && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.farmdoc}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {t("profile.farmer.createAccount.hints.farmdocHint")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-gray-900">{t("profile.farmer.createAccount.labels.farmArea")}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.farmer.createAccount.labels.totalArea")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          name="farmArea"
                          value={form.farmArea}
                          onChange={handleChange}
                          onBlur={() => handleBlur("farmArea")}
                          placeholder="e.g., 5.5"
                          className={`h-12 transition-all ${
                            form.farmArea
                              ? "border-green-300 bg-green-50/30"
                              : ""
                          } ${
                            touched.farmArea && errors.farmArea
                              ? "border-red-500"
                              : ""
                          }`}
                          required
                        />
                        {touched.farmArea && errors.farmArea && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{" "}
                            {errors.farmArea}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          {t("profile.farmer.createAccount.labels.unit")} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          onValueChange={(value:string) => {
                            setForm({ ...form, farmUnit: value });
                            validateField("farmUnit", value);
                          }}
                          value={form.farmUnit}
                        >
                            <SelectTrigger className="h-12 border-green-300 bg-green-50/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hectare">{t("profile.farmer.createAccount.units.hectareLabel")}</SelectItem>
                            <SelectItem value="acre">{t("profile.farmer.createAccount.units.acreLabel")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {form.farmArea && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">
                            {t("profile.farmer.createAccount.labels.totalArea")}
                          </span>{" "}
                          {form.farmArea}{" "}
                          {form.farmUnit === "hectare" ? t("profile.farmer.createAccount.units.hectares") : t("profile.farmer.createAccount.units.acres")}
                          {form.farmUnit === "hectare" && form.farmArea && (
                            <span className="text-blue-600">
                              {" "}
                              ≈ {(parseFloat(form.farmArea) * 2.471).toFixed(2)}{" "}
                              {t("profile.farmer.createAccount.units.acres")}
                            </span>
                          )}
                          {form.farmUnit === "acre" && form.farmArea && (
                            <span className="text-blue-600">
                              {" "}
                              ≈ {(parseFloat(form.farmArea) / 2.471).toFixed(2)}{" "}
                              {t("profile.farmer.createAccount.units.hectares")}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="w-full sm:w-1/2 border-2 border-green-600 text-green-600 hover:bg-green-50 h-14 text-base font-semibold"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5 rotate-180" />
                      {t("profile.farmer.createAccount.actions.backToPersonalInfo")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || Object.keys(errors).length > 0}
                      className="w-full sm:w-1/2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("profile.farmer.createAccount.actions.creating")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          {t("profile.farmer.createAccount.actions.completeRegistration")}
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    {t("legal.agreement", { terms: t("legal.terms"), privacy: t("legal.privacy") })}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
