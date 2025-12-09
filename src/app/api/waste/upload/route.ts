import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: NextRequest) {
  try {
    const { base64, fileName } = await request.json();

    if (!base64 || !fileName) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const uploadResponse = await imagekit.upload({
      file: base64,
      fileName,
      folder: "/waste_images",
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
    });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
