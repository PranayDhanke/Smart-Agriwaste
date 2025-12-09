import { WasteFormDataSchema } from "@/components/types/ListWaste";
import dbConnect from "@/lib/mongoDB";
import Waste from "@/models/waste";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data: WasteFormDataSchema = await req.json();

    await dbConnect();

    console.log(data);
    

    // Save document
    await Waste.create({
      ...data,
      createdAt: new Date(), // timestamp
    });

    return NextResponse.json(
      { status: "Waste listed successfully ✅" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to list waste ❌" }, { status: 500 });
  }
}
