// src/app/api/notifications/read/route.ts
import { NextResponse } from "next/server";
import Notification from "@/models/notification.model";

export async function PUT(req: Request) {
  const { id } = await req.json();

  await Notification.findByIdAndUpdate(id, { read: true });

  return NextResponse.json({ success: true });
}
