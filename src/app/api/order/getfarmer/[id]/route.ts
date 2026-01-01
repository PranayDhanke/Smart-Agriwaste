import dbConnect from "@/lib/mongoDB";
import Order from "@/models/Orders/Order";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const param = await params;
    const farmerId = await param.id;

    await dbConnect();

    const orderdata = await Order.find({ farmerId });

    return NextResponse.json({ orderdata }, { status: 200 });
  } catch {
    return NextResponse.json("Error while fetching the data", { status: 500 });
  }
}
