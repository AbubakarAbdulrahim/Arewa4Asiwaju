import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { getMessages } from "@/messages";

export const metadata: Metadata = {
  title: "Arewa for Asiwaju — Hausa",
  description: "Bayanin Arewa for Asiwaju da manufofinta a harshen Hausa.",
  alternates: { canonical: "/ha" },
  openGraph: { locale: "ha_NG", title: "Arewa for Asiwaju (A4A) — Hausa" },
};

export default function HausaHomePage() {
  const t = getMessages("ha");
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <section className="border-b border-line py-14 sm:py-20">
          <div className="site-container max-w-5xl">
            <p className="eyebrow">Arewa for Asiwaju · A4A</p>
            <h1 className="display-title mt-5 max-w-4xl text-ink">{t.heroTitle}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{t.heroIntro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary" href="/register">
                {t.participation}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link className="button-secondary" href="/ha/about">
                {t.about}
              </Link>
              <Link className="button-quiet" href="/">
                English
              </Link>
            </div>
          </div>
        </section>
        <section className="site-container py-12">
          <h2 className="section-title">{t.mission}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            A4A na mai da hankali kan shirya al’umma, bayyana manufofi, da ƙarfafa matasa da ɗalibai
            su shiga ayyukan al’umma. Ana gina wannan fassarar ne bisa takardar tsarin ƙungiyar da
            aka bayar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="button-secondary" href="/mission">
              Karin bayani kan manufa
            </Link>
            <Link className="button-secondary" href="/events">
              Abubuwan da ke tafe
            </Link>
          </div>
        </section>
      </main>
      <Footer reserveFloatingActionSpace />
      <WhatsAppFab />
    </div>
  );
}
