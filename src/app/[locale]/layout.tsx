import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/modules/Home/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import RedirectNotAccount from "@/modules/Extra/RedirectNotAccount";
import { CartProvider } from "@/components/provider/CartProvider";
import { NotificationProvider } from "@/components/provider/NotificationProvider";
import FloatingCart from "@/modules/marketplace/FlotingCart";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

import { enUS, hiIN } from "@clerk/localizations";

import { LocalizationResource } from "@clerk/types";
import Header from "@/modules/Home/Header/Header";
import OneSignalProvider from "@/components/provider/OneSignalProvider";

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

const clerkLocales: {
  en: LocalizationResource;
  hi: LocalizationResource;
  mr: LocalizationResource;
} = {
  en: enUS,
  hi: hiIN,
  mr: hiIN,
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const clerkLocale = clerkLocales[locale] ?? enUS;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <ClerkProvider localization={clerkLocale}>
            <OneSignalProvider />
            <Toaster position="top-center" />
            <CartProvider>
              <NotificationProvider>
                <Header />
                {children}
                <FloatingCart />
                <Footer />
              </NotificationProvider>
            </CartProvider>
            <RedirectNotAccount />
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
