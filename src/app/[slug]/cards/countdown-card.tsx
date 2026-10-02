"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import type { BentoSize } from "@/lib/types";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

function calculateTimeLeft(targetDate: string): TimeLeft {
  const diff = Date.parse(targetDate) - Date.now();
  if (isNaN(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

export function CountdownCard({
  title,
  targetDate,
  emoji = "⏳",
  size,
}: {
  title: string;
  targetDate: string;
  emoji?: string;
  size?: BentoSize;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const isCompact = size === "1x1";

  return (
    <div className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {emoji && emoji !== "⏳" ? (
            <span className="text-base">{emoji}</span>
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </h4>
        </div>
      </div>

      <div className="my-auto flex items-center justify-center">
        {!mounted ? (
          <div className="grid grid-cols-4 gap-2 text-center w-full max-w-[240px]">
            {["hari", "jam", "menit", "detik"].map((unit) => (
              <div key={unit} className="flex flex-col rounded-xl bg-muted/60 p-2">
                <span className="font-display text-xl font-bold text-foreground">--</span>
                <span className="text-[10px] text-muted-foreground">{unit}</span>
              </div>
            ))}
          </div>
        ) : timeLeft.isPast ? (
          <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Waktu telah tiba! 🎉
          </div>
        ) : isCompact ? (
          <div className="flex flex-col items-center">
            <span suppressHydrationWarning className="font-display text-2xl font-bold text-foreground">
              {timeLeft.days}d {timeLeft.hours}h
            </span>
            <span className="text-[10px] text-muted-foreground">tersisa</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center w-full max-w-[240px]">
            <div className="flex flex-col rounded-xl bg-muted/60 p-2">
              <span suppressHydrationWarning className="font-display text-xl font-bold text-foreground">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-muted-foreground">hari</span>
            </div>
            <div className="flex flex-col rounded-xl bg-muted/60 p-2">
              <span suppressHydrationWarning className="font-display text-xl font-bold text-foreground">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-muted-foreground">jam</span>
            </div>
            <div className="flex flex-col rounded-xl bg-muted/60 p-2">
              <span suppressHydrationWarning className="font-display text-xl font-bold text-foreground">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-muted-foreground">menit</span>
            </div>
            <div className="flex flex-col rounded-xl bg-muted/60 p-2">
              <span suppressHydrationWarning className="font-display text-xl font-bold text-foreground">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-muted-foreground">detik</span>
            </div>
          </div>
        )}
      </div>

      <div suppressHydrationWarning className="text-[10px] text-muted-foreground/70 text-right truncate">
        {mounted
          ? new Date(targetDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : targetDate.slice(0, 10)}
      </div>
    </div>
  );
}
