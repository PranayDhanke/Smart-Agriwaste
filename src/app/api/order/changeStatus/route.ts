import dbConnect from "@/lib/mongoDB";
import Order from "@/models/Orders/Order";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json("id or status is not present", { status: 401 });
    }

    await dbConnect();

    await Order.findByIdAndUpdate(id, { status }, { new: true });

    return NextResponse.json("Order status updated", { status: 200 });
  } catch {
    return NextResponse.json("Failed to change the oreder status", {
      status: 500,
    });
  }
}
