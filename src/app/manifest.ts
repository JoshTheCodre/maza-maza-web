import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maza-Maza",
    short_name: "Maza-Maza",
    description: "Rides and deliveries at the price you agree.",
    start_url: "/ride",
    display: "standalone",
    background_color: "#f5f5f0",
    theme_color: "#0f100d",
    icons: [{ src: "/icons/maza-maza.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
