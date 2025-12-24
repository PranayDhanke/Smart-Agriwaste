import dbConnect from "@/lib/mongoDB";
import Negotiation from "@/models/Orders/Negotiation";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { id, getstatus } = await req.json();
    await dbConnect();

    await Negotiation.findByIdAndUpdate(id, { status: getstatus });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
