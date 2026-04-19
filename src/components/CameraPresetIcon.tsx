import type { PresetId } from "@/lib/presets";

type Props = {
  id: PresetId;
  className?: string;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Line-art silhouettes tuned to each look (not official trademarks). */
export function CameraPresetIcon({ id, className = "h-10 w-10" }: Props) {
  const common = {
    className: `shrink-0 ${className}`,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "original":
      /* Aperture / “clean optical” */
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.25" {...stroke} />
          <path
            d="M12 5.5v2.2M12 16.3v2.2M5.5 12h2.2M16.3 12h2.2M7.3 7.3l1.55 1.55M15.15 15.15l1.55 1.55M7.3 16.7l1.55-1.55M15.15 8.85l1.55-1.55"
            {...stroke}
            strokeWidth={1.25}
          />
        </svg>
      );

    case "kodachrome":
      /* 35mm film SLR with prism hump */
      return (
        <svg {...common}>
          <path d="M5 11.5h13.5v4.5H5z" {...stroke} />
          <path d="M10 11.5V9.5h4v2" {...stroke} />
          <circle cx="8.25" cy="13.75" r="2.6" {...stroke} />
          <path d="M18.5 12.5v2.5" {...stroke} />
        </svg>
      );

    case "superia":
      /* Compact film / daylight snap — low profile, offset lens */
      return (
        <svg {...common}>
          <rect x="5" y="10" width="13" height="6" rx="1" {...stroke} />
          <circle cx="8.5" cy="13" r="2.35" {...stroke} />
          <path d="M15 11.25h3v3.5H15z" {...stroke} />
          <path d="M16.25 10v1.25" {...stroke} />
        </svg>
      );

    case "disposable":
      /* Box disposable — small lens, flash window */
      return (
        <svg {...common}>
          <rect x="5.5" y="9" width="13" height="8" rx="0.75" {...stroke} />
          <circle cx="8.75" cy="14.25" r="1.85" {...stroke} />
          <rect x="13.5" y="10.25" width="3.25" height="2" rx="0.35" {...stroke} />
          <path d="M7 9V8h10v1" {...stroke} />
        </svg>
      );

    case "early-ccd":
      /* Early 2000s brick point-and-shoot */
      return (
        <svg {...common}>
          <rect x="5" y="9.5" width="14" height="7.5" rx="0.9" {...stroke} />
          <circle cx="12" cy="13.25" r="3.1" {...stroke} />
          <circle cx="17.25" cy="11.25" r="0.55" fill="currentColor" />
          <circle cx="18.35" cy="11.25" r="0.55" fill="currentColor" />
          <path d="M6.5 9.5V8.75h4V9.5" {...stroke} />
        </svg>
      );

    case "coolpix-4300":
      /* Nikon-style compact: grip, offset big lens */
      return (
        <svg {...common}>
          <path d="M6 10.5h11.5v6H6z" {...stroke} />
          <circle cx="9.25" cy="13.5" r="2.85" {...stroke} />
          <path d="M17.5 10.5v6l2.25-1.2V11.7L17.5 10.5z" {...stroke} />
          <path d="M14.5 11h2.25v1.25H14.5z" {...stroke} />
        </svg>
      );

    case "vhs":
      /* Handycam — flip screen, barrel zoom */
      return (
        <svg {...common}>
          <path d="M5.5 10h8.5v7H5.5z" {...stroke} />
          <path d="M14 12.5h5.5l1.5 1v1l-1.5 1H14" {...stroke} />
          <path d="M7 10V8.5h5.5V10" {...stroke} />
          <circle cx="9.5" cy="14" r="1.35" {...stroke} />
        </svg>
      );

    case "polaroid":
      /* Instant square — eject slot, front lens */
      return (
        <svg {...common}>
          <rect x="6" y="7" width="12" height="12" rx="1" {...stroke} />
          <circle cx="10" cy="11.5" r="2.2" {...stroke} />
          <path d="M7.5 15.5h9" {...stroke} />
          <path
            d="M7.5 17h9"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
          />
        </svg>
      );

    case "dslr-neutral":
      /* Modern DSLR with prism and grip */
      return (
        <svg {...common}>
          <path d="M5 11.5h12.5v5H5z" {...stroke} />
          <path d="M9.5 11.5V9h5v2.5" {...stroke} />
          <circle cx="8" cy="14" r="2.5" {...stroke} />
          <path d="M17.5 12v4.5" {...stroke} />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <rect x="6" y="9" width="12" height="7" rx="1" {...stroke} />
          <circle cx="12" cy="12.5" r="2.5" {...stroke} />
        </svg>
      );
  }
}
