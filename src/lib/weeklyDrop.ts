import type { PresetId } from "./presets";

/** Looks that make sense as a “drop” (skip plain / original). */
const DROP_POOL: PresetId[] = [
  "kodachrome",
  "superia",
  "disposable",
  "early-ccd",
  "coolpix-4300",
  "vhs",
  "polaroid",
  "dslr-neutral",
];

/** One line per look — why this week’s drop matters for the story / demo. */
export const WEEKLY_DROP_BLURB: Partial<Record<PresetId, string>> = {
  kodachrome: "Golden-hour nostalgia — one look, one week, easy to post.",
  superia: "Daylight greens and punch — great for outdoor weekend shots.",
  disposable: "Flash-party energy — perfect for group pics and night outs.",
  "early-ccd": "Y2K digicam grit — lean into the lo-fi comeback.",
  "coolpix-4300": "Cool Nikon JPEG color — the iconic compact-C CCD vibe.",
  vhs: "Tape-era warmth — make stills feel like paused camcorder footage.",
  polaroid: "Soft blacks, creamy mids — instant-camera mood without the film.",
  "dslr-neutral": "Clean pro color — when you still want a camera, not a toy.",
};

function mondayStartLocal(d = new Date()): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function stableIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

/** Featured look for the current calendar week (local Monday bucket). No API. */
export function getWeeklyDropInfo(d = new Date()): {
  presetId: PresetId;
  /** e.g. "Apr 14, 2026" — Monday that starts this week */
  weekStartsLabel: string;
  weekKey: string;
} {
  const monday = mondayStartLocal(d);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");
  const weekKey = `${y}-${m}-${day}`;
  const presetId = DROP_POOL[stableIndex(weekKey, DROP_POOL.length)];
  const weekStartsLabel = monday.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return { presetId, weekStartsLabel, weekKey };
}

export function weeklyDropBlurbFor(presetId: PresetId): string {
  return (
    WEEKLY_DROP_BLURB[presetId] ??
    "A fresh featured look — try it on this week’s photos."
  );
}
