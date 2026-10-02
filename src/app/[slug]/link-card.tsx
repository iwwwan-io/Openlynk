"use client";

import { ExternalLink } from "lucide-react";
import type { BentoSize } from "@/lib/types";
import { renderSocialIcon, getSocialColor, getSocialName } from "@/components/social-icons";

// Deteksi platform dari hostname → warna brand + label aksi.
function platform(href: string): { color: string; label: string; handle: string } | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const h = url.hostname.toLowerCase();
  const seg = url.pathname.split("/").filter(Boolean).pop() ?? "";
  const handle = seg ? `@${seg.replace("@", "")}` : h;
  const name = getSocialName(href);
  const color = getSocialColor(href);

  if (name !== "Website") {
    let label = "Kunjungi";
    if (h.includes("instagram.com") || h.includes("tiktok.com") || h.includes("x.com") || h.includes("twitter.com") || h.includes("github.com")) label = "Ikuti";
    if (h.includes("youtube.com") || h.includes("youtu.be")) label = "Subscribe";
    if (h.includes("wa.me") || h.includes("whatsapp.com") || h.includes("t.me") || h.includes("telegram")) label = "Chat";
    if (h.includes("linkedin.com")) label = "Connect";
    if (h.includes("spotify.com")) label = "Dengarkan";
    return { color, label, handle };
  }
  return null;
}

function PlatformIcon({ href, size = "md" }: { href: string; title: string; size?: "sm" | "md" | "lg" }) {
  const iconClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return renderSocialIcon(href, iconClass);
}

const cardCls =
  "group relative h-full w-full rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md";

export function LinkCard({
  title,
  href,
  pageId,
  size,
}: {
  title: string;
  href: string;
  pageId: string;
  size?: BentoSize;
}) {
  const p = platform(href);
  const isMonochrome =
    !p ||
    p.color === "#000000" ||
    p.color === "#24292F" ||
    p.color === "#18181b";

  // 1x1: Bento square tile yang sangat rapi dan proporsional
  if (size === "1x1") {
    return (
      <a
        href={href}
        data-track={href}
        data-page={pageId}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardCls} flex flex-col justify-between p-3.5`}
      >
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 border ${
              isMonochrome
                ? "border-border/70 bg-muted/60 text-foreground"
                : ""
            }`}
            style={
              !isMonochrome
                ? {
                    backgroundColor: `${p.color}18`,
                    color: p.color,
                    borderColor: `${p.color}35`,
                  }
                : undefined
            }
          >
            <PlatformIcon href={href} title={title} size="md" />
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
        </div>
        <div className="min-w-0 pt-2">
          <p className="truncate font-display text-sm font-semibold text-foreground">
            {p?.handle ? p.handle : title}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {title}
          </p>
        </div>
      </a>
    );
  }

  // 2x1: banner horizontal kompak
  if (size === "2x1") {
    return (
      <a
        href={href}
        data-track={href}
        data-page={pageId}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardCls} flex items-center gap-x-3 px-5`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            isMonochrome
              ? "border-border/70 bg-muted/60 text-foreground"
              : ""
          }`}
          style={
            !isMonochrome
              ? {
                  backgroundColor: `${p.color}18`,
                  color: p.color,
                  borderColor: `${p.color}35`,
                }
              : undefined
          }
        >
          <PlatformIcon href={href} title={title} size="sm" />
        </div>
        <span className="truncate font-display text-sm font-semibold text-foreground">{p?.handle ?? title}</span>
        {p && (
          <span
            className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              isMonochrome
                ? "bg-foreground text-background"
                : "text-white"
            }`}
            style={!isMonochrome ? { backgroundColor: p.color } : undefined}
          >
            {p.label}
          </span>
        )}
      </a>
    );
  }

  // 2x2: wide dengan area brand
  if (size === "2x2") {
    return (
      <a
        href={href}
        data-track={href}
        data-page={pageId}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardCls} flex overflow-hidden`}
      >
        <div
          className={`flex w-28 shrink-0 items-center justify-center border-r ${
            isMonochrome
              ? "border-border/70 bg-muted/30 text-foreground"
              : ""
          }`}
          style={
            !isMonochrome
              ? {
                  backgroundColor: `${p.color}15`,
                  color: p.color,
                  borderColor: `${p.color}30`,
                }
              : undefined
          }
        >
          <PlatformIcon href={href} title={title} size="lg" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-y-1 p-5">
          <p className="truncate font-display text-base font-bold text-foreground">{p?.handle ?? title}</p>
          <p className="truncate text-xs text-muted-foreground">{title}</p>
          {p && (
            <div className="pt-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  isMonochrome
                    ? "bg-foreground text-background"
                    : "text-white"
                }`}
                style={!isMonochrome ? { backgroundColor: p.color } : undefined}
              >
                {p.label}
              </span>
            </div>
          )}
        </div>
      </a>
    );
  }

  // Fallback default
  return (
    <a
      href={href}
      data-track={href}
      data-page={pageId}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardCls} flex flex-col p-4`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          isMonochrome
            ? "border-border/70 bg-muted/60 text-foreground"
            : ""
        }`}
        style={
          !isMonochrome
            ? {
                backgroundColor: `${p.color}18`,
                color: p.color,
                borderColor: `${p.color}35`,
              }
            : undefined
        }
      >
        <PlatformIcon href={href} title={title} size="md" />
      </div>
      <div className="mt-auto space-y-0.5 pt-3">
        <p className="truncate font-display text-sm font-semibold text-foreground">{p?.handle ?? title}</p>
        <p className="truncate text-xs text-muted-foreground">{title}</p>
      </div>
    </a>
  );
}
