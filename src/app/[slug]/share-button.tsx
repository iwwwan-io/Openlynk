"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: name, url }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(url).catch(() => undefined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted shadow-2xs"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>Disalin!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          <span>Bagikan</span>
        </>
      )}
    </button>
  );
}
