import { WasteFormDataSchema } from "@/components/types/ListWaste";
import dbConnect from "@/lib/mongoDB";
import Waste from "@/models/waste";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: WasteFormDataSchema = await req.json();
    await dbConnect();

    const param = await params;

    const id = await param.id;

    console.log("ID :: ", id, "Incoming Data:", data);

    const updatedWaste = await Waste.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updatedWaste) {
      return NextResponse.json({ error: "Waste not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Waste updated successfully", updatedWaste },
      { status: 200 }
    );
  } catch (error) {
    console.log("error", error);

    return NextResponse.json(
      { error: "Error while updating the waste data" },
      { status: 400 }
    );
  }
}
