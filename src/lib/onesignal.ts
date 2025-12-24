import OneSignal from "react-onesignal";

let initialized = false;

export const initOneSignal = async (userId: string): Promise<void> => {
  if (initialized) return;

  if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
    console.error("OneSignal App ID is missing");
    return;
  }

  try {
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
    });

    initialized = true;

    // Ask permission explicitly
    const permission = await OneSignal.Notifications.permission;

    if (!permission) {
      await OneSignal.Notifications.requestPermission();
    }

    // Login user (this creates External User ID)
    await OneSignal.login(userId);

    console.log("OneSignal initialized and logged in:", userId);
  } catch (error) {
    console.error("OneSignal init/login failed:", error);
  }
};
