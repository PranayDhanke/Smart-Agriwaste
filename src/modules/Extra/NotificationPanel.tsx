"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, XCircle } from "lucide-react";
import { useNotifications } from "@/components/hooks/useNotification";
import axios from "axios";
import { useState } from "react";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationPanel({
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { loading, data } = useNotifications(refreshKey);

  const markAsRead = async (id: string) => {
    await axios.put("/api/notification/read", { id });
    setRefreshKey(refreshKey + 1);
  };

  const deleteNotification = async (id: string) => {
    await axios.delete("/api/notification/delete", { data: { id } });
    setRefreshKey(refreshKey + 1);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Notifications
            <Badge variant="secondary">{data.length}</Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-70px)]">
          <div className="space-y-3 p-4">
            {loading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}

            {data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No notifications yet
              </p>
            ) : (
              data.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`border p-3 rounded-lg cursor-pointer ${
                    n.read ? "bg-muted" : "bg-green-50 border-green-300"
                  }`}
                >
                  <div>
                    <XCircle
                      onClick={() => deleteNotification(n._id)}
                      className="h-5 w-5 float-end text-blue-600 mt-0.5"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
