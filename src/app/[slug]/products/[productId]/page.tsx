import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getDb } from "@/lib/store";
import { themeVars } from "@/lib/themes";
import { ProductDetailView } from "./product-detail-view";

// Incremental Static Regeneration (ISR): revalidate at most once every 60 seconds
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const db = await getDb();
    const params: { slug: string; productId: string }[] = [];
    for (const page of db.pages.filter((p) => p.isPublic)) {
      for (const prod of db.products.filter((p) => p.pageId === page.id && p.isActive)) {
        params.push({ slug: page.slug, productId: prod.id });
      }
    }
    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}): Promise<Metadata> {
  const { slug, productId } = await params;
  const db = await getDb();
  const page = db.pages.find((p) => p.slug === slug && p.isPublic);
  if (!page) return { title: "Halaman Tidak Ditemukan | OpenLynk" };

  const product = db.products.find(
    (p) => p.id === productId && p.pageId === page.id && p.isActive
  );
  if (!product) return { title: "Produk Tidak Ditemukan | OpenLynk" };

  const title = `${product.name} | ${page.name} — OpenLynk`;
  const description =
    product.description || `Beli ${product.name} langsung dari @${page.slug} di OpenLynk. Akses unduh instan digital.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/${page.slug}/products/${product.id}`,
      siteName: "OpenLynk",
      images: [
        {
          url: `/${page.slug}/products/${product.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${product.name} - ${page.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/${page.slug}/products/${product.id}/opengraph-image`],
    },
    alternates: {
      canonical: `/${page.slug}/products/${product.id}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const db = await getDb();
  const page = db.pages.find((p) => p.slug === slug && p.isPublic);
  if (!page) notFound();

  const product = db.products.find(
    (p) => p.id === productId && p.pageId === page.id && p.isActive
  );
  if (!product) notFound();

  const dark = page.darkMode;
  const accent = page.accentColor;
  const vars = themeVars(page.theme, dark, accent) as CSSProperties;

  return (
    <div className={dark ? "dark" : ""} style={vars}>
      <ProductDetailView page={page} product={product} />
    </div>
  );
}
