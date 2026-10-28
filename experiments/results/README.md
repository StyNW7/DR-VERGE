# 📊 results/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

Seluruh keluaran **run final DR-VERGE** (`enhanced_v1_20260811`) yang dihasilkan oleh [`../notebooks/full_pipeline_notebook_enhanced.ipynb`](../notebooks/full_pipeline_notebook_enhanced.ipynb). Setiap angka di paper dapat ditelusuri kembali ke berkas di folder ini.

```text
DR-VERGE final run completed successfully.
run_tag        : enhanced_v1_20260811
mode           : FULL RUN
gates          : 36/36 passed (30 blocking, all passed)
method M*      : dual_csd (seed 3407)
deployment     : qat_int8 (seed 42, QAT_INT8), verified=True
evaluated runs : 70
```

> [!IMPORTANT]
> Folder ini adalah **artefak historis dari satu eksekusi** dan tidak pernah dibuat ulang di tempat. Isinya dikurasi: hanya artefak yang dibutuhkan untuk memverifikasi dan mereproduksi setiap angka (lihat [Yang sengaja tidak disertakan](#-yang-sengaja-tidak-disertakan)). Model ONNX untuk demo ada di [`../../frontend/public/models/`](../../frontend/public/models/).

---

## 🗂️ Struktur

```text
results/
├── FINAL_RUN_COMPLETE.txt        penanda run selesai — hanya ditulis bila semua blocking gate lulus
├── run_summary.json              ringkasan seluruh run dalam satu berkas
├── rq1_verdict.json              keputusan RQ1 (CSD vs tiga pembanding)
├── deployment_choice.json        varian deployment terpilih beserta aturan dan alasannya
├── deployment_verification.json  verifikasi muat-ulang artefak deployment
│
├── tables/        34 CSV — angka di balik setiap klaim
├── figures/       14 gambar × 3 berkas (.png · _caption.txt · _data.csv)
├── metrics/       5 berkas diagnostik (metrik mentah per run, peringatan collapse, gradien CSD, ...)
├── predictions/   prediksi per sampel: test/ (70 berkas) · validation/ (30 berkas)
├── configs/       konfigurasi yang dikunci sebelum run + catatan lingkungan
└── splits/        partisi tingkat mata yang persis dipakai (train 800 · val 200 · test 550)
```

---

## 🔎 Mulai dari mana

| Pertanyaan | Berkas |
|---|---|
| Apakah run memverifikasi dirinya? | [`tables/table_gate_report.csv`](tables/table_gate_report.csv) — 36/36 lulus |
| Apakah angka utama konsisten dengan prediksi mentah? | [`tables/table_results_audit.csv`](tables/table_results_audit.csv) — 265/265 cocok |
| Performa setiap kondisi (QWK, Macro-F1, MAE, SER, dll.) | [`tables/table_predictive_performance.csv`](tables/table_predictive_performance.csv) |
| Statistik RQ1 (CI, permutasi, Holm) | [`tables/table_statistics_primary.csv`](tables/table_statistics_primary.csv) |
| Metrik mekanisme CSD (ShiftL1, CosAgree, BenefitCorr) | [`tables/table_csd_mechanism.csv`](tables/table_csd_mechanism.csv) |
| Ukuran, latensi, dan _throughput_ | [`tables/table_efficiency.csv`](tables/table_efficiency.csv) |
| Retensi QWK setelah kuantisasi | [`tables/table_retention_main.csv`](tables/table_retention_main.csv) |
| Dasar keputusan _deployment_ (validasi) | [`tables/table_deployment_eligibility.csv`](tables/table_deployment_eligibility.csv) · [`deployment_choice.json`](deployment_choice.json) |
| Hasil eksternal DeepDRiD | [`tables/table_external_summary.csv`](tables/table_external_summary.csv) · [`tables/table_external_ci.csv`](tables/table_external_ci.csv) |
| Pemilihan metode dan _hyperparameter_ | [`tables/table_method_selection.csv`](tables/table_method_selection.csv) · [`configs/selected_hyperparameters.json`](configs/selected_hyperparameters.json) |
| Stage A (resolusi & _sampling_) | [`tables/table_stage_a_recipe_selection.csv`](tables/table_stage_a_recipe_selection.csv) |
| Ketika CI dan permutasi tidak sepakat | [`tables/table_ci_permutation_disagreement.csv`](tables/table_ci_permutation_disagreement.csv) |
| Label resmi setiap kondisi | [`tables/table_condition_labels.csv`](tables/table_condition_labels.csv) |

---

## 🖼️ Gambar

Setiap gambar tersedia dalam **`.png` (400 dpi)**, disertai `_caption.txt` dan `_data.csv` yang memuat angka persis yang digambarkan — sehingga setiap gambar dapat diaudit tanpa menjalankan ulang notebook.

| Gambar | Menunjukkan |
|---|---|
| [`fig_01_dataset`](figures/fig_01_dataset.png) | Jumlah mata DRTiD per partisi dan _grade_ |
| [`fig_02_performance`](figures/fig_02_performance.png) | Performa setiap kondisi pada uji internal (rerata ± SD antar-_seed_) |
| [`fig_03_ordinal_safety`](figures/fig_03_ordinal_safety.png) | _Severe error_ (selisih ≥ 2 _grade_) — kesalahan yang paling berdampak klinis |
| [`fig_04_per_grade_recall`](figures/fig_04_per_grade_recall.png) | _Recall_ per _grade_ |
| [`fig_05_confusion`](figures/fig_05_confusion.png) | Matriks konfusi ternormalisasi per baris |
| [`fig_06_dual_view_gain`](figures/fig_06_dual_view_gain.png) | **Premis** — keuntungan _dual-view_ terhadap _auxiliary head_ dan model _single-view_ independen |
| [`fig_07_csd_mechanism`](figures/fig_07_csd_mechanism.png) | **RQ1 mekanisme** — CSD terbaik pada ketiga metrik _shift fidelity_ |
| [`fig_08_csd_gradient`](figures/fig_08_csd_gradient.png) | Rasio gradien CSD/_task_ — bukti bahwa CSD benar-benar memengaruhi pembelajaran |
| [`fig_09_retention`](figures/fig_09_retention.png) | Retensi QWK setelah kuantisasi (garis 95% = kriteria rekayasa) |
| [`fig_10_efficiency`](figures/fig_10_efficiency.png) | Ukuran artefak dan latensi CPU satu _thread_ |
| [`fig_11_pareto`](figures/fig_11_pareto.png) | **RQ2** — _trade-off_ QWK vs latensi CPU |
| [`fig_12_forest`](figures/fig_12_forest.png) | **RQ1 prediktif** — seluruh perbandingan pra-registrasi beserta CI |
| [`fig_13_external_setc`](figures/fig_13_external_setc.png) | Evaluasi konfirmatori eksternal DeepDRiD Set-C |
| [`fig_14_internal_vs_external`](figures/fig_14_internal_vs_external.png) | Internal vs eksternal — generalisasi lintas domain |

---

## 🏷️ Konvensi penamaan

| Pola | Contoh | Arti |
|---|---|---|
| `predictions/<split>/DRTiD_<split>_<kondisi>_seed<s>_<presisi>.csv` | `DRTiD_test_dual_csd_seed42_FP32.csv` | Satu baris per mata: _grade_ asli, _grade_ prediksi, skor kumulatif |
| `metrics/all_conditions_raw.csv` | — | Seluruh metrik untuk setiap kondisi × _seed_ × presisi (70 run) |
| `metrics/csd_gradient_diagnostic.json` | — | Bukti bahwa CSD menyumbang gradien pada _backbone_ |
| `metrics/teacher_delta_distribution.csv` | — | Distribusi Δ milik _teacher_ (dasar skala _s_) |
| `metrics/deepdrid_exclusion_audit.csv` | — | Audit eksklusi citra DeepDRiD |

**Kondisi utama:** `macula_only`, `disc_only`, `dual_no_distill`, `dual_logitkd`, `dual_featkd`, `dual_csd`. **Ablasi:** `abl_csd_raw_smoothl1`, `abl_csd_kl_softmax`, `abl_csd_counterfactual`. **Varian RQ2:** `best_fp32`, `ptq_int8`, `qat_int8`, `ft_ptq_int8`, `fp32_ft_control`, `fp32_ft_plain`.

---

## ⚙️ Catatan reproduktibilitas

| Berkas | Isi |
|---|---|
| [`configs/config.json`](configs/config.json) | Seluruh konfigurasi yang dikunci (resolusi, _seed_, _grid_, B, P, engine kuantisasi) |
| [`configs/environment.json`](configs/environment.json) | Versi Python, PyTorch, CUDA, GPU, dan engine kuantisasi |
| [`configs/requirements_exact.txt`](configs/requirements_exact.txt) | Versi paket persis |
| [`configs/split_manifest.json`](configs/split_manifest.json) | Manifest partisi DRTiD |
| [`configs/csd_scale.json`](configs/csd_scale.json) | Skala global CSD _s_ = 0,1073 |
| [`configs/threshold_calibration.json`](configs/threshold_calibration.json) | _Threshold_ keputusan terpilih per kondisi |
| [`configs/quantization_info.json`](configs/quantization_info.json) · [`quantized_modules_by_seed.json`](configs/quantized_modules_by_seed.json) | Cakupan operator kuantisasi — identik untuk PTQ/QAT/FT-PTQ di kelima _seed_ |

---

## 🧹 Yang sengaja tidak disertakan

Repositori hanya memuat artefak yang **tidak dapat diturunkan ulang** dari berkas lain. Berikut yang disimpan lokal saja beserta alasannya:

| Tidak disertakan | Alasan |
|---|---|
| Bobot model (`*.pt`, `*.pth`, `*.pt2`) | Ukurannya besar; model ONNX untuk demo ada di `frontend/public/models/` |
| Matriks konfusi per run | Dapat dihitung langsung dari `predictions/` (lihat di bawah) |
| Riwayat pelatihan per epoch | Tidak dibutuhkan untuk mereproduksi angka; ringkasan gradien CSD ada di `metrics/` dan `fig_08` |
| Versi `.svg` / `.pdf` gambar | Duplikat format dari `.png` yang sama |
| Prediksi per sampel DeepDRiD | Hasil eksternal tersedia sebagai tabel (`table_external_*.csv`) dan gambar `fig_13`/`fig_14` |

Contoh menghitung ulang matriks konfusi dan QWK dari prediksi per sampel:

```python
import pandas as pd
from sklearn.metrics import cohen_kappa_score, confusion_matrix

d = pd.read_csv("predictions/test/DRTiD_test_dual_csd_seed42_FP32.csv")
print(confusion_matrix(d.true_grade, d.pred_grade, labels=range(5)))
print(cohen_kappa_score(d.true_grade, d.pred_grade, weights="quadratic", labels=range(5)))
```
