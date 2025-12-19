import dbConnect from "@/lib/mongoDB";
import FarmerAccount from "@/models/farmeraccount"; // prefer PascalCase for model
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // parse and validate body
    const body = await req.json();

    const {
      phone,
      aadharnumber,
      state,
      district,
      taluka,
      village,
      houseBuildingName,
      roadarealandmarkName,
      farmNumber,
      farmArea,
      farmUnit,
      aadharUrl,
      farmDocUrl,
    } = body;

    const param = await params;

    const id = param.id;
    // params is not a promise

    if (!id) {
      return NextResponse.json({ error: "Missing farmer id" }, { status: 400 });
    }

    // optional: minimal validation example
    if (!phone && !aadharnumber && !aadharUrl && !farmDocUrl) {
      return NextResponse.json(
        { error: "No update fields provided" },
        { status: 400 }
      );
    }

    await dbConnect();

    // await the update so we know the result
    const updated = await FarmerAccount.findOneAndUpdate(
      { farmerId: id }, // change to { _id: id } if your schema uses Mongo _id
      {
        phone,
        aadharnumber,
        state,
        district,
        taluka,
        village,
        houseBuildingName,
        roadarealandmarkName,
        farmNumber,
        farmArea,
        farmUnit,
        aadharUrl,
        farmDocUrl,
      },
      {
        new: true, // return the updated doc
        runValidators: true, // ensure schema validators run
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Farmer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Updated Farmer Profile", data: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("Update farmer profile error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
