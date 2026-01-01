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

    await Order.findByIdAndUpdate(
      id,
      { isOutForDelivery: true },
      { new: true }
    );

    return NextResponse.json("Order has succesfully set out for delivery", {
      status: 200,
    });
  } catch {
    return NextResponse.json("Failed to set out for delivery", {
      status: 500,
    });
  }
}
