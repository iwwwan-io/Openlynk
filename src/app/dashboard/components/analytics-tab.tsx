"use client";

import { Eye, MousePointerClick, TrendingUp, ShoppingBag, Users } from "lucide-react";
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
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-32 items-end gap-1.5 pt-4">
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.date}: ${d.count}`}>
          <div
            className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
            style={{ height: `${Math.max(6, (d.count / max) * 105)}px`, backgroundColor: color }}
          />
          <span className="text-[10px] text-muted-foreground font-mono">{d.date.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsTab({ stats, subsCount, accentColor = "#2563eb" }: AnalyticsTabProps) {
  const ctrRate = stats.views > 0 ? `${((stats.clicks / stats.views) * 100).toFixed(1)}%` : "0%";

  const metricCards = [
    { label: "Total Views", val: stats.views.toLocaleString(), icon: Eye, color: "text-blue-500" },
    { label: "Total Clicks", val: stats.clicks.toLocaleString(), icon: MousePointerClick, color: "text-emerald-500" },
    { label: "Rasio CTR", val: ctrRate, icon: TrendingUp, color: "text-violet-500" },
    { label: "Omset Penjualan", val: formatIDR(stats.omset), icon: ShoppingBag, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const MIcon = m.icon;
          return (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between text-muted-foreground mb-1.5">
                <span className="text-xs font-semibold">{m.label}</span>
                <MIcon className={`h-4 w-4 ${m.color}`} />
              </div>
              <p className="font-display text-2xl font-extrabold text-foreground">{m.val}</p>
            </div>
          );
        })}
      </div>

      {/* Traffic Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">
              Kunjungan Harian (Views)
            </h3>
            <span className="text-xs font-mono text-muted-foreground">7 Hari Terakhir</span>
          </div>
          {stats.viewsOverTime.length > 0 ? (
            <Bars data={stats.viewsOverTime} color={accentColor} />
          ) : (
            <p className="text-xs text-muted-foreground py-10 text-center">Belum ada data rekaman</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">
              Interaksi Link (Clicks)
            </h3>
            <span className="text-xs font-mono text-muted-foreground">7 Hari Terakhir</span>
          </div>
          {stats.clicksOverTime.length > 0 ? (
            <Bars data={stats.clicksOverTime} color="#10b981" />
          ) : (
            <p className="text-xs text-muted-foreground py-10 text-center">Belum ada data rekaman</p>
          )}
        </div>
      </div>

      {/* Newsletter Subscribers Info */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h4 className="font-display text-sm font-bold text-foreground">
              Pelanggan Newsletter ({subsCount})
            </h4>
            <p className="text-xs text-muted-foreground">
              Pengunjung yang berlangganan newsletter di halaman profil ini
            </p>
          </div>
        </div>
        <span className="font-display text-xl font-bold text-foreground font-mono">
          {subsCount} Kontak
        </span>
      </div>
    </div>
  );
}
