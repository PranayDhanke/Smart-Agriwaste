import dbConnect from "@/lib/mongoDB";
import farmeraccount from "@/models/farmeraccount";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formdata = await request.formData();

    await dbConnect();

    const farmerId = formdata.get("farmerId");
    const firstName = formdata.get("firstName");
    const lastName = formdata.get("lastName");
    const username = formdata.get("username");
    const email = formdata.get("email");
    const phone = formdata.get("phone");
    const aadharnumber = formdata.get("aadharnumber");
    const state = formdata.get("state");
    const district = formdata.get("district");
    const taluka = formdata.get("taluka");
    const village = formdata.get("village");
    const houseBuildingName = formdata.get("houseBuildingName");
    const roadarealandmarkName = formdata.get("roadarealandmarkName");
    const farmNumber = formdata.get("farmNumber");
    const farmArea = formdata.get("farmArea");
    const farmUnit = formdata.get("farmUnit");
    const aadharUrl = formdata.get("aadharUrl");
    const farmDocUrl = formdata.get("farmDocUrl");

    await farmeraccount.create({
      farmerId,
      firstName,
      lastName,
      username,
      email,
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
      farmDocUrl
    });

    return NextResponse.json({ status: "Profile created successfully ✅" })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile ❌" },
      { status: 500 }
    );
  }
}
