import { IKFile, IKListResponse } from "@/components/types/uploadFiles";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";


function extractFiles(listResp: IKListResponse): IKFile[] {
  if (Array.isArray(listResp)) return listResp;
  if ("results" in listResp && Array.isArray(listResp.results)) return listResp.results;
  if ("items" in listResp && Array.isArray(listResp.items)) return listResp.items;
  if ("files" in listResp && Array.isArray(listResp.files)) return listResp.files;

  for (const value of Object.values(listResp)) {
    if (Array.isArray(value) && value.every((v) => typeof v === "object")) {
      return value as IKFile[];
    }
  }
  return [];
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const id = formData.get("id") as string | null;
    const folder = formData.get("folder") as string | null;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!id || !folder)
      return NextResponse.json({ error: "Missing required fields (id or folder)" }, { status: 400 });

    const listResp = await imagekit.listFiles({
      searchQuery: `name="${id}.jpg"`,
      path: `/${folder}`,
      limit: 1,
    });

    const existingFiles = extractFiles(listResp as IKListResponse);

    if (existingFiles.length > 0) {
      await imagekit.deleteFile(existingFiles[0].fileId);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const uploadResponse = await imagekit.upload({
      file: base64,
      fileName: `${id}.jpg`,
      folder: `/${folder}`,
      useUniqueFileName: false,
    });

    return NextResponse.json({
      message: "✅ Upload successful",
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: "Upload error", detail: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown upload error" }, { status: 500 });
  }
}
