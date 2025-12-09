"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Leaf } from "lucide-react"

export default function Footer() {
  const { isSignedIn, user } = useUser()
  const role = user?.unsafeMetadata?.role || "farmer" // "farmer" or "buyer"

  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white ">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold mb-4">
              <div className="bg-white p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-green-700" />
              </div>
              <span>AgriWaste</span>
            </Link>
            <p className="text-green-100 leading-relaxed mb-4">
              Connecting farmers and buyers for sustainable agricultural waste management and a greener future.
            </p>
            <div className="space-y-2 text-sm text-green-100">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@agriwaste.com" className="hover:text-white transition">
                  support@agriwaste.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+911234567890" className="hover:text-white transition">
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-green-100">
              <li>
                <Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Marketplace
                </Link>
              </li>
              {(!isSignedIn || role === "farmer") && (
                <li>
                  <Link href="/process" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                    Waste Management Processes
                  </Link>
                </li>
              )}
              <li>
                <Link href="/community" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users - Dynamic based on role */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              {!isSignedIn ? "Get Started" : role === "farmer" ? "For Farmers" : "For Buyers"}
            </h3>
            <ul className="space-y-2.5 text-green-100">
              {!isSignedIn ? (
                <>
                  <li>
                    <Link href="/sign-up?role=farmer" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      Join as Farmer
                    </Link>
                  </li>
                  <li>
                    <Link href="/sign-up?role=buyer" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      Join as Buyer
                    </Link>
                  </li>
                  <li>
                    <Link href="/sign-in" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      Sign In
                    </Link>
                  </li>
                </>
              ) : role === "farmer" ? (
                <>
                  <li>
                    <Link href="/profile/list-waste" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      List Your Waste
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/farmer/my-listing" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      My Listings
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/farmer/my-orders" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/farmer/analytics" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      Analytics
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/marketplace" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      Browse Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/buyer/my-purchases" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      My Purchases
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                      My Profile
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/community" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2.5 text-green-100 mb-6">
              <li>
                <Link href="/privacy" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white hover:translate-x-1 inline-block transition-all">
                  Refund Policy
                </Link>
              </li>
            </ul>

            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <Link 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-white hover:text-green-700 p-2.5 rounded-full transition-all"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-white hover:text-green-700 p-2.5 rounded-full transition-all"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-white hover:text-green-700 p-2.5 rounded-full transition-all"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-700 hover:bg-white hover:text-green-700 p-2.5 rounded-full transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-green-100">
            <p>
              © {new Date().getFullYear()} AgriWaste Marketplace. All rights reserved.
            </p>
            <p className="flex items-center gap-1">
              Made with <span className="text-red-400">♥</span> for sustainable agriculture
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
