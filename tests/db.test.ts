import { describe, expect, test } from "bun:test";
import { getDb, saveDb, recordView, recordClick, addSubscriber } from "@/lib/store";
import { client } from "@/lib/db";

describe("SQLite database store with Drizzle", () => {
  test("getDb() menginisialisasi SQLite dan mengembalikan data demo", async () => {
    const db = await getDb();
    expect(db.pages.length).toBeGreaterThan(0);
    const demo = db.pages.find((p) => p.slug === "demo");
    expect(demo?.name).toBeDefined();
    expect(demo?.name?.length).toBeGreaterThan(0);
    expect(Array.isArray(demo?.bento)).toBe(true);
    expect(db.products.length).toBeGreaterThan(0);
  });

  test("recordView & recordClick bekerja secara atomic di SQLite", async () => {
    const initialDb = await getDb();
    const initialViews = initialDb.views.length;
    const initialClicks = initialDb.clicks.length;

    await recordView("page_demo");
    await recordClick("page_demo", "https://example.com");

    const updatedDb = await getDb();
    expect(updatedDb.views.length).toBe(initialViews + 1);
    expect(updatedDb.clicks.length).toBe(initialClicks + 1);
  });

  test("saveDb() dapat memperbarui bio halaman dan persisten di SQLite", async () => {
    const db = await getDb();
    const demo = db.pages.find((p) => p.slug === "demo");
    expect(demo).toBeDefined();
    if (!demo) return;

    const originalBio = demo.bio;
    demo.bio = "Bio teruji SQLite Drizzle";
    await saveDb(db);

    const reloadedDb = await getDb();
    const reloadedDemo = reloadedDb.pages.find((p) => p.slug === "demo");
    expect(reloadedDemo?.bio).toBe("Bio teruji SQLite Drizzle");

    // Kembalikan ke original
    demo.bio = originalBio;
    await saveDb(db);
  });
});
