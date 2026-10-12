import "server-only";
import { env } from "@/lib/env";
import { generateMembershipCardPdfTemplate } from "@/lib/cards/pdf-template";
import type { CardGenerationInput } from "@/lib/cards/pdf-template";

export type { CardGenerationInput, CardGenerationResult } from "@/lib/cards/pdf-template";

export function generateMembershipCardPdf(input: CardGenerationInput) {
  return generateMembershipCardPdfTemplate(input, env.NEXT_PUBLIC_APP_URL);
}
