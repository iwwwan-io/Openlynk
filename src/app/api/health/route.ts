import { NextResponse } from "next/server";
import { client } from "@/lib/db";
import { isImageKitConfigured } from "@/lib/storage";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unknown";

  try {
    await client.execute("SELECT 1;");
    dbStatus = "healthy";
  } catch (err) {
    dbStatus = "unhealthy";
    return NextResponse.json(
      {
        status: "error",
        database: dbStatus,
        error: String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  const isProd = process.env.NODE_ENV === "production";
  return NextResponse.json(
    {
      status: "ok",
      version: "2.0.0",
      database: dbStatus,
      // Tanpa membocorkan secrets: hanya status konfigurasi
      config: {
        dbPersistent: dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://"),
        dbLocalFallback: !dbUrl || dbUrl.startsWith("file:"),
        storage: isImageKitConfigured() ? "imagekit" : "local-fallback",
        midtrans: process.env.MIDTRANS_SERVER_KEY ? "configured" : "sandbox",
        email: process.env.RESEND_API_KEY ? "resend" : "log",
        whatsapp: process.env.FONNTE_TOKEN || process.env.WABLAS_TOKEN
          ? "configured"
          : "log",
        adminToken: process.env.ADMIN_TOKEN ? "set" : "missing",
        prodRisk:
          isProd &&
          (!dbUrl || dbUrl.startsWith("file:") || !isImageKitConfigured()),
      },
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
