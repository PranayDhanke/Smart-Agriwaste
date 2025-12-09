import dbConnect from "@/lib/mongoDB";
import buyeraccount from "@/models/buyeraccount";

import BuyerAccountModel from "@/models/buyeraccount"; // PascalCase model
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formdata = await request.formData();

    // Coerce values from FormData (could be string | File | null)
    const getString = (key: string) => {
      const v = formdata.get(key);
      return v === null ? null : String(v);
    };

    const buyerId = getString("buyerId");
    const firstName = getString("firstName");
    const lastName = getString("lastName");
    const username = getString("username");
    const email = getString("email");
    const phone = getString("phone");
    const aadharnumber = getString("aadharnumber");
    const state = getString("state");
    const district = getString("district");
    const taluka = getString("taluka");
    const village = getString("village");
    const houseBuildingName = getString("houseBuildingName");
    const roadarealandmarkName = getString("roadarealandmarkName");
    const aadharUrl = getString("aadharUrl");

    // Basic validation
    if (!buyerId || !firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: buyerId, firstName, lastName or email",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Optional: check if buyer already exists
    const existing = await BuyerAccountModel.findOne({ buyerId }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Buyer profile already exists" },
        { status: 409 }
      );
    }

    // Create document (await it)
    const created = await buyeraccount.create(
      {
        buyerId,
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
        aadharUrl,
      },
      { runValidators: true } // ensure mongoose schema validators run
    );

    return NextResponse.json(
      { message: "Profile created successfully ✅", data: created },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create profile ❌" },
      { status: 500 }
    );
  }
}
