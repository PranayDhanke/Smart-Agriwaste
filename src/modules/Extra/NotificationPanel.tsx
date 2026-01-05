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
import { useNotification } from "@/components/hooks/useNotification";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationPanel({
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const {
    notifications,
    markAsReadNotification,
    removeNotification,
  } = useNotification();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            Notifications
            <Badge variant="secondary">{notifications.length}</Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-70px)]">
          <div className="space-y-3 p-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsReadNotification(n)}
                  className={`border p-3 rounded-lg cursor-pointer transition ${
                    n.read
                      ? "bg-muted"
                      : "bg-green-50 border-green-300"
                  }`}
                >
                  <XCircle
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n._id);
                    }}
                    className="h-5 w-5 float-end text-blue-600 cursor-pointer"
                  />

                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
