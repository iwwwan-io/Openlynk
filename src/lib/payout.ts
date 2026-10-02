import { client, ensureDbInitialized } from "./db";
import { uid, type CreatorBalance, type PayoutAccount, type PayoutRequest, type PayoutStatus } from "./types";

export const MIN_PAYOUT_AMOUNT = 50000; // Minimal penarikan Rp 50.000

export const SUPPORTED_BANKS = [
  "BCA",
  "Bank Mandiri",
  "BRI",
  "BNI",
  "Bank Jago",
  "SeaBank",
  "BSI (Bank Syariah Indonesia)",
  "CIMB Niaga",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
];

/**
 * Menghitung saldo kreator secara akurat berdasarkan riwayat transaksi dan penarikan.
 */
export async function getCreatorBalance(userId: string): Promise<CreatorBalance> {
  await ensureDbInitialized();

  // 1. Dapatkan seluruh pageId milik user
  const pagesRes = await client.execute({
    sql: "SELECT id FROM pages WHERE user_id = ?;",
    args: [userId],
  });

  const pageIds = pagesRes.rows.map((r) => String(r.id));

  let totalEarnings = 0;
  if (pageIds.length > 0) {
    // Buat placeholder ?, ?, ? untuk SQL IN clause
    const placeholders = pageIds.map(() => "?").join(", ");
    const ordersRes = await client.execute({
      sql: `SELECT COALESCE(SUM(total_idr), 0) as total FROM orders 
            WHERE page_id IN (${placeholders}) AND status IN ('paid', 'sent');`,
      args: pageIds,
    });
    totalEarnings = Number(ordersRes.rows[0]?.total ?? 0);
  }

  // 2. Hitung total dana yang telah berhasil ditarik (status: completed)
  const withdrawnRes = await client.execute({
    sql: "SELECT COALESCE(SUM(amount_idr), 0) as total FROM payout_requests WHERE user_id = ? AND status = 'completed';",
    args: [userId],
  });
  const totalWithdrawn = Number(withdrawnRes.rows[0]?.total ?? 0);

  // 3. Hitung penarikan yang sedang antre / diproses (status: pending atau processing)
  const pendingRes = await client.execute({
    sql: "SELECT COALESCE(SUM(amount_idr), 0) as total FROM payout_requests WHERE user_id = ? AND status IN ('pending', 'processing');",
    args: [userId],
  });
  const pendingWithdrawals = Number(pendingRes.rows[0]?.total ?? 0);

  // 4. Saldo bersih yang masih bisa ditarik
  const availableBalance = Math.max(0, totalEarnings - totalWithdrawn - pendingWithdrawals);

  return {
    totalEarnings,
    totalWithdrawn,
    pendingWithdrawals,
    availableBalance,
    minWithdrawal: MIN_PAYOUT_AMOUNT,
  };
}

/**
 * Mengambil informasi rekening bank / e-wallet pencairan dana milik kreator.
 */
export async function getPayoutAccount(userId: string): Promise<PayoutAccount | null> {
  await ensureDbInitialized();
  const res = await client.execute({
    sql: "SELECT * FROM payout_accounts WHERE user_id = ? LIMIT 1;",
    args: [userId],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0] as Record<string, unknown>;
  return {
    id: String(r.id),
    userId: String(r.user_id),
    bankName: String(r.bank_name),
    accountNumber: String(r.account_number),
    accountHolder: String(r.account_holder),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

/**
 * Menyimpan atau memperbarui rekening pencairan dana kreator.
 */
export async function upsertPayoutAccount(
  userId: string,
  data: { bankName: string; accountNumber: string; accountHolder: string }
): Promise<PayoutAccount> {
  await ensureDbInitialized();
  const now = new Date().toISOString();
  const existing = await getPayoutAccount(userId);

  const id = existing ? existing.id : uid("pacc");
  const bankName = data.bankName.trim();
  const accountNumber = data.accountNumber.trim();
  const accountHolder = data.accountHolder.trim();

  await client.execute({
    sql: `INSERT OR REPLACE INTO payout_accounts (id, user_id, bank_name, account_number, account_holder, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?);`,
    args: [id, userId, bankName, accountNumber, accountHolder, existing ? existing.createdAt : now, now],
  });

  return {
    id,
    userId,
    bankName,
    accountNumber,
    accountHolder,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };
}

/**
 * Mengambil riwayat permintaan penarikan dana seorang kreator.
 */
export async function getPayoutHistory(userId: string): Promise<PayoutRequest[]> {
  await ensureDbInitialized();
  const res = await client.execute({
    sql: "SELECT * FROM payout_requests WHERE user_id = ? ORDER BY created_at DESC;",
    args: [userId],
  });

  return res.rows.map((r: Record<string, unknown>) => ({
    id: String(r.id),
    userId: String(r.user_id),
    amountIdr: Number(r.amount_idr),
    bankName: String(r.bank_name),
    accountNumber: String(r.account_number),
    accountHolder: String(r.account_holder),
    status: r.status as PayoutStatus,
    adminNotes: r.admin_notes ? String(r.admin_notes) : undefined,
    proofUrl: r.proof_url ? String(r.proof_url) : undefined,
    createdAt: String(r.created_at),
    processedAt: r.processed_at ? String(r.processed_at) : undefined,
  }));
}

/**
 * Mengajukan permohonan penarikan saldo (Withdrawal Request).
 */
export async function requestPayout(
  userId: string,
  amountIdr: number
): Promise<PayoutRequest> {
  await ensureDbInitialized();

  // 1. Verifikasi rekening penerima sudah diatur
  const account = await getPayoutAccount(userId);
  if (!account) {
    throw new Error("Silakan simpan rekening bank / e-wallet pencairan dana terlebih dahulu.");
  }

  // 2. Verifikasi batas nominal
  if (amountIdr < MIN_PAYOUT_AMOUNT) {
    throw new Error(`Nominal penarikan minimal Rp ${MIN_PAYOUT_AMOUNT.toLocaleString("id-ID")}.`);
  }

  // 3. Verifikasi saldo mencukupi
  const balance = await getCreatorBalance(userId);
  if (amountIdr > balance.availableBalance) {
    throw new Error(
      `Saldo tersedia Anda (${balance.availableBalance.toLocaleString("id-ID")}) tidak mencukupi untuk penarikan ini.`
    );
  }

  const id = uid("pay");
  const now = new Date().toISOString();

  await client.execute({
    sql: `INSERT INTO payout_requests (id, user_id, amount_idr, bank_name, account_number, account_holder, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'pending', ?);`,
    args: [id, userId, amountIdr, account.bankName, account.accountNumber, account.accountHolder, now],
  });

  return {
    id,
    userId,
    amountIdr,
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountHolder: account.accountHolder,
    status: "pending",
    createdAt: now,
  };
}

/**
 * Memperbarui status penarikan dana oleh platform admin (approval / rejection).
 */
export async function updatePayoutStatus(
  requestId: string,
  status: PayoutStatus,
  adminNotes?: string,
  proofUrl?: string
): Promise<PayoutRequest> {
  await ensureDbInitialized();
  const now = new Date().toISOString();

  await client.execute({
    sql: `UPDATE payout_requests 
          SET status = ?, admin_notes = ?, proof_url = ?, processed_at = ?
          WHERE id = ?;`,
    args: [status, adminNotes || null, proofUrl || null, now, requestId],
  });

  const res = await client.execute({
    sql: "SELECT * FROM payout_requests WHERE id = ? LIMIT 1;",
    args: [requestId],
  });

  if (res.rows.length === 0) throw new Error("Permintaan penarikan tidak ditemukan");
  const r = res.rows[0] as Record<string, unknown>;

  return {
    id: String(r.id),
    userId: String(r.user_id),
    amountIdr: Number(r.amount_idr),
    bankName: String(r.bank_name),
    accountNumber: String(r.account_number),
    accountHolder: String(r.account_holder),
    status: r.status as PayoutStatus,
    adminNotes: r.admin_notes ? String(r.admin_notes) : undefined,
    proofUrl: r.proof_url ? String(r.proof_url) : undefined,
    createdAt: String(r.created_at),
    processedAt: r.processed_at ? String(r.processed_at) : undefined,
  };
}
