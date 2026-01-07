import Order from "@/models/Orders/Order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const param = await params;

    const id = param.id;

    const orderdata = await Order.findById(id);

    return NextResponse.json({ orderdata }, { status: 200 });
  } catch {
    return NextResponse.json("error while getting the order details", {
      status: 500,
    });
  }
}
