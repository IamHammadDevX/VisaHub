import { NextRequest, NextResponse } from "next/server";
import { postForm } from "@/lib/vughy-client";

export async function POST(req: NextRequest) {
  try {
    const { typeid } = await req.json();

    if (!typeid) {
      return NextResponse.json({ error: "typeid is required" }, { status: 400 });
    }

    const data = await postForm("/getvisatypename", {
      typeid: String(typeid),
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch visa type name" },
      { status: 500 }
    );
  }
}
