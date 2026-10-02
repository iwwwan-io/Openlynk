export async function sendDigitalEmail(input: {
  to: string;
  productName: string;
  fileUrl?: string;
}): Promise<{ sent: boolean; mode: "resend" | "log" }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "OpenLynk <noreply@openlynk.id>";
  if (!key || !input.to.includes("@")) {
    console.log(`[email:${input.to}] ${input.productName} ${input.fileUrl ?? ""}`);
    return { sent: false, mode: "log" };
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `File ${input.productName}`,
      html: `<p>Terima kasih! Unduh di sini: ${input.fileUrl ?? "-"}</p>`,
    }),
  }).catch(() => {});
  return { sent: true, mode: "resend" };
}
