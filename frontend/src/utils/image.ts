/**
 * Resizes a picked image file down to a small JPEG and returns it as a
 * data: URL — this is what lets the product form accept a photo straight
 * from the shop owner's phone/computer with no external file host or
 * upload endpoint. The backend's `imageUrl` column is a plain string, so a
 * (compressed, capped) data URL is a drop-in fit: no schema or API change
 * needed, and it stays well under the request body size limit.
 */
export async function resizeImageToDataUrl(file: File, maxDimension = 640, quality = 0.72): Promise<string> {
  const original = await readFileAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return original; // Extremely unlikely, but fall back to the untouched image rather than fail.
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}
