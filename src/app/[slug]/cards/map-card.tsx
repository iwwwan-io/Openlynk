import { MapPin, ExternalLink } from "lucide-react";
import { getMapEmbedUrl } from "@/lib/embeds";
import type { BentoSize } from "@/lib/types";

export function MapCard({
  label,
  address,
}: {
  label: string;
  address: string;
  size?: BentoSize;
}) {
  const embedUrl = getMapEmbedUrl(address);
  const directMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative flex-1 bg-muted">
        <iframe
          src={embedUrl}
          title={label || address}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border/40 bg-card/95 px-3 py-2 text-xs backdrop-blur">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="font-semibold text-foreground truncate">{label || address}</span>
        </div>
        <a
          href={directMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Rute</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
