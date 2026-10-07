import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenLynk — Platform Link-in-Bio & Toko Kreator",
    short_name: "OpenLynk",
    description:
      "Platform all-in-one untuk kreator konten Indonesia: jual produk digital, terima donasi sawer QRIS, dan bagikan tautan bento.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
