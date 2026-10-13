export const BANNER_WIDTH = 764;
export const BANNER_HEIGHT = 1080;
export const BANNER_SCALE = 2;

export type BannerRenderOptions = {
  name: string;
  position: string;
  photo: HTMLImageElement | null;
  logo: HTMLImageElement | null;
  zoom: number;
  panX: number;
  panY: number;
};

const portrait = { x: 164, y: 391, width: 436, height: 543 };

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawBackground(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  const gradient = ctx.createLinearGradient(0, 0, 0, BANNER_HEIGHT);
  gradient.addColorStop(0, "#009764");
  gradient.addColorStop(0.45, "#00794f");
  gradient.addColorStop(1, "#00190f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  const sideGlow = ctx.createRadialGradient(600, 255, 10, 600, 255, 420);
  sideGlow.addColorStop(0, "rgba(63, 184, 116, .22)");
  sideGlow.addColorStop(1, "rgba(0, 40, 25, 0)");
  ctx.fillStyle = sideGlow;
  ctx.fillRect(300, 0, 464, 700);

  ctx.save();
  ctx.globalAlpha = 0.055;
  for (let x = 516; x < 780; x += 18) {
    for (let y = 4; y < 330; y += 18) {
      if ((x + y) % 3 === 0) {
        ctx.fillStyle = "#8bd3a3";
        ctx.fillRect(x, y, 6, 6);
      }
    }
  }
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = "#a6d8b4";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(480 + i * 12, 0);
    ctx.bezierCurveTo(510 + i * 14, 130, 445 + i * 23, 270, 520 + i * 16, 430);
    ctx.stroke();
  }
  if (logo?.complete && logo.naturalWidth > 0) {
    ctx.globalAlpha = 0.07;
    ctx.drawImage(logo, 155, 90, 175, 250, 442, 78, 355, 470);
  }
  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = "rgba(239, 248, 241, .83)";
  ctx.lineWidth = 1.2;
  roundedRect(ctx, 44, 96, 676, 428, 30);
  ctx.stroke();
  // The top rule is interrupted by the centered logo in the reference.
  ctx.fillStyle = "#008f5b";
  ctx.fillRect(240, 90, 284, 14);
  ctx.restore();
}

function drawRope(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.32)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.moveTo(483, 331);
  ctx.bezierCurveTo(483, 359, 501, 373, 507, 390);
  ctx.bezierCurveTo(512, 402, 519, 408, 521, 423);
  ctx.lineCap = "round";
  ctx.strokeStyle = "#9b5d2e";
  ctx.lineWidth = 13;
  ctx.stroke();
  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.moveTo(480, 332);
  ctx.bezierCurveTo(480, 358, 497, 374, 504, 390);
  ctx.bezierCurveTo(509, 402, 516, 408, 518, 422);
  ctx.strokeStyle = "#e4bd7d";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.strokeStyle = "rgba(111, 59, 25, .7)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i += 1) {
    const y = 350 + i * 10;
    ctx.beginPath();
    ctx.moveTo(486 + i * 2.2, y - 4);
    ctx.lineTo(500 + i * 2.1, y + 4);
    ctx.stroke();
  }

  for (const eyelet of [
    { x: 483, y: 330 },
    { x: 520, y: 424 },
  ]) {
    const metal = ctx.createLinearGradient(
      eyelet.x - 16,
      eyelet.y - 15,
      eyelet.x + 15,
      eyelet.y + 15,
    );
    metal.addColorStop(0, "#fff1c7");
    metal.addColorStop(0.38, "#815528");
    metal.addColorStop(0.7, "#eed08f");
    metal.addColorStop(1, "#64431e");
    ctx.beginPath();
    ctx.arc(eyelet.x, eyelet.y, 13, 0, Math.PI * 2);
    ctx.fillStyle = metal;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyelet.x, eyelet.y, 7.2, 0, Math.PI * 2);
    ctx.fillStyle = "#6f4725";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyelet.x, eyelet.y, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#f9c944";
    ctx.fill();
  }
  ctx.restore();
}

function drawPortrait(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  zoom: number,
  panX: number,
  panY: number,
) {
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.beginPath();
  ctx.rect(portrait.x, portrait.y, portrait.width, portrait.height);
  ctx.clip();
  ctx.fillStyle = "#d8e5f7";
  ctx.fillRect(portrait.x, portrait.y, portrait.width, portrait.height);

  if (photo?.complete && photo.naturalWidth > 0) {
    const fitScale = Math.max(
      portrait.width / photo.naturalWidth,
      portrait.height / photo.naturalHeight,
    );
    const scale = fitScale * zoom;
    const drawWidth = photo.naturalWidth * scale;
    const drawHeight = photo.naturalHeight * scale;
    const overflowX = Math.max(0, drawWidth - portrait.width);
    const overflowY = Math.max(0, drawHeight - portrait.height);
    const left = portrait.x - overflowX / 2 + (panX * overflowX) / 2;
    const top = portrait.y - overflowY / 2 + (panY * overflowY) / 2;
    ctx.drawImage(photo, left, top, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = "#f4f7fb";
    ctx.fillRect(portrait.x, portrait.y, portrait.width, portrait.height);
    ctx.fillStyle = "#d3dce5";
    ctx.beginPath();
    ctx.arc(382, 568, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(382, 770, 138, 152, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#435248";
    ctx.font = "700 18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Choose a photo to preview your banner", 382, 887);
  }
  ctx.restore();
}

function wrapName(ctx: CanvasRenderingContext2D, name: string, maxWidth: number, fontSize: number) {
  ctx.font = `700 ${fontSize}px Impact, "Arial Narrow", Arial, sans-serif`;
  const words = name.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawNameplate(ctx: CanvasRenderingContext2D, name: string) {
  ctx.save();
  ctx.translate(368.5, 850);
  ctx.rotate(-0.03);
  const gradient = ctx.createLinearGradient(-258, -53, 258, 53);
  gradient.addColorStop(0, "#009965");
  gradient.addColorStop(0.5, "#00a875");
  gradient.addColorStop(1, "#008d5d");
  roundedRect(ctx, -258, -53, 516, 106, 13);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(235,255,242,.58)";
  ctx.lineWidth = 1;
  ctx.stroke();

  let fontSize = 42;
  let lines = wrapName(ctx, name, 474, fontSize);
  while (
    (lines.length > 2 || lines.some((line) => ctx.measureText(line).width > 474)) &&
    fontSize > 18
  ) {
    fontSize -= 2;
    lines = wrapName(ctx, name, 474, fontSize);
  }
  ctx.font = `700 ${fontSize}px Impact, "Arial Narrow", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,.15)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  if (lines.length <= 1) {
    ctx.fillText(name, 0, 2, 474);
  } else {
    const visibleLines = lines.slice(0, 2);
    const lineHeight = Math.min(fontSize + 2, 40);
    visibleLines.forEach((line, index) => {
      ctx.fillText(line, 0, (index - (visibleLines.length - 1) / 2) * lineHeight, 474);
    });
  }
  ctx.restore();
}

function wrapPosition(ctx: CanvasRenderingContext2D, position: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of position.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawPosition(ctx: CanvasRenderingContext2D, position: string) {
  const trimmed = position.trim();
  if (!trimmed) return;

  let fontSize = 22;
  let lines: string[];
  do {
    ctx.font = `700 ${fontSize}px Georgia, serif`;
    lines = wrapPosition(ctx, trimmed, 630);
    if (lines.length <= 2 && lines.every((line) => ctx.measureText(line).width <= 630)) break;
    fontSize -= 1;
  } while (fontSize > 15);

  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px Georgia, serif`;
  ctx.shadowColor = "rgba(0,0,0,.22)";
  ctx.shadowBlur = 2;
  const lineHeight = fontSize + 2;
  lines.slice(0, 2).forEach((line, index, visibleLines) => {
    const offset = (index - (visibleLines.length - 1) / 2) * lineHeight;
    ctx.fillText(line, 382, 930 + offset, 630);
  });
  ctx.restore();
}

function drawSocialFooter(ctx: CanvasRenderingContext2D) {
  const y = 1030;
  const icons = [
    { x: 160, type: "facebook" },
    { x: 185, type: "instagram" },
    { x: 210, type: "twitter" },
  ];
  ctx.save();
  for (const icon of icons) {
    roundedRect(ctx, icon.x, y - 9, 17, 17, 4);
    ctx.fillStyle = "#08a875";
    ctx.fill();
    ctx.fillStyle = "#fff";
    if (icon.type === "facebook") {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 14px Arial, sans-serif";
      ctx.fillText("f", icon.x + 8.5, y - 0.5);
    } else if (icon.type === "instagram") {
      roundedRect(ctx, icon.x + 3.2, y - 5.8, 10.6, 11.6, 3);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(icon.x + 8.5, y - 0.1, 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(icon.x + 11.8, y - 4.2, 0.7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(icon.x + 3, y - 4);
      ctx.quadraticCurveTo(icon.x + 7, y - 8, icon.x + 10, y - 5);
      ctx.lineTo(icon.x + 14, y - 6);
      ctx.lineTo(icon.x + 12, y - 3);
      ctx.quadraticCurveTo(icon.x + 13, y + 3, icon.x + 7, y + 5);
      ctx.quadraticCurveTo(icon.x + 4, y + 6, icon.x + 2, y + 4);
      ctx.quadraticCurveTo(icon.x + 6, y + 4, icon.x + 7, y + 2);
      ctx.quadraticCurveTo(icon.x + 3, y + 1, icon.x + 3, y - 4);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#1bb17a";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "700 14px Georgia, serif";
  ctx.fillText("@a4astudentwing  |  #A4AStudentsWing  #A4A", 233, y);
  ctx.restore();
}

export function drawBanner(
  canvas: HTMLCanvasElement,
  options: BannerRenderOptions,
  scale = BANNER_SCALE,
) {
  canvas.width = BANNER_WIDTH * scale;
  canvas.height = BANNER_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas rendering is unavailable in this browser.");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT);

  drawBackground(ctx, options.logo);
  drawFrame(ctx);

  if (options.logo?.complete && options.logo.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(382, 96, 53, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.drawImage(options.logo, 332, 46, 100, 100);
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,.12)";
  ctx.shadowBlur = 2;
  ctx.font = "700 20px Georgia, serif";
  ctx.fillText("AREWA FOR ASIWAJU", 382, 169);
  ctx.font = "900 38px Georgia, serif";
  ctx.fillText("STUDENTS'", 382, 201);
  ctx.fillText("WING", 382, 237);
  ctx.restore();

  const labelGradient = ctx.createLinearGradient(0, 288, 0, 366);
  labelGradient.addColorStop(0, "#ffcf16");
  labelGradient.addColorStop(1, "#ffbd00");
  roundedRect(ctx, 215, 288, 320, 78, 13);
  ctx.fillStyle = labelGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.24)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#16110b";
  ctx.shadowColor = "rgba(255,255,255,.4)";
  ctx.shadowBlur = 2;
  ctx.font = '900 42px Impact, "Arial Narrow", sans-serif';
  ctx.fillText("I belong to", 360, 327);
  ctx.restore();

  drawPortrait(ctx, options.photo, options.zoom, options.panX, options.panY);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(234, 374);
  ctx.lineTo(529, 374);
  ctx.lineTo(477, 419);
  ctx.quadraticCurveTo(466, 430, 451, 430);
  ctx.lineTo(310, 430);
  ctx.quadraticCurveTo(293, 430, 282, 419);
  ctx.closePath();
  const ribbon = ctx.createLinearGradient(0, 374, 0, 430);
  ribbon.addColorStop(0, "#ff332c");
  ribbon.addColorStop(1, "#e5080d");
  ctx.fillStyle = ribbon;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(234, 374);
  ctx.lineTo(280, 374);
  ctx.lineTo(298, 390);
  ctx.lineTo(240, 390);
  ctx.closePath();
  ctx.fillStyle = "#b80811";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 40px Georgia, serif";
  ctx.fillText("A4A", 382, 402);
  ctx.restore();
  drawRope(ctx);

  drawNameplate(ctx, options.name.trim() || "Your name");
  drawPosition(ctx, options.position);

  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 27px Georgia, serif";
  ctx.fillText("Student Wing, A4A", 382, 972);
  ctx.restore();
  drawSocialFooter(ctx);
}

export function getBannerFilename(name: string) {
  const safeName = name
    .trim()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return `arewa4asiwaju${safeName ? `-${safeName}` : ""}.png`;
}
