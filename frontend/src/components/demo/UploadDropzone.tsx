import { useCallback, useId, useRef, useState } from "react";
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
  hint: string;
  variant: "macula" | "disc";
  value: UploadedImage | null;
  error: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
  onZoom: () => void;
}) {
  const [dragging, setDragging] = useState(false);
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
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="mono text-[11px] tracking-[0.16em] text-subtle">{index}</span>
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-foreground">
            {label}
          </span>
        </div>
        {value && (
          <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Received
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
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-[4/3] w-full bg-surface">
            <img
              src={value.previewUrl}
              alt={`Uploaded ${label.toLowerCase()} fundus image: ${value.file.name}`}
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
                Zoom
              </button>
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12px] font-medium transition-colors hover:border-foreground disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Replace
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12px] font-medium transition-colors hover:border-foreground disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>

          {/* File metadata */}
          <dl className="grid grid-cols-3 gap-px border-t border-border bg-border text-[11px]">
            <div className="bg-card px-3 py-2.5">
              <dt className="text-subtle">File</dt>
              <dd className="mt-0.5 truncate font-medium" title={value.file.name}>
                {value.file.name}
              </dd>
            </div>
            <div className="bg-card px-3 py-2.5">
              <dt className="text-subtle">Resolution</dt>
              <dd className="mono mt-0.5 font-medium">
                {value.meta ? `${value.meta.width}×${value.meta.height}` : "—"}
              </dd>
            </div>
            <div className="bg-card px-3 py-2.5">
              <dt className="text-subtle">Size</dt>
              <dd className="mono mt-0.5 font-medium">{formatBytes(value.file.size)}</dd>
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
            "flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            dragging
              ? "border-foreground bg-muted scale-[0.99]"
              : error
                ? "border-foreground/60 bg-card"
                : "border-border bg-card hover:border-foreground/50 hover:bg-muted",
          )}
        >
          <div className="h-20 w-20 opacity-25">
            <FundusIllustration variant={variant} />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="inline-flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {dragging ? "Drop the image here" : "Drag and drop, or click to browse"}
            </div>
            <p className="max-w-[26ch] text-[11px] leading-relaxed text-muted-foreground">
              {hint}
            </p>
          </div>

          <span className="mono text-[9px] uppercase tracking-[0.14em] text-subtle">
            JPG · JPEG · PNG
          </span>
        </button>
      )}

      {/* Validation error */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2.5 inline-flex items-start gap-2 text-[12px] leading-relaxed text-foreground"
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
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${label} preview`}
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
            aria-label="Close preview"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-surface p-4">
          <img
            src={image.previewUrl}
            alt={`Full size preview of ${image.file.name}`}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>

        <div className="mono flex flex-wrap gap-x-6 gap-y-1 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          <span>
            {image.meta ? `${image.meta.width} × ${image.meta.height} px` : "Resolution —"}
          </span>
          <span>{formatBytes(image.file.size)}</span>
        </div>
      </div>
    </div>
  );
}
