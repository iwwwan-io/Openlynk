import type { BentoItem, BentoSize } from "./types";

export type XY = { x: number; y: number };
export type WH = { w: number; h: number };

export function sizeWH(type: BentoItem["type"], size: BentoSize | undefined, cols: 2 | 4): WH {
  if (type === "header" || size === "4x1") return { w: cols, h: 1 };
  if (type === "product") return cols === 4 ? { w: 4, h: 3 } : { w: 2, h: 3 };
  if (size === "4x2") return cols === 4 ? { w: 4, h: 2 } : { w: 2, h: 2 };
  if (size === "2x2") return { w: 2, h: 2 };
  if (size === "2x1") return { w: 2, h: 1 };
  if (size === "1x1") return { w: 1, h: 1 };
  if (type === "video" || type === "sawer") return { w: 2, h: 2 };
  return { w: 2, h: 1 };
}

export type Placed = BentoItem & { pos: XY };

function itemSize(b: BentoItem): BentoSize | undefined {
  if (b.type === "product") return undefined;
  return b.size;
}

// Item tanpa posisi ditumpuk di bawah; posisi yang ada dipertahankan.
export function ensurePos(items: BentoItem[], cols: 2 | 4): Placed[] {
  let bottom = 0;
  const known = items.filter((b) => b.pos);
  for (const b of known) {
    bottom = Math.max(bottom, b.pos!.y + sizeWH(b.type, itemSize(b), cols).h);
  }
  return items.map((b) => {
    if (b.pos) return { ...b, pos: b.pos };
    const pos = { x: 0, y: bottom };
    bottom += sizeWH(b.type, itemSize(b), cols).h;
    return { ...b, pos };
  });
}

export function layoutOf(
  items: BentoItem[],
  cols: 2 | 4
): { i: string; x: number; y: number; w: number; h: number }[] {
  if (cols === 4) {
    return ensurePos(items, cols).map((b) => {
      const { w, h } = sizeWH(b.type, itemSize(b), cols);
      return {
        i: b.id,
        x: Math.max(0, Math.min(b.pos.x, cols - w)),
        y: Math.max(0, b.pos.y),
        w,
        h,
      };
    });
  }

  // 2-column mobile layout: pack items in reading order to prevent collisions
  const placed = ensurePos(items, 4);
  const sorted = [...placed].sort((a, b) => {
    if (a.pos.y !== b.pos.y) return a.pos.y - b.pos.y;
    return a.pos.x - b.pos.x;
  });

  const occupied: boolean[][] = [];
  const isFree = (x: number, y: number, w: number, h: number) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (occupied[y + dy]?.[x + dx]) return false;
      }
    }
    return true;
  };
  const mark = (x: number, y: number, w: number, h: number) => {
    for (let dy = 0; dy < h; dy++) {
      if (!occupied[y + dy]) occupied[y + dy] = [];
      for (let dx = 0; dx < w; dx++) {
        occupied[y + dy][x + dx] = true;
      }
    }
  };

  return sorted.map((b) => {
    const { w, h } = sizeWH(b.type, itemSize(b), 2);
    let y = 0;
    while (true) {
      for (let x = 0; x <= 2 - w; x++) {
        if (isFree(x, y, w, h)) {
          mark(x, y, w, h);
          return { i: b.id, x, y, w, h };
        }
      }
      y++;
    }
  });
}
