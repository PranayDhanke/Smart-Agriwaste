"use client";

import OneSignal from "react-onesignal";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";

export default function OneSignalClient() {
  const { isLoaded, user } = useUser();

  const initializedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  /* -------------------- INIT ONESIGNAL ONCE -------------------- */
  useEffect(() => {
    if (initializedRef.current) return;

    OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      allowLocalhostAsSecureOrigin: true,
    })
      .then(() => {
        initializedRef.current = true;
        checkPermission();
      })
      .catch(console.error);
  }, []);

  /* -------------------- LOGIN USER -------------------- */
  useEffect(() => {
    if (!initializedRef.current) return;
    if (!isLoaded || !user?.id) return;

    OneSignal.login(user.id).catch(console.error);
  }, [isLoaded, user?.id]);

  /* -------------------- CHECK PERMISSION -------------------- */
  const checkPermission = async () => {
    try {
      const optedIn = OneSignal.User.PushSubscription.optedIn;
      setShowBanner(!optedIn);
    } catch {
      setShowBanner(true);
    }
  };

  /* -------------------- ENABLE NOTIFICATIONS -------------------- */
  const enableNotifications = async () => {
    try {
      setLoading(true);

      const optedIn = OneSignal.User.PushSubscription.optedIn;

      if (!optedIn) {
        await OneSignal.User.PushSubscription.optIn();
      }

      setShowBanner(false);
    } catch (err) {
      console.error("OneSignal opt-in error", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  if (!showBanner) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
          <Bell className="h-5 w-5 text-green-600" />
        </div>

        <div>
          <p className="text-sm font-semibold text-green-900">
            Stay updated
          </p>
          <p className="text-xs text-green-700">
            Get order & negotiation updates instantly
          </p>
        </div>
      </div>

      <button
        onClick={enableNotifications}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60 sm:mt-0 sm:w-auto"
      >
        {loading ? "Enabling..." : "Enable"}
      </button>
    </div>
  );
}
