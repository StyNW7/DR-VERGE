# 📓 notebooks/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

| Berkas | Peran |
|---|---|
| [`full_pipeline_notebook_enhanced.ipynb`](full_pipeline_notebook_enhanced.ipynb) | **Notebook final DR-VERGE** — versi yang sudah dieksekusi beserta seluruh keluaran selnya. Seluruh angka run utama (Tabel I–III, RQ2, _deployment_) berasal dari notebook ini. |
| [`DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb`](DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb) | **Analisis suplementer v2** — _inference-only_ atas model beku notebook di atas; versi tereksekusi (56/56 _gates_). Sumber bukti inferensial mekanisme, generalisasi Set-C, dan dekomposisi. Keluaran: [`../results/supplementary/`](../results/supplementary/). |
| [`DRVERGE_Enhanced_Supplementary_Analysis.ipynb`](DRVERGE_Enhanced_Supplementary_Analysis.ipynb) | Analisis suplementer v1 — **digantikan oleh v2**. Disimpan untuk provenans: v2 dapat memakai ulang _cache_ inferensi v1 setelah seluruh hash-nya tervalidasi. |

Notebook ini **mandiri**: data, model, _loss_, metrik, statistik, kuantisasi, ekspor, gambar, dan tabel seluruhnya diimplementasikan di dalamnya. Keluaran yang ditulisnya disimpan di [`../results/`](../results/).

---

## 🧭 Isi notebook

| Bagian | Isi | _Gate_ |
|---|---|---|
| §1 Environment | Pemasangan Google Drive, dependensi, determinisme cuBLAS | Gate 0 |
| §2 Configuration | `DRIVE_BASE`, `RUN_TAG`, `QUICK`, `RESUME`, `USE_AMP`; protokol yang dikunci (_seed_, _grid_, B, P) | — |
| §3 Utilities & gates | Mekanisme _gate_: pemeriksaan yang menghentikan run bila gagal | — |
| §4 DRTiD splits | Partisi resmi + split latih/validasi terstratifikasi; verifikasi urutan _field_ dan lateralitas | Gate 1 |
| §5 APTOS integrity | Pemeriksaan duplikat dan kebocoran APTOS | Gate 1b |
| §6 Image cache | _Cache_ citra hasil _resize_ dan transformasi augmentasi | — |
| §7 Models | _Backbone_, InteractionFusion, CORAL _head_ dengan _ordered bias_, uji unit | Gate 2a |
| §8 Losses | CORAL, _auxiliary_, Logit-KD, Feature-KD, **CSD** | — |
| §9 Metrics | QWK (dicek terhadap `sklearn`), Macro-F1, MAE, SER, metrik _shift fidelity_ | Gate 2b |
| §10 Smoke test | Seluruh komponen dirangkai dan dijalankan singkat | Gate 2c |
| §13a Stage A | Pemilihan resolusi & _sampling_ pada validasi | Gate 4c |
| §11 · §13b | Prapelatihan APTOS dan _teacher_ ResNet-50 pada resep terpilih | Gate 3 |
| §12–13 | _Student_, _baseline_ _single-view_, _grid_ Logit-KD / Feature-KD / CSD, ablasi formulasi CSD | Gate 4a · 4b · 5 |
| §13c | Kalibrasi _threshold_ keputusan (validasi saja) | Gate 6e |
| §14 | Seleksi metode dua tahap (validasi saja) | Gate 6a–6d |
| §15–16 | Kuantisasi PTQ / QAT / FT-PTQ dengan cakupan setara; keputusan _deployment_ dikunci | Gate 7a–7d |
| §17 | Evaluasi uji internal DRTiD; prediksi per sampel disimpan | Gate 8 · 9 |
| §18 | Statistik: _bootstrap_ berklaster, permutasi, Holm | Gate 10 |
| §19 | Validasi eksternal DeepDRiD Set-C (model dibekukan) | Gate 11 |
| §20 | Ekspor `checkpoint.pt`, `model.pt2`, `model.onnx`, `metadata.json` + verifikasi muat ulang | Gate 12a–12d |
| §21–22 | 14 gambar, 34 tabel, laporan akhir | — |
| §21b | **_Self-audit_** — 265 angka utama dihitung ulang dari prediksi per sampel | Gate 12b · 12c |

---

## ▶️ Cara menjalankan

1. Buka notebook di **Google Colab** dengan GPU (run final memakai A100).
2. Letakkan dataset di `MyDrive/DR-VERGE/dataset/` — lokasi DRTiD dan DeepDRiD dicari otomatis.
3. Atur sel _Configuration_:

   ```python
   DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
   RUN_TAG    = "enhanced_v1_YYYYMMDD"   # tag baru untuk setiap run baru
   QUICK      = False                    # True = gladi singkat: 1 seed, sedikit epoch, Set-B
   RESUME     = True                     # lanjutkan run yang terputus pada RUN_TAG yang sama
   USE_AMP    = False                    # mixed precision; mengubah numerik sedikit
   ```

4. **_Run All_.** Bila Colab terputus, buka kembali dengan `RUN_TAG` yang sama dan _Run All_ lagi; _checkpoint_ yang sudah ada diverifikasi lalu dipakai ulang.
5. Seluruh artefak ditulis ke `MyDrive/DR-VERGE/artifacts_<RUN_TAG>/`. Berkas `FINAL_RUN_COMPLETE.txt` hanya muncul bila semua _blocking gate_ lulus.

> [!TIP]
> Mode `QUICK = True` menguji pipeline eksternal pada **Set-B** sehingga **Set-C** — partisi konfirmatori — tetap tidak tersentuh sampai run sebenarnya. Selalu gunakan `RUN_TAG` sementara untuk gladi.

Sebelum run penuh, notebook dapat diperiksa secara statis dengan skrip di [`../scripts/verification/`](../scripts/).

---

## 📖 Urutan membaca keluaran

1. `FINAL_RUN_COMPLETE.txt` — bila tidak ada, run belum selesai dan tidak ada angka yang boleh dikutip.
2. `tables/table_gate_report.csv` — apakah ada _gate_ yang gagal.
3. `rq1_verdict.json` — keputusan RQ1 pada kedua sumbu: prediktif dan mekanistik.
4. `tables/table_predictive_performance.csv` dan `tables/table_statistics.csv` — besar efek beserta CI.
5. `tables/table_rq2_validation.csv` + `deployment_choice.json` — dasar keputusan _deployment_.
6. `tables/table_retention_main.csv` dan `tables/table_efficiency.csv` — inti RQ2.
7. `tables/table_external_deepdrid.csv` + `tables/table_external_ci.csv` — hasil eksternal Set-C.

Peta lengkapnya ada di [`../results/README.md`](../results/README.md).

---

## 🔬 Notebook analisis suplementer v2

Notebook ini **tidak melatih apa pun**. Ia memuat 21 _checkpoint_ beku dari `artifacts_enhanced_v1_20260811/` secara _strict_, mereproduksi hasil asli, lalu menghitung statistik baru. Semua keluaran ditulis ke folder baru; artefak asli diperiksa SHA-256-nya sebelum dan sesudah.

| Fase | Isi | Aturan berhenti |
|---|---|---|
| P0 | Inventaris, hash SHA-256, _strict load_ 21 _checkpoint_, verifikasi config/ambang/M\*, uji reproduksi awal | Gagal → berhenti |
| P1 | Inferensi 3 _head_ untuk 20 _student_ + _teacher_, reproduksi penuh, 9 kontras internal + sensitivitas | Reproduksi gagal → berhenti |
| P2 | DeepDRiD Set-C: integritas 100/200/400, reproduksi QWK eksternal, statistik berklaster pasien | Gagal → hanya P2 dihentikan |
| P3 | Identitas dekomposisi, subgrup kebenaran _teacher_, kuartil besarnya _shift teacher_ | Identitas gagal → berhenti |
| P4 | _Precision/recall/F1_ per _grade_, arah kesalahan Grade 1 | Diagnostik |
| P5 | Pearson vs Spearman, kalibrasi skor ambang ordinal | Gagal → hanya P5 dihentikan |
| P6 | Ringkasan _benchmark deployment_ asli (dibaca ulang, tidak diukur ulang) | — |

**Menjalankan:** buka di Colab dengan GPU, pastikan `MyDrive/DR-VERGE/artifacts_enhanced_v1_20260811/` dan dataset tersedia, lalu _Run All_. Atur `STAT_MODE = "debug"` (B = 500, **tidak pernah dilaporkan**) untuk gladi, lalu `STAT_MODE = "final"` (B = 10.000) untuk angka yang dikutip. Run dianggap selesai hanya jika `SUPPLEMENTARY_RUN_COMPLETE.txt` tertulis. `RNG_SEED = 20261029`.
