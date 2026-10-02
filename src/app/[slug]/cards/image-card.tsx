import { ExternalLink } from "lucide-react";
import type { BentoSize } from "@/lib/types";

export function ImageCard({
  url,
  caption,
  href,
}: {
  url: string;
  caption?: string;
  href?: string;
  size?: BentoSize;
}) {
  const content = (
    <div className="group relative flex h-full w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={caption || "Banner image"}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Caption or Link Indicator */}
      {(caption || href) && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
          {caption ? (
            <p className="line-clamp-2 text-xs font-medium leading-snug drop-shadow-sm">{caption}</p>
          ) : (
            <div />
          )}
          {href && (
            <span className="ml-2 inline-flex shrink-0 items-center justify-center rounded-full bg-white/20 p-1 backdrop-blur-sm transition-transform group-hover:scale-110">
              <ExternalLink className="h-3 w-3 text-white" />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
      >
        {content}
      </a>
    );
  }

  return content;
}
