import { redirect } from "next/navigation";

export default function LegacyMemberLoginPage(): never {
  redirect("/login");
}
