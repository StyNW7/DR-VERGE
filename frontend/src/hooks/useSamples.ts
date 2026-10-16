import { useEffect, useState } from "react";
import { SAMPLE_MANIFEST_URL, type SampleEntry, type SampleManifest } from "@/data/samples";

/**
 * Loads the curated sample manifest shipped in `/public/samples`.
 *
 * Resolves to `null` on any failure: the picker is a convenience, and the demo
 * must still work (by upload) when the manifest is missing.
 */
export function useSampleManifest(): { manifest: SampleManifest | null; loading: boolean } {
  const [manifest, setManifest] = useState<SampleManifest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(SAMPLE_MANIFEST_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SampleManifest | null) => {
        if (cancelled) return;
        setManifest(data && Array.isArray(data.samples) && data.samples.length > 0 ? data : null);
      })
      .catch(() => {
        if (!cancelled) setManifest(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { manifest, loading };
}

/**
 * Fetches one field of a sample as a real `File`, so it goes through exactly the
 * same validation and inference path as an image the visitor uploads.
 * The filename carries the eye id only — never the grade.
 */
export async function fetchSampleFile(sample: SampleEntry, field: "macula" | "disc"): Promise<File> {
  const url = field === "macula" ? sample.macula : sample.disc;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sample image unavailable (${res.status})`);
  const blob = await res.blob();
  return new File([blob], `${sample.sample_id}_${field}.jpg`, {
    type: blob.type || "image/jpeg",
  });
}
