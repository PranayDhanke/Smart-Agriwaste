import dbConnect from "@/lib/mongoDB";
import Waste from "@/models/waste";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const param = await params;
    const id = param.id;

    await dbConnect();

    const singleWaste = await Waste.findById(id);

    return NextResponse.json({ singleWaste }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
