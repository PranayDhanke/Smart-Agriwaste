import { NotificationContext } from "@/context/NotificationContext";
import { useContext } from "react";

export function useNotification() {
  const notificationContextcxt = useContext(NotificationContext);
  if (!notificationContextcxt) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return notificationContextcxt;
}
