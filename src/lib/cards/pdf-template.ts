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

  // CR80 layout: member photo left, identity details center, verification QR right.
  front.drawRectangle({
    x: 22,
    y: 86,
    width: 98,
    height: 132,
    color: white,
    borderColor: rgb(0.78, 0.82, 0.78),
    borderWidth: 0.8,
  });
  if (memberPhoto) {
    const fitted = memberPhoto.scaleToFit(90, 124);
    front.drawImage(memberPhoto, {
      x: 26 + (90 - fitted.width) / 2,
      y: 90 + (124 - fitted.height) / 2,
      width: fitted.width,
      height: fitted.height,
    });
  } else {
    front.drawText("PHOTO", { x: 54, y: 149, size: 9, font: bold, color: muted });
  }
  front.drawText("MEMBER PHOTO", { x: 41, y: 74, size: 6, font: bold, color: muted });

  const detailsX = 134;
  const detailsWidth = 216;
  const nameLayout = wrapFullName(input.fullName, bold, detailsWidth);
  front.drawText("FULL NAME", { x: detailsX, y: 221, size: 6.5, font: bold, color: muted });
  nameLayout.lines.forEach((line, index) => {
    front.drawText(line, {
      x: detailsX,
      y: 202 - index * 15,
      size: nameLayout.size,
      font: bold,
      color: ink,
    });
  });
  const membershipLabelY = 181 - (nameLayout.lines.length - 1) * 15;
  front.drawText("MEMBERSHIP NUMBER", {
    x: detailsX,
    y: membershipLabelY,
    size: 6.5,
    font: bold,
    color: muted,
  });
  drawFittedText(front, input.membershipNumber, mono, {
    x: detailsX,
    y: membershipLabelY - 16,
    size: 11,
    minSize: 8,
    maxWidth: detailsWidth,
    color: forest,
  });

  const locationLabelY = membershipLabelY - 40;
  front.drawText("STATE / LGA", {
    x: detailsX,
    y: locationLabelY,
    size: 6.5,
    font: bold,
    color: muted,
  });
  drawFittedText(front, `${input.stateName} / ${input.lgaName}`.toUpperCase(), bold, {
    x: detailsX,
    y: locationLabelY - 15,
    size: 9,
    minSize: 7,
    maxWidth: detailsWidth,
    color: ink,
  });

  const institutionLabelY = locationLabelY - 36;
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
      y: institutionLabelY - 14,
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
  front.drawText(`EXPIRES  ${formatDate(input.expiresAt)}`, {
    x: detailsX,
    y: 29,
    size: 6.5,
    font: regular,
    color: muted,
  });

  front.drawRectangle({
    x: 373,
    y: 89,
    width: 91,
    height: 129,
    color: rgb(0.95, 0.97, 0.94),
    borderColor: rgb(0.84, 0.88, 0.83),
    borderWidth: 0.8,
  });
  front.drawImage(qr, { x: 380, y: 126, width: 77, height: 77 });
  front.drawText("VERIFY CARD", { x: 391, y: 113, size: 6.5, font: bold, color: forest });
  front.drawText("STATUS ONLY", { x: 392, y: 101, size: 5.5, font: regular, color: muted });
  front.drawRectangle({ x: 0, y: 0, width, height: 7, color: forest });

  const back = pdf.addPage([width, height]);
  back.drawRectangle({ x: 0, y: 0, width, height, color: paper });
  back.drawRectangle({ x: 0, y: height - 58, width, height: 58, color: forest });
  back.drawRectangle({ x: 0, y: height - 62, width, height: 4, color: ochre });
  back.drawImage(logo, { x: 20, y: height - 51, width: 43, height: 43 });
  back.drawText("CARD INFORMATION", { x: 75, y: height - 29, size: 13, font: bold, color: white });
  back.drawText("AREWA FOR ASIWAJU STUDENT WING", {
    x: 76,
    y: height - 45,
    size: 7.5,
    font: regular,
    color: white,
  });
  back.drawText("MEMBERSHIP", { x: 24, y: 221, size: 7, font: bold, color: forest });
  back.drawText("This card confirms membership in the A4A Student Wing.", {
    x: 24,
    y: 203,
    size: 8.5,
    font: regular,
    color: ink,
  });
  back.drawText("Scan the QR code to check whether the card is active.", {
    x: 24,
    y: 185,
    size: 8.5,
    font: regular,
    color: ink,
  });
  back.drawText("The public check confirms card status only.", {
    x: 24,
    y: 167,
    size: 8.5,
    font: regular,
    color: ink,
  });
  back.drawText("The membership number is an identifier, not a password.", {
    x: 24,
    y: 149,
    size: 8.5,
    font: regular,
    color: ink,
  });
  back.drawRectangle({
    x: 24,
    y: 70,
    width: width - 48,
    height: 52,
    color: white,
    borderColor: rgb(0.84, 0.87, 0.84),
    borderWidth: 0.8,
  });
  back.drawText("A4A MOVEMENT MEMBERSHIP CARD", {
    x: 36,
    y: 101,
    size: 7,
    font: bold,
    color: forest,
  });
  back.drawText("This is not a national identity card or a government-issued credential.", {
    x: 36,
    y: 84,
    size: 8,
    font: regular,
    color: muted,
  });
  back.drawText("Keep your card and verification QR private.", {
    x: 24,
    y: 48,
    size: 7,
    font: bold,
    color: forest,
  });
  back.drawText("AREWA FOR ASIWAJU  |  A4A STUDENT WING", {
    x: 24,
    y: 27,
    size: 6.5,
    font: regular,
    color: muted,
  });

  return { pdfBuffer: await pdf.save(), verificationUrl: verificationUrl.toString() };
}
