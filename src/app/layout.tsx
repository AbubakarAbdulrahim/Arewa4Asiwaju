import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Arewa4Asiwaju",
    default: "Arewa4Asiwaju | Official Northern Digital Civic Platform",
  },
  description:
    "Official digital mobilization, verified membership registration, and chapter administration platform for Arewa4Asiwaju student and youth wing across the 19 Northern Nigerian States and FCT.",
  keywords: [
    "Arewa4Asiwaju",
    "Northern Nigeria Youth",
    "Digital Membership",
    "Arewa Civic Engagement",
    "Student Mobilisation",
    "Kano",
    "Kaduna",
    "Abuja",
  ],
  authors: [{ name: "Arewa4Asiwaju Directorate of Digital Media" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://arewa4asiwaju.org",
    title: "Arewa4Asiwaju | Official Northern Digital Civic Platform",
    description:
      "Join the official digital movement for Northern youth development, leadership, and progressive civic engagement.",
    siteName: "Arewa4Asiwaju",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arewa4Asiwaju | Official Northern Digital Civic Platform",
    description: "Official digital platform for Arewa4Asiwaju across the 19 Northern States & FCT.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B4619",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#FBF9F5] text-[#121713] antialiased selection:bg-[#0B4619] selection:text-white">
        {children}
      </body>
    </html>
  );
}
