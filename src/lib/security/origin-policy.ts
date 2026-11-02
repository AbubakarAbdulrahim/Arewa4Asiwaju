export function isTrustedOrigin(
  origin: string | null,
  requestOrigin: string,
  configuredOrigins: readonly string[],
): boolean {
  if (!origin) return false;

  try {
    const parsedOrigin = new URL(origin);
    if (!["http:", "https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== origin) {
      return false;
    }

    const trustedOrigins = [requestOrigin, ...configuredOrigins].map(
      (value) => new URL(value).origin,
    );
    return trustedOrigins.includes(parsedOrigin.origin);
  } catch {
    return false;
  }
}
