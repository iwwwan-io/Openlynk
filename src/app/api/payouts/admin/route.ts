import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { updatePayoutStatus } from "@/lib/payout";
import type { PayoutStatus } from "@/lib/types";

export async function PATCH(req: Request) {
  const user = await getSessionUser(req);
  const isPlatformAdmin = (user && user.role === "admin") || isAdmin(req);

  if (!isPlatformAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    requestId?: string;
    status?: PayoutStatus;
    adminNotes?: string;
    proofUrl?: string;
  };

  const { requestId, status, adminNotes, proofUrl } = body;
  if (!requestId || !status) {
    return NextResponse.json(
      { error: "requestId dan status wajib diisi." },
      { status: 400 }
    );
  }

  const validStatuses: PayoutStatus[] = ["pending", "processing", "completed", "rejected"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Status ${status} tidak valid.` },
      { status: 400 }
    );
  }

  try {
    const updated = await updatePayoutStatus(requestId, status, adminNotes, proofUrl);
    return NextResponse.json({ ok: true, request: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui status penarikan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
