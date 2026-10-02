import { redirect } from "next/navigation";

export default async function ShortProductRoutePage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  redirect(`/${slug}/products/${productId}`);
}
