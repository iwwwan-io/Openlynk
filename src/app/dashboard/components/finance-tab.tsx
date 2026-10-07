"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Wallet,
  ArrowUpRight,
  Landmark,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Download,
} from "lucide-react";
import {
  formatIDR,
  type CreatorBalance,
  type PayoutAccount,
  type PayoutRequest,
  type PayoutStatus,
  type User,
  type Order,
} from "@/lib/types";
import { exportFinanceToCSV } from "@/lib/export-csv";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FinanceTab({
  currentUser,
  orders = [],
}: {
  currentUser?: User | null;
  orders?: Order[];
} = {}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<CreatorBalance>({
    totalEarnings: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    availableBalance: 0,
    minWithdrawal: 50000,
  });
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccount | null>(null);
  const [history, setHistory] = useState<PayoutRequest[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Form Rekening
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Form Penarikan
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Admin Payout States
  const [adminRequests, setAdminRequests] = useState<
    (PayoutRequest & { userName?: string; userEmail?: string })[]
  >([]);
  const [loadingAdminRequests, setLoadingAdminRequests] = useState(false);
  const [selectedAdminReq, setSelectedAdminReq] = useState<
    (PayoutRequest & { userName?: string; userEmail?: string }) | null
  >(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTargetStatus, setAdminTargetStatus] = useState<PayoutStatus>("completed");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [adminProofInput, setAdminProofInput] = useState("");
  const [submittingAdminAction, setSubmittingAdminAction] = useState(false);

  useEffect(() => {
    loadData();
    if (currentUser?.role === "admin") {
      loadAdminRequests();
    }
  }, [currentUser?.role]);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payouts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data keuangan");

      setBalance(data.balance);
      setPayoutAccount(data.payoutAccount);
      setHistory(data.history || []);
      setSupportedBanks(data.supportedBanks || []);

      if (data.payoutAccount) {
        setBankName(data.payoutAccount.bankName);
        setAccountNumber(data.payoutAccount.accountNumber);
        setAccountHolder(data.payoutAccount.accountHolder);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!accountNumber.trim() || !accountHolder.trim()) {
      setError("Nomor rekening dan nama pemilik wajib diisi.");
      return;
    }

    setSavingAccount(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payouts/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, accountNumber, accountHolder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan rekening");

      setPayoutAccount(data.account);
      setShowAccountModal(false);
      setSuccess("Rekening pencairan dana berhasil diperbarui.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan rekening");
    } finally {
      setSavingAccount(false);
    }
  }

  async function handleRequestWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < balance.minWithdrawal) {
      setError(`Nominal penarikan minimal ${formatIDR(balance.minWithdrawal)}`);
      return;
    }

    if (amount > balance.availableBalance) {
      setError("Nominal penarikan melebihi saldo tersedia Anda.");
      return;
    }

    setSubmittingWithdraw(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountIdr: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengajukan penarikan");

      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setSuccess("Permintaan penarikan berhasil diajukan dan sedang diproses.");
      await loadData(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengajukan penarikan");
    } finally {
      setSubmittingWithdraw(false);
    }
  }

  async function loadAdminRequests() {
    setLoadingAdminRequests(true);
    try {
      const res = await fetch("/api/payouts/admin");
      const data = await res.json();
      if (res.ok) {
        setAdminRequests(data.requests || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingAdminRequests(false);
    }
  }

  function openAdminActionModal(
    req: PayoutRequest & { userName?: string; userEmail?: string },
    defaultStatus: PayoutStatus = "completed"
  ) {
    setSelectedAdminReq(req);
    setAdminTargetStatus(defaultStatus);
    setAdminNotesInput(req.adminNotes || "");
    setAdminProofInput(req.proofUrl || "");
    setShowAdminModal(true);
  }

  async function handleAdminActionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAdminReq) return;
    setSubmittingAdminAction(true);
    try {
      const res = await fetch("/api/payouts/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedAdminReq.id,
          status: adminTargetStatus,
          adminNotes: adminNotesInput.trim() || undefined,
          proofUrl: adminProofInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status");
      setShowAdminModal(false);
      setSelectedAdminReq(null);
      setSuccess(`Status permohonan #${selectedAdminReq.id} berhasil diubah ke ${adminTargetStatus}.`);
      loadAdminRequests();
      loadData(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setSubmittingAdminAction(false);
    }
  }

  const statusBadge = (st: PayoutStatus) => {
    switch (st) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" /> Antrean
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <RefreshCw className="h-3 w-3 animate-spin" /> Diproses
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Berhasil
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            <XCircle className="h-3 w-3" /> Ditolak
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            <span>Dompet Kreator & Penarikan Dana</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pantau penghasilan penjualan produk digital dan tarik saldo bersih ke rekening bank atau e-wallet Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance.availableBalance < balance.minWithdrawal}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Tarik Saldo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Tersedia */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 shadow-sm space-y-1 relative overflow-hidden ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Saldo Tersedia
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {formatIDR(balance.availableBalance)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Minimal penarikan {formatIDR(balance.minWithdrawal)}
          </p>
        </div>

        {/* Total Penghasilan */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-1 transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Penjualan Bersih
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tracking-tight">
            {formatIDR(balance.totalEarnings)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Akumulasi pesanan lunas
          </p>
        </div>

        {/* Sedang Antre */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-1 transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sedang Diproses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tracking-tight">
            {formatIDR(balance.pendingWithdrawals)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Dalam antrean pencairan
          </p>
        </div>

        {/* Total Ditarik */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-1 transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Telah Ditarik
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-foreground tracking-tight">
            {formatIDR(balance.totalWithdrawn)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Transfer sukses ke rekening
          </p>
        </div>
      </div>

      {/* Account Info Box */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display text-sm font-bold text-foreground">
              Rekening Pencairan Dana
            </h3>
            {payoutAccount ? (
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{payoutAccount.bankName}</strong> • {payoutAccount.accountNumber} a.n.{" "}
                <span className="font-semibold text-foreground">{payoutAccount.accountHolder}</span>
              </p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Rekening belum diatur. Tambahkan rekening bank/e-wallet untuk mencairkan saldo.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAccountModal(true)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
        >
          <span>{payoutAccount ? "Ubah Rekening" : "Atur Rekening"}</span>
        </button>
      </div>

      {/* Withdrawal History Table */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">
              Riwayat Penarikan Dana & Mutasi
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              {history.length} riwayat penarikan
            </span>
          </div>

          <button
            type="button"
            onClick={() => exportFinanceToCSV(orders, history, "Keuangan")}
            disabled={orders.length === 0 && history.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Unduh laporan mutasi keuangan ke CSV"
          >
            <Download className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Export Mutasi CSV</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Belum ada riwayat penarikan dana</p>
            <p>Saldo penjualan Anda yang terkumpul dapat ditarik kapan saja ke rekening Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="pb-2.5 font-medium">Tanggal</th>
                  <th className="pb-2.5 font-medium">Tujuan Transfer</th>
                  <th className="pb-2.5 font-medium">Nominal</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {history.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-foreground">{req.bankName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {req.accountNumber} ({req.accountHolder})
                      </div>
                    </td>
                    <td className="py-3 font-bold font-mono text-foreground">
                      {formatIDR(req.amountIdr)}
                    </td>
                    <td className="py-3">{statusBadge(req.status)}</td>
                    <td className="py-3 text-[11px] text-muted-foreground max-w-xs truncate">
                      {req.adminNotes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KHUSUS ADMIN PLATFORM: Payout Management */}
      {currentUser?.role === "admin" && (
        <div className="rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary mb-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Panel Admin Platform</span>
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Semua Permohonan Penarikan Kreator
              </h3>
            </div>
            <button
              type="button"
              onClick={loadAdminRequests}
              disabled={loadingAdminRequests}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAdminRequests ? "animate-spin" : ""}`} />
              <span>Muat Ulang Permohonan</span>
            </button>
          </div>

          {loadingAdminRequests ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Memuat permohonan admin...</span>
            </div>
          ) : adminRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Tidak ada permohonan penarikan yang tercatat di sistem.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="pb-2.5 font-medium">Kreator</th>
                    <th className="pb-2.5 font-medium">Rekening Tujuan</th>
                    <th className="pb-2.5 font-medium">Nominal</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {adminRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-foreground">{req.userName || "Kreator"}</div>
                        <div className="text-[11px] text-muted-foreground">{req.userEmail}</div>
                        <div className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                          ID: #{req.id} • {new Date(req.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-foreground">{req.bankName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {req.accountNumber} ({req.accountHolder})
                        </div>
                      </td>
                      <td className="py-3 font-bold font-mono text-foreground">
                        {formatIDR(req.amountIdr)}
                      </td>
                      <td className="py-3">{statusBadge(req.status)}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openAdminActionModal(req, req.status === "pending" ? "processing" : "completed")}
                          className="rounded-full border border-border bg-foreground text-background px-3 py-1 text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          Kelola / Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Pengaturan Rekening */}
      <Dialog open={showAccountModal} onOpenChange={(v) => !v && setShowAccountModal(false)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-xl sm:rounded-3xl">
          <DialogHeader className="border-b border-border/60 pb-3 text-left">
            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              <span>Atur Rekening Pencairan</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rekening tujuan pencairan dana penjualanmu
            </DialogDescription>
          </DialogHeader>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Bank atau E-Wallet
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  {(supportedBanks.length > 0
                    ? supportedBanks
                    : ["BCA", "Bank Mandiri", "BRI", "BNI", "Bank Jago", "SeaBank", "GoPay", "OVO", "DANA"]
                  ).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nomor Rekening / No. HP E-Wallet
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="contoh: 1234567890 atau 081234567890"
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Pemilik Rekening (Sesuai Buku Tabungan / KTP)
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="contoh: Budi Santoso"
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {savingAccount && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Simpan Rekening</span>
                </button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      {/* Modal Ajukan Penarikan Saldo */}
      <Dialog open={showWithdrawModal} onOpenChange={(v) => !v && setShowWithdrawModal(false)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-xl sm:rounded-3xl">
          <DialogHeader className="border-b border-border/60 pb-3 text-left">
            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span>Tarik Saldo ke Rekening</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ajukan pencairan saldo ke rekeningmu
            </DialogDescription>
          </DialogHeader>

            <form onSubmit={handleRequestWithdraw} className="space-y-4">
              <div className="rounded-2xl bg-muted/40 p-3.5 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tujuan Pencairan:</span>
                  <span className="font-bold text-foreground">
                    {payoutAccount ? `${payoutAccount.bankName} (${payoutAccount.accountNumber})` : "Belum diatur"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Saldo Tersedia:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatIDR(balance.availableBalance)}
                  </span>
                </div>
              </div>

              {!payoutAccount && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Harap atur rekening penerima terlebih dahulu sebelum menarik dana.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nominal Penarikan (IDR)
                </label>
                <input
                  type="number"
                  min={balance.minWithdrawal}
                  max={balance.availableBalance}
                  step={1000}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Min. ${balance.minWithdrawal}`}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden font-mono"
                />

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={amt > balance.availableBalance}
                      onClick={() => setWithdrawAmount(String(amt))}
                      className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-mono hover:bg-muted disabled:opacity-30"
                    >
                      {formatIDR(amt)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(balance.availableBalance))}
                    className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-[10px] font-bold"
                  >
                    Semua Saldo
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdraw || !payoutAccount || Number(withdrawAmount) < balance.minWithdrawal}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-40"
                >
                  {submittingWithdraw && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Kirim Permintaan</span>
                </button>
              </div>
            </form>
        </DialogContent>
      </Dialog>

      {/* Modal Admin Kelola Status Penarikan */}
      <Dialog open={showAdminModal && selectedAdminReq !== null} onOpenChange={(v) => !v && setShowAdminModal(false)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-xl sm:rounded-3xl">
          <DialogHeader className="border-b border-border/60 pb-3 text-left">
            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Kelola Permohonan Penarikan</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ubah status dan catat bukti transfer
            </DialogDescription>
          </DialogHeader>
          {selectedAdminReq && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/30 p-3.5 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kreator:</span>
                <span className="font-semibold text-foreground">
                  {selectedAdminReq.userName || "Kreator"} ({selectedAdminReq.userEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tujuan Transfer:</span>
                <span className="font-mono font-semibold">
                  {selectedAdminReq.bankName} - {selectedAdminReq.accountNumber} ({selectedAdminReq.accountHolder})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nominal Bersih:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatIDR(selectedAdminReq.amountIdr)}
                </span>
              </div>
            </div>

            <form onSubmit={handleAdminActionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Ubah Status Penarikan
                </label>
                <select
                  value={adminTargetStatus}
                  onChange={(e) => setAdminTargetStatus(e.target.value as PayoutStatus)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="pending">Antrean (Pending)</option>
                  <option value="processing">Sedang Diproses (Processing)</option>
                  <option value="completed">Selesai Ditransfer (Completed)</option>
                  <option value="rejected">Tolak Permohonan (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Catatan Admin / No. Referensi Transfer
                </label>
                <input
                  type="text"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Contoh: Ditransfer via BCA no ref: 2026100512345"
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tautan Bukti Transfer (Opsional)
                </label>
                <input
                  type="url"
                  value={adminProofInput}
                  onChange={(e) => setAdminProofInput(e.target.value)}
                  placeholder="https://ik.imagekit.io/.../bukti-transfer.jpg"
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAdminAction}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-40"
                >
                  {submittingAdminAction && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
