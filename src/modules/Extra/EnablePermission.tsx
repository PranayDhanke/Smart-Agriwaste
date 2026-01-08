"use client";

import React, { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useTranslations } from "next-intl";

const EnablePermission = ({ onClose }: { onClose?: () => void }) => {
  const t = useTranslations("faq");
  useEffect(() => {
    OneSignal.Notifications.requestPermission();
  }, []);
  return <div>
    <h3 className="text-lg font-semibold">{t("extra.enablePermission.title")}</h3>
  </div>;
};

export default EnablePermission;
