import { describe, expect, test } from "bun:test";
import { getDb, saveDb, validateAndApplyCoupon, incrementCouponUses } from "@/lib/store";
import { uid, type Coupon } from "@/lib/types";

describe("Coupon System & Discount Validation", () => {
  test("Kupon persentase HEMAT20 memotong 20% dari subtotal", async () => {
    const res = await validateAndApplyCoupon("page_demo", "HEMAT20", 100000);
    expect(res.valid).toBe(true);
    expect(res.discountIdr).toBe(20000);
    expect(res.finalSubtotal).toBe(80000);
  });

  test("Kupon nominal tetap BERKAH30K memotong Rp 30.000", async () => {
    const res = await validateAndApplyCoupon("page_demo", "BERKAH30K", 99000);
    expect(res.valid).toBe(true);
    expect(res.discountIdr).toBe(30000);
    expect(res.finalSubtotal).toBe(69000);
  });

  test("Kupon gagal jika subtotal di bawah minimum belanja", async () => {
    // BERKAH30K memiliki minOrderIdr 50.000
    const res = await validateAndApplyCoupon("page_demo", "BERKAH30K", 35000);
    expect(res.valid).toBe(false);
    expect(res.message).toContain("Minimal belanja");
  });

  test("Kupon gagal jika kode tidak ditemukan", async () => {
    const res = await validateAndApplyCoupon("page_demo", "TIDAKADA", 100000);
    expect(res.valid).toBe(false);
    expect(res.message).toContain("tidak ditemukan");
  });

  test("Kupon non-aktif ditolak", async () => {
    const db = await getDb();
    const testCoupon: Coupon = {
      id: uid("coupon"),
      pageId: "page_demo",
      code: "NONAKTIF",
      discountType: "percent",
      discountValue: 50,
      usedCount: 0,
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    db.coupons.push(testCoupon);
    await saveDb(db);

    const res = await validateAndApplyCoupon("page_demo", "NONAKTIF", 100000);
    expect(res.valid).toBe(false);
    expect(res.message).toContain("tidak aktif");

    // Bersihkan
    db.coupons = db.coupons.filter((c) => c.id !== testCoupon.id);
    await saveDb(db);
  });

  test("Kupon kadaluarsa ditolak", async () => {
    const db = await getDb();
    const expiredCoupon: Coupon = {
      id: uid("coupon"),
      pageId: "page_demo",
      code: "EXPIRED",
      discountType: "percent",
      discountValue: 10,
      usedCount: 0,
      isActive: true,
      expiresAt: "2020-01-01T00:00:00.000Z",
      createdAt: new Date().toISOString(),
    };
    db.coupons.push(expiredCoupon);
    await saveDb(db);

    const res = await validateAndApplyCoupon("page_demo", "EXPIRED", 100000);
    expect(res.valid).toBe(false);
    expect(res.message).toContain("berakhir");

    // Bersihkan
    db.coupons = db.coupons.filter((c) => c.id !== expiredCoupon.id);
    await saveDb(db);
  });

  test("incrementCouponUses menambah jumlah pemakaian", async () => {
    const db = await getDb();
    const coupon = db.coupons.find((c) => c.code === "HEMAT20");
    expect(coupon).toBeDefined();
    if (!coupon) return;

    const initialUsed = coupon.usedCount;
    await incrementCouponUses(coupon.id);

    const updatedDb = await getDb();
    const updatedCoupon = updatedDb.coupons.find((c) => c.id === coupon.id);
    expect(updatedCoupon?.usedCount).toBe(initialUsed + 1);
  });
});
