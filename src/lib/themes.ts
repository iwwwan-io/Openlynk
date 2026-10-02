// Preset tema OpenLynk: dipetakan sebagai CSS variables pada halaman publik.
// Menyediakan pasangan mode light & dark dengan kontras dan aksen warna optimal.

export type ThemeName =
  | "default"
  | "slate"
  | "stone"
  | "midnight"
  | "ocean"
  | "sunset"
  | "forest"
  | "rose"
  | "lavender"
  | "noir"
  | "latte"
  | "cyber";

export const THEME_NAMES: ThemeName[] = [
  "default",
  "slate",
  "stone",
  "midnight",
  "ocean",
  "sunset",
  "forest",
  "rose",
  "lavender",
  "noir",
  "latte",
  "cyber",
];

type Mode = Record<string, string>;

const T: Record<ThemeName, { light: Mode; dark: Mode }> = {
  default: {
    light: {
      "--background": "#fafaf9",
      "--foreground": "#1c1917",
      "--card": "#ffffff",
      "--card-foreground": "#1c1917",
      "--border": "#e7e5e4",
      "--muted": "#f5f5f4",
      "--muted-foreground": "#78716c",
      "--primary": "#1c1917",
      "--primary-foreground": "#fafaf9",
    },
    dark: {
      "--background": "#141414",
      "--foreground": "#fafaf9",
      "--card": "#202020",
      "--card-foreground": "#fafaf9",
      "--border": "#383838",
      "--muted": "#282828",
      "--muted-foreground": "#a3a3a3",
      "--primary": "#fafaf9",
      "--primary-foreground": "#141414",
    },
  },
  slate: {
    light: {
      "--background": "#f8fafc",
      "--foreground": "#0f172a",
      "--card": "#ffffff",
      "--card-foreground": "#0f172a",
      "--border": "#e2e8f0",
      "--muted": "#f1f5f9",
      "--muted-foreground": "#64748b",
      "--primary": "#0f172a",
      "--primary-foreground": "#f8fafc",
    },
    dark: {
      "--background": "#0a0f1d",
      "--foreground": "#f1f5f9",
      "--card": "#131b2e",
      "--card-foreground": "#f1f5f9",
      "--border": "#1e293b",
      "--muted": "#172033",
      "--muted-foreground": "#94a3b8",
      "--primary": "#38bdf8",
      "--primary-foreground": "#0a0f1d",
    },
  },
  stone: {
    light: {
      "--background": "#faf7f2",
      "--foreground": "#292524",
      "--card": "#fffdfa",
      "--card-foreground": "#292524",
      "--border": "#e7e0d4",
      "--muted": "#f5eee4",
      "--muted-foreground": "#857262",
      "--primary": "#44403c",
      "--primary-foreground": "#fafaf9",
    },
    dark: {
      "--background": "#171311",
      "--foreground": "#f5efe6",
      "--card": "#241e1b",
      "--card-foreground": "#f5efe6",
      "--border": "#3d342f",
      "--muted": "#2b2420",
      "--muted-foreground": "#a89f91",
      "--primary": "#d4a373",
      "--primary-foreground": "#171311",
    },
  },
  midnight: {
    light: {
      "--background": "#f4f5fb",
      "--foreground": "#1e1b4b",
      "--card": "#ffffff",
      "--card-foreground": "#1e1b4b",
      "--border": "#dfe1f5",
      "--muted": "#eceef9",
      "--muted-foreground": "#6366a8",
      "--primary": "#4338ca",
      "--primary-foreground": "#f4f5fb",
    },
    dark: {
      "--background": "#080a14",
      "--foreground": "#e6e7fb",
      "--card": "#101426",
      "--card-foreground": "#e6e7fb",
      "--border": "#1e2442",
      "--muted": "#161b33",
      "--muted-foreground": "#9a9cd0",
      "--primary": "#818cf8",
      "--primary-foreground": "#080a14",
    },
  },
  ocean: {
    light: {
      "--background": "#f0f7fa",
      "--foreground": "#083344",
      "--card": "#ffffff",
      "--card-foreground": "#083344",
      "--border": "#cde4ed",
      "--muted": "#e1f0f5",
      "--muted-foreground": "#4d7c8a",
      "--primary": "#0284c7",
      "--primary-foreground": "#f0f7fa",
    },
    dark: {
      "--background": "#06131a",
      "--foreground": "#d9f0f5",
      "--card": "#0b202c",
      "--card-foreground": "#d9f0f5",
      "--border": "#133547",
      "--muted": "#0f2838",
      "--muted-foreground": "#7fb3c0",
      "--primary": "#22d3ee",
      "--primary-foreground": "#06131a",
    },
  },
  sunset: {
    light: {
      "--background": "#fef6ee",
      "--foreground": "#431407",
      "--card": "#ffffff",
      "--card-foreground": "#431407",
      "--border": "#f8dac5",
      "--muted": "#fbeadb",
      "--muted-foreground": "#a06a45",
      "--primary": "#ea580c",
      "--primary-foreground": "#fef6ee",
    },
    dark: {
      "--background": "#180c05",
      "--foreground": "#fdeede",
      "--card": "#26150a",
      "--card-foreground": "#fdeede",
      "--border": "#422413",
      "--muted": "#331c0e",
      "--muted-foreground": "#c79a74",
      "--primary": "#fb923c",
      "--primary-foreground": "#180c05",
    },
  },
  forest: {
    light: {
      "--background": "#f2f8f4",
      "--foreground": "#052e16",
      "--card": "#ffffff",
      "--card-foreground": "#052e16",
      "--border": "#cee6d3",
      "--muted": "#e3f2e7",
      "--muted-foreground": "#4d7c58",
      "--primary": "#16a34a",
      "--primary-foreground": "#f2f8f4",
    },
    dark: {
      "--background": "#05160d",
      "--foreground": "#dcf2e3",
      "--card": "#0c2417",
      "--card-foreground": "#dcf2e3",
      "--border": "#163d27",
      "--muted": "#10301f",
      "--muted-foreground": "#86b392",
      "--primary": "#34d399",
      "--primary-foreground": "#05160d",
    },
  },
  rose: {
    light: {
      "--background": "#fdf3f5",
      "--foreground": "#4c0519",
      "--card": "#ffffff",
      "--card-foreground": "#4c0519",
      "--border": "#f7cbd5",
      "--muted": "#fae1e7",
      "--muted-foreground": "#a05268",
      "--primary": "#e11d48",
      "--primary-foreground": "#fdf3f5",
    },
    dark: {
      "--background": "#18050c",
      "--foreground": "#fbdce4",
      "--card": "#260a14",
      "--card-foreground": "#fbdce4",
      "--border": "#421324",
      "--muted": "#330d1b",
      "--muted-foreground": "#c08497",
      "--primary": "#fb7185",
      "--primary-foreground": "#18050c",
    },
  },
  lavender: {
    light: {
      "--background": "#f6f3fc",
      "--foreground": "#2e1065",
      "--card": "#ffffff",
      "--card-foreground": "#2e1065",
      "--border": "#dcd0f4",
      "--muted": "#ebe3fa",
      "--muted-foreground": "#7c6aa8",
      "--primary": "#9333ea",
      "--primary-foreground": "#f6f3fc",
    },
    dark: {
      "--background": "#0f071f",
      "--foreground": "#e7defc",
      "--card": "#190e33",
      "--card-foreground": "#e7defc",
      "--border": "#2d1b54",
      "--muted": "#231442",
      "--muted-foreground": "#a793d6",
      "--primary": "#c084fc",
      "--primary-foreground": "#0f071f",
    },
  },
  noir: {
    light: {
      "--background": "#ffffff",
      "--foreground": "#000000",
      "--card": "#f7f7f8",
      "--card-foreground": "#000000",
      "--border": "#e4e4e7",
      "--muted": "#f4f4f5",
      "--muted-foreground": "#71717a",
      "--primary": "#000000",
      "--primary-foreground": "#ffffff",
    },
    dark: {
      "--background": "#000000",
      "--foreground": "#ffffff",
      "--card": "#111111",
      "--card-foreground": "#ffffff",
      "--border": "#242424",
      "--muted": "#1a1a1a",
      "--muted-foreground": "#a1a1aa",
      "--primary": "#ffffff",
      "--primary-foreground": "#000000",
    },
  },
  latte: {
    light: {
      "--background": "#fcf8f2",
      "--foreground": "#3d2c1e",
      "--card": "#ffffff",
      "--card-foreground": "#3d2c1e",
      "--border": "#eee3d3",
      "--muted": "#f5ede0",
      "--muted-foreground": "#8f7663",
      "--primary": "#92400e",
      "--primary-foreground": "#fcf8f2",
    },
    dark: {
      "--background": "#1c140d",
      "--foreground": "#faefe3",
      "--card": "#2b2016",
      "--card-foreground": "#faefe3",
      "--border": "#423224",
      "--muted": "#36271c",
      "--muted-foreground": "#bda18c",
      "--primary": "#f59e0b",
      "--primary-foreground": "#1c140d",
    },
  },
  cyber: {
    light: {
      "--background": "#f0fdf4",
      "--foreground": "#022c22",
      "--card": "#ffffff",
      "--card-foreground": "#022c22",
      "--border": "#bbf7d0",
      "--muted": "#dcfce7",
      "--muted-foreground": "#15803d",
      "--primary": "#10b981",
      "--primary-foreground": "#ffffff",
    },
    dark: {
      "--background": "#050811",
      "--foreground": "#e2f952",
      "--card": "#0b1122",
      "--card-foreground": "#e2f952",
      "--border": "#182649",
      "--muted": "#111b36",
      "--muted-foreground": "#7ee787",
      "--primary": "#00f0ff",
      "--primary-foreground": "#050811",
    },
  },
};

export function themeVars(theme: string, dark: boolean, accent?: string): Record<string, string> {
  const preset = T[(theme as ThemeName) ?? "default"] ?? T.default;
  const vars: Record<string, string> = { ...(dark ? preset.dark : preset.light) };
  if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) {
    vars["--primary"] = accent;
  }
  return vars;
}
