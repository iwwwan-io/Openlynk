import { getYouTubeEmbedUrl } from "@/lib/embeds";
import type { BentoSize } from "@/lib/types";
import { YoutubeIcon } from "@/components/social-icons";

export function VideoCard({
  title,
  url,
}: {
  title?: string;
  url: string;
  size?: BentoSize;
}) {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      {title && (
        <div className="flex shrink-0 items-center justify-between border-b border-border/40 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 line-clamp-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FF0000]/15 text-[#FF0000]">
              <YoutubeIcon className="h-3 w-3" />
            </span>
            <span className="text-foreground">{title}</span>
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-[#FF0000] opacity-80 hover:opacity-100 transition-opacity"
          >
            YouTube ↗
          </a>
        </div>
      )}

      <div className="relative flex-1 bg-black/90">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title ?? "Video"}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF0000]/20 text-[#FF0000]">
              <YoutubeIcon className="h-6 w-6" />
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs font-semibold text-white/90 underline hover:text-white"
            >
              Tonton di YouTube
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
