import { ImageResponse } from "next/og";
import { getDb } from "@/lib/store";

export const runtime = "nodejs";
export const alt = "Preview Profil OpenLynk";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = await getDb();
  const page = db.pages.find((p) => p.slug === slug);

  if (!page) {
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
          <div style={{ fontSize: 48, fontWeight: "bold" }}>OpenLynk</div>
          <div style={{ fontSize: 24, color: "#a1a1aa", marginTop: 12 }}>
            Halaman Tidak Ditemukan
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const accentColor = page.accentColor || "#10b981";
  const productsCount = db.products.filter((p) => p.pageId === page.id && p.isActive).length;
  const bentoCount = page.bento ? page.bento.length : 0;
  const initial = (page.name || slug).charAt(0).toUpperCase();

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
        {/* Glow Background Accent */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}33 0%, rgba(9,9,11,0) 70%)`,
          }}
        />

        {/* Top Bar: Brand & Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#09090b",
                fontWeight: "900",
                fontSize: "20px",
              }}
            >
              O
            </div>
            <span style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
              OpenLynk
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "8px 18px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: "15px",
              color: "#d4d4d8",
            }}
          >
            <span>✨ Toko Digital & Link-in-Bio</span>
          </div>
        </div>

        {/* Center: Creator Info Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            zIndex: 10,
          }}
        >
          {page.image ? (
            <img
              src={page.image}
              alt={page.name}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "9999px",
                objectFit: "cover",
                border: `4px solid ${accentColor}`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "9999px",
                backgroundColor: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                fontWeight: "bold",
                color: "#ffffff",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {initial}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "800px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "44px", fontWeight: "800", letterSpacing: "-1px" }}>
                {page.name}
              </span>
              <span
                style={{
                  fontSize: "18px",
                  color: accentColor,
                  fontWeight: "700",
                  backgroundColor: `${accentColor}1a`,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  border: `1px solid ${accentColor}40`,
                }}
              >
                @{page.slug}
              </span>
            </div>

            {page.bio ? (
              <p
                style={{
                  fontSize: "20px",
                  color: "#a1a1aa",
                  lineHeight: "1.4",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {page.bio}
              </p>
            ) : (
              <p style={{ fontSize: "20px", color: "#71717a", margin: 0 }}>
                Kunjungi profil dan koleksi produk digital {page.name} di OpenLynk.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar: Stats Badges & URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "24px",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {productsCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  color: "#e4e4e7",
                }}
              >
                <span style={{ color: accentColor, fontWeight: "bold" }}>📦</span>
                <span>{productsCount} Produk Digital</span>
              </div>
            )}
            {bentoCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  color: "#e4e4e7",
                }}
              >
                <span style={{ color: accentColor, fontWeight: "bold" }}>⚡</span>
                <span>{bentoCount} Kartu Bento Interaktif</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                color: "#e4e4e7",
              }}
            >
              <span style={{ color: accentColor, fontWeight: "bold" }}>💳</span>
              <span>Bayar Instan QRIS</span>
            </div>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#d4d4d8",
              fontFamily: "monospace",
            }}
          >
            openlynk.id/{page.slug}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
