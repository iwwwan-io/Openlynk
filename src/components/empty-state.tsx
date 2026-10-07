import { Inbox } from "lucide-react";

/** Empty state generik: ikon + judul + petunjuk opsional. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
}: {
  icon?: typeof Inbox;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-bold">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
