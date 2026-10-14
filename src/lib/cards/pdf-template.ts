import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export interface CardGenerationInput {
  fullName: string;
  membershipNumber: string;
  stateName: string;
  stateCode: string;
  lgaName: string;
  wardName?: string | null;
  institutionName?: string | null;
  photoBytes?: Uint8Array | null;
  issuedAt: Date | string;
  expiresAt: Date | string;
  verificationToken: string;
}

export interface CardGenerationResult {
  pdfBuffer: Uint8Array;
  verificationUrl: string;
}

const forest = rgb(0.043, 0.274, 0.098);
const ink = rgb(0.07, 0.09, 0.07);
const muted = rgb(0.34, 0.39, 0.35);
const ochre = rgb(0.5, 0.36, 0.05);
const paper = rgb(0.984, 0.976, 0.96);
const white = rgb(1, 1, 1);

function formatDate(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error("invalid_card_date");
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  })
    .format(date)
    .toUpperCase();
}

function drawFittedText(
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  options: {
    x: number;
    y: number;
    size: number;
    maxWidth: number;
    color: ReturnType<typeof rgb>;
    minSize?: number;
  },
) {
  let size = options.size;
  while (font.widthOfTextAtSize(text, size) > options.maxWidth && size > (options.minSize ?? 8))
    size -= 0.5;
  if (font.widthOfTextAtSize(text, size) > options.maxWidth)
    throw new Error("card_name_does_not_fit");
  page.drawText(text, { x: options.x, y: options.y, size, font, color: options.color });
}

function drawCenteredText(
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  size: number,
  y: number,
  color: ReturnType<typeof rgb>,
  centerX = page.getWidth() / 2,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: centerX - textWidth / 2, y, size, font, color });
}

function wrapFullName(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  maxWidth: number,
) {
  for (let size = 13; size >= 8; size -= 0.5) {
    const lines: string[] = [];
    let line = "";
    for (const word of text.trim().toUpperCase().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      for (const character of Array.from(word)) {
        const next = line + character;
        if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
          lines.push(line);
          line = character;
        } else {
          line = next;
        }
      }
    }
    if (line) lines.push(line);
    if (lines.length <= 2) return { lines, size };
  }
  throw new Error("card_name_does_not_fit");
}

export async function generateMembershipCardPdfTemplate(
  input: CardGenerationInput,
  appUrl: string,
): Promise<CardGenerationResult> {
  if (!/^[a-f0-9]{64}$/.test(input.verificationToken)) throw new Error("invalid_card_token");
  const verificationUrl = new URL("/verify-card", appUrl);
  verificationUrl.hash = input.verificationToken;

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl.toString(), {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 320,
    color: { dark: "#0B4619", light: "#FFFFFF" },
  });
  const pdf = await PDFDocument.create();
  pdf.setTitle(`A4A Membership Card ${input.membershipNumber}`);
  pdf.setAuthor("Arewa for Asiwaju");
  pdf.setSubject("Digital membership card");
  pdf.setCreator("Arewa for Asiwaju Membership Platform");
  pdf.setProducer("Arewa for Asiwaju Membership Platform");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.CourierBold);
  const logoBytes = await readFile(
    path.join(process.cwd(), "public", "brand", "arewa-for-asiwaju-a4a.jpg"),
  );
  const logo = await pdf.embedJpg(logoBytes);
  let memberPhoto:
    Awaited<ReturnType<typeof pdf.embedJpg>> | Awaited<ReturnType<typeof pdf.embedPng>> | null =
    null;
  if (input.photoBytes?.byteLength) {
    try {
      memberPhoto = await pdf.embedJpg(input.photoBytes);
    } catch {
      memberPhoto = await pdf.embedPng(input.photoBytes);
    }
  }
  const qrBytes = Buffer.from(qrCodeDataUrl.split(",")[1] ?? "", "base64");
  const qr = await pdf.embedPng(qrBytes);
  const width = 486;
  const height = 306;

  const front = pdf.addPage([width, height]);
  front.drawRectangle({ x: 0, y: 0, width, height, color: paper });
  front.drawRectangle({
    x: 0.5,
    y: 0.5,
    width: width - 1,
    height: height - 1,
    borderColor: rgb(0.82, 0.86, 0.82),
    borderWidth: 1,
  });
  front.drawRectangle({ x: 0, y: height - 58, width, height: 58, color: forest });
  front.drawRectangle({ x: 0, y: height - 62, width, height: 4, color: ochre });
  front.drawImage(logo, { x: 20, y: height - 51, width: 43, height: 43 });
  front.drawText("AREWA FOR ASIWAJU", {
    x: 74,
    y: height - 30,
    size: 15,
    font: bold,
    color: white,
  });
  front.drawText("STUDENT WING  |  MEMBERSHIP CARD", {
    x: 75,
    y: height - 46,
    size: 7.5,
    font: regular,
    color: white,
  });

  // Subtle movement mark, centered behind the cardholder details.
  front.drawImage(logo, {
    x: (width - 156) / 2,
    y: 76,
    width: 156,
    height: 156,
    opacity: 0.09,
  });

  // CR80 layout: portrait left, consistently aligned identity fields center, QR right.
  front.drawRectangle({
    x: 24,
    y: 96,
    width: 96,
    height: 130,
    color: white,
    borderColor: rgb(0.78, 0.82, 0.78),
    borderWidth: 0.8,
  });
  if (memberPhoto) {
    const fitted = memberPhoto.scaleToFit(88, 122);
    front.drawImage(memberPhoto, {
      x: 28 + (88 - fitted.width) / 2,
      y: 100 + (122 - fitted.height) / 2,
      width: fitted.width,
      height: fitted.height,
    });
  } else {
    drawCenteredText(front, "PHOTO", bold, 9, 156, muted, 72);
  }

  const detailsX = 140;
  const detailsWidth = 212;
  const nameLayout = wrapFullName(input.fullName, bold, detailsWidth);
  front.drawText("FULL NAME", { x: detailsX, y: 210, size: 6.5, font: bold, color: muted });
  nameLayout.lines.forEach((line, index) => {
    front.drawText(line, {
      x: detailsX,
      y: 192 - index * 14,
      size: nameLayout.size,
      font: bold,
      color: ink,
    });
  });
  const membershipLabelY = 158 - (nameLayout.lines.length - 1) * 12;
  front.drawText("MEMBERSHIP NUMBER", {
    x: detailsX,
    y: membershipLabelY,
    size: 6.5,
    font: bold,
    color: muted,
  });
  drawFittedText(front, input.membershipNumber, mono, {
    x: detailsX,
    y: membershipLabelY - 14,
    size: 10.5,
    minSize: 8,
    maxWidth: detailsWidth,
    color: forest,
  });

  const locationLabelY = membershipLabelY - 32;
  front.drawText("STATE / LGA", {
    x: detailsX,
    y: locationLabelY,
    size: 6.5,
    font: bold,
    color: muted,
  });
  drawFittedText(front, `${input.stateName} / ${input.lgaName}`.toUpperCase(), bold, {
    x: detailsX,
    y: locationLabelY - 13,
    size: 8.5,
    minSize: 7,
    maxWidth: detailsWidth,
    color: ink,
  });

  const wardLabelY = locationLabelY - 26;
  front.drawText("WARD", {
    x: detailsX,
    y: wardLabelY,
    size: 6.5,
    font: bold,
    color: muted,
  });
  drawFittedText(front, input.wardName?.toUpperCase() || "NOT RECORDED", bold, {
    x: detailsX,
    y: wardLabelY - 12,
    size: 8.5,
    minSize: 7,
    maxWidth: detailsWidth,
    color: ink,
  });

  const institutionLabelY = locationLabelY - 52;
  if (input.institutionName) {
    front.drawText("INSTITUTION", {
      x: detailsX,
      y: institutionLabelY,
      size: 6.5,
      font: bold,
      color: muted,
    });
    drawFittedText(front, input.institutionName.toUpperCase(), bold, {
      x: detailsX,
      y: institutionLabelY - 12,
      size: 8,
      minSize: 6,
      maxWidth: detailsWidth,
      color: ink,
    });
  }
  front.drawText(`ISSUED  ${formatDate(input.issuedAt)}`, {
    x: detailsX,
    y: 42,
    size: 6.5,
    font: regular,
    color: muted,
  });

  front.drawRectangle({
    x: 374,
    y: 94,
    width: 90,
    height: 132,
    color: rgb(0.95, 0.97, 0.94),
    borderColor: rgb(0.84, 0.88, 0.83),
    borderWidth: 0.8,
  });
  front.drawImage(qr, { x: 384, y: 132, width: 70, height: 70 });
  drawCenteredText(front, "VERIFY STATUS", bold, 6.3, 119, forest, 419);
  drawCenteredText(front, "MEMBERSHIP ONLY", regular, 5.1, 107, muted, 419);
  front.drawRectangle({ x: 0, y: 0, width, height: 7, color: forest });

  const back = pdf.addPage([width, height]);
  back.drawRectangle({ x: 0, y: 0, width, height, color: paper });
  back.drawRectangle({
    x: 0.5,
    y: 0.5,
    width: width - 1,
    height: height - 1,
    borderColor: rgb(0.82, 0.86, 0.82),
    borderWidth: 1,
  });
  back.drawRectangle({ x: 0, y: height - 58, width, height: 58, color: forest });
  back.drawRectangle({ x: 0, y: height - 62, width, height: 4, color: ochre });
  drawCenteredText(back, "A4A STUDENT WING", bold, 8, height - 18, white);
  drawCenteredText(back, "MEMBERSHIP CARD INFORMATION", regular, 6.3, height - 39, white);

  drawCenteredText(back, "MEMBERSHIP & VERIFICATION", bold, 8, 218, forest);
  drawCenteredText(back, "This card confirms membership in the A4A Student Wing.", regular, 8.5, 197, ink);
  drawCenteredText(back, "Scan the QR code on the front to check current membership status.", regular, 8, 180, ink);
  drawCenteredText(back, "The public check confirms card status only.", regular, 7.5, 164, muted);

  back.drawRectangle({
    x: 38,
    y: 91,
    width: width - 76,
    height: 52,
    color: rgb(0.94, 0.96, 0.93),
    borderColor: rgb(0.84, 0.87, 0.84),
    borderWidth: 0.8,
  });
  drawCenteredText(back, "MEMBERSHIP IDENTIFIER", bold, 6.5, 125, forest);
  drawCenteredText(back, "This number identifies your membership; it is not a password.", regular, 7.5, 108, ink);
  drawCenteredText(back, "Not a national identity card or government-issued credential.", regular, 7, 71, muted);
  drawCenteredText(back, "Support: 09122628654  |  09013113304", bold, 7.5, 51, forest);
  drawCenteredText(back, "Keep your card and verification QR private.", regular, 6.5, 31, muted);
  back.drawRectangle({ x: 0, y: 0, width, height: 6, color: forest });

  return { pdfBuffer: await pdf.save(), verificationUrl: verificationUrl.toString() };
}
