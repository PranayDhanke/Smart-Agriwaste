import {
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import { IconType } from "react-icons/lib";

export type Role = "farmer" | "buyer" | "guest";

export interface NavItem {
  key: string;
  href: string;
  icon: IconType;
}

export const NAVIGATION: Record<Role, NavItem[]> = {
  guest: [
    { key: "nav.home", href: "/", icon: FiHome },
    { key: "nav.marketplace", href: "/marketplace", icon: FiShoppingCart },
    { key: "nav.community", href: "/community", icon: FiUsers },
  ],

  farmer: [
    { key: "nav.home", href: "/", icon: FiHome },
    { key: "nav.marketplace", href: "/marketplace", icon: FiShoppingCart },
    {
      key: "nav.myListings",
      href: "/profile/farmer/my-listing",
      icon: FiPackage,
    },
    { key: "nav.orders", href: "/profile/farmer/my-orders", icon: FiDollarSign },
    {
      key: "nav.analytics",
      href: "/profile/farmer/analytics",
      icon: FiTrendingUp,
    },
    { key: "nav.community", href: "/community", icon: FiUsers },
  ],

  buyer: [
    { key: "nav.home", href: "/", icon: FiHome },
    { key: "nav.marketplace", href: "/marketplace", icon: FiShoppingCart },
    {
      key: "nav.myPurchases",
      href: "/profile/buyer/my-purchases",
      icon: FiPackage,
    },
    { key: "nav.community", href: "/community", icon: FiUsers },
  ],
};
