import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BannerGenerator } from "@/components/banner/BannerGenerator";

export const metadata: Metadata = {
  title: "Create Your A4A Students’ Wing Banner",
  description:
    "Upload your picture, enter your name, and generate your personalized Arewa for Asiwaju Students’ Wing banner.",
  alternates: { canonical: "/banner-generator" },
  openGraph: {
    title: "Create Your A4A Students’ Wing Banner",
    description: "Make a personalized Arewa for Asiwaju Students’ Wing banner in your browser.",
  },
};

export default function BannerGeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <BannerGenerator />
      </main>
      <Footer />
    </div>
  );
}
