import dbConnect from "@/lib/mongoDB";
import Negotiation from "@/models/Orders/Negotiation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await dbConnect();

    await Negotiation.create({ ...data, createdAt: new Date() });

    return NextResponse.json(
      { message: "Negotiation request logged successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to log negotiation request" },
      { status: 500 }
    );
  }
}
