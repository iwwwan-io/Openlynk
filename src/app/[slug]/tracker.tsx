"use client";

import { useEffect } from "react";

export function Tracker({ pageId }: { pageId: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", pageId }),
    }).catch(() => {});
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[data-track]");
      if (!a) return;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "click",
          pageId: a.getAttribute("data-page") ?? pageId,
          href: a.getAttribute("data-track") ?? "",
        }),
      }).catch(() => {});
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pageId]);
  return null;
}
