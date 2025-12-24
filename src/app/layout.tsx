import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/modules/Home/Header";
import Footer from "@/modules/Home/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import RedirectNotAccount from "@/modules/Extra/RedirectNotAccount";
import FloatingCart from "@/modules/Extra/FlotingCart";
import OneSignalProvider from "@/components/provider/OneSignalProvider";
import { CartProvider } from "@/components/provider/CartProvider";
import { NotificationProvider } from "@/components/provider/NotificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart AgriWaste",
  description: "Smart Agricultural Waste Management & Value Creation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster position="top-center" />
          <CartProvider>
            <NotificationProvider>
              <Header />
              <OneSignalProvider />
              {children}
              <FloatingCart />
              <Footer />
            </NotificationProvider>
          </CartProvider>
          <RedirectNotAccount />
        </body>
      </html>
    </ClerkProvider>
  );
}
