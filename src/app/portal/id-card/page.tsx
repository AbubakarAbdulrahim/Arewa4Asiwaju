import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const instant = false;

export default async function MemberCardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("memberships")
    .select("id,status,membership_number")
    .eq("profile_id", user.id)
    .maybeSingle();
  const { data: card } =
    membership?.status === "active"
      ? await supabase
          .from("id_cards")
          .select("card_version,status,issued_at,expires_at")
          .eq("membership_id", membership.id)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("card_version", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };
  return (
    <section>
      <h2 className="text-xl font-bold">Digital ID card</h2>
      <p className="mt-2 text-sm text-muted">
        Your membership card is private. Sign in again whenever you need to view or download it.
      </p>
      {!membership || membership.status !== "active" ? (
        <p className="mt-5 border border-line bg-surface p-4 text-sm">
          An active membership is required before a card can be shown.
        </p>
      ) : !card ? (
        <div className="mt-5 border border-line bg-surface p-5">
          <p>Your card may still be processing or may need renewal.</p>
          <Link className="button-quiet mt-4" href="/portal/support">
            Contact support
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm">
            Card version {card.card_version} · expires{" "}
            {new Date(card.expires_at).toLocaleDateString("en-NG", { dateStyle: "long" })}
          </p>
          <div className="mt-4 overflow-hidden border border-line bg-white">
            <iframe
              title="Private preview of your A4A membership card"
              src="/api/cards/preview"
              className="h-[560px] w-full"
              loading="lazy"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/api/cards/download" className="button-primary">
              Download PDF
            </Link>
            <p className="self-center text-xs text-muted">
              Membership number: <span className="font-mono">{membership.membership_number}</span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
