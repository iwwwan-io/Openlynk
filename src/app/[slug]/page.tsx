import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getDb } from "@/lib/store";
import { themeVars } from "@/lib/themes";
import { layoutOf } from "@/lib/grid";
import { LinkCard } from "./link-card";
import { ProductCard } from "./product-card";
import { ShareButton } from "./share-button";
import { QrModal } from "@/components/qr-modal";
import { Subscribe } from "./subscribe";
import { Tracker } from "./tracker";
import { NoteCard } from "./cards/note-card";
import { VideoCard } from "./cards/video-card";
import { MusicCard } from "./cards/music-card";
import { MapCard } from "./cards/map-card";
import { CountdownCard } from "./cards/countdown-card";
import { ImageCard } from "./cards/image-card";
import { GithubCard } from "./cards/github-card";
import { CalendarCard } from "./cards/calendar-card";
import { SawerCard } from "./cards/sawer-card";
import { SectionHeader } from "./cards/section-header";
import { SocialBar } from "./social-bar";

import type { Metadata, ResolvingMetadata } from "next";

// Incremental Static Regeneration (ISR): revalidate at most once every 60 seconds
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const db = await getDb();
    return db.pages
      .filter((p) => p.isPublic)
      .map((p) => ({
        slug: p.slug,
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const page = db.pages.find((p) => p.slug === slug && p.isPublic);

  if (!page) {
    return {
      title: "Halaman Tidak Ditemukan | OpenLynk",
      description: "Halaman kreator tidak ditemukan di OpenLynk.",
    };
  }

  const title = `${page.name} (@${page.slug}) | OpenLynk`;
  const description =
    page.bio ||
    `Kunjungi profil resmi ${page.name} di OpenLynk. Temukan tautan eksklusif, karya, dan produk digital premium.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/${page.slug}`,
      siteName: "OpenLynk",
      images: [
        {
          url: `/${page.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${page.name} on OpenLynk`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/${page.slug}/opengraph-image`],
    },
    alternates: {
      canonical: `/${page.slug}`,
    },
  };
}

async function ResponsiveBentoGrid({
  slug,
  pageId,
  className,
}: {
  slug: string;
  pageId: string;
  className?: string;
}) {
  const db = await getDb();
  const page = db.pages.find((p) => p.id === pageId);
  if (!page || page.bento.length === 0) return null;
  const products = db.products.filter((p) => p.pageId === page.id && p.isActive);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const layoutSm = layoutOf(page.bento, 2);
  const layoutLg = layoutOf(page.bento, 4);
  const smMap = new Map(layoutSm.map((l) => [l.i, l]));
  const lgMap = new Map(layoutLg.map((l) => [l.i, l]));

  return (
    <div className={`bento-unified-grid ${className ?? ""}`}>
      {page.bento.map((b) => {
        const lSm = smMap.get(b.id);
        const lLg = lgMap.get(b.id);
        if (!lSm || !lLg) return null;

        const cellStyle: CSSProperties = {
          ["--col-sm" as string]: `${lSm.x + 1} / span ${lSm.w}`,
          ["--row-sm" as string]: `${lSm.y + 1} / span ${lSm.h}`,
          ["--col-lg" as string]: `${lLg.x + 1} / span ${lLg.w}`,
          ["--row-lg" as string]: `${lLg.y + 1} / span ${lLg.h}`,
          minHeight: 0,
        };
        if (b.type === "header") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell flex items-center min-h-0">
              <SectionHeader title={b.title} subtitle={b.subtitle} />
            </div>
          );
        }
        if (b.type === "link") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <LinkCard title={b.title} href={b.href} pageId={page.id} size={b.size} />
            </div>
          );
        }
        if (b.type === "note") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <NoteCard title={b.title} text={b.text} size={b.size} />
            </div>
          );
        }
        if (b.type === "video") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <VideoCard title={b.title} url={b.url} size={b.size} />
            </div>
          );
        }
        if (b.type === "music") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <MusicCard title={b.title} url={b.url} size={b.size} />
            </div>
          );
        }
        if (b.type === "map") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <MapCard label={b.label} address={b.address} size={b.size} />
            </div>
          );
        }
        if (b.type === "countdown") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <CountdownCard
                title={b.title}
                targetDate={b.targetDate}
                emoji={b.emoji}
                size={b.size}
              />
            </div>
          );
        }
        if (b.type === "image") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <ImageCard url={b.url} caption={b.caption} href={b.href} size={b.size} />
            </div>
          );
        }
        if (b.type === "github") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <GithubCard username={b.username} size={b.size} />
            </div>
          );
        }
        if (b.type === "calendar") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <CalendarCard
                title={b.title}
                url={b.url}
                description={b.description}
                size={b.size}
              />
            </div>
          );
        }
        if (b.type === "sawer") {
          return (
            <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
              <SawerCard
                bentoId={b.id}
                pageId={page.id}
                pageName={page.name}
                title={b.title}
                message={b.message}
                unitName={b.unitName}
                unitPrice={b.unitPrice}
                targetAmount={b.targetAmount}
                currentAmount={b.currentAmount}
                size={b.size}
              />
            </div>
          );
        }
        if (b.type !== "product") return null;
        const p = productMap.get(b.productId);
        if (!p) return null;
        return (
          <div key={b.id} style={cellStyle} className="bento-cell min-h-0">
            <ProductCard p={p} slug={slug} accent={page.accentColor} />
          </div>
        );
      })}
    </div>
  );
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const page = db.pages.find((p) => p.slug === slug && p.isPublic);
  if (!page) notFound();
  const dark = page.darkMode;
  const accent = page.accentColor;
  const vars = themeVars(page.theme, dark, accent) as CSSProperties;

  return (
    <div className={dark ? "dark" : ""} style={vars}>
      <main className="min-h-screen w-full bg-background text-foreground">
        <div className="mx-auto w-full max-w-md sm:max-w-2xl lg:max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <Tracker pageId={page.id} />
          <div className="animate-fade-in flex flex-col gap-y-3 sm:gap-y-4">
            {page.bannerImage && (
              <div className="relative -mb-10 sm:-mb-14 h-32 sm:h-44 md:h-52 w-full overflow-hidden rounded-3xl border border-border/80 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.bannerImage}
                  alt={`${page.name} banner`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
            )}
            <div className={`flex items-start justify-between ${page.bannerImage ? "relative z-10 px-1 sm:px-2" : ""}`}>
              {page.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.image}
                  alt={page.name}
                  className="h-20 w-20 rounded-full border border-border object-cover shadow-md ring-4 sm:h-28 sm:w-28"
                  style={{ ["--tw-ring-color" as string]: "var(--background)" }}
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-bold text-white shadow-md ring-4 sm:h-28 sm:w-28 sm:text-3xl"
                  style={{ backgroundColor: accent }}
                >
                  {page.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <QrModal slug={page.slug} pageName={page.name} variant="pill" />
                <ShareButton name={page.name} slug={page.slug} />
              </div>
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-foreground">
                {page.name}
              </h1>
              {page.bio && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">{page.bio}</p>}
            </div>
            {page.socials && Object.keys(page.socials).length > 0 && (
              <div className="pt-1 flex justify-start">
                <SocialBar socials={page.socials} accentColor={accent} pageId={page.id} />
              </div>
            )}
          </div>

          <div className="mt-5 sm:mt-7">
            <ResponsiveBentoGrid slug={slug} pageId={page.id} />
          </div>

          {db.products
            .filter(
              (p) =>
                p.pageId === page.id &&
                p.isActive &&
                !page.bento.some((b) => b.type === "product" && b.productId === p.id)
            )
            .map((p) => (
              <div key={p.id} className="mt-6">
                <ProductCard p={p} slug={slug} accent={accent} />
              </div>
            ))}

          <Subscribe pageId={page.id} dark={dark} />

          <footer className="animate-fade-in py-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-all hover:text-foreground"
            >
              Buat halaman gratis di <span className="font-semibold text-foreground">OpenLynk</span>
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
