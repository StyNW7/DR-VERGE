# Hasil Run Enhanced — DR-VERGE

**Run ID:** `artifacts_enhanced_v1_20260811`
**Tanggal:** 11 Agustus 2026 · **Perangkat:** NVIDIA A100-SXM4-80GB (Colab) · **Quant engine:** x86
**Status:** ✅ **36/36 gate lolos · 0 error · `FINAL_RUN_COMPLETE.txt` tertulis**

---

## 0. Ringkasan Satu Paragraf

Run *enhanced* adalah **tindak lanjut yang sudah dipra-registrasi** (pre-registered) dari run
*simple*, dengan empat perbaikan protokol yang ditetapkan **sebelum** eksekusi. Semua gate
integritas lolos, termasuk gate audit-mandiri yang merekomputasi 265 angka headline dari prediksi
per-sampel dengan **0 ketidakcocokan**. Temuan utamanya **mereplikasi disosiasi yang sama untuk
ketiga kalinya**: CSD unggul pada **seluruh tiga metrik mekanisme**, namun **tidak satu pun** dari
tiga perbandingan prediktifnya kredibel — semua selang kepercayaan memuat nol. Perbaikan protokol
tidak mengubah kesimpulan, dan justru itulah yang membuat kesimpulan ini kuat.

---

## 1. Apakah Hasil Ini Sudah Bagus? — Penilaian Jujur

### ✅ Yang Kuat

| Aspek | Bukti |
|---|---|
| **Integritas eksekusi** | 36/36 gate lolos, 0 error, 51 sel tereksekusi berurutan |
| **Auditabilitas** | 265 nilai headline direkomputasi dari prediksi per-sampel → **265 cocok, 0 selisih** |
| **Replikasi** | Urutan mekanisme CSD identik di **tiga** run independen (simple, efficient, enhanced) |
| **Kekuatan statistik** | Bootstrap patient-clustered B=10.000, permutasi 10.000, Holm **dalam** famili |
| **Validasi eksternal** | Set-C DeepDRiD, 5 seed *matched*, 100 pasien, partisi disjoint terverifikasi |
| **Higienitas seleksi** | Stage A dipilih **sebelum** teacher ada; threshold t\* hanya dari validasi |
| **Kejujuran pelaporan** | Notebook secara eksplisit *melewati* perbandingan `csd_fp32` vs `best_fp32` karena keduanya model yang sama |

**Kualitas metodologis run ini tinggi.** Rantai keputusan (Stage A → teacher → grid → seleksi
metode → seleksi deployment) tidak pernah menyentuh test set, dan setiap tahap punya gate.

### ⚠ Yang Harus Dilaporkan Apa Adanya

Ada **enam** hal yang tidak boleh disembunyikan. Menyembunyikannya adalah risiko terbesar bagi
paper ini, karena semuanya terlihat jelas dari file yang ada di repositori.

**(1) Estimasi titik CSD kali ini NEGATIF terhadap baseline.**
Pada run *simple*, CSD vs no-distillation adalah **+0,0171**. Pada run *enhanced*, menjadi
**−0,0024**. Arahnya berbalik. Keduanya null (CI memuat nol), sehingga secara statistik tidak ada
kontradiksi — tetapi klaim "CSD meningkatkan QWK" **tidak dapat dibuat**, dan tidak boleh
disiratkan lewat pemilihan angka.

**(2) M\* dipilih sebagai `dual_csd`, tetapi pada test CSD berada di peringkat 3 dari 4.**

| Kondisi | Val QWK (dasar seleksi) | Test QWK | Peringkat test |
|---|---|---|---|
| dual_csd | **0,6490** ← terpilih | 0,6018 | 3 |
| dual_featkd | 0,6477 | **0,6161** | **1** |
| dual_logitkd | 0,6308 | 0,5942 | 4 |
| dual_no_distill | 0,6228 | 0,6042 | 2 |

Jarak validasi antara `dual_csd` dan `dual_featkd` hanya **0,0013** — notebook sendiri mencatat
`2 methods within 0.005 mean QWK -- tie-break chain applied`. Ini **ketidakstabilan seleksi**, dan
merupakan temuan yang layak dilaporkan, bukan aib.

**(3) Recall Grade 1 nyaris nol pada semua model — termasuk teacher.**

| Kondisi | G0 | **G1** | G2 | G3 | G4 |
|---|---|---|---|---|---|
| teacher | 0,932 | **0,000** | 0,260 | 0,362 | 0,750 |
| dual_csd | 0,803 | **0,068** | 0,192 | 0,304 | 0,580 |
| dual_featkd | 0,808 | **0,080** | 0,186 | 0,342 | 0,580 |

Teacher **tidak pernah sekalipun** memprediksi Grade 1 dengan benar. Grade 1 (NPDR ringan) adalah
kelas yang secara klinis penting untuk deteksi dini. Ini **limitasi klinis paling serius** dalam
studi ini dan wajib masuk paper. Perhatikan: `Gate9_TestDiagnostics` lolos dengan 0 kondisi
ditandai — jadi angka ini **tidak** tertangkap gate otomatis, dan hanya terlihat dari tabel
per-grade recall.

**(4) QAT — model yang dideploy — secara kredibel LEBIH BURUK dari PTQ di data eksternal.**

| Perbandingan | Internal (test DRTiD) | Eksternal (Set-C) |
|---|---|---|
| qat_int8 vs ptq_int8 | +0,0101 [−0,0179, +0,0411] tidak kredibel | **−0,0384 [−0,0826, −0,0006] KREDIBEL** |

Tandanya **berbalik** antara internal dan eksternal, dan versi eksternalnya adalah **satu-satunya
perbandingan eksternal yang kredibel** dalam seluruh run. Aturan deployment memilih QAT karena
retensi validasi 99,0%; kriteria itu bersifat *engineering* dan dibekukan sebelumnya, jadi
pilihannya sah. Tetapi paper harus menyatakan bahwa **kriteria deployment internal dan performa
eksternal tidak sejalan di sini.**

**(5) `best_fp32` dan `csd_fp32` identik.**
Karena M\* = `dual_csd`, kedua baris itu adalah model yang persis sama (QWK 0,6688, sd 0,0415 —
identik hingga digit terakhir). Notebook menanganinya dengan benar dan melewati perbandingannya.
Namun di tabel eksternal keduanya tampil sebagai dua baris, sehingga **pembaca bisa mengira ada
dua model berbeda**. Beri catatan kaki di paper.

**(6) Satu perbandingan di mana CI dan uji permutasi tidak sepakat.**
`ptq_int8 vs best_fp32`: CI = [−0,0360, +0,0023] (memuat nol) tetapi p_holm = 0,0243 (< 0,05).
Aturan repositori: **laporkan keduanya, klaim tidak ada.**

### 📌 Catatan Teknis Minor

- **Ekspor ONNX gagal untuk model INT8** (`Conv2dPackedParamsBase` tidak didukung
  `torch.export`). Hanya `teacher_fp32` dan `best_student_fp32` yang punya ONNX (paritas
  1,7e−06 dan 7,2e−07). Ini **batasan PyTorch**, bukan cacat metode — semua model INT8 tetap
  punya `state_dict` yang terverifikasi dapat dimuat ulang.
- **Teacher hanya 1 seed** (sd = NaN). Angka teacher adalah titik tunggal, bukan rerata.
- **Ablasi hanya 3 seed** dan tidak diuji statistik. `abl_csd_raw_smoothl1` (0,6178) tampak lebih
  tinggi dari `dual_csd` (0,6018) di test — **jangan diklaim**, jumlah seed-nya berbeda.
- **118 checkpoint digunakan ulang dari disk.** Ini sah (identitas checkpoint diverifikasi saat
  dimuat), tetapi harus disebut di bagian reproduksibilitas.

---

## 2. RQ1 — Apakah Complementarity-Shift Distillation Bekerja?

### 2a. Sisi Prediktif: **NULL** (semua tiga perbandingan)

Test DRTiD, 5 seed *matched*, bootstrap patient-clustered B=10.000:

| Perbandingan | ΔQWK | 95% CI | p | Kredibel? |
|---|---|---|---|---|
| CSD vs no-distillation | −0,0024 | [−0,0336, +0,0285] | 0,8003 | ❌ |
| CSD vs logit-KD | +0,0077 | [−0,0304, +0,0463] | 0,3640 | ❌ |
| CSD vs feature-KD | −0,0143 | [−0,0445, +0,0153] | 0,1650 | ❌ |

**Seluruh CI memuat nol. Tidak ada satu pun klaim keunggulan prediktif yang dapat dibuat.**

### 2b. Sisi Mekanisme: **CSD UNGGUL DI 3 DARI 3 METRIK**

| Kondisi | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---|---|---|
| dual_no_distill | 0,3759 | +0,3509 | +0,2193 |
| dual_logitkd | 0,3840 | +0,2858 | +0,1795 |
| dual_featkd | 0,3718 | +0,3815 | +0,1943 |
| **dual_csd** | **0,3509** | **+0,4361** | **+0,3075** |

CSD terbaik pada ketiganya. **BenefitCorr adalah yang paling bermakna**: ia mengukur apakah
student memperoleh manfaat dual-view pada **sampel yang sama** dengan teacher. CSD mencapai
+0,3075 — **40% lebih tinggi** dari runner-up (no-distillation, +0,2193).

### 2c. Replikasi Lintas Tiga Run — Inilah Kekuatan Sebenarnya

| Metrik mekanisme | Simple | Enhanced | Pemenang |
|---|---|---|---|
| ShiftL1 (CSD) | 0,4320 | 0,3509 | CSD di keduanya |
| CosAgree (CSD) | +0,4257 | +0,4361 | CSD di keduanya |
| BenefitCorr (CSD) | +0,2902 | +0,3075 | CSD di keduanya |

Urutan mekanisme **identik** di run simple, efficient, dan enhanced — dari pelatihan independen,
resolusi berbeda (224 vs 384), dan rezim seleksi berbeda. Yang **tidak** stabil adalah urutan di
antara baseline: pada run enhanced, logit-KD justru **lebih buruk dari no-distillation** pada
ketiga metrik mekanisme, sedangkan pada run simple ia lebih baik.

> **Interpretasi yang dapat dipertahankan:** jarak antara CSD dan kelompok baseline bersifat
> **robust**; urutan di dalam kelompok baseline **tidak**.

### 2d. Premis Dual-View Tetap Berlaku

| Model | Test QWK |
|---|---|
| macula_only | 0,5175 |
| disc_only | 0,5502 |
| **dual_csd** | **0,6018** (+0,0516 di atas single-view terbaik) |
| Teacher (validasi) | QWK_dual 0,8133 vs maks aux 0,7664 → **G_aux = +0,0469** |

Dual-view mengungguli single-view terbaik pada teacher maupun student. **Premis penelitian tidak
gugur** — yang tidak terbukti hanyalah bahwa *cara khusus mendistilasi* pergeseran itu
meningkatkan QWK.

---

## 3. RQ2 — Apakah Kuantisasi INT8 Mempertahankan Kualitas?

### 3a. Efisiensi (angka terhitung, bukan klaim signifikansi)

| Transisi | Retensi QWK | Percepatan CPU | Kompresi |
|---|---|---|---|
| Teacher → student | 81,7% | 19,3× | 119,0× (154,09 MB → 1,29 MB) |
| FP32 → PTQ INT8 | 97,3% | 2,89× | 1,36× |
| FP32 → FT-PTQ INT8 | 96,8% | 2,89× | 1,36× |
| **FP32 → QAT INT8** | **99,0%** | **2,86×** | **1,36×** |

Student: **328.588 parameter** vs teacher **40.313.932** (123× lebih sedikit).
Latensi deployment (QAT INT8): **11,35 ms** median di CPU.

### 3b. Statistik Internal (test DRTiD)

| Perbandingan | ΔQWK | 95% CI | p | Kredibel? |
|---|---|---|---|---|
| ptq_int8 vs best_fp32 | −0,0164 | [−0,0360, +0,0023] | 0,0081 | ❌ (CI memuat nol) ⚠ |
| qat_int8 vs best_fp32 | −0,0063 | [−0,0293, +0,0175] | 0,4177 | ❌ |
| qat_int8 vs ptq_int8 | +0,0101 | [−0,0179, +0,0411] | 0,2427 | ❌ |
| *(kontrol)* fp32_ft_control vs best_fp32 | +0,0107 | [−0,0076, +0,0293] | 0,0398 | ❌ |
| *(kontrol)* qat_int8 vs fp32_ft_control | −0,0170 | [−0,0378, +0,0049] | 0,0184 | ❌ |

**Tidak ada degradasi yang kredibel.** Ini adalah bentuk hasil yang tepat untuk RQ2: klaimnya
adalah **non-inferioritas**, bukan peningkatan.

### 3c. Eksternal — Set-C DeepDRiD (100 pasien, 200 mata, 400 citra)

| Model | QWK (rerata 5 seed) | sd |
|---|---|---|
| teacher | 0,7923 | — (1 seed) |
| ptq_int8 | **0,6729** | 0,0365 |
| best_fp32 = csd_fp32 | 0,6688 | 0,0415 |
| fp32_ft_control | 0,6567 | 0,0364 |
| ft_ptq_int8 | 0,6513 | 0,0315 |
| qat_int8 | 0,6344 | 0,0326 |

Perbandingan berpasangan (bootstrap patient-clustered):

| Perbandingan | ΔQWK | 95% CI | Kredibel? |
|---|---|---|---|
| ptq_int8 vs best_fp32 | +0,0040 | [−0,0191, +0,0294] | ❌ |
| fp32_ft_control vs best_fp32 | −0,0121 | [−0,0383, +0,0152] | ❌ |
| ft_ptq_int8 vs best_fp32 | −0,0175 | [−0,0546, +0,0142] | ❌ |
| qat_int8 vs best_fp32 | −0,0344 | [−0,0747, +0,0018] | ❌ |
| **qat_int8 vs ptq_int8** | **−0,0384** | **[−0,0826, −0,0006]** | ✅ **KREDIBEL** |

Student mempertahankan **84,4%** QWK teacher pada data eksternal (0,6688 / 0,7923) — sedikit
lebih tinggi daripada retensi internal (81,7%).

> **Perbedaan penting dari run simple.** Pada run simple, FT-PTQ **lebih baik** dari FP32 di
> Set-C (+0,0766, kredibel), dan analisis kontrol menunjukkan keuntungan itu berasal dari
> *fine-tuning*, bukan kuantisasi. Pada run enhanced, keuntungan itu **tidak muncul**:
> `fp32_ft_control` justru −0,0121 terhadap `best_fp32`. **Efek fine-tuning eksternal tidak
> mereplikasi.** Ini harus dinyatakan; jangan mengutip temuan run simple seolah-olah sudah mapan.

---

## 4. Keputusan Deployment

```
Aturan (dibekukan sebelum run):  retensi QWK validasi ≥ 95%
                                 DAN severe error tidak kredibel lebih buruk
                                 DAN latensi CPU terendah

  ptq_int8      retensi 93,4%  → ditolak
  ft_ptq_int8   retensi 93,6%  → ditolak
  qat_int8      retensi 99,0%  → ELIGIBLE   ✅

DEPLOYMENT = qat_int8 (seed 42) · 11,35 ms · terverifikasi dapat dimuat ulang
```

Aturan diterapkan pada **validasi saja**, dan dibekukan sebelum test dibuka. Perhatikan bahwa run
simple memilih `ft_ptq_int8` sementara run enhanced memilih `qat_int8` — **pilihan deployment
tidak stabil antar run**, konsisten dengan ketidakstabilan seleksi pada butir 1(2).

---

## 5. Hiperparameter Terpilih (semua dari validasi)

| Tahap | Terpilih | Dasar |
|---|---|---|
| Stage A resep | **384×384, standard sampling** | val QWK 0,6491 vs 0,5549 (224/standard) |
| logit-KD | α = 0,5 · τ = 2,0 | val QWK 0,6484 |
| feature-KD | γ_feat = 2,0 | val QWK 0,6543 |
| **CSD** | **variant = smoothl1_norm · β = 0,1** | val QWK 0,6469 |
| QAT learning rate | 3e−05 | val QWK INT8 terkonversi 0,6462 |
| Threshold t\* | no_distill 0,40 · logitkd 0,50 · featkd 0,50 · **csd 0,50** | grid validasi |

Skala global CSD: `E_train[|Δ_T|] = 0,107276` (counterfactual 0,074165).
Rasio gradien CSD/task pada β terpilih: **0,5335** (dalam pita kewarasan [0,01 , 10]).

**Catatan penting soal Stage A:** resep 384/standard menang telak (+0,094 val QWK atas
224/standard). Ini menjelaskan mengapa teacher run enhanced (test QWK 0,7364) jauh lebih baik
daripada run simple (0,6544). Resolusi, bukan distilasi, adalah pengungkit terbesar dalam studi
ini — fakta yang layak disebut dalam pembahasan.

---

## 6. Figur

14 figur, penamaan bersih `fig_01_dataset` … `fig_14_internal_vs_external`. Setiap figur hadir
sebagai **`.png` + `.svg` + `.pdf` + `_caption.txt` + `_data.csv`**.

> ✅ **Tidak ada tabrakan `fig_13`** di run ini — masalah yang ada pada folder run *simple*
> (dua `fig_13` berbeda dalam satu folder) **tidak terjadi di sini**. Folder ini aman untuk
> dikutip langsung.

Tiga figur yang memikul paper:

| Figur | Menampilkan |
|---|---|
| `fig_07_csd_mechanism` | CSD unggul pada ketiga panel mekanisme — figur tunggal terkuat |
| `fig_12_forest` | Seluruh perbandingan pra-registrasi dengan CI; null RQ1 tampil jujur |
| `fig_13_external_setc` | Hasil Set-C; caption wajib memuat peringatan tumpang-tindih interval |

---

## 7. Verifikasi Integritas

**36/36 gate lolos.** Yang paling penting:

| Gate | Hasil |
|---|---|
| `Gate12b_ResultsConsistent` | **265 nilai direkomputasi, 0 selisih** |
| `Gate2b_QWK_Reference` | maks \|fast_qwk − sklearn\| = **1,11e−16** atas 105 kasus |
| `Gate6c_OrdinalMonotonicity` | tingkat pelanggaran ordinal maks = **0,00e+00** |
| `Gate7b_QuantScopeMatched` | himpunan operator identik lintas PTQ/QAT/FT-PTQ untuk 5 seed |
| `Gate11b_PartitionsDisjoint` | setA 299 / setB 100 / setC 100 pasien, **0 tumpang tindih** |
| `Gate12b_FP32_ONNX` | paritas ONNX 1,7e−06 (teacher), 7,2e−07 (student) |
| `Gate11a_SetC_Completeness` | 100 pasien / 200 mata / 400 citra — persis seperti diharapkan |

`Gate12b_ResultsConsistent` sempat gagal pada percobaan pertama (155 dari 265 tidak cocok). **Itu
adalah bug pada kode audit, bukan pada hasil**: blok audit eksternal mencocokkan setiap berkas
prediksi terhadap baris partisi *primary*, sehingga 31 model × 5 kombinasi (partisi × urutan
lapang) non-primary = 155 dijamin tidak cocok. Setelah pencocokan diperbaiki agar memakai kunci
partisi masing-masing, **265/265 cocok**. Tidak ada angka hasil yang berubah.

---

## 8. Ringkasan Angka untuk Dikutip

```
Teacher       : 40.313.932 parameter · test QWK 0,7364 · G_aux +0,0469 · 154,09 MB · 627,6 ms
Student (M*)  : 328.588 parameter    · test QWK 0,6018 · 1,29 MB · 32,6 ms
Deployment    : qat_int8 seed 42     · 0,95 MB · 11,35 ms · retensi validasi 99,0%
Kompresi      : 119,0× lebih kecil · 19,3× lebih cepat · 81,7% QWK teacher dipertahankan
Eksternal     : Set-C QWK 0,6688 (student) vs 0,7923 (teacher) — retensi 84,4%
RQ1 prediktif : 3/3 null, seluruh CI memuat nol
RQ1 mekanisme : CSD unggul 3/3 metrik (0,3509 / +0,4361 / +0,3075)
RQ2           : tidak ada degradasi kredibel; QAT retensi 99,0%
Gate          : 36/36 lolos · audit-mandiri 265/265 cocok
```

---

## 9. Hubungan dengan Run Lain

| | simple | efficient | **enhanced** |
|---|---|---|---|
| Gate | 32/32 | parsial | **36/36** |
| Resolusi | 224 | 224 | **384 (dipilih Stage A)** |
| Kalibrasi threshold | ✗ | ✗ | **✅** |
| Teacher test QWK | 0,6544 | — | **0,7364** |
| CSD vs no-distill | +0,0171 (null) | null | **−0,0024 (null)** |
| Urutan mekanisme | CSD terbaik 3/3 | CSD terbaik 3/3 | **CSD terbaik 3/3** |
| Model deployment | ft_ptq_int8 | — | **qat_int8** |
| Efek FT eksternal | +0,0766 kredibel | — | **−0,0121 tidak kredibel** |

**Aturan pelaporan yang ditetapkan sebelum run:** *jika run simple dan enhanced berbeda, keduanya
dilaporkan.* Aturan itu sekarang berlaku pada dua butir — arah efek RQ1 dan efek fine-tuning
eksternal. Keduanya wajib muncul di paper.

**Mana yang jadi hasil utama?** Gunakan **enhanced** sebagai run utama: protokolnya lebih ketat
(Stage A, kalibrasi threshold, dua gate tambahan), jumlah gate lebih banyak, dan seleksinya lebih
higienis. Posisikan **simple** sebagai run pendahulu yang mereplikasi temuan mekanisme.

---

## 10. Kesimpulan

**Apakah hasil ini bagus?** Ya — sebagai *pekerjaan ilmiah*. Eksekusinya bersih, auditnya
lengkap, dan temuan intinya tereplikasi tiga kali.

**Apakah hasil ini "menang"?** Tidak dalam arti "metode baru mengalahkan baseline". CSD **tidak**
meningkatkan QWK secara kredibel, dan pada run ini estimasi titiknya bahkan negatif.

**Lalu apa kontribusinya?** Studi ini menunjukkan sesuatu yang lebih halus dan lebih jujur:
**sinyal komplementaritas dapat ditransfer secara terukur, tetapi transfer itu tidak otomatis
menjadi akurasi ordinal yang lebih baik.** Disosiasi itu — diukur, direplikasi, dan dilaporkan
apa adanya — adalah kontribusi utamanya, dan itulah yang membedakan paper ini dari klaim
peningkatan yang tidak dapat direproduksi.

---

*Dokumen ini disusun dari keluaran tereksekusi di `full_pipeline_notebook_enhanced.ipynb`.
Setiap angka dapat dilacak ke sel notebook atau ke `*_data.csv` figur terkait.*
