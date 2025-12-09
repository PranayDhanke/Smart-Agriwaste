import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Recycle, Users, Globe } from "lucide-react"
import Link from "next/link"

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Hero / Intro */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-700">About Us</h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Our Agriculture Waste Management platform helps farmers and communities 
            turn agricultural residues into valuable resources. 
            From composting to biomass energy, we bridge the gap between 
            sustainable practices and practical solutions.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-700">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To empower farmers and rural communities by providing them with 
                easy access to sustainable waste management solutions, reducing 
                environmental pollution, and improving income opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-green-700">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                A future where no agricultural waste is left unmanaged— 
                every residue is transformed into compost, energy, or raw material, 
                creating a cleaner, greener, and more profitable ecosystem.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Features */}
        <section>
          <h2 className="mb-6 text-center text-2xl font-bold text-green-700">
            What We Offer
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Recycle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Smart Processes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Find the best waste management process tailored to your waste type, 
                  quantity, and available resources.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Farmer Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Connect with buyers and sellers to trade compost, biomass, 
                  manure, and other agri by-products directly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Eco-Friendly Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Reduce burning and dumping by adopting eco-friendly 
                  alternatives like composting, mulching, and biogas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-white shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Sustainability Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Together, we’re reducing pollution, improving soil fertility, 
                  and contributing to a sustainable future for agriculture.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-2xl bg-green-100 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-green-700 mb-3">
            Join Our Mission
          </h2>
          <p className="mx-auto max-w-2xl text-gray-700 mb-6">
            Whether you’re a farmer, entrepreneur, or eco-conscious citizen, 
            be a part of the change. Explore processes, trade resources, 
            and help build a greener tomorrow.
          </p>
          <Link href="/marketplace">
            <button className="rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700">
              Explore Marketplace
            </button>
          </Link>
        </section>
      </div>
    </main>
  )
}
