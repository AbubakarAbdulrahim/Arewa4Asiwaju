const voterCardNotice =
  "If you choose Yes for voter-card possession and submit a card number, it is stored with your private membership record for movement membership administration. It is not printed on your ID card. Contact the movement to request correction or deletion.";

export function buildRegistrationNotice(baseNotice: string): string {
  return [baseNotice, voterCardNotice].join("\n\n");
}
