import { siteConfig } from "@/config/siteConfig";
import { formatBytes } from "./formatting";

/**
 * Upload validation.
 *
 * This checks that a file is a plausible image of an acceptable type and size.
 * It deliberately does NOT attempt to judge whether the image is a fundus
 * photograph, or which retinal field it shows — the browser cannot do that, and
 * pretending to would be fake analysis presented as real.
 */

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export interface ImageMeta {
  width: number;
  height: number;
}

export interface UploadedImage {
  file: File;
  /** Object URL for preview. Must be revoked when replaced or cleared. */
  previewUrl: string;
  meta: ImageMeta | null;
}

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return siteConfig.acceptedExtensions.some((ext) => lower.endsWith(ext));
}

export function validateImageFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return { ok: false, error: "No file was selected." };
  }

  // Some systems report an empty or unexpected MIME type, so the extension is
  // accepted as a fallback rather than rejecting a legitimate JPEG outright.
  const typeOk =
    (siteConfig.acceptedMimeTypes as readonly string[]).includes(file.type) ||
    (file.type === "" && hasAcceptedExtension(file.name));

  if (!typeOk) {
    return {
      ok: false,
      error: `Unsupported file type. Please upload a JPG, JPEG, or PNG image.`,
    };
  }

  if (file.size === 0) {
    return { ok: false, error: "That file appears to be empty. Please choose another image." };
  }

  if (file.size > siteConfig.maxUploadBytes) {
    return {
      ok: false,
      error: `File is too large (${formatBytes(file.size)}). The maximum is ${formatBytes(
        siteConfig.maxUploadBytes,
      )}.`,
    };
  }

  return { ok: true };
}

/**
 * Reads intrinsic dimensions for the metadata panel.
 *
 * Resolves to null rather than rejecting: failing to read dimensions is a
 * cosmetic loss, and it must never block an otherwise valid upload.
 */
export function readImageMeta(file: File): Promise<ImageMeta | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    let settled = false;

    const finish = (meta: ImageMeta | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(meta);
    };

    img.onload = () => finish({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => finish(null);
    // A decode that never settles must not leave the caller hanging.
    window.setTimeout(() => finish(null), 8000);
    img.src = url;
  });
}

export const acceptAttribute = siteConfig.acceptedMimeTypes.join(",");
