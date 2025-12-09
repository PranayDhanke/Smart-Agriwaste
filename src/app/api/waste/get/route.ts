import dbConnect from "@/lib/mongoDB";
import Waste from "@/models/waste";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const wastedata = await Waste.find({});

    return NextResponse.json({ wastedata }, { status: 200 });
  } catch (error) {               
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch waste listings" },
      { status: 500 }
    );
  }
}
