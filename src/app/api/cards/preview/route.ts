import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await createServerSupabaseClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to view your card." }, { status: 401 });
    const admin = createAdminClient();
    const { data: membership } = await admin
      .from("memberships")
      .select("id")
      .eq("profile_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (!membership)
      return NextResponse.json({ error: "No active card is available." }, { status: 404 });
    const { data: card } = await admin
      .from("id_cards")
      .select("pdf_storage_path")
      .eq("membership_id", membership.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("card_version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!card?.pdf_storage_path)
      return NextResponse.json({ error: "Your card is not ready to preview." }, { status: 409 });
    const { data, error } = await admin.storage
      .from("member-id-cards")
      .createSignedUrl(card.pdf_storage_path, 60);
    if (error || !data?.signedUrl)
      return NextResponse.json({ error: "Card preview is unavailable." }, { status: 503 });
    return NextResponse.redirect(data.signedUrl, {
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Card preview is unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
