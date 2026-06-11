import { NextRequest, NextResponse } from "next/server";
import { postForm } from "@/lib/vughy-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gid, visatype, visaid, origincountry, destinationcountry } = body;

    const data = await postForm("/getform_visa", {
      gid: String(gid ?? "1"),
      visatype: String(visatype ?? "1"),
      visaid: String(visaid ?? "1"),
      origincountry: String(origincountry ?? ""),
      destinationcountry: String(destinationcountry ?? ""),
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch visa form" },
      { status: 500 }
    );
  }
}
