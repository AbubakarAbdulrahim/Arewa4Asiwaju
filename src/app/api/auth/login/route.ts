import { NextResponse } from "next/server";

/** Retired passwordless sign-in endpoint. Member access now requires a password. */
export async function POST() {
  return NextResponse.json(
    { error: "Passwordless member sign-in is no longer available. Use the member login page." },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store, private",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
