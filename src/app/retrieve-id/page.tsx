import type { Metadata } from "next";
import { MemberCardAccess } from "@/components/auth/MemberCardAccess";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Retrieve your membership ID card",
  description: "Securely access your Arewa for Asiwaju Student Wing membership card.",
  alternates: { canonical: "/login" },
};

export default function RetrieveIdPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f4]">
      <MemberCardAccess />
      <Footer />
    </div>
  );
}
