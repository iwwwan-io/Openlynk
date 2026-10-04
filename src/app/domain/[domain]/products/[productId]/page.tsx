import { notFound } from "next/navigation";
import { getDb } from "@/lib/store";
import ProductDetailPage, { generateMetadata as generateProductMetadata } from "../../../../[slug]/products/[productId]/page";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
