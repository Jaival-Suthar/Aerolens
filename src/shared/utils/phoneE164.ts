/** Aligns with backend `utils/phone-validator.js` E164_STRICT_REGEX */
export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function isLikelyE164(value: string): boolean {
  return E164_REGEX.test(value.trim());
}
