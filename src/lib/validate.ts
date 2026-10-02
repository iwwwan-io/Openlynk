const RESERVED = new Set([
  "sign-up", "sign-in", "claim", "api", "actions", "app", "admin", "login",
  "logout", "dashboard", "auth", "pricing", "about", "blog", "docs", "help",
  "support", "status", "settings", "profile", "account", "checkout", "klaim",
  "jelajahi",
]);

export function validSlug(slug: string): string | null {
  if (!/^[a-z0-9-]{3,30}$/.test(slug)) return "slug 3-30 huruf/angka/strip";
  if (RESERVED.has(slug)) return "slug dicadangkan";
  return null;
}

export function fee(total: number): number {
  return Math.round(total * 0.05);
}
