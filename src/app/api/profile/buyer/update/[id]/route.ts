import dbConnect from "@/lib/mongoDB";
import buyeraccount from "@/models/buyeraccount";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {
      phone,
      aadharnumber,
      state,
      district,
      taluka,
      village,
      houseBuildingName,
      roadarealandmarkName,
      aadharUrl,
    } = await req.json();
    const param = await params;
    const id = param.id;

    // Update farmer profile logic here

    await dbConnect();

    buyeraccount.findOneAndUpdate(
      { buyerID: id },
      {
        phone,
        aadharnumber,
        state,
        district,
        taluka,
        village,
        houseBuildingName,
        roadarealandmarkName,
        aadharUrl,
      },
      {
        new: true,
      }
    );

    return NextResponse.json("Updated Buyer Profile", { status: 200 });
  } catch {
    return NextResponse.json("error", { status: 500 });
  }
}
