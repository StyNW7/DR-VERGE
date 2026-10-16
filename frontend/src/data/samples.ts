/**
 * Demo sample eyes.
 *
 * The list itself is NOT duplicated here: the demo reads
 * `/samples/manifest.json` at runtime, so the curated set and its notices have
 * one source of truth. This file only declares the manifest's shape and the
 * single pair used to illustrate the home hero.
 */

export interface SampleEntry {
  sample_id: string;
  eye: "left" | "right";
  path: string;
  macula: string;
  disc: string;
  /** The reference grade. Never shown before inference has run. */
  ground_truth_grade: number;
  ground_truth_name: string;
  decision_margin: number;
}

export interface SampleManifest {
  count_eyes: number;
  curation_notice: string;
  measured_reference: {
    QWK: number;
    exact_accuracy: number;
    eyes: number;
    partition: string;
  };
  source: {
    dataset: string;
    license: string;
    url: string;
  };
  samples: SampleEntry[];
}

export const SAMPLE_MANIFEST_URL = "/samples/manifest.json";

/**
 * The hero illustration: a real DeepDRiD pair and the real cumulative scores
 * the shipped in-browser model (`best_student_fp32`, seed 3407) produces for it,
 * copied from `/samples/p24-r/meta.json`. Not a mock-up.
 */
export const heroExample = {
  sampleId: "p24-r",
  macula: "/samples/p24-r/macula.jpg",
  disc: "/samples/p24-r/disc.jpg",
  cumulativeScores: [0.9303, 0.9038, 0.7266, 0.36],
  decisionThreshold: 0.5,
  credit: "DeepDRiD · CC BY-SA 4.0",
} as const;
