import { notFound } from "next/navigation";
import { getDb } from "@/lib/store";
import ProductDetailPage, { generateMetadata as generateProductMetadata } from "../../../../[slug]/products/[productId]/page";
import type { Metadata } from "next";

// Incremental Static Regeneration (ISR): revalidate at most once every 60 seconds
export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const db = await getDb();
    const params: { domain: string; productId: string }[] = [];
    for (const page of db.pages.filter((p) => p.isPublic && p.customDomain)) {
      for (const prod of db.products.filter((p) => p.pageId === page.id && p.isActive)) {
        params.push({ domain: page.customDomain!, productId: prod.id });
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
  params: Promise<{ domain: string; productId: string }>;
}): Promise<Metadata> {
  const { domain, productId } = await params;
  const db = await getDb();
  const page = db.pages.find(
    (p) => p.customDomain?.toLowerCase() === domain.toLowerCase() && p.isPublic
  );
  if (!page) return { title: "Halaman Tidak Ditemukan | OpenLynk" };

  return generateProductMetadata({
    params: Promise.resolve({ slug: page.slug, productId }),
  });
}

export default async function CustomDomainProductPage({
  params,
}: {
  params: Promise<{ domain: string; productId: string }>;
}) {
  const { domain, productId } = await params;
  const db = await getDb();
  const page = db.pages.find(
    (p) => p.customDomain?.toLowerCase() === domain.toLowerCase() && p.isPublic
  );
  if (!page) notFound();

  return ProductDetailPage({
    params: Promise.resolve({ slug: page.slug, productId }),
  });
}
