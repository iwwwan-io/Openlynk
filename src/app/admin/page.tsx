import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AdminConsole } from "./console";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/masuk?redirect=/admin");
  // Jangan bocorkan keberadaan halaman ke non-admin — lempar ke dashboard biasa
  if (user.role !== "admin") redirect("/dashboard");
  return <AdminConsole currentUser={user} />;
}
