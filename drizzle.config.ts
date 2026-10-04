import { defineConfig } from "drizzle-kit";

const isTurso =
  process.env.DATABASE_URL?.startsWith("libsql:") ||
  process.env.DATABASE_URL?.startsWith("https:");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: isTurso ? "turso" : "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./data/openlynk.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  strict: false,
});
