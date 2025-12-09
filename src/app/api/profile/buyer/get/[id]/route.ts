import dbConnect from "@/lib/mongoDB";
import buyeraccount from "@/models/buyeraccount";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const param = await params;
    const id = param.id;

    const accountdata = await buyeraccount.findOne({ buyerId: id });

    return NextResponse.json({ accountdata }, { status: 200 });
  } catch {
    return NextResponse.json("Error fetching profile", { status: 500 });
  }
}
