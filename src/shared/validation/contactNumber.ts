/**
 * Contact number: optional leading +, then only digits and common separators.
 * Valid when the digit count is 10–15 (E.164-style length).
 */
export const CONTACT_NUMBER_ERROR_MESSAGE =
  "Enter a valid contact number: 10–15 digits. You may use +, spaces, dashes, or parentheses.";

const ALLOWED_CHARS = /^\+?[\d\s().-]+$/;

export function isValidContactNumber(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (!ALLOWED_CHARS.test(t)) return false;
  const digits = t.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
