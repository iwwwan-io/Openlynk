import { describe, expect, it } from "bun:test";
import { getDb, saveDb } from "@/lib/store";
import { uid, type Page } from "@/lib/types";

describe("Fase 6: Custom Domain & Growth Integrations", () => {
  it("Page type and SQLite store supports customDomain persistence", async () => {
    const db = await getDb();
    const testPageId = uid("page");
    const testSlug = `custom-${Date.now()}`;
    const now = new Date().toISOString();

    const newPage: Page = {
      id: testPageId,
      userId: "usr_demo",
      slug: testSlug,
      customDomain: "links.kreatortest.com",
      name: "Kreator Custom Domain",
      bio: "Halaman uji coba custom domain",
      bento: [],
      theme: "default",
      accentColor: "#10b981",
      darkMode: false,
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    };

    db.pages.push(newPage);
    await saveDb(db);

    // Refresh db and verify
    const reloaded = await getDb();
    const found = reloaded.pages.find((p) => p.id === testPageId);
    expect(found).toBeDefined();
    expect(found?.customDomain).toBe("links.kreatortest.com");

    // Clean up
    const idx = db.pages.findIndex((p) => p.id === testPageId);
    if (idx !== -1) {
      db.pages.splice(idx, 1);
      await saveDb(db);
    }
  });

  it("Validates domain strings properly", () => {
    const domainRegex =
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

    // Valid domains
    expect(domainRegex.test("creator.me")).toBe(true);
    expect(domainRegex.test("links.brand.co.id")).toBe(true);
    expect(domainRegex.test("bio.john-doe.id")).toBe(true);

    // Invalid domains
    expect(domainRegex.test("invalid domain with spaces.com")).toBe(false);
    expect(domainRegex.test("http://with-protocol.com")).toBe(false);
    expect(domainRegex.test("nodot")).toBe(false);
    expect(domainRegex.test("-leadingslash.com")).toBe(false);
  });

  it("Normalizes custom domains by stripping protocols and paths", () => {
    function normalizeDomain(input: string): string {
      return input
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
    }

    expect(normalizeDomain("https://bio.kreator.com/")).toBe("bio.kreator.com");
    expect(normalizeDomain("http://MYBRAND.ID/page")).toBe("mybrand.id");
    expect(normalizeDomain("  links.sarah.me  ")).toBe("links.sarah.me");
  });
});
