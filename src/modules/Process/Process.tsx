"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProductList from "@/../public/Products/Product.json";
import ProcessMapping from "@/../public/WasteSet/ProcessMapping.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

import {
  Leaf,
  Recycle,
  Target,
  AlertTriangle,
  ChevronRight,
  Copy,
  Download,
  Clock,
  Hammer,
  Droplet,
  Sun,
  X,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import { WasteForm, WasteType } from "@/components/types/ListWaste";

export default function Process() {
  const [formData, setFormData] = useState<WasteForm>({
    wasteType: "",
    wasteProduct: "",
    quantity: 0,
    moisture: "dry",
    currentMethod: "",
    intendedUse: "",
    contamination: "no",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const moistureToKey = (m: string) => {
    if (!m) return "low_moisture";
    if (m === "dry") return "low_moisture";
    if (m === "semiwet") return "medium_moisture";
    if (m === "wet") return "high_moisture";
    return m;
  };

  const moistureLabelToPct = (m: string) => {
    if (m === "dry") return "≤ 25% (Dry)";
    if (m === "semiwet") return "25–50% (Semi-wet)";
    if (m === "wet") return "≥ 50% (Wet)";
    return "";
  };

  const presets = [
    {
      label: "Wheat — Dry → Compost",
      payload: {
        wasteType: "crop",
        wasteProduct: "Wheat",
        moisture: "dry",
        intendedUse: "compost",
      },
    },
    {
      label: "Rice — Wet → Biogas",
      payload: {
        wasteType: "crop",
        wasteProduct: "Rice",
        moisture: "wet",
        intendedUse: "biogas",
      },
    },
    {
      label: "Banana — Wet → Feed",
      payload: {
        wasteType: "fruit",
        wasteProduct: "Banana",
        moisture: "wet",
        intendedUse: "compost",
      },
    },
  ];

  function applyPreset(p: any) {
    setFormData({ ...formData, ...p.payload });
    setResult(null);
    setError("");
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  const inferNeeds = (procSteps: string[]) => {
    const needs: string[] = [];
    const joined = procSteps.join(" ").toLowerCase();
    if (
      joined.includes("compost") ||
      joined.includes("aerobic") ||
      joined.includes("turning")
    )
      needs.push("Space for compost pile & turning fork");
    if (
      joined.includes("manure") ||
      joined.includes("cow dung") ||
      joined.includes("mixing")
    )
      needs.push("Access to animal manure");
    if (
      joined.includes("dry") ||
      joined.includes("drying") ||
      joined.includes("air-drying")
    )
      needs.push("Open area for drying");
    if (
      joined.includes("bale") ||
      joined.includes("baler") ||
      joined.includes("pellet")
    )
      needs.push("Mechanical baling equipment");
    if (
      joined.includes("anaerobic") ||
      joined.includes("digestion") ||
      joined.includes("biogas")
    )
      needs.push("Anaerobic digester");
    if (
      joined.includes("ferment") ||
      joined.includes("pulping") ||
      joined.includes("vinegar")
    )
      needs.push("Fermentation vessel");
    if (needs.length === 0) needs.push("Basic tools & drying space");
    return needs;
  };

  const estimateDifficulty = (procSteps: string[]) => {
    const joined = procSteps.join(" ").toLowerCase();
    if (
      joined.includes("anaerobic") ||
      joined.includes("pellet") ||
      joined.includes("distillation")
    )
      return {
        label: "Higher (equipment needed)",
        score: 3,
        color: "text-orange-600",
      };
    if (
      joined.includes("compost") ||
      joined.includes("drying") ||
      joined.includes("chopping")
    )
      return {
        label: "Medium (manual work)",
        score: 2,
        color: "text-yellow-600",
      };
    return { label: "Easy (simple steps)", score: 1, color: "text-green-600" };
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const { wasteType, wasteProduct, moisture } = formData;

      if (!wasteType || !wasteProduct || !moisture) {
        setError("Please choose waste type, product and moisture level.");
        setIsSubmitting(false);
        return;
      }

      const typeMap: any = (ProcessMapping as any).waste_management_rules?.[
        wasteType
      ];

      if (!typeMap) {
        setError(
          `We don't have guidance for "${wasteType}". Try a different type.`
        );
        setIsSubmitting(false);
        return;
      }

      const productMap: any = typeMap[wasteProduct];
      if (!productMap) {
        setError(
          `No guidance found for "${wasteProduct}". Try a similar product.`
        );
        setIsSubmitting(false);
        return;
      }

      const key = moistureToKey(moisture);
      const recommended = productMap[key] || productMap["default"];
      if (!recommended) {
        setError("No recommendation available. Try different options.");
        setIsSubmitting(false);
        return;
      }

      const needs = inferNeeds(recommended.process || []);
      const difficulty = estimateDifficulty(recommended.process || []);

      setResult({
        key: `${wasteType}.${wasteProduct}.${key}`,
        recommended_process: recommended.process || [],
        final_use: recommended.final_use || "—",
        notes: recommended.notes || "",
        needs,
        difficulty,
      });

      setSidebarOpen(true);
      setTimeout(() => window.scrollTo({ top: 400, behavior: "smooth" }), 150);
    } catch (err) {
      console.error("Lookup error:", err);
      setError("Unexpected error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      alert("Recommendation copied to clipboard!");
    } catch {
      alert("Unable to copy. Try download instead.");
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      formData.wasteProduct || "recommendation"
    }-recommendation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearResult = () => {
    setResult(null);
    setSidebarOpen(false);
  };

  // Render sidebar content
  const renderSidebarContent = () => {
    if (result) {
      return (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Result Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  Ready to Go!
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {result.final_use}
                </p>
              </div>
            </div>
            <button
              onClick={clearResult}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition"
              aria-label="Close result"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <Separator />

          {/* Process Steps */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-3">
              Step-by-step plan
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {result.recommended_process.map((step: string, i: number) => (
                <div key={i} className="flex gap-2 items-start text-xs">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold flex-shrink-0 text-xs">
                    {i + 1}
                  </div>
                  <div className="text-gray-700 pt-0.5">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What You Need */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Hammer className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-gray-900">
                What you'll need
              </span>
            </div>
            <ul className="space-y-1">
              {result.needs.map((need: string, idx: number) => (
                <li key={idx} className="text-xs text-gray-700 flex gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{need}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Difficulty Level */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-gray-900">
                Effort level
              </span>
            </div>
            <div className={`text-sm font-medium ${result.difficulty.color}`}>
              {result.difficulty.label}
            </div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((score) => (
                <div
                  key={score}
                  className={`h-2 flex-1 rounded-full ${
                    score <= result.difficulty.score
                      ? "bg-amber-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          {result.notes && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-xs font-semibold text-gray-900 mb-2">
                Important notes
              </div>
              <div className="text-xs text-gray-700 leading-relaxed">
                {result.notes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={copyResult}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              onClick={downloadResult}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* Farmer Tips */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-green-700" />
              <span className="text-xs font-semibold text-gray-900">
                Quick tips
              </span>
            </div>
            <ul className="space-y-1.5">
              <li className="text-xs text-gray-700">
                ✓ Remove plastics & metal before processing
              </li>
              <li className="text-xs text-gray-700">
                ✓ Keep compost piles moist, turn weekly
              </li>
              <li className="text-xs text-gray-700">
                ✓ For biogas, contact local installers
              </li>
            </ul>
          </div>
        </div>
      );
    }

    // Default sidebar content (FAQ, tips, etc.)
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Quick reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick reference</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2.5">
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
              <Sun className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span>Dry = good for compost/drying</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-sky-50 rounded">
              <Droplet className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <span>Semi-wet = pre-dry or mix</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Droplet className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Wet = biogas/fermentation</span>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-3">
            <div>
              <div className="font-semibold text-gray-900 mb-1">
                Do I need a machine?
              </div>
              <div className="text-gray-600 leading-relaxed">
                Composting & drying are manual. Pelletizing needs equipment.
              </div>
            </div>
            <Separator className="my-2" />
            <div>
              <div className="font-semibold text-gray-900 mb-1">
                Is this free?
              </div>
              <div className="text-gray-600 leading-relaxed">
                Yes! Information only. Consult suppliers for facilities.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Get started</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span>Try a preset for quick results</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">2.</span>
              <span>Fill your details</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-600 font-bold">3.</span>
              <span>Get your plan & share it</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <main className="min-h-screen pb-10 bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Recycle className="h-8 w-8 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Smart Waste Management
              </h1>
              <p className="text-sm md:text-base text-gray-700 mt-1">
                Get a simple step-by-step plan for your waste
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-4">
          {/* Form column - 2/3 width on desktop */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Tell us about your waste
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Pick the options below — we'll suggest an easy process.
                  </p>
                </div>

                {/* Presets - full width, horizontal scroll on mobile */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                    Quick presets
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="px-3 py-2 text-xs md:text-sm rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition whitespace-nowrap flex-shrink-0 font-medium"
                      >
                        {p.label.split("—")[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Waste type & product */}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-semibold">
                        Type of Waste *
                      </Label>
                      <Select
                        onValueChange={(value: WasteType) =>
                          setFormData({
                            ...formData,
                            wasteType: value,
                            wasteProduct: "",
                          })
                        }
                        value={formData.wasteType}
                      >
                        <SelectTrigger className="h-11 mt-2">
                          <SelectValue placeholder="Select waste type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">🌾 Crop residues</SelectItem>
                          <SelectItem value="fruit">🍌 Fruit waste</SelectItem>
                          <SelectItem value="vegetable">
                            🥬 Vegetable waste
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Product *</Label>
                      <Select
                        disabled={!formData.wasteType}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, wasteProduct: value })
                        }
                        value={formData.wasteProduct}
                      >
                        <SelectTrigger className="h-11 mt-2">
                          <SelectValue placeholder="Select product" />
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

                  {/* Quantity & moisture */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-sm font-semibold">Quantity</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: e.target.valueAsNumber,
                          })
                        }
                        className="mt-2 h-11"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Estimate is fine
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold">
                          Moisture *
                        </Label>
                        <p className="text-xs text-gray-500">
                          {moistureLabelToPct(formData.moisture)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, moisture: "dry" })
                          }
                          className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-medium transition ${
                            formData.moisture === "dry"
                              ? "bg-yellow-100 border-2 border-yellow-400 text-yellow-900"
                              : "bg-white border border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Sun className="w-4 h-4" />
                            <span>Dry</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, moisture: "semiwet" })
                          }
                          className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-medium transition ${
                            formData.moisture === "semiwet"
                              ? "bg-sky-100 border-2 border-sky-400 text-sky-900"
                              : "bg-white border border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Droplet className="w-4 h-4" />
                            <span>Semi-wet</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, moisture: "wet" })
                          }
                          className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-medium transition ${
                            formData.moisture === "wet"
                              ? "bg-blue-100 border-2 border-blue-400 text-blue-900"
                              : "bg-white border border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Droplet className="w-4 h-4" />
                            <span>Wet</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Processing prefs & safety */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-semibold">
                        Intended Use *
                      </Label>
                      <Select
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, intendedUse: value })
                        }
                        value={formData.intendedUse}
                      >
                        <SelectTrigger className="h-11 mt-2">
                          <SelectValue placeholder="What do you want?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compost">🌱 Compost</SelectItem>
                          <SelectItem value="biogas">⚡ Biogas</SelectItem>
                          <SelectItem value="feed">🐄 Feed</SelectItem>
                          <SelectItem value="sell">💰 Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">
                        Contamination?
                      </Label>
                      <RadioGroup
                        value={formData.contamination}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, contamination: value })
                        }
                        className="flex gap-4 mt-2"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="no" />
                          <span className="text-sm">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="yes" />
                          <span className="text-sm">
                            Yes (plastic/metal/chemicals)
                          </span>
                        </label>
                      </RadioGroup>
                      <p className="text-xs text-gray-500 mt-2">
                        Remove before processing
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">
                      Notes (optional)
                    </Label>
                    <Textarea
                      placeholder="Add extra details — e.g., nearby facilities, weather"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="mt-2 min-h-24"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 h-12 text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Thinking..." : "Show me the plan"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        setFormData({
                          wasteType: "",
                          wasteProduct: "",
                          quantity: 0,
                          moisture: "dry",
                          currentMethod: "",
                          intendedUse: "",
                          contamination: "no",
                          notes: "",
                        });
                        setResult(null);
                        setError("");
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </form>

                {/* Error display */}
                {error && (
                  <div className="mt-4 text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200 flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width on desktop, full width on mobile */}
          <aside
            className={`lg:col-span-1 max-h-[calc(100vh-200px)] overflow-y-auto transition-all duration-300 ${
              sidebarOpen ? "order-first lg:order-last" : "order-last"
            }`}
          >
            {renderSidebarContent()}
          </aside>
        </div>
      </div>
    </main>
  );
}
