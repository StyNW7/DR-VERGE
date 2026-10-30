# 🔬 results/supplementary/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

Keluaran **analisis suplementer v2** DR-VERGE (`artifacts_enhanced_supplementary_v2_20261029`), dihasilkan oleh [`../../notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb`](../../notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb).

```text
SUPPLEMENTARY_RUN_COMPLETE
completed_at      : 2026-10-29T17:54:13
phase_status      : P0–P6 PASSED · FINAL PASSED
gates             : 56/56 passed
spec gates        : 25/25 covered
source_unchanged  : True   (21 checkpoint + 59 berkas sumber, SHA-256 identik sebelum/sesudah)
B_FINAL           : 10000
```

> [!IMPORTANT]
> **Inference-only dan eksploratori.** Analisis ini hanya **membaca** model beku dari run utama [`enhanced_v1_20260811`](../). Tidak ada pelatihan, penyetelan, re-kuantisasi, pencarian ambang, maupun pemilihan ulang model. Karena dirancang **setelah** hasil utama diketahui, seluruh hasilnya diberi label **eksploratori pasca-hoc**. Angka run utama (Tabel I–III paper, RQ2, keputusan _deployment_) **tidak berubah**.

---

## 🎯 Pertanyaan yang dijawab

| # | Pertanyaan | Jawaban singkat |
|---|---|---|
| 1 | Apakah keunggulan CSD pada fidelitas mekanisme didukung secara **inferensial**, bukan hanya deskriptif? | **Ya untuk ShiftL1** — CI 95% tidak memuat nol terhadap ketiga pembanding. CosAgree konklusif vs Logit-KD. BenefitCorr searah, belum konklusif |
| 2 | Apakah pola itu **bertahan** di DeepDRiD Set-C? | CSD **peringkat 1 pada ketiga metrik**; CosAgree konklusif vs NoDistill dan Logit-KD |
| 3 | **Mengapa** fidelitas yang lebih baik tidak menaikkan QWK? | Identitas eksak: selisih output = selisih agregasi dasar + selisih _shift_. CSD hanya menargetkan suku kedua |
| 4 | **Kapan** CSD paling bermanfaat? | Ketika _shift_ teacher **besar** (kuartil teratas) dan **tepat** (teacher benar) |
| 5 | Apakah hasil **stabil** terhadap pilihan metrik? | CSD tetap peringkat 1 BenefitCorr dengan Pearson maupun Spearman; kalibrasi setara student lain |

---

## 📌 Hasil inti

**Inferensi fidelitas mekanisme — DRTiD internal** (550 _examined-eye records_, 5 _seed_ berpasangan, _hierarchical paired bootstrap_ B = 10.000). Δ = CSD − pembanding.

| Pembanding | ΔShiftL1 ↓ | ΔCosAgree ↑ | ΔBenefitCorr ↑ |
|---|---|---|---|
| NoDistill | **−0,0249\*** [−0,0477; −0,0043] | +0,0852 [−0,0134; +0,1870] | +0,0882 [−0,0342; +0,2329] |
| Logit-KD | **−0,0331\*** [−0,0567; −0,0103] | **+0,1503\*** [+0,0263; +0,3011] | +0,1280 [−0,0038; +0,2643] |
| Feature-KD | **−0,0209\*** [−0,0408; −0,0012] | +0,0546 [−0,0225; +0,1407] | +0,1132 [−0,0390; +0,2662] |

<sub>\* CI 95% tidak memuat nol dan menguntungkan CSD. **4/9** kontras konklusif, **0/9** menguntungkan pembanding, **34/45** pasangan _seed_-kontras searah CSD, arah kesembilan kontras stabil pada _leave-one-seed-out_. Dengan model dianggap tetap (bootstrap record saja / permutasi + Holm), **9/9** kontras memisah dari nol (p<sub>Holm</sub> ≤ 0,0034) — ketidakpastian yang tersisa berasal dari jumlah _seed_, bukan ukuran data uji.</sub>

**Identitas dekomposisi** (residual numerik 0):

$$
p^{S}_{\text{dual}} - p^{T}_{\text{dual}} \;=\; \big(\bar p^{S} - \bar p^{T}\big) \;+\; \big(\Delta^{S} - \Delta^{T}\big), \qquad \bar p = \tfrac{1}{2}\,(p_{\text{mac}} + p_{\text{disc}})
$$

CSD memiliki selisih _shift_ terkecil (0,3509), tetapi selisih agregasi dasarnya (0,4361) lebih besar daripada Feature-KD (0,4217) dan NoDistill (0,4269); kesesuaian _grade_ dengan teacher 65,5% vs 66,1% (Feature-KD). Di 20 model _student_, QWK lebih berkaitan dengan selisih agregasi dasar (ρ = −0,52) daripada dengan ShiftL1 (ρ = −0,35).

Ringkasan lengkap: [`reports/SUPPLEMENTARY_RESULTS_OVERVIEW.md`](reports/SUPPLEMENTARY_RESULTS_OVERVIEW.md).

---

## 🗂️ Struktur

```text
supplementary/
├── SUPPLEMENTARY_RUN_COMPLETE.txt   penanda selesai — hanya ditulis bila seluruh gate lulus
├── tables/        27 CSV — statistik, dekomposisi, kuartil shift, subgrup, per-grade, kalibrasi
├── figures/       4 gambar × 3 berkas (.png · _caption.txt · _data.csv)
├── paper_tables/  tabel berformat Indonesia untuk paper (Tabel IV, Set-C, diagnostik)
├── reports/       laporan per fase P1–P5, ringkasan, audit reproduksibilitas, claim ledger
└── logs/          gate report, cek reproduksi, manifest checkpoint, lingkungan, run manifest
```

---

## 🔎 Mulai dari mana

| Pertanyaan | Berkas |
|---|---|
| Apakah run memverifikasi dirinya? | [`logs/gate_report.csv`](logs/gate_report.csv) — 56/56 lulus · [`SUPPLEMENTARY_RUN_COMPLETE.txt`](SUPPLEMENTARY_RUN_COMPLETE.txt) |
| Apakah hasil asli tereproduksi? | [`logs/reproduction_checks.csv`](logs/reproduction_checks.csv) — 156/156 cocok (selisih maks. 1,2 × 10⁻⁴) · [`logs/reproduction_checks_external.csv`](logs/reproduction_checks_external.csv) |
| Apakah model tidak berubah? | [`logs/checkpoint_manifest.csv`](logs/checkpoint_manifest.csv) — SHA-256 21 checkpoint |
| Inferensi mekanisme internal (9 kontras) | [`tables/table_mechanism_internal_stats.csv`](tables/table_mechanism_internal_stats.csv) · [`paper_tables/TABEL_INFERENSI_FIDELITAS_INTERNAL.csv`](paper_tables/TABEL_INFERENSI_FIDELITAS_INTERNAL.csv) |
| Generalisasi mekanisme Set-C | [`tables/table_mechanism_external_stats.csv`](tables/table_mechanism_external_stats.csv) · [`tables/table_mechanism_rank_internal_vs_external.csv`](tables/table_mechanism_rank_internal_vs_external.csv) |
| Konsistensi per _seed_ & _leave-one-seed-out_ | [`tables/table_mechanism_seed_consistency.csv`](tables/table_mechanism_seed_consistency.csv) · [`tables/table_mechanism_sensitivity.csv`](tables/table_mechanism_sensitivity.csv) |
| Dekomposisi mekanisme–prediksi | [`tables/table_mechanism_decomposition.csv`](tables/table_mechanism_decomposition.csv) · [`tables/table_mechanism_performance_association.csv`](tables/table_mechanism_performance_association.csv) |
| Kapan CSD paling bermanfaat | [`tables/table_teacher_shift_bins.csv`](tables/table_teacher_shift_bins.csv) · [`tables/table_teacher_correctness_subgroups.csv`](tables/table_teacher_correctness_subgroups.csv) |
| Kesalahan per _grade_ & Grade 1 | [`tables/table_grade1_confusions.csv`](tables/table_grade1_confusions.csv) · [`tables/table_error_by_grade.csv`](tables/table_error_by_grade.csv) |
| Pearson vs Spearman, kalibrasi | [`tables/table_benefitcorr_sensitivity.csv`](tables/table_benefitcorr_sensitivity.csv) · [`tables/table_ordinal_calibration_summary.csv`](tables/table_ordinal_calibration_summary.csv) |
| Klaim yang boleh / dilarang | [`reports/CLAIM_LEDGER.csv`](reports/CLAIM_LEDGER.csv) |

---

## 🖼️ Gambar

| Gambar | Menunjukkan |
|---|---|
| [`fig_mechanism_effect_forest`](figures/fig_mechanism_effect_forest.png) | Selisih fidelitas CSD − pembanding beserta CI 95% (internal) |
| [`fig_internal_external_mechanism`](figures/fig_internal_external_mechanism.png) | Internal DRTiD vs DeepDRiD Set-C dalam satu panel — **Gambar 9** paper |
| [`fig_mechanism_decomposition`](figures/fig_mechanism_decomposition.png) | Selisih _shift_ vs selisih agregasi dasar vs selisih output _joint_ |
| [`fig_confusion_core_models`](figures/fig_confusion_core_models.png) | Matriks konfusi ternormalisasi baris: teacher dan empat kondisi inti |

Seperti run utama, hanya `.png` yang disertakan; versi `.pdf`/`.svg` adalah duplikat format.

---

## 🧪 Desain statistik singkat

- **Unit resampling** — DRTiD: _examined-eye record_ (DRTiD tidak memiliki ID pasien). Set-C: **pasien** (kedua mata selalu ikut bersama).
- **Setiap replikasi** meresampling unit **dan** lima _seed_ secara bersamaan, dengan penarikan yang sama untuk CSD, pembanding, dan teacher; setiap metrik (termasuk korelasi Pearson BenefitCorr) dihitung ulang. Replikasi tidak valid: 0.
- **Pelengkap** — bootstrap record saja, _leave-one-seed-out_, arah per _seed_, permutasi bersyarat (P = 10.000) + Holm atas 9 kontras, BenefitCorr Spearman.
- **Definisi metrik** disalin verbatim dari notebook utama; ambang beku (NoDistill 0,40; lainnya 0,50).
- `RNG_SEED = 20261029`; hash penarikan bootstrap dicatat di [`logs/run_manifest.json`](logs/run_manifest.json). Statistik dihitung ulang pada dua eksekusi terpisah dengan hasil identik.

---

## ⚖️ Batas klaim

| ✅ Boleh | ❌ Jangan |
|---|---|
| "ShiftL1 CSD lebih rendah dari ketiga pembanding, CI 95% tidak memuat nol (eksploratori)" | "CSD signifikan pada ketiga metrik mekanisme" |
| "BenefitCorr searah dengan CSD, tetapi CI memuat nol" | "BenefitCorr CSD signifikan" |
| "Pola fidelitas juga teramati pada Set-C (eksploratori)" | "CSD meningkatkan QWK / akurasi" |
| "Unit resampling internal: _examined-eye record_" | "Bootstrap internal berklaster pasien" |

---

## 📝 Catatan penamaan

- `table_VI_paper_internal.csv` dan rujukan "Tabel VI" di `reports/SUPPLEMENTARY_RESULTS_OVERVIEW.md` memakai **nomor kerja** dari notebook. Di paper final tabel ini menjadi **Tabel IV** (lihat [`paper_tables/`](paper_tables/)). Berkas hasil sengaja tidak disunting agar tetap identik dengan keluaran run.
- Folder `paper_ready/` dan _cache_ inferensi (`*.parquet`) tidak disertakan: isinya dapat diturunkan ulang dari tabel di sini atau dengan menjalankan notebook.
