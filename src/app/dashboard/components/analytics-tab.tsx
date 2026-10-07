"use client";

import { useState } from "react";
import { Eye, MousePointerClick, TrendingUp, ShoppingBag, Users, BarChart2 } from "lucide-react";
import { formatIDR } from "@/lib/types";

export interface AnalyticsStats {
  views: number;
  clicks: number;
  orders: number;
  omset: number;
  viewsOverTime: { date: string; count: number }[];
  clicksOverTime: { date: string; count: number }[];
}

interface AnalyticsTabProps {
  stats: AnalyticsStats;
  subsCount: number;
  accentColor?: string;
}

function Bars({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-36 items-end gap-2 pt-6">
      {data.map((d) => {
        const isHovered = hoveredDate === d.date;
        const heightPct = Math.max(8, (d.count / max) * 100);
        return (
          <div
            key={d.date}
            className="group relative flex flex-1 flex-col items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHoveredDate(d.date)}
            onMouseLeave={() => setHoveredDate(null)}
          >
            {/* Interactive Tooltip on Hover */}
            {isHovered && (
              <div className="absolute -top-9 z-20 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] font-mono font-bold text-background shadow-md animate-in fade-in zoom-in-95 duration-100">
                {d.date}: {d.count.toLocaleString("id-ID")}
              </div>
            )}

            <div className="relative w-full flex items-end justify-center h-24">
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  isHovered ? "opacity-100 ring-2 ring-foreground/20 scale-y-[1.02]" : "opacity-85 hover:opacity-100"
                }`}
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className={`text-[10px] font-mono transition-colors ${isHovered ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              {d.date.slice(8)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsTab({ stats, subsCount, accentColor = "#2563eb" }: AnalyticsTabProps) {
  const ctrRate = stats.views > 0 ? `${((stats.clicks / stats.views) * 100).toFixed(1)}%` : "0%";
  const conversionRate = stats.clicks > 0 ? `${((stats.orders / stats.clicks) * 100).toFixed(1)}%` : "0%";

  const metricCards = [
    { label: "Total Views", val: stats.views.toLocaleString(), sub: "Kunjungan profil", icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Clicks", val: stats.clicks.toLocaleString(), sub: "Interaksi link & produk", icon: MousePointerClick, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Rasio CTR", val: ctrRate, sub: "Klik per kunjungan", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Total Omset", val: formatIDR(stats.omset), sub: "Pendapatan toko lunas", icon: ShoppingBag, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {metricCards.map((m) => {
          const MIcon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-foreground/20 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${m.bg} ${m.color}`}>
                  <MIcon className="h-4 w-4" />
                </div>
              </div>
              <p className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{m.val}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Traffic Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Eye className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground">
                Kunjungan Harian (Views)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">7 Hari Terakhir</span>
          </div>
          {stats.viewsOverTime.length > 0 ? (
            <Bars data={stats.viewsOverTime} color={accentColor} />
          ) : (
            <p className="text-xs text-muted-foreground py-12 text-center">Belum ada data rekaman kunjungan</p>
          )}
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MousePointerClick className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground">
                Interaksi Link (Clicks)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">7 Hari Terakhir</span>
          </div>
          {stats.clicksOverTime.length > 0 ? (
            <Bars data={stats.clicksOverTime} color="#10b981" />
          ) : (
            <p className="text-xs text-muted-foreground py-12 text-center">Belum ada data rekaman klik</p>
          )}
        </div>
      </div>

      {/* Secondary Insights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Newsletter Subscribers Info */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/80 text-foreground shadow-2xs">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-display text-sm font-bold text-foreground">
                Pelanggan Newsletter
              </h4>
              <p className="text-xs text-muted-foreground">
                Audiens terdaftar dari form bio
              </p>
            </div>
          </div>
          <span className="font-display text-xl font-extrabold text-foreground font-mono">
            {subsCount} Kontak
          </span>
        </div>

        {/* Conversion Rate Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-2xs">
              <BarChart2 className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-display text-sm font-bold text-foreground">
                Konversi Penjualan
              </h4>
              <p className="text-xs text-muted-foreground">
                {stats.orders} pesanan dari {stats.clicks} klik
              </p>
            </div>
          </div>
          <span className="font-display text-xl font-extrabold text-foreground font-mono">
            {conversionRate}
          </span>
        </div>
      </div>
    </div>
  );
}
