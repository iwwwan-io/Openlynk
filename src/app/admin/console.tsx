"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  Receipt,
  Wallet,
  ScrollText,
  LayoutDashboard,
  RefreshCw,
  Loader2,
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Ban,
  Crown,
  TrendingUp,
  AlertTriangle,
  Banknote,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { formatIDR, type User } from "@/lib/types";
import { useTheme } from "@/components/theme";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm";
import { DataPagination } from "@/components/data-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "overview" | "users" | "orders" | "payouts" | "audit";

interface Overview {
  totalUsers: number;
  totalPages: number;
  paidOrders: number;
  paidOrdersToday: number;
  gmv: number;
  feeCollected: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  adminCount: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  suspended: boolean;
  pageCount: number;
  gmv: number;
  createdAt: string;
}

interface AdminOrder {
  id: string;
  pageId: string;
  pageSlug?: string;
  pageName?: string;
  buyerName: string;
  buyerContact: string;
  qty: number;
  totalIdr: number;
  feeIdr: number;
  status: string;
  createdAt: string;
}

interface PayoutReq {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amountIdr: number;
  status: string;
  adminNotes?: string;
  proofUrl?: string;
  createdAt: string;
}

interface AuditItem {
  id: string;
  adminId: string;
  adminName?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  notes?: string;
  createdAt: string;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Gagal (${res.status})`);
  return data;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const hues = [160, 200, 220, 260, 20, 0, 330, 120];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  const hue = hues[h % hues.length];
  const cls = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <span
      aria-hidden
      className={`flex ${cls} shrink-0 items-center justify-center rounded-full font-bold text-white`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 45%), hsl(${(hue + 40) % 360} 60% 38%))` }}
    >
      {(name.charAt(0) || "?").toUpperCase()}
    </span>
  );
}

export function AdminConsole({ currentUser }: { currentUser: User }) {
  const [tab, setTab] = useState<Tab>("overview");
  const { isDark, toggle: toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [overview, setOverview] = useState<Overview | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const USERS_LIMIT = 15;
  const [userSearch, setUserSearch] = useState("");
  const [userPlan, setUserPlan] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [pendingUserAction, setPendingUserAction] = useState<{
    userId: string;
    patch: Record<string, unknown>;
    title: string;
    description?: string;
    confirmLabel?: string;
    input?: { label: string; placeholder?: string };
  } | null>(null);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_LIMIT = 15;
  const [orderStatus, setOrderStatus] = useState("");

  const [payouts, setPayouts] = useState<PayoutReq[]>([]);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const PAYOUTS_LIMIT = 15;
  const [payoutAction, setPayoutAction] = useState<PayoutReq | null>(null);
  const [payoutTarget, setPayoutTarget] = useState<"processing" | "completed" | "rejected">("processing");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [payoutProof, setPayoutProof] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);

  const [audit, setAudit] = useState<AuditItem[]>([]);

  function flashSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  }

  const loadOverview = useCallback(async () => {
    const d = await api("/api/admin/overview");
    setOverview(d);
  }, []);

  const loadUsers = useCallback(async (page = usersPage) => {
    const q = new URLSearchParams({ limit: String(USERS_LIMIT), page: String(page) });
    if (userSearch.trim()) q.set("search", userSearch.trim());
    if (userPlan) q.set("plan", userPlan);
    const d = await api(`/api/admin/users?${q.toString()}`);
    setUsers(d.users);
    setUsersTotal(d.total);
  }, [usersPage, userSearch, userPlan]);

  const loadOrders = useCallback(async (page = ordersPage) => {
    const q = new URLSearchParams({ limit: String(ORDERS_LIMIT), page: String(page) });
    if (orderStatus) q.set("status", orderStatus);
    const d = await api(`/api/admin/orders?${q.toString()}`);
    setOrders(d.orders);
    setOrdersTotal(d.total);
  }, [ordersPage, orderStatus]);

  const loadPayouts = useCallback(async (page = payoutsPage) => {
    const d = await api(`/api/payouts/admin?limit=${PAYOUTS_LIMIT}&page=${page}`);
    setPayouts(d.requests ?? []);
    setPayoutsTotal(d.total ?? (d.requests ?? []).length);
  }, [payoutsPage]);

  const loadAudit = useCallback(async () => {
    const d = await api("/api/admin/audit?limit=100");
    setAudit(d.items ?? []);
  }, []);

  const loadTab = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ringkasan selalu disegarkan di latar untuk badge antrean payout
      if (tab !== "overview") void loadOverview().catch(() => {});
      if (tab === "overview") {
        await Promise.all([loadOverview(), loadPayouts()]);
      } else if (tab === "users") {
        await loadUsers();
      } else if (tab === "orders") {
        await loadOrders();
      } else if (tab === "payouts") {
        await loadPayouts();
      } else {
        await loadAudit();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [tab, loadOverview, loadUsers, loadOrders, loadPayouts, loadAudit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTab();
  }, [loadTab]);

  async function executeUserAction(inputValue?: string) {
    if (!pendingUserAction) return;
    const { userId, patch } = pendingUserAction;
    const finalPatch =
      inputValue !== undefined && patch.suspended === true
        ? { ...patch, suspendedReason: inputValue }
        : patch;
    setPendingUserAction(null);
    setActing(userId);
    setError("");
    try {
      const d = await api("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...finalPatch }),
      });
      if (d.changed) flashSuccess(`Perubahan tersimpan: ${(d.changes ?? []).join(", ")}`);
      await Promise.all([loadUsers(), loadOverview().catch(() => {})]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setActing(null);
    }
  }

  async function handleUserPatch(
    userId: string,
    patch: Record<string, unknown>,
    confirm?: { title: string; description?: string; confirmLabel?: string; input?: { label: string; placeholder?: string } }
  ) {
    if (confirm) {
      setPendingUserAction({ userId, patch, ...confirm });
      return;
    }
    setActing(userId);
    setError("");
    try {
      const d = await api("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });
      if (d.changed) flashSuccess(`Perubahan tersimpan: ${(d.changes ?? []).join(", ")}`);
      await Promise.all([loadUsers(), loadOverview().catch(() => {})]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setActing(null);
    }
  }

  async function handlePayoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payoutAction) return;
    setPayoutSaving(true);
    setError("");
    try {
      await api("/api/payouts/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: payoutAction.id,
          status: payoutTarget,
          adminNotes: payoutNotes.trim() || undefined,
          proofUrl: payoutProof.trim() || undefined,
        }),
      });
      flashSuccess(`Payout ${payoutAction.id} → ${payoutTarget}`);
      setPayoutAction(null);
      setPayoutNotes("");
      setPayoutProof("");
      await Promise.all([loadPayouts(), loadOverview().catch(() => {})]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memproses payout");
    } finally {
      setPayoutSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { id: "users", label: "Kreator", icon: Users },
    { id: "orders", label: "Transaksi", icon: Receipt },
    { id: "payouts", label: "Payout", icon: Wallet },
    { id: "audit", label: "Audit Log", icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Header hero — pita gelap agar otoritas admin terasa beda dari dashboard kreator */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-lg dark:bg-zinc-900 dark:border dark:border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-500/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-emerald-500/15 blur-[100px]"
          />
          <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/30">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mode Admin
                </p>
                <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight">
                  Panel Admin Platform
                </h1>
                <p className="text-xs text-zinc-400">
                  {currentUser.name} • {currentUser.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
                aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={loadTab}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Muat Ulang
              </button>
              <Link
                href="/dashboard"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </div>
          </div>
          {overview && overview.pendingPayouts > 0 && (
            <button
              type="button"
              onClick={() => setTab("payouts")}
              className="relative flex w-full items-center gap-2.5 border-t border-white/10 bg-amber-500/10 px-5 py-2.5 text-left text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/20 sm:px-6"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {overview.pendingPayouts} payout menunggu ({formatIDR(overview.pendingPayoutAmount)}) — proses sekarang
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0" />
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Tab bar */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 h-auto w-full justify-start sm:justify-center" aria-label="Navigasi admin">
            {tabs.map((t) => {
              const Icon = t.icon;
              const badge =
                t.id === "payouts" && overview && overview.pendingPayouts > 0 ? overview.pendingPayouts : null;
              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground data-[active]:bg-foreground data-[active]:text-background data-[active]:shadow-sm"
                >
                  <Icon className="size-4" aria-hidden />
                  {t.label}
                  {badge !== null && (
                    <span className="ml-0.5 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-extrabold text-zinc-950">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat data admin...
          </div>
        ) : (
          <>
            {tab === "overview" && overview && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="!bg-gradient-to-br !from-emerald-500/15 !via-card !to-card !border-emerald-500/25">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">GMV Terkumpul</p>
                        <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold">{formatIDR(overview.gmv)}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{overview.paidOrders} order lunas • {overview.paidOrdersToday} hari ini</p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </span>
                    </div>
                  </Card>
                  <Card className="!bg-gradient-to-br !from-amber-500/15 !via-card !to-card !border-amber-500/25">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fee Platform</p>
                        <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold">{formatIDR(overview.feeCollected)}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">Pendapatan kotor platform</p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Banknote className="h-5 w-5" />
                      </span>
                    </div>
                  </Card>
                  <button
                    type="button"
                    onClick={() => setTab("payouts")}
                    className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 shadow-sm text-left transition-all hover:bg-amber-500/20 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Payout Antre</p>
                        <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold">
                          {overview.pendingPayouts} <span className="text-sm font-bold text-muted-foreground">permohonan</span>
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          {formatIDR(overview.pendingPayoutAmount)} — proses <ArrowRight className="h-3 w-3" />
                        </p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        <Clock className="h-5 w-5" />
                      </span>
                    </div>
                  </button>
                  <Card>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kreator / Halaman</p>
                        <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold">
                          {overview.totalUsers.toLocaleString("id-ID")}
                          <span className="text-sm font-bold text-muted-foreground"> / {overview.totalPages.toLocaleString("id-ID")}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{overview.adminCount} akun admin</p>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                        <Users className="h-5 w-5" />
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {tab === "users" && (
              <Card>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { setUsersPage(1); void loadUsers(1); } }}
                      placeholder="Cari email / nama..."
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:border-foreground"
                    />
                  </div>
                  <Select
                    value={userPlan || "all"}
                    onValueChange={(v) => { setUserPlan(v && v !== "all" ? v : ""); setUsersPage(1); }}
                  >
                    <SelectTrigger aria-label="Filter paket" className="w-[160px] rounded-xl min-h-[44px]">
                      <SelectValue placeholder="Semua paket" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Semua paket</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => { setUsersPage(1); void loadUsers(1); }}
                    className="rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-bold min-h-[44px]"
                  >
                    Cari
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{usersTotal} kreator ditemukan</p>
                {users.length === 0 ? (
                  <EmptyState icon={Users} title="Tidak ada kreator cocok" hint="Ubah kata kunci atau filter paket, lalu tekan Cari." />
                ) : (
                <div className="overflow-x-auto -mx-1 px-1">
                  <Table className="text-xs min-w-[760px]">
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Kreator</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Paket / Peran</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Halaman / GMV</TableHead>
                        <TableHead className="font-semibold uppercase tracking-wide text-[10px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className={`transition-colors hover:bg-muted/40 ${u.suspended ? "bg-destructive/5" : ""}`}>
                          <TableCell className="py-3 pr-2">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={u.name} size="sm" />
                              <div>
                                <div className="font-semibold flex items-center gap-1.5">
                                  <span className="max-w-[180px] truncate">{u.name}</span>
                                  {u.suspended && (
                                    <span className="rounded-full bg-destructive/10 border border-destructive/30 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
                                      SUSPENDED
                                    </span>
                                  )}
                                  {u.role === "admin" && (
                                    <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-1.5 py-0.5 text-[9px] font-bold text-sky-600 dark:text-sky-400">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-[11px] text-muted-foreground max-w-[220px] truncate">{u.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 pr-2">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                              u.plan === "pro"
                                ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400"
                                : "bg-muted border-border text-muted-foreground"
                            }`}>
                              {u.plan === "pro" && <Crown className="h-2.5 w-2.5" />}
                              {u.plan.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 pr-2 font-mono">
                            {u.pageCount} hal • {formatIDR(u.gmv)}
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <div className="inline-flex flex-wrap justify-end gap-1">
                              {u.plan === "free" ? (
                                <button
                                  type="button"
                                  disabled={acting === u.id}
                                  onClick={() => handleUserPatch(u.id, { plan: "pro" })}
                                  className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 disabled:opacity-50"
                                >
                                  <Crown className="h-3 w-3 inline mr-0.5" />
                                  Jadi Pro
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={acting === u.id}
                                  onClick={() => handleUserPatch(u.id, { plan: "free" }, {
                                    title: "Kembalikan ke Free?",
                                    description: `${u.email} kehilangan fitur Pro.`,
                                    confirmLabel: "Ya, kembalikan",
                                  })}
                                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold disabled:opacity-50"
                                >
                                  Ke Free
                                </button>
                              )}
                              {u.role === "admin" ? (
                                <button
                                  type="button"
                                  disabled={acting === u.id}
                                  onClick={() =>
                                    handleUserPatch(u.id, { role: "creator" }, {
                                      title: "Demote admin?",
                                      description: `${u.email} tidak lagi bisa membuka panel admin.`,
                                      confirmLabel: "Ya, demote",
                                    })
                                  }
                                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold disabled:opacity-50"
                                >
                                  Demote
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={acting === u.id}
                                  onClick={() =>
                                    handleUserPatch(u.id, { role: "admin" }, {
                                      title: "Promosikan menjadi admin?",
                                      description: `${u.email} mendapat akses penuh panel admin.`,
                                      confirmLabel: "Ya, promosikan",
                                    })
                                  }
                                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold disabled:opacity-50"
                                >
                                  Jadi Admin
                                </button>
                              )}
                              {u.suspended ? (
                                <button
                                  type="button"
                                  disabled={acting === u.id}
                                  onClick={() => handleUserPatch(u.id, { suspended: false })}
                                  className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[10px] font-bold text-emerald-600 disabled:opacity-50"
                                >
                                  Buka Blokir
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={acting === u.id}
                                  onClick={() => handleUserPatch(u.id, { suspended: true }, {
                                    title: `Suspend ${u.email}?`,
                                    description: "Akun langsung keluar dari semua perangkat dan tidak bisa login.",
                                    confirmLabel: "Ya, suspend",
                                    input: { label: "Alasan suspend (opsional)", placeholder: "Contoh: spam, pelanggaran" },
                                  })}
                                  className="rounded-lg bg-destructive/10 border border-destructive/30 px-2 py-1 text-[10px] font-bold text-destructive disabled:opacity-50"
                                >
                                  <Ban className="h-3 w-3 inline mr-0.5" />
                                  Suspend
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}
                <DataPagination
                  page={usersPage}
                  total={usersTotal}
                  limit={USERS_LIMIT}
                  onChange={(p) => { setUsersPage(p); void loadUsers(p); }}
                />
              </Card>
            )}

            {tab === "orders" && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Select
                    value={orderStatus || "all"}
                    onValueChange={(v) => { setOrderStatus(v && v !== "all" ? v : ""); setOrdersPage(1); }}
                  >
                    <SelectTrigger aria-label="Filter status order" className="w-[180px] rounded-xl min-h-[44px]">
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Semua status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => { setOrdersPage(1); void loadOrders(1); }}
                    className="rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-bold min-h-[44px]"
                  >
                    Filter
                  </button>
                  <span className="text-xs text-muted-foreground">{ordersTotal} transaksi</span>
                </div>
                <div className="overflow-x-auto -mx-1 px-1">
                  {orders.length === 0 ? (
                    <EmptyState icon={Receipt} title="Tidak ada transaksi" hint="Belum ada order pada filter status ini." />
                  ) : (
                  <Table className="text-xs min-w-[720px]">
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Order</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Halaman</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Pembeli</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Nominal</TableHead>
                        <TableHead className="font-semibold uppercase tracking-wide text-[10px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.id} className="transition-colors hover:bg-muted/40">
                          <TableCell className="py-2.5 pr-2 font-mono">#{o.id.slice(0, 12)}</TableCell>
                          <TableCell className="py-2.5 pr-2 font-medium">{o.pageSlug ? `/${o.pageSlug}` : o.pageId.slice(0, 8)}</TableCell>
                          <TableCell className="py-2.5 pr-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={o.buyerName} size="sm" />
                              <div>
                                <div className="font-semibold max-w-[160px] truncate">{o.buyerName}</div>
                                <div className="font-mono text-[10px] text-muted-foreground max-w-[180px] truncate">{o.buyerContact}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 pr-2 font-mono font-bold">
                            {formatIDR(o.totalIdr)}
                            <div className="text-[10px] font-normal text-muted-foreground">fee {formatIDR(o.feeIdr)}</div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <StatusBadge value={o.status} uppercase />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  )}
                </div>
                <DataPagination
                  page={ordersPage}
                  total={ordersTotal}
                  limit={ORDERS_LIMIT}
                  onChange={(p) => { setOrdersPage(p); void loadOrders(p); }}
                />
              </Card>
            )}

            {tab === "payouts" && (
              <Card>
                <p className="text-xs text-muted-foreground mb-3">{payoutsTotal} permohonan tercatat</p>
                {payouts.length === 0 ? (
                  <EmptyState icon={Wallet} title="Tidak ada payout" hint="Permohonan penarikan kreator akan muncul di sini." />
                ) : (
                <div className="overflow-x-auto -mx-1 px-1">
                  <Table className="text-xs min-w-[720px]">
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Kreator</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Tujuan</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Nominal</TableHead>
                        <TableHead className="pr-2 font-semibold uppercase tracking-wide text-[10px]">Status</TableHead>
                        <TableHead className="font-semibold uppercase tracking-wide text-[10px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((p) => (
                        <TableRow key={p.id} className={`transition-colors hover:bg-muted/40 ${p.status === "pending" ? "bg-amber-500/5" : ""}`}>
                          <TableCell className="py-2.5 pr-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={p.userName || "K"} size="sm" />
                              <div>
                                <div className="font-semibold max-w-[150px] truncate">{p.userName || "Kreator"}</div>
                                <div className="font-mono text-[10px] text-muted-foreground max-w-[170px] truncate">{p.userEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 pr-2">
                            <span className="font-semibold">{p.bankName}</span>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {p.accountNumber} ({p.accountHolder})
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 pr-2 font-mono font-bold">{formatIDR(p.amountIdr)}</TableCell>
                          <TableCell className="py-2.5 pr-2">
                            <StatusBadge value={p.status} uppercase />
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            {["pending", "processing"].includes(p.status) ? (
                              <div className="inline-flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayoutAction(p);
                                    setPayoutTarget(p.status === "pending" ? "processing" : "completed");
                                    setPayoutNotes(p.adminNotes ?? "");
                                    setPayoutProof(p.proofUrl ?? "");
                                  }}
                                  className="rounded-lg bg-foreground text-background px-2.5 py-1 text-[10px] font-bold"
                                >
                                  Proses
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayoutAction(p);
                                    setPayoutTarget("rejected");
                                    setPayoutNotes("");
                                    setPayoutProof("");
                                  }}
                                  className="rounded-lg border border-destructive/40 text-destructive px-2.5 py-1 text-[10px] font-bold"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Selesai</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}
                <DataPagination
                  page={payoutsPage}
                  total={payoutsTotal}
                  limit={PAYOUTS_LIMIT}
                  onChange={(p) => { setPayoutsPage(p); void loadPayouts(p); }}
                />
              </Card>
            )}

            {tab === "audit" && (
              <Card>
                <p className="text-xs text-muted-foreground mb-3">{audit.length} entri terakhir</p>
                <div className="space-y-2">
                  {audit.map((a) => {
                    const tone = a.action.includes("suspend") || a.action.includes("reject")
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : a.action.includes("bootstrap") || a.action.includes("promote") || a.action.includes("completed")
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : a.action.includes("payout")
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : "bg-muted text-muted-foreground border-border";
                    return (
                    <div key={a.id} className="rounded-xl border border-border/60 p-3 text-xs transition-colors hover:bg-muted/30">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 font-mono font-bold ${tone}`}>{a.action}</span>
                        {a.targetType && (
                          <span className="font-mono text-muted-foreground">
                            {a.targetType}:{a.targetId?.slice(0, 16)}
                          </span>
                        )}
                        <span className="ml-auto text-muted-foreground">
                          {a.adminName ?? a.adminId} • {new Date(a.createdAt).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {a.notes && <p className="mt-1 text-muted-foreground">{a.notes}</p>}
                    </div>
                    );
                  })}
                  {audit.length === 0 && (
                    <EmptyState icon={ScrollText} title="Belum ada aktivitas" hint="Setiap aksi admin tercatat di sini." />
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Konfirmasi aksi user */}
      <ConfirmDialog
        open={pendingUserAction !== null}
        onOpenChange={(v) => !v && setPendingUserAction(null)}
        title={pendingUserAction?.title ?? ""}
        description={pendingUserAction?.description}
        confirmLabel={pendingUserAction?.confirmLabel ?? "Ya, lanjutkan"}
        danger
        busy={acting !== null}
        input={pendingUserAction?.input}
        onConfirm={executeUserAction}
      />

      {/* Modal proses payout */}      <Dialog open={payoutAction !== null} onOpenChange={(v) => !v && setPayoutAction(null)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl sm:rounded-3xl">
          {payoutAction && (
          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display font-bold">
                {payoutTarget === "rejected" ? "Tolak payout" : `Proses payout → ${payoutTarget}`}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Formulir keputusan payout kreator
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 p-3">
              <Avatar name={payoutAction.userName || "K"} size="sm" />
              <div className="text-xs">
                <p className="font-bold">{payoutAction.userName} • {formatIDR(payoutAction.amountIdr)}</p>
                <p className="font-mono text-muted-foreground">{payoutAction.bankName} {payoutAction.accountNumber}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold" htmlFor="payout-notes">Catatan admin</label>
              <textarea
                id="payout-notes"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                rows={2}
                placeholder="Contoh: transfer via BCA 12 Okt, ref 123"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-semibold" htmlFor="payout-proof">URL bukti transfer (opsional)</label>
              <input
                id="payout-proof"
                value={payoutProof}
                onChange={(e) => setPayoutProof(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={payoutSaving}
              className="w-full rounded-full bg-foreground text-background py-2.5 text-sm font-bold min-h-[44px] disabled:opacity-50"
            >
              {payoutSaving ? "Menyimpan..." : "Simpan keputusan"}
            </button>
          </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
