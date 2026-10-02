/**
 * WhatsApp Gateway Provider untuk Pengiriman Notifikasi Transaksi OpenLynk.
 * Mendukung Fonnte, Wablas, Generic Webhook, dan Log Sandbox.
 */

export interface WhatsAppSendInput {
  to: string;
  message: string;
}

export interface DigitalDeliveryWhatsAppInput {
  buyerName: string;
  buyerContact: string;
  productName: string;
  creatorName: string;
  downloadUrl: string;
  orderId: string;
  appUrl?: string;
}

/**
 * Normalisasi format nomor telepon Indonesia menjadi format standar internasional (628xxx).
 * Mengembalikan null jika input berupa email atau bukan nomor yang valid.
 */
export function formatIndonesianPhone(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.includes("@")) return null; // Email, bukan nomor telepon

  // Hapus semua karakter non-digit
  let digits = trimmed.replace(/\D/g, "");
  if (!digits || digits.length < 9) return null;

  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (digits.startsWith("8")) {
    digits = "62" + digits;
  } else if (!digits.startsWith("62")) {
    // Jika tidak diawali 62 tapi berformat internasional lain
    return digits;
  }

  return digits;
}

/**
 * Mengirim pesan WhatsApp via provider gateway yang dikonfigurasi.
 */
export async function sendWhatsAppMessage(
  input: WhatsAppSendInput
): Promise<{ sent: boolean; mode: "fonnte" | "wablas" | "webhook" | "log"; error?: string }> {
  const phone = formatIndonesianPhone(input.to);
  const fonnteToken = process.env.FONNTE_TOKEN || process.env.WHATSAPP_API_TOKEN;
  const wablasToken = process.env.WABLAS_TOKEN;
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

  // Jika bukan nomor telepon (misal email) atau tidak ada token gateway
  if (!phone || (!fonnteToken && !wablasToken && !webhookUrl)) {
    console.log(`[whatsapp:${phone || input.to}] ${input.message.slice(0, 100)}...`);
    return { sent: false, mode: "log" };
  }

  // 1. Integrasi Provider Fonnte
  if (fonnteToken) {
    try {
      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: fonnteToken.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: phone,
          message: input.message,
          countryCode: "62",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { status?: boolean; reason?: string };
      if (res.ok && json.status !== false) {
        return { sent: true, mode: "fonnte" };
      }
      return { sent: false, mode: "fonnte", error: json.reason || "Fonnte error" };
    } catch (err: unknown) {
      return { sent: false, mode: "fonnte", error: err instanceof Error ? err.message : "Error Fonnte" };
    }
  }

  // 2. Integrasi Provider Wablas
  if (wablasToken) {
    const wablasDomain = process.env.WABLAS_DOMAIN || "https://kudus.wablas.com";
    try {
      const res = await fetch(`${wablasDomain.replace(/\/$/, "")}/api/send-message`, {
        method: "POST",
        headers: {
          Authorization: wablasToken.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          message: input.message,
        }),
      });
      if (res.ok) return { sent: true, mode: "wablas" };
      return { sent: false, mode: "wablas", error: `HTTP ${res.status}` };
    } catch (err: unknown) {
      return { sent: false, mode: "wablas", error: err instanceof Error ? err.message : "Error Wablas" };
    }
  }

  // 3. Generic Webhook Gateway
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone,
          message: input.message,
          event: "order.paid",
        }),
      });
      return { sent: res.ok, mode: "webhook" };
    } catch (err: unknown) {
      return { sent: false, mode: "webhook", error: err instanceof Error ? err.message : "Error Webhook" };
    }
  }

  return { sent: false, mode: "log" };
}

/**
 * Template pengiriman berkas digital via WhatsApp secara otomatis.
 */
export async function sendDigitalDeliveryWhatsApp(
  input: DigitalDeliveryWhatsAppInput
): Promise<{ sent: boolean; mode: string }> {
  const phone = formatIndonesianPhone(input.buyerContact);
  if (!phone) return { sent: false, mode: "not_phone" };

  const baseUrl = (
    input.appUrl ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://openlynk.id"
  ).replace(/\/$/, "");

  const fullDownloadUrl = input.downloadUrl.startsWith("http")
    ? input.downloadUrl
    : `${baseUrl}${input.downloadUrl.startsWith("/") ? "" : "/"}${input.downloadUrl}`;

  const message = [
    `Halo *${input.buyerName || "Kak"}*! 👋`,
    "",
    `Terima kasih telah berbelanja di *${input.creatorName}* via OpenLynk. Pembayaran pesanan Anda telah *LUNAS*! 🎉`,
    "",
    `📦 *Produk:* ${input.productName}`,
    `🆔 *ID Pesanan:* #${input.orderId}`,
    "",
    `📥 *Tautan Unduhan Berkas Digital (Tautan Aman):*`,
    `${fullDownloadUrl}`,
    "",
    `💡 *Catatan Keamanan:*`,
    `• Tautan di atas berlaku selama 24 jam.`,
    `• Anda juga dapat mengakses seluruh riwayat unduhan kapan saja di portal pembeli: ${baseUrl}/akses`,
    "",
    `Semoga karyanya bermanfaat dan selamat berkarya! ✨`,
    `— Tim *${input.creatorName}* & OpenLynk`,
  ].join("\n");

  return sendWhatsAppMessage({ to: phone, message });
}
