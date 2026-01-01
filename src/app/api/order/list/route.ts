import dbConnect from "@/lib/mongoDB";
import Order from "@/models/Orders/Order";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const orders = Array.isArray(body) ? body : [body];

    if (orders.length === 0) {
      return NextResponse.json(
        { message: "No orders provided" },
        { status: 400 }
      );
    }

    const createdOrders = await Order.insertMany(
      orders.map((order) => ({
        ...order,
        createdAt: new Date(),
      }))
    );

    return NextResponse.json(
      {
        message: "Orders placed successfully",
        count: createdOrders.length,
        orders: createdOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);

    return NextResponse.json(
      { message: "Error while sending the order request" },
      { status: 500 }
    );
  }
}
