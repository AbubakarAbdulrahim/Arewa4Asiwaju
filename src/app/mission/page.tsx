import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Mission and objectives",
  description: "Mission and vision of the Arewa for Asiwaju Student Wing.",
  alternates: { canonical: "/about" },
};

export default function MissionPage() {
  redirect("/about#mission");
}
