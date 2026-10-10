import { NextRequest, NextResponse } from "next/server";
import { generateMembershipCardPdf } from "@/lib/cards/id-card-generator";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name") || "Supporter Member";
    const num = searchParams.get("num") || "A4A-2026-KN-000001";
    const state = searchParams.get("state") || "Kano";
    const lga = searchParams.get("lga") || "Kano Municipal";
    const inst = searchParams.get("inst") || "Bayero University Kano (BUK)";
    const token = searchParams.get("token") || "arewa4asiwaju-verification-token-sample";

    const { pdfBuffer } = await generateMembershipCardPdf({
      fullName: name,
      membershipNumber: num,
      stateName: state,
      stateCode: "KN",
      lgaName: lga,
      institutionName: inst,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000),
      verificationToken: token,
    });

    const bodyBuffer = Buffer.from(pdfBuffer);

    return new NextResponse(bodyBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Arewa4Asiwaju-ID-Card-${num}.pdf"`,
        "Content-Length": bodyBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Card PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate digital membership card PDF" },
      { status: 500 }
    );
  }
}
