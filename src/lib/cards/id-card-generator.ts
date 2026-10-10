import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CardGenerationInput {
  fullName: string;
  membershipNumber: string;
  stateName: string;
  stateCode: string;
  lgaName: string;
  institutionName?: string | null;
  issuedAt: Date | string;
  expiresAt: Date | string;
  verificationToken: string;
  photoUrl?: string | null;
}

export interface CardGenerationResult {
  pdfBuffer: Uint8Array;
  qrCodeDataUrl: string;
  verificationUrl: string;
  verificationToken: string;
}

/**
 * Generates an ISO/IEC 7810 ID-1 compliant Digital Membership Card PDF
 * Dimensions: 85.60 mm x 53.98 mm (rendered at 2x 243pt x 153pt = 486pt x 306pt for crisp vector print)
 */
export async function generateMembershipCardPdf(
  input: CardGenerationInput
): Promise<CardGenerationResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://arewa4asiwaju.org";
  const verificationUrl = `${baseUrl}/verify-card?token=${encodeURIComponent(
    input.verificationToken
  )}`;

  // 1. Generate QR code PNG Data URL
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 200,
    color: {
      dark: "#0B4619", // Brand Emerald
      light: "#FFFFFF",
    },
  });

  // 2. Create PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed standard fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Card dimensions: 486 x 306 points (high-density standard landscape ID card)
  const cardWidth = 486;
  const cardHeight = 306;

  // ----------------------------------------------------
  // FRONT OF THE CARD (Page 1)
  // ----------------------------------------------------
  const frontPage = pdfDoc.addPage([cardWidth, cardHeight]);

  // Card Background: Crisp Warm White
  frontPage.drawRectangle({
    x: 0,
    y: 0,
    width: cardWidth,
    height: cardHeight,
    color: rgb(0.984, 0.976, 0.96), // #FBF9F5
  });

  // Top Header Banner: Deep Emerald Green
  const headerHeight = 72;
  frontPage.drawRectangle({
    x: 0,
    y: cardHeight - headerHeight,
    width: cardWidth,
    height: headerHeight,
    color: rgb(0.043, 0.274, 0.098), // #0B4619
  });

  // Savanna Gold accent line below header
  frontPage.drawRectangle({
    x: 0,
    y: cardHeight - headerHeight - 4,
    width: cardWidth,
    height: 4,
    color: rgb(0.772, 0.607, 0.152), // #C59B27
  });

  // Header Title
  frontPage.drawText("AREWA4ASIWAJU MOVEMENT", {
    x: 20,
    y: cardHeight - 34,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  frontPage.drawText("OFFICIAL DIGITAL MEMBERSHIP IDENTIFICATION", {
    x: 20,
    y: cardHeight - 54,
    size: 9,
    font: fontBold,
    color: rgb(0.772, 0.607, 0.152), // Gold
  });

  // Watermark emblem in background center
  frontPage.drawText("AREWA4ASIWAJU", {
    x: 80,
    y: 110,
    size: 32,
    font: fontBold,
    color: rgb(0.92, 0.94, 0.92),
  });

  // Photo Placeholder / Box (Left Column)
  const photoX = 24;
  const photoY = 60;
  const photoWidth = 110;
  const photoHeight = 145;

  frontPage.drawRectangle({
    x: photoX,
    y: photoY,
    width: photoWidth,
    height: photoHeight,
    color: rgb(0.93, 0.95, 0.93),
    borderColor: rgb(0.772, 0.607, 0.152),
    borderWidth: 2,
  });

  // Photo Silhouette initials or badge
  frontPage.drawText("VERIFIED", {
    x: photoX + 28,
    y: photoY + 70,
    size: 10,
    font: fontBold,
    color: rgb(0.043, 0.274, 0.098),
  });

  frontPage.drawText("MEMBER", {
    x: photoX + 30,
    y: photoY + 54,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Details Column (Center & Right)
  const detailsX = 150;
  let cursorY = cardHeight - headerHeight - 30;

  // Full Name
  frontPage.drawText("FULL NAME", {
    x: detailsX,
    y: cursorY,
    size: 7,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.4),
  });
  cursorY -= 16;
  frontPage.drawText(input.fullName.toUpperCase(), {
    x: detailsX,
    y: cursorY,
    size: 14,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.07),
  });

  // Membership Number
  cursorY -= 24;
  frontPage.drawText("MEMBERSHIP NUMBER", {
    x: detailsX,
    y: cursorY,
    size: 7,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.4),
  });
  cursorY -= 16;
  frontPage.drawText(input.membershipNumber, {
    x: detailsX,
    y: cursorY,
    size: 13,
    font: fontCourier,
    color: rgb(0.043, 0.274, 0.098), // Brand Emerald
  });

  // State & LGA
  cursorY -= 24;
  frontPage.drawText("STATE & LGA", {
    x: detailsX,
    y: cursorY,
    size: 7,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.4),
  });
  cursorY -= 14;
  frontPage.drawText(`${input.stateName.toUpperCase()} / ${input.lgaName.toUpperCase()}`, {
    x: detailsX,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Institution / Chapter
  if (input.institutionName) {
    cursorY -= 20;
    frontPage.drawText("CAMPUS / CHAPTER", {
      x: detailsX,
      y: cursorY,
      size: 7,
      font: fontBold,
      color: rgb(0.4, 0.45, 0.4),
    });
    cursorY -= 12;
    const truncatedInst =
      input.institutionName.length > 32
        ? input.institutionName.substring(0, 30) + "..."
        : input.institutionName;
    frontPage.drawText(truncatedInst.toUpperCase(), {
      x: detailsX,
      y: cursorY,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  // Validity Dates
  cursorY -= 22;
  const issueDateStr = new Date(input.issuedAt).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });
  const expDateStr = new Date(input.expiresAt).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });

  frontPage.drawText(`ISSUED: ${issueDateStr.toUpperCase()}  |  EXPIRES: ${expDateStr.toUpperCase()}`, {
    x: detailsX,
    y: cursorY,
    size: 8,
    font: fontBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Embed QR Code on the Right
  const qrImageBytes = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  const qrSize = 92;
  const qrX = cardWidth - qrSize - 20;
  const qrY = 75;

  frontPage.drawRectangle({
    x: qrX - 4,
    y: qrY - 4,
    width: qrSize + 8,
    height: qrSize + 8,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.772, 0.607, 0.152),
    borderWidth: 1.5,
  });

  frontPage.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  frontPage.drawText("SCAN TO VERIFY", {
    x: qrX + 11,
    y: qrY - 14,
    size: 7,
    font: fontBold,
    color: rgb(0.043, 0.274, 0.098),
  });

  // Bottom Gold/Green Bar
  frontPage.drawRectangle({
    x: 0,
    y: 0,
    width: cardWidth,
    height: 12,
    color: rgb(0.043, 0.274, 0.098),
  });

  // ----------------------------------------------------
  // BACK OF THE CARD (Page 2)
  // ----------------------------------------------------
  const backPage = pdfDoc.addPage([cardWidth, cardHeight]);

  // Background
  backPage.drawRectangle({
    x: 0,
    y: 0,
    width: cardWidth,
    height: cardHeight,
    color: rgb(0.984, 0.976, 0.96),
  });

  // Top Bar
  backPage.drawRectangle({
    x: 0,
    y: cardHeight - 16,
    width: cardWidth,
    height: 16,
    color: rgb(0.043, 0.274, 0.098),
  });

  // Terms and Code of Conduct
  backPage.drawText("TERMS & CONDITIONS OF MEMBERSHIP", {
    x: 24,
    y: cardHeight - 44,
    size: 11,
    font: fontBold,
    color: rgb(0.043, 0.274, 0.098),
  });

  const terms = [
    "1. This card remains the property of Arewa4Asiwaju and must be surrendered on demand.",
    "2. It signifies active membership, grassroots mobilization rights, and student representation.",
    "3. Misuse, forgery, or unauthorized transfer is strictly prohibited and subject to revocation.",
    "4. If found, please return to any Arewa4Asiwaju State Chapter or National Secretariat.",
    "5. For instant verification, scan the dynamic QR code on the front or visit arewa4asiwaju.org/verify-card.",
  ];

  let termY = cardHeight - 68;
  for (const line of terms) {
    backPage.drawText(line, {
      x: 24,
      y: termY,
      size: 8,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });
    termY -= 16;
  }

  // Contact Information Block
  termY -= 14;
  backPage.drawRectangle({
    x: 24,
    y: termY - 50,
    width: cardWidth - 48,
    height: 60,
    color: rgb(0.94, 0.96, 0.94),
    borderColor: rgb(0.85, 0.88, 0.85),
    borderWidth: 1,
  });

  backPage.drawText("NATIONAL SECRETARIAT & LIAISON DESK", {
    x: 36,
    y: termY - 14,
    size: 8,
    font: fontBold,
    color: rgb(0.043, 0.274, 0.098),
  });

  backPage.drawText("Plot 1204, Central Business District, Abuja, FCT, Nigeria", {
    x: 36,
    y: termY - 28,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  backPage.drawText("Email: secretariat@arewa4asiwaju.org  |  Toll-Free Hotline: 0800-AREWA-4A", {
    x: 36,
    y: termY - 42,
    size: 7.5,
    font: fontBold,
    color: rgb(0.772, 0.607, 0.152),
  });

  // Bottom Security Line
  backPage.drawText(`VERIFICATION SERIAL: ${input.verificationToken.substring(0, 24).toUpperCase()}...`, {
    x: 24,
    y: 20,
    size: 7,
    font: fontCourier,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save PDF bytes
  const pdfBuffer = await pdfDoc.save();

  return {
    pdfBuffer,
    qrCodeDataUrl,
    verificationUrl,
    verificationToken: input.verificationToken,
  };
}
