"use client";

import React, { useEffect } from "react";
import OneSignal from "react-onesignal";

const EnablePermission = () => {
  useEffect(() => {
    OneSignal.Notifications.requestPermission();
  }, []);
  return <div>EnablePermission</div>;
};

export default EnablePermission;
