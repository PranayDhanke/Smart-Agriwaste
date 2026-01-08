"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useTranslations } from "next-intl";

const CreateAccountRedirect = () => {
  const router = useRouter();
  const { user } = useUser();
  const t = useTranslations("faq");

  const clerkRole = user?.unsafeMetadata.role;

  useEffect(() => {
    const role = localStorage.getItem("roleItem")?.trim();

    if (role === "user" || role === null) {
      router.push(`/create-account/${clerkRole}`);
    } else {
      router.push(`/create-account/${role}`);
    }
  }, [clerkRole , router]);
  return <div className="h-screen animate-collapsible-up">{t("extra.createAccountRedirect.loading")}</div>;
};

export default CreateAccountRedirect;
