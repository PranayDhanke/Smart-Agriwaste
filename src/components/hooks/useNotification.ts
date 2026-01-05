import { NotificationContext } from "@/context/NotificationContext";
import { useContext } from "react";

export function useNotification() {
  const context = useContext(NotificationContext);
  if(!context){
    throw new Error("useNotitification must be inside the notification provider")
  }
  return context;
}
