export type MemberPhotoFormat = "jpeg" | "png";

export interface MemberPhotoInfo {
  format: MemberPhotoFormat;
  width: number;
  height: number;
  contentType: "image/jpeg" | "image/png";
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const MAX_PIXELS = 8_000_000;
const MIN_DIMENSION = 128;

function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isStartOfFrame) {
      return {
        height: (bytes[offset + 3] << 8) | bytes[offset + 4],
        width: (bytes[offset + 5] << 8) | bytes[offset + 6],
      };
    }
    offset += segmentLength;
  }
  return null;
}

export function inspectMemberPhoto(bytes: Uint8Array): MemberPhotoInfo {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) throw new Error("photo_size_invalid");
  let format: MemberPhotoFormat;
  let dimensions: { width: number; height: number } | null;
  if (
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    format = "png";
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    dimensions = { width: view.getUint32(16), height: view.getUint32(20) };
  } else {
    format = "jpeg";
    dimensions = jpegDimensions(bytes);
    if (!dimensions) throw new Error("photo_format_invalid");
  }
  if (!dimensions) throw new Error("photo_format_invalid");
  if (
    dimensions.width < MIN_DIMENSION ||
    dimensions.height < MIN_DIMENSION ||
    dimensions.width > MAX_DIMENSION ||
    dimensions.height > MAX_DIMENSION ||
    dimensions.width * dimensions.height > MAX_PIXELS
  ) {
    throw new Error("photo_dimensions_invalid");
  }
  return {
    format,
    width: dimensions.width,
    height: dimensions.height,
    contentType: format === "jpeg" ? "image/jpeg" : "image/png",
  };
}
