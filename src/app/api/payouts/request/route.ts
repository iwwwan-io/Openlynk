import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { requestPayout } from "@/lib/payout";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { amountIdr?: number };
  const amountIdr = Number(body.amountIdr || 0);

  if (isNaN(amountIdr) || amountIdr <= 0) {
    return NextResponse.json(
      { error: "Jumlah nominal penarikan tidak valid." },
      { status: 400 }
    );
  }

  try {
    const payoutReq = await requestPayout(user.id, amountIdr);
    return NextResponse.json({ ok: true, request: payoutReq }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengajukan penarikan";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
