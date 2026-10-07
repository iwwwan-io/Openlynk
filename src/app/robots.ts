import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : "https://openlynk.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jelajahi", "/akses", "/klaim", "/demo"],
        disallow: ["/api/", "/dashboard/", "/checkout/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
