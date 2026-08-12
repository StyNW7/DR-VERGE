/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public DR-VERGE inference endpoint. Empty while the model is undeployed. */
  readonly VITE_MODEL_API_URL?: string;
  /** "true" forces mock inference; defaults to true when no real path exists. */
  readonly VITE_USE_MOCK_MODEL?: string;
  /** "false" disables the in-browser ONNX model. Defaults to enabled. */
  readonly VITE_USE_LOCAL_MODEL?: string;
  /** Directory holding model.onnx, model.onnx.data and metadata.json. */
  readonly VITE_LOCAL_MODEL_URL?: string;
  /** Link to downloadable sample dual-view fundus pairs. */
  readonly VITE_SAMPLE_DATASET_URL?: string;
  /** Link to the paper PDF. */
  readonly VITE_PAPER_URL?: string;
  /** Link to the source repository. */
  readonly VITE_GITHUB_URL?: string;
  /** Institution name shown in the footer and research metadata. */
  readonly VITE_INSTITUTION?: string;
  /** Inference request timeout in milliseconds. */
  readonly VITE_REQUEST_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
