import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/portal-schemas";
import { hasTrustedOrigin } from "@/lib/security/same-origin";
import { processMembershipCard, type CardProcessingState } from "@/lib/cards/issue-card";

export async function PATCH(request: NextRequest) {
  if (!hasTrustedOrigin(request))
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Sign in to update your profile." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Check your profile details." }, { status: 400 });
  }
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Check the highlighted profile fields." }, { status: 400 });
  const { firstName, middleName, lastName, stateOfResidence, lgaOfResidence } = parsed.data;
  const { data, error } = await supabase.rpc("update_my_member_profile", {
    p_first_name: firstName,
    p_middle_name: middleName || null,
    p_last_name: lastName,
    p_state_of_residence: stateOfResidence,
    p_lga_of_residence: lgaOfResidence,
  });
  if (error)
    return NextResponse.json(
      { error: "Profile could not be saved. Please retry." },
      { status: 409 },
    );
  const result = Array.isArray(data) ? data[0] : null;
  let cardStatus: CardProcessingState | undefined;
  if (result?.new_card_id && result?.membership_id) {
    try {
      cardStatus = await processMembershipCard(user.id, result.membership_id, result.new_card_id);
    } catch {
      cardStatus = "failed";
    }
  }
  const message =
    cardStatus === "ready"
      ? "Profile updated and your card has been reissued."
      : cardStatus === "processing"
        ? "Profile updated. Your replacement card is processing."
        : cardStatus === "failed"
          ? "Profile updated. Card generation needs a retry; contact support if it remains unavailable."
          : "Profile updated.";
  return NextResponse.json(
    { ok: true, message, cardStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}
