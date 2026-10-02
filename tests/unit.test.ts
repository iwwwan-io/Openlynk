import { describe, expect, test } from "bun:test";
import { verifySignature } from "@/lib/midtrans";
import { fee, validSlug } from "@/lib/validate";
import { sizeWH } from "@/lib/grid";
import { getYouTubeEmbedUrl, getSpotifyEmbedUrl, getMapEmbedUrl } from "@/lib/embeds";
import { parseDashboardPath, buildDashboardPath } from "@/app/dashboard/dashboard-routing";

describe("fee 5%", () => {
  test("99000 -> 4950", () => expect(fee(99000)).toBe(4950));
  test("dibulatkan", () => expect(fee(1001)).toBe(50));
});

describe("slug", () => {
  test("valid", () => expect(validSlug("tokoku")).toBeNull());
  test("pendek ditolak", () => expect(validSlug("ab")).not.toBeNull());
  test("reserved ditolak", () => expect(validSlug("admin")).not.toBeNull());
  test("dashboard dicadangkan", () => expect(validSlug("dashboard")).not.toBeNull());
});

describe("midtrans", () => {
  test("tanpa key selalu true (sandbox)", () =>
    expect(
      verifySignature({ orderId: "x", statusCode: "200", grossAmount: "1", signatureKey: "y" })
    ).toBe(true));
});

describe("bento grid sizing", () => {
  test("product size in 4 and 2 cols", () => {
    expect(sizeWH("product", undefined, 4)).toEqual({ w: 4, h: 3 });
    expect(sizeWH("product", undefined, 2)).toEqual({ w: 2, h: 3 });
  });

  test("4x2 card size", () => {
    expect(sizeWH("video", "4x2", 4)).toEqual({ w: 4, h: 2 });
    expect(sizeWH("video", "4x2", 2)).toEqual({ w: 2, h: 2 });
  });

  test("2x2 card size", () => {
    expect(sizeWH("note", "2x2", 4)).toEqual({ w: 2, h: 2 });
    expect(sizeWH("map", "2x2", 2)).toEqual({ w: 2, h: 2 });
  });

  test("header card full width size in 4 and 2 cols", () => {
    expect(sizeWH("header", undefined, 4)).toEqual({ w: 4, h: 1 });
    expect(sizeWH("header", undefined, 2)).toEqual({ w: 2, h: 1 });
    expect(sizeWH("link", "4x1", 4)).toEqual({ w: 4, h: 1 });
  });

  test("default sizes", () => {
    expect(sizeWH("note", "2x1", 4)).toEqual({ w: 2, h: 1 });
    expect(sizeWH("music", undefined, 4)).toEqual({ w: 2, h: 1 });
    expect(sizeWH("video", undefined, 4)).toEqual({ w: 2, h: 2 });
  });

  test("image, github, and calendar card sizes", () => {
    expect(sizeWH("image", "2x2", 4)).toEqual({ w: 2, h: 2 });
    expect(sizeWH("image", "4x2", 4)).toEqual({ w: 4, h: 2 });
    expect(sizeWH("github", "1x1", 4)).toEqual({ w: 1, h: 1 });
    expect(sizeWH("github", "2x1", 4)).toEqual({ w: 2, h: 1 });
    expect(sizeWH("calendar", "2x1", 4)).toEqual({ w: 2, h: 1 });
    expect(sizeWH("calendar", "2x2", 2)).toEqual({ w: 2, h: 2 });
  });

  test("sawer card sizes", () => {
    expect(sizeWH("sawer", undefined, 4)).toEqual({ w: 2, h: 2 });
    expect(sizeWH("sawer", "1x1", 4)).toEqual({ w: 1, h: 1 });
    expect(sizeWH("sawer", "2x1", 4)).toEqual({ w: 2, h: 1 });
    expect(sizeWH("sawer", "2x2", 4)).toEqual({ w: 2, h: 2 });
    expect(sizeWH("sawer", "4x2", 4)).toEqual({ w: 4, h: 2 });
    expect(sizeWH("sawer", "4x2", 2)).toEqual({ w: 2, h: 2 });
  });
});

describe("embeds helper", () => {
  test("youtube url parsing", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(getYouTubeEmbedUrl("invalid-url")).toBeNull();
  });

  test("spotify url parsing", () => {
    expect(
      getSpotifyEmbedUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")
    ).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(getSpotifyEmbedUrl("invalid")).toBeNull();
  });

  test("map url generation", () => {
    expect(getMapEmbedUrl("Jakarta")).toContain("maps.google.com/maps?q=Jakarta");
    expect(getMapEmbedUrl("")).toBe("");
  });
});

describe("Dashboard URL & Tab Routing", () => {
  test("parses /dashboard default", () => {
    const res = parseDashboardPath("/dashboard");
    expect(res.tab).toBe("pages");
    expect(res.slug).toBeUndefined();
    expect(res.subtab).toBeUndefined();
  });

  test("parses /dashboard/overview", () => {
    const res = parseDashboardPath("/dashboard/overview");
    expect(res.tab).toBe("pages");
    expect(res.showOverview).toBe(true);
  });

  test("parses /dashboard/studio/demo and subtabs", () => {
    expect(parseDashboardPath("/dashboard/studio/demo")).toEqual({
      tab: "pages",
      slug: "demo",
      subtab: undefined,
    });
    expect(parseDashboardPath("/dashboard/studio/demo/theme")).toEqual({
      tab: "pages",
      slug: "demo",
      subtab: "theme",
    });
    expect(parseDashboardPath("/dashboard/studio/demo/content")).toEqual({
      tab: "pages",
      slug: "demo",
      subtab: "content",
    });
    expect(parseDashboardPath("/dashboard/studio/demo/products")).toEqual({
      tab: "pages",
      slug: "demo",
      subtab: "products",
    });
  });

  test("parses store, coupons, analytics, and settings tabs", () => {
    expect(parseDashboardPath("/dashboard/store")).toEqual({ tab: "store" });
    expect(parseDashboardPath("/dashboard/coupons")).toEqual({ tab: "coupons", slug: undefined });
    expect(parseDashboardPath("/dashboard/coupons/demo")).toEqual({ tab: "coupons", slug: "demo" });
    expect(parseDashboardPath("/dashboard/analytics")).toEqual({ tab: "analytics", slug: undefined });
    expect(parseDashboardPath("/dashboard/settings")).toEqual({ tab: "settings" });
  });

  test("builds correct dashboard URLs", () => {
    expect(buildDashboardPath("pages", "demo")).toBe("/dashboard/studio/demo");
    expect(buildDashboardPath("pages", "demo", "theme")).toBe("/dashboard/studio/demo/theme");
    expect(buildDashboardPath("pages", undefined, undefined, true)).toBe("/dashboard/overview");
    expect(buildDashboardPath("store")).toBe("/dashboard/store");
    expect(buildDashboardPath("coupons", "demo")).toBe("/dashboard/coupons/demo");
    expect(buildDashboardPath("analytics", "demo")).toBe("/dashboard/analytics/demo");
    expect(buildDashboardPath("settings")).toBe("/dashboard/settings");
  });
});

