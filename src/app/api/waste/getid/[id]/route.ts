import dbConnect from "@/lib/mongoDB";
import Waste from "@/models/waste";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to MongoDB (important if not already connected)
    await dbConnect();

    // Extract the query parameter
    const param = await params;
    const id = param.id;

    if (!id) {
      return NextResponse.json(
        { message: "Farmer ID is required" },
        { status: 400 }
      );
    }

    // Await the query
    const wastedata = await Waste.find({ farmerId: id });

    // Respond with data
    return NextResponse.json({ wastedata }, { status: 200 });
  } catch (error) {
    console.error("Error fetching waste listing:", error);
    return NextResponse.json(
      { message: "Failed to fetch waste listing by ID" },
      { status: 500 }
    );
  }
}
