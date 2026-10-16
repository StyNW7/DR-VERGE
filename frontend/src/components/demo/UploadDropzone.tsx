import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Upload,
  X,
  RefreshCw,
  Maximize2,
  AlertCircle,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/utils/formatting";
import { acceptAttribute, type UploadedImage } from "@/utils/fileValidation";
import { FundusIllustration } from "@/components/common/FundusIllustration";
import { useI18n } from "@/i18n/context";

/**
 * One of the two upload slots.
 *
 * Fully keyboard operable: the drop area is a real button, so Enter/Space open
 * the file picker and the focus ring lands where the user expects. Drag-and-drop
 * is an enhancement on top of that, not the only way in.
 */
export function UploadDropzone({
  index,
  label,
  hint,
  variant,
  value,
  error,
  disabled = false,
  onSelect,
  onClear,
  onZoom,
}: {
  index: string;
  label: string;
  hint: React.ReactNode;
  variant: "macula" | "disc";
  value: UploadedImage | null;
  error: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
  onZoom: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const { t, ts, lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) onSelect(file);
    },
    [disabled, onSelect],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragging(true);
    },
    [disabled],
  );

  return (
    <div className="flex flex-col">
      {/* Slot header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "mono flex h-6 w-6 items-center justify-center rounded-full border border-border text-[10px] text-foreground",
              "colorful:border-transparent colorful:bg-acc-solid colorful:font-semibold colorful:text-acc-fg",
              variant === "macula" ? "accent-coral" : "accent-amber",
            )}
          >
            {index}
          </span>
          <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
            {label}
          </span>
        </div>
        {value && (
          <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground colorful:font-semibold colorful:text-brand">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {t("Received", "Diterima")}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={acceptAttribute}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          // Reset so re-selecting the same filename still fires onChange.
          e.target.value = "";
        }}
      />

      {value ? (
        /* ---------- preview ---------- */
        <div className="group card-premium relative overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-black">
            <img
              src={value.previewUrl}
              alt={ts(
                `Uploaded ${label.toLowerCase()} fundus image: ${value.file.name}`,
                `Citra fundus ${label.toLowerCase()} yang diunggah: ${value.file.name}`,
              )}
              className="h-full w-full object-contain"
            />
            {/* Hover / focus-within actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/85 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                onClick={onZoom}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12px] font-medium transition-colors hover:border-foreground"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t("Zoom", "Perbesar")}
              </button>
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12px] font-medium transition-colors hover:border-foreground disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t("Replace", "Ganti")}
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12px] font-medium transition-colors hover:border-foreground disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {t("Remove", "Hapus")}
              </button>
            </div>
          </div>

          {/* File metadata */}
          <dl className="grid grid-cols-3 gap-px border-t border-border bg-border text-[11px]">
            <div className="bg-card px-3 py-2.5">
              <dt className="text-subtle">{t("File", "Berkas")}</dt>
              <dd className="mt-0.5 truncate font-medium" title={value.file.name}>
                {value.file.name}
              </dd>
            </div>
            <div className="bg-card px-3 py-2.5">
              <dt className="text-subtle">{t("Resolution", "Resolusi")}</dt>
              <dd className="mono mt-0.5 font-medium">
                {value.meta ? `${value.meta.width}×${value.meta.height}` : "—"}
              </dd>
            </div>
            <div className="bg-card px-3 py-2.5">
              <dt className="text-subtle">{t("Size", "Ukuran")}</dt>
              <dd className="mono mt-0.5 font-medium">{formatBytes(value.file.size, lang)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        /* ---------- empty dropzone ---------- */
        <button
          type="button"
          onClick={openPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          disabled={disabled}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "group relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ease-editorial",
            "disabled:cursor-not-allowed disabled:opacity-50",
            dragging
              ? "border-foreground bg-muted scale-[0.99] colorful:border-brand colorful:bg-brand-soft"
              : error
                ? "border-foreground/60 bg-card colorful:border-coral-solid/70 colorful:bg-coral-soft"
                : "border-border bg-card hover:border-foreground/50 hover:bg-surface colorful:border-brand-line colorful:hover:border-brand colorful:hover:bg-brand-soft/70",
          )}
        >
          <div className="dot-bg fade-mask-radial pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className={cn(
              "relative h-20 w-20 opacity-25 transition-all duration-500 group-hover:scale-105 group-hover:opacity-40",
              "colorful:text-acc-solid colorful:opacity-60 colorful:group-hover:opacity-90",
              variant === "macula" ? "accent-coral" : "accent-amber",
            )}
          >
            <FundusIllustration variant={variant} />
          </div>

          <div className="relative flex flex-col items-center gap-2">
            <span className="brand-fill flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
              <Upload className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="text-sm font-semibold">
              {dragging
                ? t("Drop the image here", "Lepaskan citra di sini")
                : t("Drag and drop, or click to browse", "Seret dan lepas, atau klik untuk memilih")}
            </div>
            <p className="max-w-[26ch] text-[11px] leading-relaxed text-muted-foreground">
              {hint}
            </p>
          </div>

          <span className="mono relative text-[9px] uppercase tracking-[0.14em] text-subtle">
            JPG · JPEG · PNG
          </span>
        </button>
      )}

      {/* Validation error */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2.5 inline-flex items-start gap-2 text-[12px] leading-relaxed text-foreground colorful:font-medium colorful:text-coral"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Full-size preview modal. */
export function ZoomModal({
  image,
  label,
  onClose,
}: {
  image: UploadedImage | null;
  label: string;
  onClose: () => void;
}) {
  const { t, ts, lang } = useI18n();

  // Escape closes the preview, as any dialog should.
  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={ts(`${label} preview`, `Pratinjau ${label}`)}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="mono truncate text-[11px] uppercase tracking-[0.14em]">
              {label}
            </span>
            <span className="truncate text-[12px] text-muted-foreground">
              {image.file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={ts("Close preview", "Tutup pratinjau")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-surface p-4">
          <img
            src={image.previewUrl}
            alt={ts(`Full size preview of ${image.file.name}`, `Pratinjau ukuran penuh ${image.file.name}`)}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>

        <div className="mono flex flex-wrap gap-x-6 gap-y-1 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          <span>
            {image.meta
              ? `${image.meta.width} × ${image.meta.height} px`
              : `${t("Resolution", "Resolusi")} —`}
          </span>
          <span>{formatBytes(image.file.size, lang)}</span>
        </div>
      </div>
    </div>
  );
}
