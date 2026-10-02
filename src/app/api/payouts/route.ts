import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getCreatorBalance,
  getPayoutAccount,
  getPayoutHistory,
  SUPPORTED_BANKS,
} from "@/lib/payout";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [balance, payoutAccount, history] = await Promise.all([
      getCreatorBalance(user.id),
      getPayoutAccount(user.id),
      getPayoutHistory(user.id),
    ]);

    return NextResponse.json({
      ok: true,
      balance,
      payoutAccount,
      history,
      supportedBanks: SUPPORTED_BANKS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat data keuangan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
