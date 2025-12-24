"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: string;
}

export function useNotifications(refreshKey?: number) {
  const { user } = useUser();

  const [unread, setUnread] = useState(0);
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const res = await axios.get<Notification[]>(
          `/api/notification/get/${user.id}`
        );

        if (!isMounted) return;

        setData(res.data);

        const unreadCount = res.data.filter((n) => !n.read).length;
        setUnread(unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshKey]);

  return {
    unread,
    data,
    loading,
  };
}
