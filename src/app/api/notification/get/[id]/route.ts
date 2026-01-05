import { NextResponse } from "next/server";
import Notification from "@/models/notification.model";
import dbConnect from "@/lib/mongoDB";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const param = await params; // Clerk userId

    await dbConnect();
    const id = await param.id;

    const notifications = await Notification.find({ userId: id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notification fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
