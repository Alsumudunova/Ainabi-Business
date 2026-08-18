import QRCode from "qrcode";

/**
 * Kyrgyzstan has no single bank-agnostic scannable payment-QR standard we
 * can generate against without a merchant/PSP integration, so this QR just
 * encodes plain text (shop name, the owner's configured payment details,
 * and the amount) for the customer's own banking app to read — a cheaper,
 * typo-proof stand-in for reading a phone number aloud across the counter,
 * not an automated payment. The cashier still confirms payment by eye.
 */
export function buildPaymentQrText(businessName: string, qrPaymentInfo: string, amountLabel: string): string {
  return `${businessName}\n${qrPaymentInfo}\n${amountLabel}`;
}

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 220,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
