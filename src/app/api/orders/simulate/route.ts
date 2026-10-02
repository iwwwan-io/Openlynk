import { NextResponse } from "next/server";
import { sendDigitalEmail } from "@/lib/email";
import { sendDigitalDeliveryWhatsApp } from "@/lib/whatsapp";
import { markOrderPaid } from "@/lib/store";

// Sandbox helper: tandai order pending -> paid tanpa signature.
// Hanya untuk demo; di produksi pakai webhook Midtrans asli.
export async function POST(req: Request) {
  const body = (await req.json()) as { orderId?: string };
  if (!body.orderId) return NextResponse.json({ error: "orderId wajib" }, { status: 400 });

  const result = await markOrderPaid(body.orderId);
  if (!result.order) return NextResponse.json({ error: "order tidak ada" }, { status: 404 });
  if (!result.newlyPaid) {
    return NextResponse.json({ error: "hanya pending bisa dibayar" }, { status: 400 });
  }

  // Kirim email & WhatsApp file digital hanya jika produk berupa digital dan ada fileUrl
  if (result.product?.kind === "digital" && result.product?.fileUrl) {
    const secureDownloadUrl = `/api/downloads/${result.order.id}?contact=${encodeURIComponent(result.order.buyerContact)}`;
    
    // 1. Kirim Email (Resend / Log)
    await sendDigitalEmail({
      to: result.order.buyerContact,
      productName: result.product.name,
      fileUrl: secureDownloadUrl,
    });

    // 2. Kirim WhatsApp (Fonnte / Wablas / Webhook / Log)
    await sendDigitalDeliveryWhatsApp({
      buyerName: result.order.buyerName,
      buyerContact: result.order.buyerContact,
      productName: result.product.name,
      creatorName: result.page?.name || "Kreator",
      downloadUrl: secureDownloadUrl,
      orderId: result.order.id,
    });
  }

  return NextResponse.json(result.order);
}

