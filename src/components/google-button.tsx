"use client";

import { useEffect, useState } from "react";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

/**
 * Tombol "Lanjutkan dengan Google". Sembunyi otomatis bila server
 * belum menyetel GOOGLE_CLIENT_ID/SECRET. `href` sudah berisi
 * query redirect/slug dari halaman pemanggil.
 */
export function GoogleButton({ href, label = "Lanjutkan dengan Google" }: { href: string; label?: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled) setEnabled(j?.google === true);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled !== true) return null;

  return (
    <a
      href={href}
      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <GoogleIcon />
      <span>{label}</span>
    </a>
  );
}

export function OAuthDivider() {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <span>atau</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
