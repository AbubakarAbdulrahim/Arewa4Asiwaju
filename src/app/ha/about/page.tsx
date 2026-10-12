import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Game da Arewa for Asiwaju",
  description: "Bayanin ƙungiyar Arewa for Asiwaju a harshen Hausa.",
  alternates: { canonical: "/ha/about" },
  openGraph: { locale: "ha_NG" },
};

export default function HausaAboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="site-container flex-1 py-12 sm:py-16">
        <p className="eyebrow">Bayanin ƙungiya</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Arewa for Asiwaju
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">
          A4A ƙungiya ce ta wayar da kan jama’a da bayar da shawarwari kan siyasa, wadda ke aiki a
          Arewacin Najeriya domin haɗa manufofin gwamnati da al’ummomin tushe.
        </p>
        <section className="mt-10 border-t border-line pt-7">
          <h2 className="section-title">Abubuwan da ƙungiyar ke mayar da hankali a kai</h2>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-sm leading-relaxed text-muted">
            <li>Tsara ƙungiyoyi daga jiha zuwa ƙananan hukumomi da unguwanni.</li>
            <li>Fassara da bayyana manufofin tarayya cikin harshe mai sauƙi da fahimta.</li>
            <li>Ƙarfafa matasa da ɗalibai su shiga ayyukan wayar da kai da jagoranci.</li>
            <li>
              Raba bayanan gwamnati tare da sahihan majiyoyi don tabbatar da da’awar da ake
              wallafawa.
            </li>
          </ul>
          <Link className="button-secondary mt-7" href="/about">
            English version
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
