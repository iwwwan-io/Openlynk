/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { getDb } from "@/lib/store";
import { formatIDR } from "@/lib/types";

export const runtime = "nodejs";
export const alt = "Pratinjau Produk Digital OpenLynk";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const db = await getDb();
  const page = db.pages.find((p) => p.slug === slug);
  const product = db.products.find(
    (p) => p.id === productId && (!page || p.pageId === page.id)
  );

  if (!page || !product) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 44, fontWeight: "bold" }}>OpenLynk</div>
          <div style={{ fontSize: 22, color: "#a1a1aa", marginTop: 12 }}>
            Produk Digital Tidak Ditemukan
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const accentColor = page.accentColor || "#10b981";
  const hasProductImage = Boolean(
    product.imageUrl &&
      (product.imageUrl.startsWith("http://") || product.imageUrl.startsWith("https://"))
  );
  const hasCreatorImage = Boolean(
    page.image &&
      (page.image.startsWith("http://") || page.image.startsWith("https://"))
  );
  const initial = (page.name || slug).charAt(0).toUpperCase();

  const displayHost =
    page.customDomain ||
    process.env.NEXT_PUBLIC_APP_DOMAIN ||
    (process.env.NEXT_PUBLIC_URL
      ? new URL(
          process.env.NEXT_PUBLIC_URL.startsWith("http")
            ? process.env.NEXT_PUBLIC_URL
            : `https://${process.env.NEXT_PUBLIC_URL}`
        ).host
      : "openlynk.id");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "60px 80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Background */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}33 0%, rgba(9,9,11,0) 70%)`,
          }}
        />

        {/* Top Bar: Creator Info & Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {hasCreatorImage ? (
              <img
                src={page.image!}
                alt={page.name}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "9999px",
                  objectFit: "cover",
                  border: `2px solid ${accentColor}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "9999px",
                  backgroundColor: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {initial}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#ffffff" }}>
                {page.name}
              </span>
              <span style={{ fontSize: "14px", color: "#a1a1aa" }}>
                @{page.slug}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(16,185,129,0.15)",
              padding: "8px 18px",
              borderRadius: "9999px",
              border: "1px solid rgba(16,185,129,0.3)",
              fontSize: "15px",
              fontWeight: "600",
              color: "#34d399",
            }}
          >
            <span>📦 Produk Digital</span>
          </div>
        </div>

        {/* Center: Product Detail & Optional Image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "40px",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: hasProductImage ? "680px" : "1000px" }}>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "900",
                letterSpacing: "-1px",
                lineHeight: "1.2",
                color: "#ffffff",
              }}
            >
              {product.name}
            </div>

            {product.description ? (
              <div
                style={{
                  fontSize: "20px",
                  color: "#a1a1aa",
                  lineHeight: "1.4",
                  maxHeight: "60px",
                  overflow: "hidden",
                }}
              >
                {product.description.slice(0, 140)}...
              </div>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "900",
                  color: "#34d399",
                  backgroundColor: "rgba(16,185,129,0.1)",
                  padding: "8px 20px",
                  borderRadius: "14px",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                {formatIDR(product.priceIdr)}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  color: "#d4d4d8",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                ⚡ Unduh Instan Setelah Bayar
              </div>
            </div>
          </div>

          {hasProductImage && (
            <img
              src={product.imageUrl!}
              alt={product.name}
              style={{
                width: "280px",
                height: "280px",
                borderRadius: "20px",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.15)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              }}
            />
          )}
        </div>

        {/* Bottom Bar: Platform Watermark & Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#09090b",
                fontWeight: "900",
                fontSize: "14px",
              }}
            >
              O
            </div>
            <span style={{ fontSize: "18px", fontWeight: "700", color: "#e4e4e7" }}>
              Beli di OpenLynk
            </span>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#34d399",
              fontFamily: "monospace",
            }}
          >
            {displayHost}/{page.slug}/products/{product.id}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, immutable, no-transform, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    }
  );
}
