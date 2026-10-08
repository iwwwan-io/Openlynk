import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

const rawAppUrl =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.NEXT_PUBLIC_APP_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : "http://localhost:3000");

const cleanBaseUrl =
  rawAppUrl.startsWith("http://") || rawAppUrl.startsWith("https://")
    ? rawAppUrl
    : `https://${rawAppUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(cleanBaseUrl),
  title: {
    default: "OpenLynk — Platform Link-in-Bio & Toko Produk Digital",
    template: "%s | OpenLynk",
  },
  description:
    "Platform all-in-one untuk kreator konten Indonesia: jual produk digital, terima donasi sawer QRIS, dan bagikan tautan bento.",
  keywords: [
    "link in bio",
    "produk digital",
    "bento grid",
    "sawer qris",
    "kreator indonesia",
    "openlynk",
    "jual ebook",
    "toko online kreator",
  ],
  authors: [{ name: "OpenLynk Team" }],
  creator: "OpenLynk",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "OpenLynk",
    title: "OpenLynk — Platform Link-in-Bio & Toko Produk Digital",
    description:
      "Platform all-in-one untuk kreator konten Indonesia: jual produk digital, terima donasi sawer QRIS, dan bagikan tautan bento.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenLynk — Platform Link-in-Bio & Toko Produk Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenLynk — Platform Link-in-Bio & Toko Produk Digital",
    description:
      "Platform all-in-one untuk kreator konten Indonesia: jual produk digital, terima donasi sawer QRIS, dan bagikan tautan bento.",
    creator: "@openlynkid",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
