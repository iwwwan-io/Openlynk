import crypto from "node:crypto";

export interface GoogleOAuthState {
  nonce: string;
  redirect: string;
  slugToClaim?: string;
  exp: number;
}

export const OAUTH_STATE_COOKIE = "openlynk_oauth_state";

function googleSecret(): string | null {
  return process.env.BETTER_AUTH_SECRET || process.env.ADMIN_TOKEN || null;
}

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim() &&
      googleSecret()
  );
}

export function googleRedirectUri(): string {
  const base = (
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}/api/auth/google/callback`;
}

/** State anti-CSRF: payload base64 + HMAC-SHA256. Nonce ganda dicek via cookie. */
export function signState(payload: Omit<GoogleOAuthState, "exp">): string {
  const secret = googleSecret();
  if (!secret) throw new Error("Google OAuth belum dikonfigurasi (secret hilang)");
  const body: GoogleOAuthState = { ...payload, exp: Date.now() + 10 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyState(state: string): GoogleOAuthState | null {
  const secret = googleSecret();
  if (!secret) return null;
  const [encoded, sig] = state.split(".");
  if (!encoded || !sig) return null;
  const expect = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  if (sig.length !== expect.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const body = JSON.parse(Buffer.from(encoded, "base64url").toString()) as GoogleOAuthState;
    if (!body.nonce || body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export async function exchangeCodeForTokens(code: string): Promise<{ accessToken: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Gagal menukar kode Google");
  const json = (await res.json()) as { access_token?: string; error_description?: string };
  if (!json.access_token) throw new Error(json.error_description || "Token Google tidak diterima");
  return { accessToken: json.access_token };
}

export async function fetchGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Gagal membaca profil Google");
  const json = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!json.sub || !json.email) throw new Error("Profil Google tidak lengkap");
  return {
    sub: json.sub,
    email: json.email,
    emailVerified: json.email_verified === true,
    name: (json.name || json.email.split("@")[0]).slice(0, 100),
    picture: json.picture,
  };
}
