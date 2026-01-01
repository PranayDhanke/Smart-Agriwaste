"use client";

import {
  Notification,
  NotificationContext,
  sendNotificationInterface,
} from "@/context/NotificationContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const { user } = useUser();

  // ✅ MEMOIZED FUNCTION
  const getNotification = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const res = await axios.get<Notification[]>(
        `/api/notification/get/${user.id}`
      );

      setNotifications(res.data);
      setUnread(res.data.filter((n) => !n.read).length);
    } catch {
      toast.error(
        "Unable to fetch notifications data. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const sendNotification = async (
    notificationItem: sendNotificationInterface
  ) => {
    await axios.post("/api/notification/send", {
      userId: notificationItem.userId,
      title: notificationItem.title,
      message: notificationItem.message,
      type: notificationItem.type,
    });
  };

  const markAsReadNotification = async (id: string) => {
    await axios.put("/api/notification/read", { id });
    getNotification();
  };

  const removeNotification = async (id: string) => {
    await axios.delete("/api/notification/delete", { data: { id } });
    getNotification();
  };

  const changeNotificationStatus = async (
    id: string,
    action: "accepted" | "rejected"
  ) => {
    await axios.put(`/api/negotiate/request`, {
      id,
      getstatus: action,
    });
    getNotification();
  };

  // ✅ SAFE EFFECT
  useEffect(() => {
    getNotification();
  }, [getNotification]);

  return (
    <NotificationContext.Provider
      value={{
        loading,
        unread,
        notifications,
        refresh: getNotification,
        markAsReadNotification,
        removeNotification,
        sendNotification,
        changeNotificationStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
