export async function sendDigitalEmail(input: {
  to: string;
  productName: string;
  fileUrl?: string;
}): Promise<{ sent: boolean; mode: "resend" | "log" }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "OpenLynk <noreply@openlynk.id>";
  const baseUrl = (
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://openlynk.id"
  ).replace(/\/$/, "");

  const fullDownloadUrl = input.fileUrl
    ? input.fileUrl.startsWith("http")
      ? input.fileUrl
      : `${baseUrl}${input.fileUrl.startsWith("/") ? "" : "/"}${input.fileUrl}`
    : undefined;

  if (!key || !input.to.includes("@")) {
    console.log(`[email:${input.to}] ${input.productName} ${fullDownloadUrl ?? ""}`);
    return { sent: false, mode: "log" };
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #18181b; font-size: 20px; font-weight: 700; margin-top: 0;">Terima Kasih atas Pembelian Anda! 🎉</h2>
      <p style="color: #52525b; font-size: 14px; line-height: 1.6;">
        Pembayaran pesanan produk <strong>${input.productName}</strong> telah berhasil dikonfirmasi. Berkas digital Anda siap untuk diunduh.
      </p>
      ${
        fullDownloadUrl
          ? `<div style="margin: 28px 0; text-align: center;">
              <a href="${fullDownloadUrl}" style="background-color: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 14px; display: inline-block;">
                Unduh Berkas Digital 📥
              </a>
             </div>
             <p style="color: #71717a; font-size: 12px; line-height: 1.5;">
               Tautan di atas berlaku selama 24 jam. Anda juga dapat mengakses seluruh riwayat unduhan kapan saja di:
               <a href="${baseUrl}/akses" style="color: #2563eb;">${baseUrl}/akses</a>
             </p>`
          : ""
      }
      <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 24px 0;" />
      <p style="color: #a1a1aa; font-size: 11px; margin-bottom: 0;">
        OpenLynk • Platform Produk Digital & Kreator Indonesia
      </p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `[OpenLynk] Unduhan Digital: ${input.productName}`,
      html: htmlContent,
    }),
  }).catch(() => {});
  return { sent: true, mode: "resend" };
}
