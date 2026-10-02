import { FileText } from "lucide-react";
import type { BentoSize } from "@/lib/types";

export function NoteCard({
  title,
  text,
  size,
}: {
  title?: string;
  text: string;
  size?: BentoSize;
}) {
  const isCompact = size === "1x1";

  return (
    <div className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileText className="h-3 w-3" />
          </span>
          {title && (
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground line-clamp-1">
              {title}
            </h4>
          )}
        </div>
      </div>

      <div
        className={`mt-2 flex-1 overflow-y-auto pr-1 text-card-foreground ${
          isCompact ? "text-xs line-clamp-3" : "text-sm leading-relaxed"
        }`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
