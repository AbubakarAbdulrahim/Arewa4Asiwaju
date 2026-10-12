import { en } from "./en";
import { ha } from "./ha";

export type Locale = "en" | "ha";
export const messages = { en, ha } as const;
export function getMessages(locale: Locale) {
  return messages[locale];
}
