import dbConnect from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import Notification from "@/models/notification.model";

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    await dbConnect();

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
