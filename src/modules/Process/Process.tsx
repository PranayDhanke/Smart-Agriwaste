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
} from "lucide-react";
import { WasteForm, WasteType } from "@/components/types/ListWaste";

/**
 * Farmer-friendly Process page:
 * - client only
 * - imports ProcessMapping.json
 * - improved UX: presets, moisture slider, clear steps, copy/download
 */

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

  // UI moisture slider -> maps to dry/semiwet/wet and shows % hint
  const moistureToKey = (m: string) => {
    if (!m) return "low_moisture";
    if (m === "dry") return "low_moisture";
    if (m === "semiwet") return "medium_moisture";
    if (m === "wet") return "high_moisture";
    return m;
  };

  const moistureLabelToPct = (m: string) => {
    // friendly ranges for farmers
    if (m === "dry") return "≤ 25% (Dry)";
    if (m === "semiwet") return "25–50% (Semi-wet)";
    if (m === "wet") return "≥ 50% (Wet)";
    return "";
  };

  // quick presets (example shortcuts)
  const presets = [
    { label: "Wheat — Dry → Compost", payload: { wasteType: "crop", wasteProduct: "Wheat", moisture: "dry", intendedUse: "compost" } },
    { label: "Rice — Wet → Biogas", payload: { wasteType: "crop", wasteProduct: "Rice", moisture: "wet", intendedUse: "biogas" } },
    { label: "Banana — Wet → Feed/Vinegar", payload: { wasteType: "fruit", wasteProduct: "Banana", moisture: "wet", intendedUse: "compost" } }
  ];

  function applyPreset(p: any) {
    setFormData({ ...formData, ...p.payload });
    setResult(null);
    setError("");
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  // infer simple "what you need" from recommended process text
  const inferNeeds = (procSteps: string[]) => {
    const needs: string[] = [];
    const joined = procSteps.join(" ").toLowerCase();
    if (joined.includes("compost") || joined.includes("aerobic") || joined.includes("turning"))
      needs.push("Space for compost pile & turning fork");
    if (joined.includes("manure") || joined.includes("cow dung") || joined.includes("mixing"))
      needs.push("Access to animal manure (or nitrogen source)");
    if (joined.includes("dry") || joined.includes("drying") || joined.includes("air-drying"))
      needs.push("Open area for drying (sun / rack)");
    if (joined.includes("bale") || joined.includes("baler") || joined.includes("pellet"))
      needs.push("Mechanical baling / pelletizing facility");
    if (joined.includes("anaerobic") || joined.includes("digestion") || joined.includes("biogas"))
      needs.push("Anaerobic digester (biogas plant)");
    if (joined.includes("ferment") || joined.includes("pulping") || joined.includes("vinegar"))
      needs.push("Simple fermentation vessel or local small-scale unit");
    if (needs.length === 0) needs.push("Basic tools (knife/shovel) and drying space");
    return needs;
  };

  const estimateDifficulty = (procSteps: string[]) => {
    const joined = procSteps.join(" ").toLowerCase();
    if (joined.includes("anaerobic") || joined.includes("pellet") || joined.includes("distillation")) return { label: "Higher (equipment needed)", score: 3 };
    if (joined.includes("compost") || joined.includes("drying") || joined.includes("chopping")) return { label: "Medium (manual work)", score: 2 };
    return { label: "Easy (simple steps)", score: 1 };
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

      // mapping lookup
      const typeMap: any = (ProcessMapping as any).waste_management_rules?.[wasteType];

      if (!typeMap) {
        setError(`We don't have guidance for "${wasteType}". Try a different type or contact support.`);
        setIsSubmitting(false);
        return;
      }

      const productMap: any = typeMap[wasteProduct];
      if (!productMap) {
        setError(`No guidance found for "${wasteProduct}" under ${wasteType}. Try typing a similar product.`);
        setIsSubmitting(false);
        return;
      }

      const key = moistureToKey(moisture);
      const recommended = productMap[key] || productMap["default"];
      if (!recommended) {
        setError("No recommendation available. Try a different moisture option or product.");
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
      // scroll to results for farmers
      setTimeout(() => window.scrollTo({ top: 400, behavior: "smooth" }), 150);
    } catch (err) {
      console.error("Lookup error:", err);
      setError("Unexpected error — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // copy result JSON to clipboard
  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      alert("Recommendation copied to clipboard — you can share it with others.");
    } catch {
      alert("Unable to copy. You can download instead.");
    }
  };

  // download result as JSON file
  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.wasteProduct || "recommendation"}-recommendation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen pb-10 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Recycle className="h-9 w-9 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Smart Waste Management
              </h1>
              <p className="text-gray-700 mt-1 max-w-xl">
                Choose what you have — get a simple step-by-step plan you can follow today.
                No login required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Form column */}
          <div className="md:col-span-2">
            <Card className="shadow-lg border-0 bg-white/95">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Tell us about your waste</h2>
                    <p className="text-sm text-gray-600">Pick the options below — we’ll suggest an easy process.</p>
                  </div>

                  {/* Presets */}
                  <div className="flex gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="text-sm px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                      >
                        {p.label.split("—")[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5 mt-5">
                  {/* Waste type & product */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Type of Waste *</Label>
                      <Select
                        onValueChange={(value: WasteType) =>
                          setFormData({ ...formData, wasteType: value, wasteProduct: "" })
                        }
                        value={formData.wasteType}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select waste type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crop">🌾 Crop residues</SelectItem>
                          <SelectItem value="fruit">🍌 Fruit waste</SelectItem>
                          <SelectItem value="vegetable">🥬 Vegetable waste</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Product *</Label>
                      <Select
                        disabled={!formData.wasteType}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, wasteProduct: value })
                        }
                        value={formData.wasteProduct}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.wasteType &&
                            ProductList[formData.wasteType].map((item: string) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Quantity & moisture */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-sm font-medium">Quantity (kg)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.valueAsNumber })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Approximate weight — fine if you estimate.</p>
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Moisture *</Label>
                        <p className="text-xs text-gray-500">{moistureLabelToPct(formData.moisture)}</p>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, moisture: "dry" })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.moisture === "dry" ? "bg-yellow-50 border border-yellow-300" : "bg-white border"}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            Dry
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, moisture: "semiwet" })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.moisture === "semiwet" ? "bg-sky-50 border border-sky-300" : "bg-white border"}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Droplet className="w-4 h-4 text-sky-500" />
                            Semi-wet
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, moisture: "wet" })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium ${formData.moisture === "wet" ? "bg-blue-50 border border-blue-300" : "bg-white border"}`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Droplet className="w-4 h-4 text-blue-600" />
                            Wet
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Processing prefs & safety */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Intended Use *</Label>
                      <Select
                        onValueChange={(value: string) => setFormData({ ...formData, intendedUse: value })}
                        value={formData.intendedUse}
                      >
                        <SelectTrigger className="h-12">
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
                      <Label className="text-sm font-medium">Contamination?</Label>
                      <RadioGroup value={formData.contamination} onValueChange={(value: string) => setFormData({ ...formData, contamination: value })} className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="no" />
                          <span className="text-sm">No</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="yes" />
                          <span className="text-sm">Yes (plastic/metal/chemicals)</span>
                        </label>
                      </RadioGroup>
                      <p className="text-xs text-gray-500 mt-1">If contaminated, remove or sort before processing.</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Notes (optional)</Label>
                    <Textarea placeholder="Add extra details — e.g., nearby facilities, weather" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
                      {isSubmitting ? "Thinking..." : "Show me the plan"}
                    </Button>

                    <Button type="button" variant="ghost" className="h-12" onClick={() => { setFormData({ wasteType: "", wasteProduct: "", quantity: 0, moisture: "dry", currentMethod: "", intendedUse: "", contamination: "no", notes: "" }); setResult(null); setError(""); }}>
                      Reset
                    </Button>
                  </div>
                </form>

                {/* inline errors */}
                {error && <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
              </CardContent>
            </Card>

            {/* Result display */}
            {result && (
              <div className="mt-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded">
                          <Recycle className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Recommended Plan</h3>
                          <p className="text-sm text-gray-700">{result.final_use}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={copyResult} className="text-sm px-3 py-1 bg-white rounded shadow-sm flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</button>
                        <button onClick={downloadResult} className="text-sm px-3 py-1 bg-white rounded shadow-sm flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-xs text-gray-600 mb-2">Key: <code>{result.key}</code></div>

                    {/* Steps timeline */}
                    <div className="space-y-4">
                      {result.recommended_process.map((step: string, i: number) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="mt-1 w-8 h-8 flex items-center justify-center rounded-full bg-white border text-green-600 font-semibold">{i + 1}</div>
                          <div>
                            <div className="font-medium">{step}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* notes */}
                    {result.notes && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <div className="text-sm font-semibold">Notes</div>
                        <div className="text-sm text-gray-700 mt-1">{result.notes}</div>
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="p-3 bg-white rounded border">
                        <div className="flex items-center gap-2"><Hammer className="w-4 h-4 text-gray-700" /><div className="text-sm font-medium">What you need</div></div>
                        <ul className="mt-2 list-disc ml-5 text-sm text-gray-700">
                          {result.needs.map((n: string, idx: number) => <li key={idx}>{n}</li>)}
                        </ul>
                      </div>

                      <div className="p-3 bg-white rounded border">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-700" /><div className="text-sm font-medium">Estimated effort</div></div>
                        <div className="mt-2 text-sm text-gray-700">{result.difficulty.label}</div>
                      </div>
                    </div>

                    {/* Farmer tips */}
                    <div className="mt-4 p-3 rounded bg-emerald-50 border border-emerald-100">
                      <div className="font-medium text-sm">Quick farmer tips</div>
                      <ul className="mt-2 text-sm text-gray-700 list-disc ml-5">
                        <li>Sort and remove plastics/metal before processing.</li>
                        <li>Keep compost piles moist but not waterlogged; turn weekly.</li>
                        <li>If planning biogas — contact a local biogas installer for small plants.</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right sidebar: help & shortcuts */}
          <aside className="space-y-4">
            {/* Quick reference */}
            <Card>
              <CardHeader>
                <CardTitle>Quick reference</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <div className="flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-500" /> <span>Dry = good for compost/drying</span></div>
                <div className="flex items-center gap-2"><Droplet className="w-4 h-4 text-sky-500" /> <span>Semi-wet = consider pre-drying or mixing</span></div>
                <div className="flex items-center gap-2"><Droplet className="w-4 h-4 text-blue-600" /> <span>Wet = good for biogas/fermentation</span></div>
              </CardContent>
            </Card>

            {/* Small FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <div>
                  <div className="font-medium">Do I need a machine?</div>
                  <div className="text-gray-600">Many tasks (composting, drying) can be manual. Pelletizing / distillation needs equipment.</div>
                </div>

                <div>
                  <div className="font-medium mt-2">Is this free?</div>
                  <div className="text-gray-600">Yes — information only. For building full facilities, consult a local supplier.</div>
                </div>
              </CardContent>
            </Card>

            {/* Contact / learn more */}
            <Card>
              <CardHeader>
                <CardTitle>Next steps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-2">
                <div>✔️ Try a preset for quick results</div>
                <div>✔️ Copy or download the plan to share</div>
                <div>✔️ If you want, we can add local facility links or phone numbers</div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
