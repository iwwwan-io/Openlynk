import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_DOT: Record<string, string> = {
  paid: "bg-emerald-500",
  sent: "bg-sky-500",
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  completed: "bg-emerald-500",
  expired: "bg-zinc-400",
  cancelled: "bg-zinc-400",
  rejected: "bg-rose-500",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  paid: CheckCircle2,
  pending: Clock,
  sent: Truck,
  cancelled: XCircle,
};

/**
 * Badge status order/payout terpadu: dot semantik + ikon opsional.
 * `uppercase` untuk tabel admin yang padat, default capitalize untuk storefront.
 */
export function StatusBadge({
  value,
  icon = false,
  uppercase = false,
}: {
  value: string;
  icon?: boolean;
  uppercase?: boolean;
}) {
  const Icon = icon ? STATUS_ICON[value] : undefined;
  return (
    <Badge variant="outline" className={`gap-1.5 ${uppercase ? "uppercase" : "capitalize"}`}>
      {!Icon && (
        <span aria-hidden className={`size-1.5 rounded-full ${STATUS_DOT[value] ?? "bg-zinc-400"}`} />
      )}
      {Icon && <Icon className="size-3" aria-hidden />}
      {value}
    </Badge>
  );
}
