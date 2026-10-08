import { redirect } from "next/navigation";

export const revalidate = 60;
export const dynamicParams = true;

export default async function SlugProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
