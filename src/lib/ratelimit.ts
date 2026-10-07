const hits = new Map<string, number[]>();
const MAX_MAP_SIZE = 5_000;

export function rateLimit(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();

  // Prune jika map sudah terlalu besar untuk mencegah kebocoran memori (memory leak)
  if (hits.size > MAX_MAP_SIZE) {
    for (const [k, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(k);
      } else {
        hits.set(k, valid);
      }
    }
  }

  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length <= limit;
}

export function clientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}
