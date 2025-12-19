import dbConnect from "@/lib/mongoDB";
import Negotiation from "@/models/Orders/Negotiation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const Params = await params;
    const id = Params.id;

    const negotationData = await Negotiation.find({ buyerId: id });

    return NextResponse.json(negotationData, { status: 200 });
  } catch {
    return NextResponse.json("Failed to fetch negotiation details", {
      status: 500,
    });
  }
}
