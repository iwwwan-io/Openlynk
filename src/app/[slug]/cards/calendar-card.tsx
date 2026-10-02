import { Calendar, ExternalLink } from "lucide-react";
import type { BentoSize } from "@/lib/types";

export function CalendarCard({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description?: string;
  size?: BentoSize;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-border"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {title}
            </h4>
            <p className="text-[11px] font-medium text-muted-foreground">
              Jadwalkan Konsultasi / Meeting
            </p>
          </div>
        </div>

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:text-foreground shrink-0">
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>

      {description && (
        <p className="my-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-2 pt-2 border-t border-border/40">
        <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground text-background py-1.5 px-3 text-xs font-bold transition-all group-hover:opacity-90">
          <span>Pilih Jadwal Sesi</span>
          <span className="text-[11px]">↗</span>
        </div>
      </div>
    </a>
  );
}
