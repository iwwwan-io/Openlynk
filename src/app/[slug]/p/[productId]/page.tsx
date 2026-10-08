import { redirect } from "next/navigation";

export const revalidate = 60;
export const dynamicParams = true;

export default async function ShortProductRoutePage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  redirect(`/${slug}/products/${productId}`);
}
