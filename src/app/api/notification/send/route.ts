import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDB";
import Notification from "@/models/notification.model";

interface OneSignalResponse {
  id?: string;
  recipients?: number;
  errors?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, message, type } = await req.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1️⃣ Save notification in DB
    await Notification.create({
      userId,
      title,
      message,
      type: type ?? "system",
      read: false,
    });

    // 2️⃣ Send OneSignal push
    const response = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          include_external_user_ids: [userId],
          headings: { en: title },
          contents: { en: message },
        }),
      }
    );

    const data: OneSignalResponse = await response.json();

    console.log("OneSignal response:", data);

    if (!response.ok || data.errors) {
      return NextResponse.json(
        {
          message: "OneSignal rejected the notification",
          onesignal: data,
        },
        { status: 500 }
      );
    }

    if (!data.recipients || data.recipients === 0) {
      return NextResponse.json(
        {
          message: "User not registered in OneSignal",
          onesignal: data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Notification sent successfully",
        notificationId: data.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notification send error:", error);
    return NextResponse.json(
      { message: "Failed to send notification" },
      { status: 500 }
    );
  }
}
