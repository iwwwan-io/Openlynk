"use client";

import type { SocialLinks, SocialPlatform } from "@/lib/types";
import { normalizeSocialUrl } from "@/lib/types";
import {
  getSocialColor,
  getSocialIcon,
  getSocialName,
} from "@/components/social-icons";

interface SocialBarProps {
  socials?: SocialLinks;
  accentColor?: string;
  pageId: string;
  className?: string;
}

const PLATFORM_ORDER: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "whatsapp",
  "telegram",
  "github",
  "discord",
  "linkedin",
  "spotify",
  "website",
];

export function SocialBar({ socials, pageId, className }: SocialBarProps) {
  if (!socials || typeof socials !== "object") return null;

  const validLinks: { platform: SocialPlatform; url: string; label: string; color: string }[] = [];

  for (const platform of PLATFORM_ORDER) {
    const raw = socials[platform];
    if (raw && typeof raw === "string" && raw.trim()) {
      const url = normalizeSocialUrl(platform, raw);
      if (url) {
        validLinks.push({
          platform,
          url,
          label: getSocialName(url),
          color: getSocialColor(url),
        });
      }
    }
  }

  // Also check if any additional platform key exists
  for (const [key, val] of Object.entries(socials)) {
    if (!PLATFORM_ORDER.includes(key as SocialPlatform) && typeof val === "string" && val.trim()) {
      const url = normalizeSocialUrl(key as SocialPlatform, val);
      if (url) {
        validLinks.push({
          platform: key as SocialPlatform,
          url,
          label: getSocialName(url),
          color: getSocialColor(url),
        });
      }
    }
  }

  if (validLinks.length === 0) return null;

  function trackClick(href: string) {
    try {
      const payload = JSON.stringify({ type: "click", pageId, href });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", payload);
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 ${className ?? ""}`}
      aria-label="Tautan Media Sosial"
    >
      {validLinks.map(({ platform, url, label, color }) => {
        const Icon = getSocialIcon(url);
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(url)}
            title={label}
            className="group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl border border-border/80 bg-card/80 text-muted-foreground backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-md active:scale-95"
            style={
              {
                "--hover-color": color,
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = color;
              e.currentTarget.style.borderColor = color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.borderColor = "";
            }}
          >
            <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-200 group-hover:scale-110" />
            <span className="sr-only">{label}</span>
          </a>
        );
      })}
    </div>
  );
}
