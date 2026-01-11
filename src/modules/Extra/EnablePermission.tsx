"use client";

import React, { useEffect } from "react";
import OneSignal from "react-onesignal";
import { useTranslations } from "next-intl";

const EnablePermission = () => {
  useEffect(() => {
    OneSignal.Notifications.requestPermission();
  }, []);
  const t = useTranslations("extra");
  return <div>{t("EnablePermission.title")}</div>;
};

export default EnablePermission;
