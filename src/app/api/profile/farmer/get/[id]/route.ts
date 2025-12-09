import dbConnect from "@/lib/mongoDB";
import farmeraccount from "@/models/farmeraccount";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const param = await params;
    const id = param.id;

    const accountdata = await farmeraccount.findOne({ farmerId: id });

    return NextResponse.json({ accountdata }, { status: 200 });
  } catch {
    return NextResponse.json("Error fetching profile", { status: 500 });
  }
}
