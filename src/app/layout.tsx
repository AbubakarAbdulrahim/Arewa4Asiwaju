import type { Metadata, Viewport } from "next";
import "./globals.css";
import { env } from "@/lib/env";

const description =
  "Arewa for Asiwaju Student Wing is part of a political mobilisation and advocacy movement working across Northern Nigeria.";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
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
  },
  twitter: { card: "summary", title: "Arewa for Asiwaju Student Wing", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#046735",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only fixed left-3 top-3 z-50 rounded-sm bg-white px-4 py-3 font-bold text-brand-forest focus:not-sr-only"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
