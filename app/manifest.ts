import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Ryuka Manager", short_name: "Ryuka", description: "Gestión del taller 3D", start_url: "/", display: "standalone", background_color: "#101010", theme_color: "#810404", orientation: "portrait-primary", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }] };
}
