import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { generateMembershipCardPdfTemplate } from "../src/lib/cards/pdf-template.ts";

test("card template creates a two-sided PDF with only an opaque QR token URL", async () => {
  const token = "a".repeat(64);
  const result = await generateMembershipCardPdfTemplate(
    {
      fullName: "Amina Example",
      membershipNumber: "A4A-2026-KN-000142",
      stateName: "Kano",
      stateCode: "KN",
      lgaName: "Kano Municipal",
      issuedAt: "2026-10-10T12:00:00.000Z",
      expiresAt: "2030-10-10T12:00:00.000Z",
      verificationToken: token,
    },
    "https://a4a.example.org",
  );

  const pdf = await PDFDocument.load(result.pdfBuffer);
  assert.equal(pdf.getPageCount(), 2);
  assert.deepEqual(pdf.getPage(0).getSize(), { width: 486, height: 306 });
  assert.deepEqual(pdf.getPage(1).getSize(), { width: 486, height: 306 });
  assert.ok(result.pdfBuffer.byteLength > 5_000);

  const verificationUrl = new URL(result.verificationUrl);
  assert.equal(verificationUrl.origin, "https://a4a.example.org");
  assert.equal(verificationUrl.pathname, "/verify-card");
  assert.equal(verificationUrl.hash, `#${token}`);
  assert.equal(verificationUrl.search, "");
  assert.equal(verificationUrl.href.includes("Amina"), false);
  assert.equal(verificationUrl.href.includes("000142"), false);
});
