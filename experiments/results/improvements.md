# Rencana Perbaikan: Menuju Satu Notebook Final Terkuat

**Basis:** mulai dari `full_pipeline_notebook_simple.ipynb` (32/32 gate, Set-C, 5 seed berpasangan).
Semua perbaikan di bawah **tidak mengubah RQ, arsitektur, loss, split, seed, grid, maupun aturan
seleksi**. Yang diperbaiki adalah *seberapa kuat bukti yang dihasilkan* dari eksperimen yang sama.

**Prinsip:** hampir seluruh perbaikan Tier 1 adalah **inferensi tambahan atau satu baris kode** —
tidak ada pelatihan ulang. Total tambahan waktu ≈ 15–25 menit pada run ~5 jam.

---

## Ringkasan Prioritas

| Tier | Isi | Dampak | Biaya | Risiko |
|---|---|---|---|---|
| **1** | 5 perbaikan yang mengubah klaim "sugestif" menjadi "teruji" | **tinggi** | ~20 menit | rendah |
| **2** | 3 perbaikan kualitas pelaporan | sedang | ~5 menit | rendah |
| **3** | 2 opsi yang perlu pertimbangan | bervariasi | bervariasi | perlu keputusan |

---

# TIER 1 — Wajib (dampak tinggi, biaya hampir nol)

## 1.1 Evaluasi eksternal harus berpasangan 5 seed, bukan 1 model

**Masalah terbesar saat ini.** Analisis internal Anda memakai 5 seed berpasangan dengan cluster
bootstrap dan uji permutasi. Tetapi evaluasi eksternal hanya memakai **satu model per kondisi**:

```python
ext_models = [("teacher", "-", TEACHER, "FP32", False),
              ("best_fp32", BEST_SEED, BEST_FP32_MODEL, "FP32", False)]   # ← 1 seed saja
    ...
    ext_models.append(("best_csd_fp32", BEST_CSD_SEED, ...))              # ← 1 seed saja
```

Akibatnya, klaim terkuat Anda — *CSD 0,735 vs M\* 0,644 di Set-C* — adalah **1 model vs 1 model**,
dengan metode dan seed tercampur, tanpa interval berpasangan. Di dokumen hasil, ini terpaksa ditulis
"sugestif, belum terbukti".

**Perbaikan:** evaluasi **kelima seed** untuk `dual_csd` dan **kelima seed** untuk M\* pada Set-C.

```python
# ganti dua baris ext_models di atas dengan loop atas seluruh seed inti
for s in SEEDS_CORE:
    ck = f"{CKPT_DIR}/student/{BEST_CONDITION}/seed{s}.pt"
    if os.path.exists(ck):
        ext_models.append(("best_fp32", s, load_student(ck), "FP32", False))
for s in SEEDS_CORE:
    ck = f"{CKPT_DIR}/student/dual_csd/seed{s}.pt"
    if os.path.exists(ck):
        ext_models.append(("csd_fp32", s, load_student(ck), "FP32", False))
```

**Dampak:** klaim eksternal berubah dari "sugestif" menjadi **klaim statistik yang sah dengan
interval berpasangan** — persis seperti analisis internal Anda. Ini satu-satunya perbaikan yang
dapat mengubah status temuan utama RQ1.

**Biaya:** hanya inferensi. 8 model tambahan × ~2.000 forward mata (dengan image cache) ≈ **5–10
menit**. Tidak ada pelatihan ulang.

---

## 1.2 Tambahkan uji berpasangan CSD vs M\* di eksternal

Saat ini daftar perbandingan eksternal berpasangan tidak memuat CSD sama sekali:

```python
for a, b in (("ptq_int8", "best_fp32"), ("qat_int8", "best_fp32"),
             ("ft_ptq_int8", "best_fp32"), ("qat_int8", "ptq_int8")):
```

**Perbaikan — tambahkan satu tuple:**

```python
for a, b in (("csd_fp32", "best_fp32"),          # ← BARU: inti klaim RQ1 eksternal
             ("ptq_int8", "best_fp32"), ("qat_int8", "best_fp32"),
             ("ft_ptq_int8", "best_fp32"), ("qat_int8", "ptq_int8")):
```

Fungsi `paired_patient_bootstrap` sudah ada dan sudah teruji. Setelah 1.1, perbandingan ini otomatis
menjadi 5v5 berpasangan per pasien.

**Dampak:** memberi ΔQWK + CI 95% untuk klaim RQ1 eksternal Anda. **Biaya: satu baris.**

---

## 1.3 Masukkan `fp32_ft_control` ke evaluasi eksternal

**Masalah:** hasil RQ2 paling menarik adalah *"varian INT8 yang di-fine-tune kredibel lebih baik di
Set-C"* (QAT +0,074; FT-PTQ +0,077), sementara PTQ murni tidak. Interpretasi jujurnya: yang membantu
adalah **fine-tuning**, bukan kuantisasi. Tetapi Anda **tidak bisa membuktikannya**, karena
`fp32_ft_control` (fine-tune tanpa kuantisasi) tidak pernah dievaluasi di Set-C.

**Perbaikan:**

```python
for sd, m in FT_M.items():
    ext_models.append(("fp32_ft_control", sd, m.to(DEVICE), "FP32", False))
```

**Dampak:** memisahkan efek fine-tuning dari efek kuantisasi pada data eksternal. Ini mengubah
sebuah *keterbatasan yang harus diakui* menjadi *temuan yang dapat dinyatakan*. **Biaya: 2 baris +
inferensi.**

---

## 1.4 Gate konsistensi hasil akhir

**Pelajaran langsung dari PINK-MVAN:** paper juara itu memuat inkonsistensi — abstrak menyebut
recall 68,50%, Tabel 1 dan 3 menyebut 75,70%. Kelas kesalahan ini lolos ke paper juara.

**Perbaikan:** satu sel di akhir yang **menghitung ulang** metrik headline dari prediksi per-sampel
yang tersimpan, lalu membandingkannya dengan tabel:

```python
# Gate13_ResultsConsistency -- angka di tabel harus dapat direproduksi dari prediksi mentah
bad = []
for f in glob.glob(f"{PRED_TEST_DIR}/DRTiD_test_*_FP32.csv"):
    d = pd.read_csv(f)
    cond, seed = d.condition.iloc[0], d.seed.iloc[0]
    recomputed = fast_qwk(d.true_grade.values, d.pred_grade.values)
    reported = RAW[(RAW.condition == cond) & (RAW.seed.astype(str) == str(seed))]["QWK"]
    if len(reported) and abs(float(reported.iloc[0]) - recomputed) > 1e-9:
        bad.append(f"{cond}|s{seed}: table={float(reported.iloc[0]):.6f} vs preds={recomputed:.6f}")
gate("Gate13_ResultsConsistency", not bad,
     f"{len(glob.glob(f'{PRED_TEST_DIR}/*.csv'))} prediction files recompute to the reported QWK"
     if not bad else f"MISMATCH: {bad[:3]}", blocking=BLOCK)
```

**Dampak:** menjamin setiap angka di paper dapat ditelusuri ke prediksi mentah. Ini pembeda
kredibilitas yang murah. **Biaya: ~10 baris, beberapa detik.**

---

## 1.5 Tandai ketidaksepakatan CI vs uji permutasi

**Masalah nyata di run Anda:** pada `qat_int8 vs best_fp32`, interval bootstrap mencakup nol
(−0,0683 s.d. +0,0042) tetapi p permutasi = 0,001. Dua prosedur, dua jawaban.

**Perbaikan:** tambahkan kolom penanda di `STATS`, jangan diam-diam memilih salah satu:

```python
STATS["ci_excludes_zero"] = STATS["excludes_zero"]
STATS["perm_significant"] = STATS["p_perm"] < 0.05 if "p_perm" in STATS else None
STATS["agreement"] = np.where(
    STATS["ci_excludes_zero"].fillna(False) == STATS["perm_significant"].fillna(False),
    "agree", "DISAGREE -- report both, claim neither")
```

**Dampak:** mengubah potensi tuduhan *cherry-picking* menjadi bukti kejujuran metodologis. Juri
menghargai ini. **Biaya: 4 baris.**

---

# TIER 2 — Sangat Dianjurkan (kualitas pelaporan)

## 2.1 Tabel per-derajat sebagai output kelas satu

QWK 0,55 dengan Macro-F1 0,34 berarti derajat langka sering terlewat. Metrik per-derajat sudah
dihitung di `all_metrics`, tetapi tidak pernah menjadi tabel tersendiri.

```python
pg = [{"condition": c, "grade": g,
       "precision": RAW[RAW.condition == c][f"Precision_Grade{g}"].mean(),
       "recall":    RAW[RAW.condition == c][f"Recall_Grade{g}"].mean(),
       "f1":        RAW[RAW.condition == c][f"F1_Grade{g}"].mean(),
       "support":   RAW[RAW.condition == c][f"Support_Grade{g}"].mean()}
      for c in present(CORE_CONDITIONS) for g in range(NUM_CLASSES)]
pd.DataFrame(pg).to_csv(f"{TAB_DIR}/table_per_grade_performance.csv", index=False)
```

**Dampak:** PINK-MVAN mendapat kredit karena jujur soal kelemahan. Tabel ini membuat kelemahan Anda
eksplisit dan terukur, bukan tersembunyi di balik satu angka agregat.

## 2.2 Gabungkan gambar arsitektur dari notebook Efficient

Notebook Simple tidak punya `fig_01_architecture` dan `fig_02_experimental_workflow`; notebook
Efficient punya keduanya. Paper Anda membutuhkannya (PINK-MVAN memakai 2 dari 3 gambarnya untuk
skema arsitektur).

**Perbaikan:** salin kedua sel gambar dari Efficient ke notebook final, dengan penomoran ulang agar
tidak bentrok (Simple sudah punya `fig_01_dataset`).

## 2.3 Perbaiki dua cacat gambar yang sudah diketahui

- `fig_08` (Efficient): keterangan menyebut "ShiftMAE" padahal panel menampilkan **ShiftL1**.
- `fig_11` (Efficient): batang internal untuk `best_csd_fp32` kosong padahal nilainya ada (0,4930).

Keduanya sudah diperbaiki oleh `DR-VERGE_export_and_figure_fix.ipynb`; pastikan perbaikannya ikut
masuk ke notebook final, bukan hanya ditambal setelahnya.

---

# TIER 3 — Perlu Keputusan Anda

## 3.1 Adjacent accuracy (akurasi dalam ±1 derajat) — **direkomendasikan, dengan syarat**

Metrik standar di literatur grading DR: `mean(|y_true − y_pred| ≤ 1)`. Dengan MAE ~0,80, angka ini
kemungkinan besar **jauh lebih baik dan lebih bermakna klinis** daripada Macro-F1 0,34.

```python
m["AdjacentAccuracy"] = float(np.mean(np.abs(y_true - y_pred) <= 1))
```

⚠ **Syarat mutlak:** metrik ini harus dideklarasikan sebagai **sekunder/deskriptif** di protokol
**sebelum** run final, dan **tidak boleh** dipakai untuk seleksi model atau pengujian. QWK tetap
metrik utama. Menambahkan metrik setelah melihat hasil, lalu menjadikannya headline, adalah bentuk
*p-hacking* — dan juri yang teliti akan menangkapnya.

Jika dideklarasikan lebih dulu: **tambahkan**. Ini murah dan memperkuat narasi klinis.

## 3.2 Ensemble 5 seed — **opsional, ada konsekuensi**

Merata-ratakan skor kumulatif kelima seed biasanya menaikkan QWK beberapa poin.

**Keuntungan:** memberi baris "batas atas arsitektur ini" yang jujur.
**Kerugian:** merusak cerita deployment Anda — 5 model berarti 5× ukuran dan 5× latensi, sehingga
bertentangan langsung dengan RQ2 yang menekankan efisiensi.

**Saran:** laporkan sebagai baris *referensi* di Tabel 1 dengan label eksplisit ("ensemble 5-seed,
tidak dipakai untuk deployment"), atau lewati sama sekali. **Jangan** menjadikannya model terpilih.

---

# Yang SENGAJA TIDAK Dilakukan

Penting untuk menyatakan batas, agar tidak terjadi *scope creep*.

| Tidak dilakukan | Alasan |
|---|---|
| Mengubah arsitektur, loss, atau formulasi CSD | mengubah hal fundamental; protokol sudah terkunci |
| Menaikkan resolusi dari 224×224 | mengubah protokol; biaya komputasi berlipat |
| Mengubah `pos_weight` atau menambah *class-balanced sampling* untuk memperbaiki Grade 1 | perubahan metode; hasil lama tidak lagi sebanding |
| Menambah dataset atau RQ baru | di luar lingkup |
| Menambah arsitektur student lain, pruning, INT4 | dilarang eksplisit oleh `rev-simple.md` §78 |
| Mengulang pelatihan demi angka yang lebih baik | melanggar *freeze rule* Anda sendiri |
| Protocol hash / resume multi-sesi penuh | *over-engineering*; sudah ada `RESUME` + cek konfigurasi |

**Catatan penting:** Macro-F1 rendah dan Grade 1 yang jarang terprediksi adalah **temuan**, bukan bug.
Memperbaikinya memerlukan perubahan metode, dan itu berarti seluruh hasil sebelumnya tidak lagi
sebanding. Tulis sebagai keterbatasan; jangan diperbaiki di menit terakhir.

---

# Estimasi Biaya

| Perbaikan | Jenis | Tambahan waktu |
|---|---|---|
| 1.1 eksternal 5 seed | inferensi | ~5–10 menit |
| 1.2 uji berpasangan CSD | 1 baris | ~1 menit (bootstrap) |
| 1.3 `fp32_ft_control` eksternal | inferensi | ~3 menit |
| 1.4 gate konsistensi | ~10 baris | detik |
| 1.5 penanda CI/permutasi | 4 baris | detik |
| 2.1 tabel per-derajat | ~8 baris | detik |
| 2.2 gambar arsitektur | salin sel | detik |
| 2.3 perbaikan gambar | sudah ada | detik |
| **Total** | | **≈ 15–25 menit** pada run ~5 jam |

---

# Urutan Implementasi

1. **Mulai dari salinan `full_pipeline_notebook_simple.ipynb`** (jangan Efficient).
2. Terapkan **Tier 1** — inilah yang mengubah kekuatan klaim.
3. Terapkan **Tier 2** — kualitas pelaporan.
4. Putuskan **Tier 3**; jika mengambil 3.1, **deklarasikan di protokol lebih dulu**.
5. Jalankan `QUICK = True` sekali (~15 menit) untuk memastikan seluruh jalur berjalan.
6. `RUN_TAG` baru, `QUICK = False`, Run All.
7. Verifikasi `FINAL_RUN_COMPLETE.txt` ada dan `Gate13_ResultsConsistency` lulus.

---

# Apa yang Berubah pada Paper Anda

| Klaim | Sekarang | Setelah Tier 1 |
|---|---|---|
| CSD unggul di Set-C | "sugestif, interval tumpang tindih, tanpa uji berpasangan" | **ΔQWK + CI 95% berpasangan atas 5 seed** |
| Peningkatan eksternal INT8 | "tidak dapat dipisahkan dari fine-tuning" | **dapat dipisahkan — `fp32_ft_control` diuji** |
| QAT internal | "CI dan p bertentangan" (tanpa penjelasan) | **ditandai eksplisit sebagai DISAGREE** |
| Ketertelusuran angka | diasumsikan | **dijamin gate** |
| Kelemahan per-derajat | tersembunyi di Macro-F1 | **tabel eksplisit** |

Satu perbaikan yang paling menentukan adalah **1.1**. Tanpa itu, temuan eksternal Anda — yang
merupakan hasil paling menarik dari keseluruhan penelitian — tetap berstatus "sugestif" dan tidak
dapat diklaim. Dengan itu, temuan tersebut menjadi klaim statistik yang sah, dengan biaya sekitar
sepuluh menit inferensi dan **tanpa pelatihan ulang sama sekali**.
