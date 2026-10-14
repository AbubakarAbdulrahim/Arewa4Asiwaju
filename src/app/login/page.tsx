import type { Metadata } from "next";
import { MemberCardAccess } from "@/components/auth/MemberCardAccess";

export const metadata: Metadata = {
  title: "Member login and ID card access",
  description: "Access your private Arewa for Asiwaju Student Wing membership card.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return <MemberCardAccess />;
}
