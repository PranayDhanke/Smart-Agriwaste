// src/app/api/notifications/read/route.ts
import { NextResponse } from "next/server";
import Notification from "@/models/notification.model";
import dbConnect from "@/lib/mongoDB";

export async function PUT(req: Request) {
  const { id } = await req.json();

  await dbConnect();

  await Notification.findByIdAndUpdate(id, { read: true });

  return NextResponse.json({ success: true });
}
