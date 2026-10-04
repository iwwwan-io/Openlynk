import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getDb } from "@/lib/store";
import { themeVars } from "@/lib/themes";
import { ProductDetailView } from "./product-detail-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return {
    title: `${product.name} | ${page.name} - OpenLynk`,
    description:
      product.description || `Beli ${product.name} langsung dari @${page.slug} di OpenLynk`,
    openGraph: {
      title: `${product.name} | ${page.name}`,
      description:
        product.description || `Beli ${product.name} langsung dari @${page.slug} di OpenLynk`,
      images: product.imageUrl ? [product.imageUrl] : page.image ? [page.image] : [],
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
