export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-1 py-1">
      <div className="flex items-center gap-2.5">
        <h3 className="font-display text-sm font-bold tracking-tight text-foreground sm:text-base md:text-lg">
          {title}
        </h3>
        <div className="h-px flex-1 bg-border/70" />
      </div>
      {subtitle && (
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
