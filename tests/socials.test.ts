import { describe, expect, it } from "bun:test";
import { normalizeSocialUrl, type SocialPlatform, type SocialLinks } from "@/lib/types";
import { getSocialColor, getSocialName } from "@/components/social-icons";
import { getDb, saveDb } from "@/lib/store";

describe("Social Links Normalization & Icons", () => {
  it("normalizes Instagram handles and URLs", () => {
    expect(normalizeSocialUrl("instagram", "@rian.dev")).toBe("https://instagram.com/rian.dev");
    expect(normalizeSocialUrl("instagram", "rian.dev")).toBe("https://instagram.com/rian.dev");
    expect(normalizeSocialUrl("instagram", "https://instagram.com/rian.dev")).toBe(
      "https://instagram.com/rian.dev"
    );
  });

  it("normalizes TikTok handles", () => {
    expect(normalizeSocialUrl("tiktok", "@kreator")).toBe("https://tiktok.com/@kreator");
    expect(normalizeSocialUrl("tiktok", "kreator")).toBe("https://tiktok.com/@kreator");
  });

  it("normalizes YouTube handles and custom channels", () => {
    expect(normalizeSocialUrl("youtube", "@rianpratama")).toBe("https://youtube.com/@rianpratama");
    expect(normalizeSocialUrl("youtube", "rianpratama")).toBe("https://youtube.com/@rianpratama");
    expect(normalizeSocialUrl("youtube", "https://youtube.com/c/rianpratama")).toBe(
      "https://youtube.com/c/rianpratama"
    );
  });

  it("normalizes X / Twitter handles", () => {
    expect(normalizeSocialUrl("twitter", "@rianpratama")).toBe("https://x.com/rianpratama");
    expect(normalizeSocialUrl("twitter", "rianpratama")).toBe("https://x.com/rianpratama");
  });

  it("normalizes WhatsApp phone numbers to wa.me with Indonesian country code", () => {
    expect(normalizeSocialUrl("whatsapp", "081234567890")).toBe("https://wa.me/6281234567890");
    expect(normalizeSocialUrl("whatsapp", "0812-3456-7890")).toBe("https://wa.me/6281234567890");
    expect(normalizeSocialUrl("whatsapp", "81234567890")).toBe("https://wa.me/6281234567890");
    expect(normalizeSocialUrl("whatsapp", "6281234567890")).toBe("https://wa.me/6281234567890");
    expect(normalizeSocialUrl("whatsapp", "https://wa.me/6281234567890")).toBe(
      "https://wa.me/6281234567890"
    );
  });

  it("normalizes Telegram, GitHub, Discord, LinkedIn, Spotify, Website", () => {
    expect(normalizeSocialUrl("telegram", "@rian_dev")).toBe("https://t.me/rian_dev");
    expect(normalizeSocialUrl("github", "rianpratama")).toBe("https://github.com/rianpratama");
    expect(normalizeSocialUrl("discord", "mycommunity")).toBe("https://discord.gg/mycommunity");
    expect(normalizeSocialUrl("linkedin", "rianpratama")).toBe("https://linkedin.com/in/rianpratama");
    expect(normalizeSocialUrl("spotify", "rianpratama")).toBe(
      "https://open.spotify.com/user/rianpratama"
    );
    expect(normalizeSocialUrl("website", "rianpratama.id")).toBe("https://rianpratama.id");
  });

  it("returns correct brand colors and platform names", () => {
    expect(getSocialColor("https://instagram.com/rian")).toBe("#E1306C");
    expect(getSocialColor("https://youtube.com/@rian")).toBe("#FF0000");
    expect(getSocialColor("https://wa.me/6281234567890")).toBe("#25D366");
    expect(getSocialColor("https://spotify.com/user/123")).toBe("#1ED760");

    expect(getSocialName("https://instagram.com/rian")).toBe("Instagram");
    expect(getSocialName("https://youtube.com/@rian")).toBe("YouTube");
    expect(getSocialName("https://wa.me/6281234567890")).toBe("WhatsApp");
  });
});

describe("Page Banner & Social Links Database Persistence", () => {
  it("persists and retrieves bannerImage and socials in SQLite", async () => {
    const db = await getDb();
    expect(db.pages.length).toBeGreaterThan(0);

    const testPage = db.pages[0];
    const originalBanner = testPage.bannerImage;
    const originalSocials = testPage.socials;

    const newBanner = "https://images.unsplash.com/photo-test-banner";
    const newSocials: SocialLinks = {
      instagram: "tester.id",
      twitter: "tester_tw",
      whatsapp: "081299988877",
      github: "testergh",
    };

    testPage.bannerImage = newBanner;
    testPage.socials = newSocials;

    await saveDb(db);

    // Re-query database to ensure persistence
    const reloaded = await getDb();
    const updatedPage = reloaded.pages.find((p) => p.id === testPage.id);

    expect(updatedPage).toBeDefined();
    expect(updatedPage?.bannerImage).toBe(newBanner);
    expect(updatedPage?.socials?.instagram).toBe("tester.id");
    expect(updatedPage?.socials?.twitter).toBe("tester_tw");
    expect(updatedPage?.socials?.whatsapp).toBe("081299988877");
    expect(updatedPage?.socials?.github).toBe("testergh");

    // Clean up / restore
    testPage.bannerImage = originalBanner;
    testPage.socials = originalSocials;
    await saveDb(db);
  });
});
