import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { updatePayoutStatus, getAllPayoutRequests } from "@/lib/payout";
import { logAdminAction } from "@/lib/admin";
import type { PayoutStatus } from "@/lib/types";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const isPlatformAdmin = (user && user.role === "admin") || isAdmin(req);

  if (!isPlatformAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const requests = await getAllPayoutRequests();
    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    if (limitRaw === null) return NextResponse.json({ ok: true, requests });
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 50);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    return NextResponse.json({
      ok: true,
      total: requests.length,
      page,
      limit,
      requests: requests.slice((page - 1) * limit, page * limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat data permohonan penarikan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const actorId = user ? user.id : "token:ADMIN_TOKEN";
    await logAdminAction(actorId, `payout.${status}`, "payout_request", requestId, adminNotes);
    return NextResponse.json({ ok: true, request: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui status penarikan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
