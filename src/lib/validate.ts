const RESERVED = new Set([
  "sign-up", "sign-in", "claim", "api", "actions", "app", "admin", "login",
  "logout", "dashboard", "auth", "pricing", "about", "blog", "docs", "help",
  "support", "status", "settings", "profile", "account", "checkout", "klaim",
  "jelajahi", "terms", "privacy", "refund", "kontak", "contact", "legal",
  "masuk", "daftar", "lupa-password", "akses", "products", "product",
  "domain", "demo", "sitemap",
]);

export function validSlug(slug: string): string | null {
  if (!/^[a-z0-9-]{3,30}$/.test(slug)) return "slug 3-30 huruf/angka/strip";
  if (RESERVED.has(slug)) return "slug dicadangkan";
  return null;
}

export function feeRate(plan?: string | null): number {
  return plan === "pro" ? 0.03 : 0.05;
}

export function fee(total: number, plan?: string | null): number {
  return Math.round(total * feeRate(plan));
}
