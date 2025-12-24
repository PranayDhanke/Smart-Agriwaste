import OneSignal from "react-onesignal";

export const initOneSignal = async (userId: string) => {
  await OneSignal.init({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
    allowLocalhostAsSecureOrigin: true,
  });

  // Link OneSignal user with Clerk user
  await OneSignal.login(userId);
};
