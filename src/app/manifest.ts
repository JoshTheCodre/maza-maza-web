import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maza-Maza",
    short_name: "Maza-Maza",
    description: "Rides and deliveries at the price you agree.",
    start_url: "/ride",
    display: "standalone",
    background_color: "#f3f6f2",
    theme_color: "#063a28",
    icons: [{ src: "/icons/maza-maza.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
