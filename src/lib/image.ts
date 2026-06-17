/**
 * Reads an image file and returns a small, compressed JPEG data URL — small
 * enough to store inline in the synced session record without bloating the
 * Firestore document. Downscales to fit within `maxDim` and steps the JPEG
 * quality down until the result is under ~120 KB.
 */
export async function fileToThumbnail(file: File, maxDim = 720): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);

  let quality = 0.6;
  let out = canvas.toDataURL('image/jpeg', quality);
  // ~120 KB cap (data URL length is a rough proxy for byte size).
  while (out.length > 160_000 && quality > 0.25) {
    quality -= 0.12;
    out = canvas.toDataURL('image/jpeg', quality);
  }
  return out;
}
