"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Leaf, TrendingUp, Recycle, ShoppingCart } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Analytics() {
  const t = useTranslations("faq")
  const wasteData = [
    { name: "Jan", crop: 120, veg: 80, fruit: 60 },
    { name: "Feb", crop: 150, veg: 100, fruit: 70 },
    { name: "Mar", crop: 200, veg: 130, fruit: 90 },
    { name: "Apr", crop: 170, veg: 120, fruit: 80 },
    { name: "May", crop: 0, veg: 0, fruit: 0 },
    { name: "Jun", crop: 170, veg: 120, fruit: 80 },
    { name: "Jul", crop: 170, veg: 120, fruit: 80 },
    { name: "Aug", crop: 170, veg: 120, fruit: 80 },
    { name: "Sep", crop: 170, veg: 120, fruit: 80 },
    { name: "Oct", crop: 170, veg: 120, fruit: 80 },
    { name: "Nov", crop: 170, veg: 120, fruit: 80 },
    { name: "Dec", crop: 170, veg: 120, fruit: 80 },

  ]

  const usageData = [
    { name: "Compost", value: 400 },
    { name: "Biogas", value: 300 },
    { name: "Animal Feed", value: 200 },
    { name: "Sold", value: 100 },
  ]

  const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#eab308"]

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <TrendingUp className="h-8 w-8 text-green-600" /> {t("profile.farmer.analytics.title")}
      </h1>

      <Tabs defaultValue="waste">
        <TabsList className="mb-6">
          <TabsTrigger value="waste">{t("profile.farmer.analytics.tabs.waste")}</TabsTrigger>
          <TabsTrigger value="usage">{t("profile.farmer.analytics.tabs.usage")}</TabsTrigger>
        </TabsList>

        {/* Waste Trends */}
        <TabsContent value="waste">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Recycle className="h-5 w-5" /> {t("profile.farmer.analytics.wasteGenerationTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wasteData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="crop" stackId="a" fill="#22c55e" name={t("profile.farmer.analytics.series.crop") as string} />
                  <Bar dataKey="veg" stackId="a" fill="#3b82f6" name={t("profile.farmer.analytics.series.veg") as string} />
                  <Bar dataKey="fruit" stackId="a" fill="#f97316" name={t("profile.farmer.analytics.series.fruit") as string} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Breakdown */}
        <TabsContent value="usage">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Leaf className="h-5 w-5" /> {t("profile.farmer.analytics.usageTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-green-100">
          <CardHeader>
            <CardTitle>{t("profile.farmer.analytics.stats.totalWasteManaged")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-700">820 kg</CardContent>
        </Card>
        <Card className="bg-blue-100">
          <CardHeader>
            <CardTitle>{t("profile.farmer.analytics.stats.productsSold")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" /> 120
          </CardContent>
        </Card>
        <Card className="bg-yellow-100">
          <CardHeader>
            <CardTitle>{t("profile.farmer.analytics.stats.biogasProduced")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-yellow-700">450 m³</CardContent>
        </Card>
      </div>
    </main>
  )
}
