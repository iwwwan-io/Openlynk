import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : "https://openlynk.id");
  const baseUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jelajahi", "/akses", "/klaim", "/demo", "/api/og*"],
        disallow: ["/dashboard/", "/checkout/", "/api/admin/", "/api/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
