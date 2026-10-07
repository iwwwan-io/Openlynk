import { NextResponse } from "next/server";
import { sendDigitalEmail } from "@/lib/email";
import { sendDigitalDeliveryWhatsApp } from "@/lib/whatsapp";
import { verifySignature } from "@/lib/midtrans";
import { markOrderPaid, markOrderCancelledOrExpired } from "@/lib/store";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    signature_key?: string;
    transaction_status?: string;
  };
  if (!body.order_id) return NextResponse.json({ error: "order_id wajib" }, { status: 400 });

  const ok = verifySignature({
    orderId: body.order_id,
    statusCode: body.status_code ?? "",
    grossAmount: body.gross_amount ?? "",
    signatureKey: body.signature_key ?? "",
  });
  if (!ok) return NextResponse.json({ error: "signature invalid" }, { status: 403 });

  const s = body.transaction_status ?? "";
  if (["capture", "settlement"].includes(s)) {
    const result = await markOrderPaid(body.order_id);
    if (!result.order) return NextResponse.json({ ok: true, message: "order tidak ditemukan" });

    // Idempotent: kirim email & WhatsApp hanya jika baru pertama kali lunas
    if (result.newlyPaid && result.product?.kind === "digital" && result.product?.fileUrl) {
      const secureDownloadUrl = `/api/downloads/${result.order.id}?contact=${encodeURIComponent(result.order.buyerContact)}`;
      
      // Jalankan notifikasi tanpa menggagalkan webhook bila provider eksternal mengalami latency/error
      await Promise.allSettled([
        sendDigitalEmail({
          to: result.order.buyerContact,
          productName: result.product.name,
          fileUrl: secureDownloadUrl,
        }).catch((err) => console.error("[webhook:email_error]", err)),
        sendDigitalDeliveryWhatsApp({
          buyerName: result.order.buyerName,
          buyerContact: result.order.buyerContact,
          productName: result.product.name,
          creatorName: result.page?.name || "Kreator",
          downloadUrl: secureDownloadUrl,
          orderId: result.order.id,
        }).catch((err) => console.error("[webhook:whatsapp_error]", err)),
      ]);
    }
  } else if (["expire", "cancel", "deny"].includes(s)) {
    // Revert stok & kupon secara atomic jika sebelumnya pending
    await markOrderCancelledOrExpired(body.order_id, "expired");
  }

  return NextResponse.json({ ok: true });
}

