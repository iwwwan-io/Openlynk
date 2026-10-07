import Link from "next/link";
import { getDb } from "@/lib/store";
import { HomeFooter, NavbarShell } from "@/components/site";
import { GradientButton } from "@/components/primitives";

export default async function Explore() {
  const db = await getDb();
  const pages = db.pages.filter((p) => p.isPublic);
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center px-4 py-4 md:py-8">
      <NavbarShell>
        <Link href="/klaim">
          <GradientButton className="!px-5 !py-2 !text-sm">Mulai</GradientButton>
        </Link>
      </NavbarShell>

      <div className="flex w-full max-w-3xl flex-1 flex-col py-20">
        <h1 className="font-display text-3xl font-bold">Jelajahi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Halaman kreator di OpenLynk</p>

        {pages.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <h3 className="font-display text-xl font-bold">Belum ada page</h3>
            <p className="mt-1 text-sm text-muted-foreground">Jadilah yang pertama</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                className="group rounded-2xl border border-border/50 bg-card shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="flex h-24 items-center justify-center rounded-t-2xl bg-muted">
                  <div
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white ring-4 ring-card"
                    style={{ backgroundColor: p.accentColor ?? "#18181b" }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">/{p.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  );
}
