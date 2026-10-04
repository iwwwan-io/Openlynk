import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { upsertPayoutAccount, SUPPORTED_BANKS } from "@/lib/payout";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };

  const bankName = (body.bankName || "").trim();
  const accountNumber = (body.accountNumber || "").trim();
  const accountHolder = (body.accountHolder || "").trim();

  if (!bankName || !accountNumber || !accountHolder) {
    return NextResponse.json(
      { error: "Nama bank, nomor rekening, dan nama pemilik rekening wajib diisi." },
      { status: 400 }
    );
  }

  if (!SUPPORTED_BANKS.includes(bankName)) {
    return NextResponse.json(
      { error: "Bank atau e-wallet tidak didukung. Pilih salah satu bank/e-wallet yang tersedia." },
      { status: 400 }
    );
  }

  if (accountNumber.length < 5 || accountNumber.length > 30) {
    return NextResponse.json(
      { error: "Nomor rekening / nomor e-wallet tidak valid." },
      { status: 400 }
    );
  }

  try {
    const account = await upsertPayoutAccount(user.id, {
      bankName,
      accountNumber,
      accountHolder,
    });
    return NextResponse.json({ ok: true, account });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan rekening";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
