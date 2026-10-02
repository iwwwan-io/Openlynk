import { getSpotifyEmbedUrl } from "@/lib/embeds";
import type { BentoSize } from "@/lib/types";
import { SpotifyIcon } from "@/components/social-icons";

export function MusicCard({
  title,
  url,
}: {
  title?: string;
  url: string;
  size?: BentoSize;
}) {
  const spotifyEmbed = getSpotifyEmbedUrl(url);

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      {title && (
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 line-clamp-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#1ED760]/15 text-[#1ED760]">
              <SpotifyIcon className="h-3 w-3" />
            </span>
            <span className="text-foreground">{title}</span>
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-[#1ED760] opacity-80 hover:opacity-100 transition-opacity"
          >
            Spotify ↗
          </a>
        </div>
      )}

      <div className="relative flex-1 bg-black/5 dark:bg-white/5">
        {spotifyEmbed ? (
          <iframe
            src={spotifyEmbed}
            title={title ?? "Spotify Player"}
            className="h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full w-full flex-col items-center justify-center p-4 text-center transition-colors hover:bg-muted/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1ED760]/15 text-[#1ED760]">
              <SpotifyIcon className="h-6 w-6" />
            </div>
            <span className="mt-2 font-display text-sm font-semibold">{title || "Dengarkan Musik"}</span>
            <span className="text-xs text-muted-foreground underline mt-0.5">Buka di Spotify</span>
          </a>
        )}
      </div>
    </div>
  );
}
