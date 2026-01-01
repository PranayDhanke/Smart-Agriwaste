"use client";

import {
  Notification,
  NotificationContext,
  sendNotificationInterface,
} from "@/context/NotificationContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  // 🔹 Fetch notifications (no useCallback needed)
  const getNotification = async () => {
    if (!user) return;

    try {
      const res = await axios.get<Notification[]>(
        `/api/notification/get/${user.id}`
      );

      setNotifications(res.data);
      setUnread(res.data.filter((n) => !n.read).length);
    } catch {
      toast.error("Unable to fetch notifications. Please refresh.");
    }
  };

  // 🔹 Load when user changes
  useEffect(() => {
    if (!user) return;
    getNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ================= OPTIMISTIC ACTIONS =================

  const sendNotification = async (
    notificationItem: sendNotificationInterface
  ) => {
    await axios.post("/api/notification/send", notificationItem);
  };

  const markAsReadNotification = async (id: string) => {
    let wasUnread = false;

    setNotifications((prev) =>
      prev.map((n) => {
        if (n._id === id && !n.read) {
          wasUnread = true;
          return { ...n, read: true };
        }
        return n;
      })
    );

    if (wasUnread) {
      setUnread((u) => Math.max(0, u - 1));
    }

    try {
      await axios.put("/api/notification/read", { id });
    } catch {
      getNotification();
    }
  };

  const removeNotification = async (id: string) => {
    let wasUnread = false;

    setNotifications((prev) => {
      const target = prev.find((n) => n._id === id);
      wasUnread = target ? !target.read : false;

      return prev.filter((n) => n._id !== id);
    });

    // 🔹 Decrease unread ONLY if it was unread
    if (wasUnread) {
      setUnread((u) => Math.max(0, u - 1));
    }

    try {
      await axios.delete("/api/notification/delete", {
        data: { id },
      });
    } catch {
      getNotification(); // rollback
    }
  };

  const changeNotificationStatus = async (
    id: string,
    action: "accepted" | "rejected"
  ) => {
    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, status: action, read: true } : n))
    );

    try {
      await axios.put("/api/negotiate/request", {
        id,
        getstatus: action,
      });
    } catch {
      getNotification();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        refresh: getNotification,
        sendNotification,
        markAsReadNotification,
        removeNotification,
        changeNotificationStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
