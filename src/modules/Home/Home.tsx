"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import FAQ from "./FAQ";
import {
  Leaf,
  Recycle,
  BarChart3,
  ShoppingCart,
  PackagePlus,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const role = user?.unsafeMetadata?.role || "user";

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section - Changes based on role */}
      <section className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        {!isSignedIn ? (
          <>
            {/* Guest View */}
            <h1 className="text-5xl font-extrabold tracking-tight text-green-700 sm:text-6xl">
              Transform Agricultural Waste into Value
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-gray-600">
              Connect farmers and buyers in a sustainable marketplace. List your
              waste or find quality agricultural resources.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/sign-up?role=farmer">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  Join as Farmer
                </Button>
              </Link>
              <Link href="/sign-up?role=buyer">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Join as Buyer
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          </>
        ) : role === "farmer" ? (
          <>
            {/* Farmer View */}
            <h1 className="text-5xl font-extrabold tracking-tight text-green-700 sm:text-6xl">
              Welcome Back, {user?.firstName}!
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-gray-600">
              Manage your waste listings, track orders, and grow your
              sustainable farming business.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/profile/farmer/list-waste">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                  <PackagePlus className="mr-2 h-5 w-5" />
                  List New Waste
                </Button>
              </Link>
              <Link href="/profile/farmer/my-listing">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  My Listings
                </Button>
              </Link>
              <Link href="/profile/farmer/analytics">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Buyer View */}
            <h1 className="text-5xl font-extrabold tracking-tight text-blue-700 sm:text-6xl">
              Welcome Back, {user?.firstName}!
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-gray-600">
              Discover quality agricultural waste and connect with verified
              farmers.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href="/marketplace">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/profile/buyer/my-purchases">
                <Button
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  My Purchases
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Features Section - Same for everyone */}
      <section className="mx-auto max-w-6xl px-6 py-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:shadow-md transition">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Recycle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-3">
            Eco-Friendly
          </h3>
          <p className="text-gray-600">
            Reduce pollution and promote sustainable farming through proper
            waste management.
          </p>
        </div>

        <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:shadow-md transition">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-3">
            Fair Marketplace
          </h3>
          <p className="text-gray-600">
            Connect farmers directly with buyers for transparent and profitable
            transactions.
          </p>
        </div>

        <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:shadow-md transition">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-3">
            Smart Analytics
          </h3>
          <p className="text-gray-600">
            Track performance, monitor trends, and make data-driven decisions.
          </p>
        </div>
      </section>

      {/* Process Link Section - Only for guests and farmers */}
      {(!isSignedIn || role === "farmer") && (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-10 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">
              Need Waste Management Guidance?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Discover the best methods and processes for managing different
              types of agricultural waste.
            </p>
            <Link href="/process">
              <Button className="bg-white text-green-700 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Explore Management Processes
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-12">
        <FAQ />
      </section>
    </main>
  );
}
