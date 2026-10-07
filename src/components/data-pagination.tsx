"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function pageList(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set<number>([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  const nums = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

/** Navigasi halaman terpadu di atas shadcn Pagination. */
export function DataPagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  const safePage = Math.min(Math.max(page, 1), totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3">
      <p className="text-[11px] text-muted-foreground">
        Halaman {safePage} dari {totalPages} • {total.toLocaleString("id-ID")} data
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (safePage > 1) onChange(safePage - 1);
              }}
              aria-disabled={safePage <= 1}
              className={safePage <= 1 ? "pointer-events-none opacity-40" : undefined}
            />
          </PaginationItem>
          {pageList(safePage, totalPages).map((p, i) =>
            p === "…" ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === safePage}
                  onClick={(e) => {
                    e.preventDefault();
                    onChange(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (safePage < totalPages) onChange(safePage + 1);
              }}
              aria-disabled={safePage >= totalPages}
              className={safePage >= totalPages ? "pointer-events-none opacity-40" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
