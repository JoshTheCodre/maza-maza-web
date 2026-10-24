import type { Metadata } from "next";
import { DriveSection } from "@/components/landing/drive-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Safety } from "@/components/landing/safety";
import { Services } from "@/components/landing/services";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { WebAppBand } from "@/components/landing/web-app-band";
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: { absolute: "Maza-Maza: name your price" },
  description: "Rides and deliveries in Lagos at the price you agree. Drivers keep every naira.",
};

export default function Home() {
  return (
    <div className="landing">
      <SiteHeader />
      <main id="top">
        <Hero />
        <HowItWorks />
        <Services />
        <DriveSection />
        <Safety />
        <WebAppBand />
      </main>
      <SiteFooter />
    </div>
  );
}
