import type { Metadata } from "next";
import { MemberCardAccess } from "@/components/auth/MemberCardAccess";

export const metadata: Metadata = {
  title: "Retrieve your membership ID card",
  description: "Securely access your Arewa for Asiwaju Student Wing membership card.",
  alternates: { canonical: "/login" },
};

export default function RetrieveIdPage() {
  return <MemberCardAccess />;
}
