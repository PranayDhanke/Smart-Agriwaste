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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);

  const { user } = useUser();

  const getNotification = async () => {
    try {
      setLoading(true);

      const res = await axios.get<Notification[]>(
        `/api/notification/get/${user?.id}`
      );

      setNotifications(res.data);

      const unreadCount = res.data.filter((n) => !n.read).length;
      setUnread(unreadCount);
    } catch {
      toast.error(
        "Unable to fetch notifications data Please Try to Refresh the page"
      );
    } finally {
      setLoading(false);
      return;
    }
  };

  const sendNotification = async (
    notificationItem: sendNotificationInterface
  ) => {
    await axios.post("/api/notification/send", {
      userId: notificationItem.userId, // farmer receives notification
      title: notificationItem.title,
      message: notificationItem.message,
      type: notificationItem.type,
    });
  };

  const markAsReadNotification = async (id: string) => {
    await axios.put("/api/notification/read", { id });
    await getNotification();
  };

  const removeNotification = async (id: string) => {
    await axios.delete("/api/notification/delete", { data: { id } });
    await getNotification();
  };

  const changeNotificationStatus = async (
    id: string,
    action: "accepted" | "rejected"
  ) => {
    await axios.put(`/api/negotiate/request`, {
      id,
      getstatus: action,
    });
    await getNotification();
  };

  useEffect(() => {
    getNotification();
  }, [user?.id ]);

  return (
    <NotificationContext.Provider
      value={{
        loading,
        markAsReadNotification,
        refresh: getNotification,
        removeNotification,
        sendNotification,
        unread,
        notifications,
        changeNotificationStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
