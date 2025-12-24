"use client";

import OneSignal from "react-onesignal";

export default function EnableNotification() {
  const enable = async () => {
    await OneSignal.Slidedown.promptPush();
  };

  return (
    <button onClick={enable} className="px-4 py-2 bg-green-600 text-white">
      Enable Notifications
    </button>
  );
}
