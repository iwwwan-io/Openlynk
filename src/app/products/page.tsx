import { redirect } from "next/navigation";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ProductsCatalogPage() {
  const db = await getDb();
  const demoPage = db.pages.find((p) => p.isPublic) || db.pages[0];
  if (demoPage) {
    redirect(`/${demoPage.slug}`);
  }
  redirect("/dashboard");
}
