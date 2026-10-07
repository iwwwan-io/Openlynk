import { client, ensureDbInitialized } from "./db";
import { getSessionUser, isAdmin } from "./auth";
import { uid, type User } from "./types";

export type AdminActor = { adminId: string; user: User | null };

/**
 * Verifikasi hak admin platform: user login role=admin ATAU header ADMIN_TOKEN.
 * Mengembalikan null bila tidak berhak (caller wajib balas 401 generik).
 */
export async function requireAdmin(req: Request): Promise<AdminActor | null> {
  const user = await getSessionUser(req);
  if (user && user.role === "admin") {
    return { adminId: user.id, user };
  }
  if (isAdmin(req)) {
    return { adminId: "token:ADMIN_TOKEN", user: null };
  }
  return null;
}

/**
 * Catat aksi admin ke audit log. Tidak pernah menggagalkan aksi utama.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  notes?: string
): Promise<void> {
  try {
    await ensureDbInitialized();
    await client.execute({
      sql: "INSERT INTO admin_audit_log (id, admin_id, action, target_type, target_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);",
      args: [
        uid("aal"),
        adminId,
        action.slice(0, 80),
        targetType?.slice(0, 40) ?? null,
        targetId?.slice(0, 120) ?? null,
        notes?.slice(0, 500) ?? null,
        new Date().toISOString(),
      ],
    });
  } catch {
    // Audit bersifat best-effort
  }
}

export type AdminAuditItem = {
  id: string;
  adminId: string;
  adminName?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  notes?: string;
  createdAt: string;
};

export async function getAuditLog(limit = 100): Promise<AdminAuditItem[]> {
  await ensureDbInitialized();
  const res = await client.execute({
    sql: `SELECT a.*, u.name as admin_name FROM admin_audit_log a
          LEFT JOIN users u ON a.admin_id = u.id
          ORDER BY a.created_at DESC LIMIT ?;`,
    args: [Math.min(Math.max(limit, 1), 200)],
  });
  return res.rows.map((r: Record<string, unknown>) => ({
    id: String(r.id),
    adminId: String(r.admin_id),
    adminName: r.admin_name ? String(r.admin_name) : undefined,
    action: String(r.action),
    targetType: r.target_type ? String(r.target_type) : undefined,
    targetId: r.target_id ? String(r.target_id) : undefined,
    notes: r.notes ? String(r.notes) : undefined,
    createdAt: String(r.created_at),
  }));
}

export async function countAdmins(exceptUserId?: string): Promise<number> {
  await ensureDbInitialized();
  const res = await client.execute(
    exceptUserId
      ? { sql: "SELECT COUNT(*) as c FROM users WHERE role = 'admin' AND id != ?;", args: [exceptUserId] }
      : "SELECT COUNT(*) as c FROM users WHERE role = 'admin';"
  );
  return Number(res.rows[0]?.c ?? 0);
}
