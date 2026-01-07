import dbConnect from "@/lib/mongoDB";
import Order from "@/models/Orders/Order";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json("id is not present", { status: 401 });
    }

    await dbConnect();

    await Order.findByIdAndUpdate(id, { isDelivered: true }, { new: true });

    return NextResponse.json("Order has been successfully delivered", {
      status: 200,
    });
  } catch {
    return NextResponse.json("Failed to set order has been delivered", {
      status: 500,
    });
  }
}
