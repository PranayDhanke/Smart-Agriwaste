import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDB";
import Notification from "@/models/notification.model";

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

    const options = {
      method: "POST",
      headers: {
        Authorization: `${process.env.ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,

        headings: { en: title },
        contents: { en: message },

        include_aliases: { external_id: [userId] },
        target_channel: "push",
      }),
    };

    await fetch("https://api.onesignal.com/notifications?c=push", options)
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));

    return NextResponse.json(
      {
        message: "Notification sent successfully",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to send notification" },
      { status: 500 }
    );
  }
}
