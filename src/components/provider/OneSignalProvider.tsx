"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { initOneSignal } from "@/lib/onesignal";

export default function OneSignalProvider() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    initOneSignal(user.id);
  }, [isLoaded, user?.id]);

  return null;
}
