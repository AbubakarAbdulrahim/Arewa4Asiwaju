export function getTotpQrDataUrl(qrCode: string): string {
  if (/^data:image\/svg\+xml(?:;[^,]*)?,/.test(qrCode)) return qrCode;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`;
}
