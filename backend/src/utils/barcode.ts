/**
 * Same deterministic EAN-13-style generator as the frontend's
 * utils/barcode.ts (kept in sync intentionally) — used here only for the
 * server-side fallback path, when a product is created with neither an SKU
 * nor a barcode and the frontend never got a chance to derive one on the
 * client. See that file for the full rationale.
 */

function hashToDigits(input: string, digits: number): string {
  const mod = 10n ** BigInt(digits);
  let hash = 0n;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 131n + BigInt(input.charCodeAt(i))) % mod;
  }
  return hash.toString().padStart(digits, "0");
}

function ean13CheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = Number(digits12[i]);
    sum += i % 2 === 0 ? d : d * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

export function generateBarcodeFromSku(sku: string, salt = ""): string {
  const trimmed = `${sku.trim()}${salt}`;
  if (!trimmed) return "";
  const body = hashToDigits(trimmed, 11);
  const digits12 = `2${body}`;
  return digits12 + String(ean13CheckDigit(digits12));
}
