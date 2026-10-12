import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await createServerSupabaseClient();
    const { data: authData, error: authError } = await auth.auth.getUser();
    if (authError || !authData.user)
      return NextResponse.json({ error: "Sign in to download your card." }, { status: 401 });

    const admin = createAdminClient();
    const membership = await admin
      .from("memberships")
      .select("id")
      .eq("profile_id", authData.user.id)
      .eq("status", "active")
      .maybeSingle();
    if (membership.error || !membership.data)
      return NextResponse.json(
        { error: "No active membership card is available." },
        { status: 404 },
      );

    const card = await admin
      .from("id_cards")
      .select("pdf_storage_path")
      .eq("membership_id", membership.data.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("card_version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (card.error || !card.data?.pdf_storage_path)
      return NextResponse.json(
        { error: "Your card is not ready to download yet." },
        { status: 409 },
      );

    const signed = await admin.storage
      .from("member-id-cards")
      .createSignedUrl(card.data.pdf_storage_path, 60, { download: "A4A-membership-card.pdf" });
    if (signed.error || !signed.data?.signedUrl)
      return NextResponse.json(
        { error: "Your card download is temporarily unavailable." },
        { status: 503 },
      );
    return NextResponse.redirect(signed.data.signedUrl, {
      headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
    });
  } catch {
    return NextResponse.json(
      { error: "Your card download is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
