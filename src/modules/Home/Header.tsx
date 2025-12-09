"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  FiMenu,
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiBell,
  FiPlus,
  FiUser,
  FiSettings,
  FiLogOut,
  FiShoppingBag,
} from "react-icons/fi";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";

const Header = () => {
  const { isSignedIn, user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  const role = user?.unsafeMetadata?.role || "user"; // "farmer" or "buyer"

  // Farmer Navigation
  const farmerNav = [
    { title: "Home", href: "/", icon: FiHome },
    { title: "Marketplace", href: "/marketplace", icon: FiShoppingCart },
    {
      title: "My Listings",
      href: "/profile/farmer/my-listing",
      icon: FiPackage,
    },
    { title: "Orders", href: "/profile/farmer/my-orders", icon: FiDollarSign },
    {
      title: "Analytics",
      href: "/profile/farmer/analytics",
      icon: FiTrendingUp,
    },
    { title: "Community", href: "/community", icon: FiUsers },
  ];

  // Buyer Navigation
  const buyerNav = [
    { title: "Home", href: "/", icon: FiHome },
    { title: "Marketplace", href: "/marketplace", icon: FiShoppingCart },
    {
      title: "My Purchases",
      href: "/profile/buyer/my-purchases",
      icon: FiPackage,
    },
    { title: "Community", href: "/community", icon: FiUsers },
  ];

  // Default Navigation (not signed in)
  const defaultNav = [
    { title: "Home", href: "/", icon: FiHome },
    { title: "Marketplace", href: "/marketplace", icon: FiShoppingCart },
    { title: "Community", href: "/community", icon: FiUsers },
  ];

  // Choose navigation based on role
  const navigationItems = !isSignedIn
    ? defaultNav
    : role === "farmer"
    ? farmerNav
    : buyerNav;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600">
            <FiPackage className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-700">AgriWaste</span>
            <span className="text-xs text-gray-500 hidden sm:block">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isSignedIn ? (
            <>
              {role === "farmer" && (
                <Link href={"/profile/farmer/list-waste"}>
                  <Button className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 text-white">
                    <FiPlus className="mr-2 h-4 w-4" />
                    List Waste
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" className="relative">
                <FiBell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  2
                </Badge>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 hover:bg-green-100 transition">
                    <Avatar className="w-8 h-8 rounded-full">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user?.firstName || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-green-700 hidden sm:block">
                      {user?.firstName || "Profile"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 p-1" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openUserProfile()}>
                    <FiUser className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <Link href={`/profile/${role}`}>
                    <DropdownMenuItem>
                      <FiSettings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="text-red-600"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href={"/sign-in"}>
                <Button variant="outline" className="hidden sm:inline-flex">
                  Login
                </Button>
              </Link>
              
              {/* IMPROVED SIGN UP DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <FiUser className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2">
                  <DropdownMenuLabel className="text-sm font-semibold text-gray-700 px-2 py-1.5">
                    Join as
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  
                  {/* Farmer Option */}
                  <Link href="/sign-up?role=farmer">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-green-50 rounded-md transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
                          <FiPackage className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Farmer</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Sell your agricultural waste
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </Link>

                  <div className="h-1" />

                  {/* Buyer Option */}
                  <Link href="/sign-up?role=buyer">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-blue-50 rounded-md transition-colors">
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <FiShoppingBag className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">Buyer</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Purchase quality agricultural materials
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <FiMenu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[290px] px-2">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2 text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                    <FiPackage className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-green-700">AgriWaste</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-4 mt-6">
                {isSignedIn && role === "farmer" && (
                  <Link href="/profile/list-waste">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <FiPlus className="mr-2 h-4 w-4" />
                      List Your Waste
                    </Button>
                  </Link>
                )}

                <nav className="flex flex-col space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
