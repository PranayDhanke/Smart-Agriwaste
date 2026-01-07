"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiBell, FiPlus } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { useNotification } from "@/components/hooks/useNotification";
import ProfileMenu from "./ProfileMenu";
import { useTranslations } from "next-intl";
import NotificationPanel from "@/modules/Extra/NotificationPanel";
import { useState } from "react";

export default function SignedInActions() {
  const { user } = useUser();

  const { signOut, openUserProfile } = useClerk();
  const { unread } = useNotification();

  const role = user?.publicMetadata?.role as "farmer" | "buyer";

  const t = useTranslations("header");

  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <>
      {/* Role CTA */}
      {role === "farmer" && (
        <Link href="/profile/farmer/list-waste">
          <Button
            size="sm"
            className="hidden md:flex bg-green-600 hover:bg-green-700"
          >
            <FiPlus className="mr-1" />
            {t("auth.listWaste")}
          </Button>
        </Link>
      )}

      {/* Notifications */}
      <Button
        onClick={() => setNotificationOpen(true)}
        variant="ghost"
        size="icon"
        className="relative"
      >
        <FiBell />
        {unread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </Button>

      {/* Profile */}
      <ProfileMenu
        user={{
          id: user?.id || "",
          firstName: user?.firstName || "",
          imageUrl: user?.imageUrl || "",
        }}
        role={role}
        signOut={signOut}
        openUserProfile={openUserProfile}
      />

      <NotificationPanel
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
      />
    </>
  );
}
