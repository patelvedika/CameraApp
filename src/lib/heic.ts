/** HEIC/HEIF from phones often lack a reliable MIME in the browser; fall back on extension. */
export function isHeicLike(file: File): boolean {
  const type = file.type.toLowerCase();
  if (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heif-sequence"
  ) {
    return true;
  }
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/** Decode HEIC/HEIF to JPEG so canvas and `<img>` work everywhere. */
export async function heicToJpegFile(file: File, quality = 0.92): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  const stem = file.name.replace(/\.(heic|heif)$/i, "") || "photo";
  return new File([blob], `${stem}.jpg`, { type: "image/jpeg" });
}

export function isRenderableRasterImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return isHeicLike(file);
}
