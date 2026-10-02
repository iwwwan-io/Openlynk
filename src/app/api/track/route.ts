import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { recordClick, recordView } from "@/lib/store";

export async function POST(req: Request) {
  if (!rateLimit(`track:${clientKey(req)}`, 120)) {
    return NextResponse.json({ error: "terlalu banyak" }, { status: 429 });
  }
  const body = (await req.json()) as {
    type?: "view" | "click";
    pageId?: string;
    href?: string;
  };
  if (!body.pageId || !body.type) {
    return NextResponse.json({ error: "type + pageId wajib" }, { status: 400 });
  }
  if (body.type === "view") {
    await recordView(body.pageId);
  } else {
    await recordClick(body.pageId, body.href ?? "");
  }
  return NextResponse.json({ ok: true });
}
