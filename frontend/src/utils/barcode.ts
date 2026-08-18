/**
 * Derives a scannable EAN-13-style barcode from a product's SKU, so a shop
 * owner who only types an SKU still gets a real, printable/scannable
 * barcode without having to invent one by hand.
 *
 * The number itself is just a deterministic hash of the SKU (same SKU
 * always produces the same barcode) — it carries no external meaning, so
 * it's built inside the "2xxxxxxxxxxxx" prefix range that GS1 reserves for
 * internal/in-store use (never assigned to real retail products), with a
 * proper EAN-13 check digit so real barcode scanners accept it.
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

export function generateBarcodeFromSku(sku: string): string {
  const trimmed = sku.trim();
  if (!trimmed) return "";
  const body = hashToDigits(trimmed, 11);
  const digits12 = `2${body}`;
  return digits12 + String(ean13CheckDigit(digits12));
}
