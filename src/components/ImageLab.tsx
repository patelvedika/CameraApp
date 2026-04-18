"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  heicToJpegFile,
  isHeicLike,
  isRenderableRasterImage,
} from "@/lib/heic";
import {
  PRESETS,
  type Preset,
  type PresetId,
  getPreset,
  renderWithPreset,
} from "@/lib/presets";

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };
    img.src = url;
  });
}

export function ImageLab() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceObjectUrl, setSourceObjectUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [presetId, setPresetId] = useState<PresetId>("kodachrome");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compare, setCompare] = useState(52);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const preset = useMemo(() => getPreset(presetId), [presetId]);

  const disposeSourceUrl = useCallback(() => {
    setSourceObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const removeImage = useCallback(() => {
    disposeSourceUrl();
    setSourceFile(null);
    setNaturalSize(null);
    setResultUrl(null);
    imgRef.current = null;
    setError(null);
    setCompare(52);
    if (inputRef.current) inputRef.current.value = "";
  }, [disposeSourceUrl]);

  const onPickFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !isRenderableRasterImage(file)) {
      setError("Please choose a JPG, PNG, WebP, or HEIC/HEIF file.");
      return;
    }
    setError(null);
    setBusy(true);
    disposeSourceUrl();
    try {
      let working = file;
      if (isHeicLike(file)) {
        try {
          working = await heicToJpegFile(file);
        } catch {
          setError(
            "Could not convert this HEIC/HEIF file. Try another photo, or export as JPEG from Photos.",
          );
          setSourceFile(null);
          setNaturalSize(null);
          setResultUrl(null);
          imgRef.current = null;
          return;
        }
      }
      const img = await loadImageFromFile(working);
      const url = URL.createObjectURL(working);
      setSourceFile(working);
      setSourceObjectUrl(url);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      imgRef.current = img;
    } catch {
      setError("We could not read that image. Try another file.");
      setSourceFile(null);
      setNaturalSize(null);
      setResultUrl(null);
      imgRef.current = null;
    } finally {
      setBusy(false);
    }
  };

  const reprocess = useCallback(
    (p: Preset, img: HTMLImageElement | null, nw: number, nh: number, srcUrl: string | null) => {
      if (!img || !srcUrl) return;
      if (p.id === "original") {
        setResultUrl(srcUrl);
        return;
      }
      setResultUrl(renderWithPreset(img, nw, nh, p));
    },
    [],
  );

  useEffect(() => {
    if (!imgRef.current || !naturalSize || !sourceObjectUrl) return;
    reprocess(
      preset,
      imgRef.current,
      naturalSize.w,
      naturalSize.h,
      sourceObjectUrl,
    );
  }, [preset, naturalSize, sourceObjectUrl, reprocess]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void onPickFiles(e.dataTransfer.files);
  };

  const onDownload = () => {
    if (!resultUrl || !sourceFile) return;
    const a = document.createElement("a");
    const base = sourceFile.name.replace(/\.[^.]+$/, "");
    a.href = resultUrl;
    a.download = `${base}-${preset.id}.jpg`;
    a.click();
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/80">
            PixelMuse Lab
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Camera-room looks, on your photos
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Drop a shot, pick a film or sensor profile, and export a JPEG tuned
            for vintage and early-digital character — built for quick iteration
            before you share.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(251,191,36,0.35)] transition hover:bg-amber-300"
          >
            {sourceObjectUrl ? "Replace image" : "Upload image"}
          </button>
          <button
            type="button"
            disabled={!sourceObjectUrl}
            onClick={removeImage}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-red-400/30 hover:bg-red-950/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/5 disabled:hover:text-zinc-100"
          >
            Remove photo
          </button>
          <button
            type="button"
            disabled={!resultUrl || !sourceFile}
            onClick={onDownload}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download JPEG
          </button>
        </div>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={(e) => void onPickFiles(e.target.files)}
      />

      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.12),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22%3E%3Cpath d=%22M0 0h1v1H0z%22 fill=%22%23fff%22/%3E%3C/svg%3E')]" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="flex min-h-[320px] flex-col gap-4">
            {!sourceObjectUrl ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 px-6 py-16 text-center transition hover:border-amber-400/40 hover:bg-zinc-900/50"
              >
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400 group-hover:text-amber-200/90">
                  Drag & drop
                </span>
                <span className="mt-4 text-lg font-medium text-zinc-100">
                  Add a photo to open the lab
                </span>
                <span className="mt-2 max-w-sm text-sm text-zinc-500">
                  JPG, PNG, WebP, or iPhone HEIC — processed locally in your
                  browser.
                </span>
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <div className="relative aspect-[4/3] w-full sm:aspect-video">
                    {resultUrl && sourceObjectUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- blob/data URLs */}
                        <img
                          src={resultUrl}
                          alt="Processed preview"
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs */}
                          <img
                            src={sourceObjectUrl}
                            alt="Original preview"
                            className="absolute inset-0 h-full w-full object-contain"
                          />
                        </div>
                        <div
                          className="pointer-events-none absolute inset-y-0 w-px bg-white/70 shadow-[0_0_20px_rgba(0,0,0,0.6)]"
                          style={{ left: `${compare}%` }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={compare}
                          onChange={(e) => setCompare(Number(e.target.value))}
                          className="absolute inset-0 z-10 w-full cursor-ew-resize opacity-0"
                          aria-label="Compare before and after"
                        />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                        Preparing preview…
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 px-4 py-3 text-xs text-zinc-400">
                    <span>Drag the slider to compare original vs look</span>
                    <div className="flex items-center gap-3">
                      {naturalSize && (
                        <span className="font-mono text-[11px] text-zinc-500">
                          {naturalSize.w} × {naturalSize.h}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={removeImage}
                        className="rounded-full border border-transparent px-2 py-1 text-[11px] font-medium text-zinc-400 transition hover:border-red-400/25 hover:bg-red-950/30 hover:text-red-100"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                </div>
                {busy && (
                  <p className="text-center text-xs text-amber-200/80">
                    Processing…
                  </p>
                )}
              </div>
            )}
            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
          </div>

          <aside className="flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Looks</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Each profile stacks color science, grain, and edge falloff to
                mimic real camera families.
              </p>
            </div>
            <ul className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:max-h-none">
              {PRESETS.map((p: Preset) => {
                const active = p.id === presetId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setPresetId(p.id)}
                      disabled={!sourceObjectUrl}
                      className={[
                        "flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition",
                        active
                          ? "border-amber-400/50 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]"
                          : "border-white/5 bg-zinc-950/40 hover:border-white/15 hover:bg-zinc-900/60",
                        !sourceObjectUrl ? "cursor-not-allowed opacity-40" : "",
                      ].join(" ")}
                    >
                      <span className="text-sm font-medium text-zinc-50">
                        {p.label}
                      </span>
                      <span className="mt-0.5 text-xs text-zinc-500">
                        {p.subtitle}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
