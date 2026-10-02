import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { validateAndApplyCoupon } from "@/lib/store";

export async function POST(req: Request) {
  // Rate limit: 30 requests per menit per IP
  if (!rateLimit(`coupon-check:${clientKey(req)}`, 30)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan, coba lagi nanti" }, { status: 429 });
  }

  const body = (await req.json()) as {
    pageId?: string;
    code?: string;
    subtotal?: number;
  };

  const pageId = body.pageId?.trim();
  const code = body.code?.trim().toUpperCase();
  const subtotal = Math.max(Math.floor(body.subtotal ?? 0), 0);

  if (!pageId || !code) {
    return NextResponse.json({ valid: false, message: "Page ID dan kode kupon wajib diisi" }, { status: 400 });
  }

  const result = await validateAndApplyCoupon(pageId, code, subtotal);
  return NextResponse.json(result);
}
