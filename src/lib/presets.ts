export type PresetId =
  | "original"
  | "kodachrome"
  | "superia"
  | "disposable"
  | "early-ccd"
  | "coolpix-4300"
  | "vhs"
  | "polaroid"
  | "dslr-neutral";

export type Preset = {
  id: PresetId;
  label: string;
  subtitle: string;
  /** CSS filter applied during the base draw */
  cssFilter: string;
  grain: number;
  vignette: number;
  scanlines?: number;
  liftShadows?: number;
};

export const PRESETS: Preset[] = [
  {
    id: "original",
    label: "Clean scan",
    subtitle: "No processing",
    cssFilter: "none",
    grain: 0,
    vignette: 0,
  },
  {
    id: "kodachrome",
    label: "Kodachrome 64",
    subtitle: "Warm film, punchy reds",
    cssFilter:
      "sepia(0.22) saturate(1.42) contrast(1.1) brightness(1.02) hue-rotate(-10deg)",
    grain: 0.22,
    vignette: 0.35,
    liftShadows: 0.04,
  },
  {
    id: "superia",
    label: "Fuji Superia",
    subtitle: "Greens in shadow, daylight snap",
    cssFilter:
      "saturate(1.18) contrast(1.06) brightness(1.03) hue-rotate(6deg)",
    grain: 0.14,
    vignette: 0.22,
  },
  {
    id: "disposable",
    label: "Disposable flash",
    subtitle: "Late 90s party cam",
    cssFilter:
      "brightness(1.1) contrast(1.22) saturate(1.32) hue-rotate(-4deg)",
    grain: 0.38,
    vignette: 0.45,
    liftShadows: 0.06,
  },
  {
    id: "early-ccd",
    label: "Early digital",
    subtitle: "2003 point-and-shoot",
    cssFilter:
      "contrast(1.12) saturate(0.88) brightness(1.05) hue-rotate(-2deg)",
    grain: 0.28,
    vignette: 0.18,
  },
  {
    id: "coolpix-4300",
    label: "Nikon Coolpix 4300",
    subtitle: "Best-selling 4MP Coolpix — default JPEG, cool CCD",
    cssFilter:
      "contrast(1.15) saturate(1.02) brightness(1.03) hue-rotate(-5deg)",
    grain: 0.26,
    vignette: 0.14,
    liftShadows: 0.03,
  },
  {
    id: "vhs",
    label: "VHS / Hi8",
    subtitle: "Tape warmth, soft chroma",
    cssFilter:
      "saturate(0.62) contrast(1.18) brightness(1.04) hue-rotate(14deg) blur(0.3px)",
    grain: 0.2,
    vignette: 0.55,
    scanlines: 0.12,
  },
  {
    id: "polaroid",
    label: "Polaroid fade",
    subtitle: "Lifted blacks, creamy mids",
    cssFilter:
      "brightness(1.06) contrast(0.9) saturate(0.82) sepia(0.12) hue-rotate(-4deg)",
    grain: 0.12,
    vignette: 0.25,
    liftShadows: 0.08,
  },
  {
    id: "dslr-neutral",
    label: "Modern DSLR",
    subtitle: "Neutral pro color",
    cssFilter: "contrast(1.1) saturate(1.06) brightness(0.99)",
    grain: 0.06,
    vignette: 0.12,
  },
];

function clamp(v: number, min = 0, max = 255) {
  return Math.min(max, Math.max(min, v));
}

function addGrain(imageData: ImageData, amount: number) {
  if (amount <= 0) return;
  const { data } = imageData;
  const amp = amount * 42;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * amp;
    data[i] = clamp(data[i] + n);
    data[i + 1] = clamp(data[i + 1] + n);
    data[i + 2] = clamp(data[i + 2] + n);
  }
}

function addVignette(imageData: ImageData, strength: number) {
  if (strength <= 0) return;
  const { width: w, height: h, data } = imageData;
  const cx = w / 2;
  const cy = h / 2;
  const maxD = Math.hypot(cx, cy) || 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = Math.hypot(x - cx, y - cy) / maxD;
      const v = 1 - Math.pow(d, 1.85) * strength;
      data[i] = clamp(data[i] * v);
      data[i + 1] = clamp(data[i + 1] * v);
      data[i + 2] = clamp(data[i + 2] * v);
    }
  }
}

function liftShadows(imageData: ImageData, lift: number) {
  if (!lift) return;
  const { data } = imageData;
  const add = lift * 255;
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (luma < 90) {
      data[i] = clamp(data[i] + add);
      data[i + 1] = clamp(data[i + 1] + add);
      data[i + 2] = clamp(data[i + 2] + add);
    }
  }
}

function addScanlines(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
  ctx.restore();
}

function fitSize(nw: number, nh: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(nw, nh));
  return {
    w: Math.max(1, Math.round(nw * scale)),
    h: Math.max(1, Math.round(nh * scale)),
  };
}

export function renderWithPreset(
  source: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number,
  preset: Preset,
  maxSide = 1400,
): string {
  const { w, h } = fitSize(naturalWidth, naturalHeight, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = preset.cssFilter;
  ctx.drawImage(source, 0, 0, w, h);
  ctx.filter = "none";

  const imageData = ctx.getImageData(0, 0, w, h);
  liftShadows(imageData, preset.liftShadows ?? 0);
  addGrain(imageData, preset.grain);
  addVignette(imageData, preset.vignette);
  ctx.putImageData(imageData, 0, 0);

  if (preset.scanlines) {
    addScanlines(ctx, w, h, preset.scanlines);
  }

  return canvas.toDataURL("image/jpeg", 0.92);
}

export function getPreset(id: PresetId): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
