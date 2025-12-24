import { createContext } from "react";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: string;
}

export interface sendNotificationInterface {
  userId: string;
  title: string;
  message: string;
  type: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unread: number;
  loading: boolean;
  refresh: () => void;
  sendNotification: (notificationItem: sendNotificationInterface) => void;
  markAsReadNotification: (id: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  changeNotificationStatus: (
    id: string,
    action: "accepted" | "rejected"
  ) => Promise<void>;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
