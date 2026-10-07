import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const THEME_COLORS: Record<string, string> = {
  emerald: "#10b981",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  zinc: "#71717a",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title")?.slice(0, 100) || "OpenLynk";
    const desc =
      searchParams.get("desc")?.slice(0, 180) ||
      "Platform Link-in-Bio & Toko Produk Digital All-in-One untuk Kreator Indonesia";
    const badge = searchParams.get("badge")?.slice(0, 40) || "OpenLynk Platform";
    const author = searchParams.get("author")?.slice(0, 40);
    const themeKey = searchParams.get("theme") || "emerald";
    const accentColor = THEME_COLORS[themeKey] || THEME_COLORS.emerald;

    const displayHost =
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
          {/* Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-100px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accentColor}2a 0%, rgba(9,9,11,0) 70%)`,
            }}
          />

          {/* Top Navbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  backgroundColor: accentColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontWeight: "900",
                  fontSize: "22px",
                }}
              >
                OL
              </div>
              <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                OpenLynk
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: `${accentColor}18`,
                padding: "8px 18px",
                borderRadius: "9999px",
                border: `1px solid ${accentColor}35`,
                fontSize: "15px",
                fontWeight: "600",
                color: accentColor,
              }}
            >
              <span>{badge}</span>
            </div>
          </div>

          {/* Center Card Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "1000px",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: "900",
                letterSpacing: "-1.5px",
                lineHeight: "1.2",
                color: "#ffffff",
              }}
            >
              {title}
            </div>

            {desc && (
              <div
                style={{
                  fontSize: "22px",
                  color: "#a1a1aa",
                  lineHeight: "1.4",
                  maxWidth: "900px",
                }}
              >
                {desc}
              </div>
            )}

            {author && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "8px",
                  fontSize: "18px",
                  color: "#e4e4e7",
                }}
              >
                <span style={{ color: accentColor, fontWeight: "bold" }}>Oleh:</span>
                <span>{author}</span>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
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
              <span style={{ fontSize: "16px", color: "#a1a1aa" }}>
                Toko Produk Digital &amp; Link-in-Bio
              </span>
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: accentColor,
                fontFamily: "monospace",
              }}
            >
              {displayHost}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, immutable, no-transform, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e: any) {
    return new Response(`Gagal menghasilkan OG image: ${e.message}`, { status: 500 });
  }
}
