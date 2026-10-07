import crypto from "node:crypto";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY ?? "";
const IS_PROD = process.env.MIDTRANS_IS_PRODUCTION === "true";

export const midtransConfig = {
  hasKeys: Boolean(SERVER_KEY && CLIENT_KEY),
  isProduction: IS_PROD,
  clientKey: CLIENT_KEY,
};

export async function createSnapToken(params: {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerContact: string;
}): Promise<{ token: string; redirectUrl?: string; sandbox: boolean }> {
  if (!SERVER_KEY) {
    return { token: `sandbox-${params.orderId}`, sandbox: true };
  }
  const base = IS_PROD
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const res = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${SERVER_KEY}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.customerName.slice(0, 50),
        email: params.customerContact.includes("@")
          ? params.customerContact
          : undefined,
        phone: params.customerContact,
      },
    }),
  });
  if (!res.ok) throw new Error(`Midtrans error ${res.status}`);
  const json = (await res.json()) as { token: string; redirect_url: string };
  return { token: json.token, redirectUrl: json.redirect_url, sandbox: !IS_PROD };
}

export function getSnapScriptUrl(): string {
  const isProd =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" ||
    process.env.MIDTRANS_IS_PRODUCTION === "true";
  return isProd
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

export function verifySignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  if (!SERVER_KEY) {
    // Mode produksi: wajiib menolak jika MIDTRANS_SERVER_KEY belum disetel
    if (IS_PROD || process.env.NODE_ENV === "production") {
      return false;
    }
    return true; // Sandbox lokal/testing tanpa server key
  }
  const hash = crypto
    .createHash("sha512")
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${SERVER_KEY}`)
    .digest("hex");
  return hash === input.signatureKey;
}
