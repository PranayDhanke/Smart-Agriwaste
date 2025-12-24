"use client";
import { initOneSignal } from "@/lib/onesignal";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function OneSignalProvider() {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      initOneSignal(user.id);
    }
  }, [user]);

  return null;
}
