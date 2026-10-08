import { getDb } from "@/lib/store";
import Link from "next/link";
import SlugPage, { generateMetadata as generateSlugMetadata } from "../../[slug]/page";
import type { Metadata, ResolvingMetadata } from "next";

// Incremental Static Regeneration (ISR): revalidate at most once every 60 seconds
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const db = await getDb();
    return db.pages
      .filter((p) => p.isPublic && p.customDomain)
      .map((p) => ({
        domain: p.customDomain!,
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ domain: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { domain } = await params;
  const db = await getDb();
  const page = db.pages.find(
    (p) => p.customDomain?.toLowerCase() === domain.toLowerCase() && p.isPublic
  );
  if (!page) {
    return {
      title: "Domain Belum Terhubung | OpenLynk",
      description: "Domain kustom ini belum terhubung ke halaman OpenLynk.",
    };
  }
  return generateSlugMetadata({ params: Promise.resolve({ slug: page.slug }) }, parent);
}

export default async function CustomDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const db = await getDb();
  const page = db.pages.find(
    (p) => p.customDomain?.toLowerCase() === domain.toLowerCase() && p.isPublic
  );

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white font-sans">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
          <span className="font-display font-black text-2xl text-emerald-400">OL</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl text-zinc-100">
          Domain Terhubung ke OpenLynk
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-md leading-relaxed">
          Domain <code className="font-mono text-emerald-400 font-semibold">{domain}</code> sudah mengarah ke server OpenLynk, namun belum dikonfigurasi pada profil kreator aktif.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/settings"
            className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-zinc-900 shadow hover:bg-zinc-200 transition"
          >
            Buka Pengaturan Domain
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
          >
            Beranda OpenLynk
          </Link>
        </div>
      </div>
    );
  }

  return <SlugPage params={Promise.resolve({ slug: page.slug })} />;
}
