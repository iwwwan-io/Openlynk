import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GlobalProductRoutePage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const db = await getDb();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return notFound();

  const page = db.pages.find((p) => p.id === product.pageId);
  if (!page) return notFound();

  redirect(`/${page.slug}/products/${productId}`);
}
