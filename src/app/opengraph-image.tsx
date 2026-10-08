import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "OpenLynk — Platform Link-in-Bio & Toko Produk Digital Indonesia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          padding: "70px 80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(9,9,11,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(9,9,11,0) 70%)",
          }}
        />

        {/* Top Navbar Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "900",
                fontSize: "26px",
                boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
              }}
            >
              OL
            </div>
            <span style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-1px" }}>
              OpenLynk
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(16,185,129,0.12)",
              padding: "10px 22px",
              borderRadius: "9999px",
              border: "1px solid rgba(16,185,129,0.3)",
              fontSize: "16px",
              fontWeight: "600",
              color: "#34d399",
            }}
          >
            <span>🇮🇩 Dibuat Khusus Kreator Indonesia</span>
          </div>
        </div>

        {/* Main Content Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: "900",
              letterSpacing: "-1.5px",
              lineHeight: "1.15",
              color: "#ffffff",
            }}
          >
            Platform Link-in-Bio &amp; Toko Produk Digital All-in-One
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              lineHeight: "1.4",
              maxWidth: "880px",
            }}
          >
            Jual e-book, template, course, lisensi software, terima donasi sawer QRIS instan, dan buat halaman profil bento interaktif.
          </div>
        </div>

        {/* Bottom Feature Badges & Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "16px",
                color: "#e4e4e7",
                fontWeight: "500",
              }}
            >
              <span>🍱 Bento Grid 2D</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "16px",
                color: "#e4e4e7",
                fontWeight: "500",
              }}
            >
              <span>⚡ Sawer QRIS &amp; VA Otomatis</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "16px",
                color: "#e4e4e7",
                fontWeight: "500",
              }}
            >
              <span>📦 100% Produk Digital</span>
            </div>
          </div>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#34d399",
              fontFamily: "monospace",
            }}
          >
            {displayHost}
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
