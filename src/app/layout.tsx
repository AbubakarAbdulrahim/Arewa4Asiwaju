import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/env";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const description =
  "Arewa for Asiwaju Student Wing is part of a political mobilisation and advocacy movement working across Northern Nigeria.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Arewa for Asiwaju Student Wing",
    default: "Arewa for Asiwaju Student Wing",
  },
  description,
  applicationName: "Arewa for Asiwaju Student Wing",
  icons: { icon: "/brand/arewa-for-asiwaju-a4a.jpg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    title: "Arewa for Asiwaju Student Wing",
    description,
    siteName: "Arewa for Asiwaju Student Wing",
    images: [
      {
        url: "/brand/arewa-for-asiwaju-a4a.jpg",
        width: 1200,
        height: 630,
        alt: "Arewa for Asiwaju Student Wing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arewa for Asiwaju Student Wing",
    description,
    images: ["/brand/arewa-for-asiwaju-a4a.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#046735",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Arewa for Asiwaju Student Wing",
  alternateName: "A4A Student Wing",
  url: siteUrl,
  logo: `${siteUrl}/brand/arewa-for-asiwaju-a4a.jpg`,
  description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('a4a_theme_preference');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only fixed left-3 top-3 z-50 rounded-sm bg-white px-4 py-3 font-bold text-brand-forest focus:not-sr-only"
        >
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
