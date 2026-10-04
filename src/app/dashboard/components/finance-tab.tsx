"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  formatIDR,
  type CreatorBalance,
  type PayoutAccount,
  type PayoutRequest,
  type PayoutStatus,
} from "@/lib/types";

export function FinanceTab() {
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

  useEffect(() => {
    loadData();
  }, []);

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
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm space-y-1 relative overflow-hidden">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Saldo Tersedia (Bisa Ditarik)
          </span>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatIDR(balance.availableBalance)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Minimal penarikan {formatIDR(balance.minWithdrawal)}
          </p>
        </div>

        {/* Total Penghasilan */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Penjualan Bersih
          </span>
          <div className="font-display text-2xl font-bold text-foreground">
            {formatIDR(balance.totalEarnings)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Akumulasi pesanan lunas
          </p>
        </div>

        {/* Sedang Antre */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sedang Diproses
          </span>
          <div className="font-display text-2xl font-bold text-foreground">
            {formatIDR(balance.pendingWithdrawals)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Dalam antrean pencairan dana
          </p>
        </div>

        {/* Total Ditarik */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Telah Ditarik
          </span>
          <div className="font-display text-2xl font-bold text-foreground">
            {formatIDR(balance.totalWithdrawn)}
          </div>
          <p className="text-[11px] text-muted-foreground">
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
          <h3 className="font-display text-sm font-bold text-foreground">
            Riwayat Penarikan Dana
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {history.length} transaksi
          </span>
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

      {/* Modal Pengaturan Rekening */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                <span>Atur Rekening Pencairan</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

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
          </div>
        </div>
      )}

      {/* Modal Ajukan Penarikan Saldo */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span>Tarik Saldo ke Rekening</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
