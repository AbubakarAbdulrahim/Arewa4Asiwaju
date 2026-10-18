import type { Metadata } from "next";
import { MemberCardAccess } from "@/components/auth/MemberCardAccess";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Member login and ID card access",
  description: "Access your private Arewa for Asiwaju Student Wing membership card.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f4]">
      <MemberCardAccess />
      <Footer />
    </div>
  );
}
