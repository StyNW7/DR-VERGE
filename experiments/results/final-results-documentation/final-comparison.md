# Perbandingan Final Tiga Run — DR-VERGE

Perbandingan menyeluruh antara **run efficient**, **run simple**, dan **run enhanced**:
integritas, performa, jawaban RQ, replikasi lintas run, dan putusan run mana yang dipakai.

| | efficient | simple | **enhanced** |
|---|---|---|---|
| Run ID | `artifacts_final_efficient_20260810` | `artifacts_final_locked_simple_last_20260810` | `artifacts_enhanced_v1_20260811` |
| Tanggal | 10 Agu 2026 | 10 Agu 2026 | **11 Agu 2026** |
| GPU | — (torch 2.11) | NVIDIA L4 | **NVIDIA A100-SXM4-80GB** |
| Resolusi | 224 | 224 | **384 (dipilih Stage A)** |
| Sel tereksekusi | 59/60 | 50/50 | **51/51** |
| Gate | 16/17 | 32/32 | **36/36** |

---

## 1. Putusan

> ## 🏆 **Run enhanced adalah yang terbaik dan harus menjadi run utama paper.**
>
> Unggul pada **ketiga** sumbu sekaligus: integritas (36/36 gate, audit-mandiri 265/265), kualitas
> protokol seleksi (Stage A + kalibrasi threshold + grid 3-seed), dan performa absolut (teacher QWK
> 0,7364; student 0,6018 — tertinggi di antara ketiganya).

Namun putusan ini disertai **satu syarat penting**:

> ⚠ **Run simple wajib tetap dikutip**, bukan karena sopan santun, melainkan karena run enhanced
> memiliki **titik buta struktural**: karena M\* = `dual_csd`, baris `csd_fp32` dan `best_fp32`
> adalah model yang identik, sehingga run enhanced **secara struktural tidak mampu** menguji
> "apakah CSD lebih baik daripada baseline terpilih pada data eksternal". Hanya run simple yang
> bisa menjawab itu.

**Peringkat akhir:**

| Peringkat | Run | Peran dalam paper |
|---|---|---|
| 🥇 **1** | **enhanced** | **Run utama.** Semua angka headline diambil dari sini |
| 🥈 2 | simple | Run korroborasi + satu-satunya sumber kontras CSD vs M\* eksternal |
| 🥉 3 | efficient | Artefak historis. **Jangan kutip angkanya**; sebut hanya sebagai replikasi mekanisme |

---

## 2. Tabel Induk Perbandingan

| Dimensi | efficient | simple | **enhanced** | Pemenang |
|---|---|---|---|---|
| **INTEGRITAS** | | | | |
| Gate lolos | 16/17 | 32/32 | **36/36** | 🏆 enhanced |
| Gate gagal | `Gate6b_PT2E` (suplementer) | — | — | simple / enhanced |
| Audit-mandiri hasil | ✗ | ✗ | **✅ 265/265 cocok** | 🏆 enhanced |
| Peringatan collapse | 10 kondisi | **0** | **0** | simple / enhanced |
| **PROTOKOL SELEKSI** | | | | |
| Seed untuk grid | 1 | 3 | **3** | simple / enhanced |
| Seleksi resep Stage A | ✗ | ✗ | **✅** | 🏆 enhanced |
| Kalibrasi threshold t\* | ✗ | ✗ | **✅** | 🏆 enhanced |
| Seed RQ2 | 1v1, 3v1 | **5/5** | **5/5** | simple / enhanced |
| **DATA & EVALUASI** | | | | |
| Set-C konfirmatori | ✗ | **✅** | **✅** | simple / enhanced |
| Eksternal per-seed | ✗ (n=1 vs n=1) | ✅ | **✅ 5 seed matched** | simple / enhanced |
| Bootstrap patient-clustered | ✅ | ✅ | **✅ 155 interval** | seri |
| **PERFORMA ABSOLUT** | | | | |
| Teacher test QWK | 0,6610 | 0,6544 | **0,7364** | 🏆 enhanced |
| Student terbaik test QWK | 0,5190 | 0,5546 | **0,6161** | 🏆 enhanced |
| Retensi QWK teacher | 75,5% | **84,7%** | 81,7% | 🥈 simple |
| Dual-view gain teacher | +0,0863 | **+0,1143** | +0,0469 | 🥈 simple |
| **EFISIENSI** | | | | |
| Parameter student | 329.484 | 328.588 | 328.588 | seri |
| Kompresi vs teacher | 118× | 119× | **119,0×** | seri |
| Percepatan CPU | 19,2× | 18,0× | **19,3×** | seri |
| Latensi deployment | 8,65 ms | **6,22 ms** | 11,35 ms | 🥈 simple |
| **HASIL RQ** | | | | |
| RQ1 prediktif | 1 kekalahan kredibel | 3 null | **3 null** | simple / enhanced |
| RQ1 mekanisme | CSD terbaik 4/4 | CSD terbaik 3/3 | **CSD terbaik 3/3** | seri ✅ |
| RQ2 degradasi kredibel | tidak ada | tidak ada | **tidak ada** | seri ✅ |
| M\* terpilih | dual_featkd | dual_logitkd | **dual_csd** | ⚠ berbeda |
| Model deployment | qat_int8 | ft_ptq_int8 | qat_int8 | ⚠ berbeda |

---

## 3. Perbandingan Integritas dan Metodologi

### 3.1 Run efficient — cacat metodologis nyata

Run ini punya **empat kelemahan** yang bukan sekadar kekurangan, melainkan cukup serius untuk
membatalkan kutipan angkanya:

1. **Grid hiperparameter hanya 1 seed.** Sebuah konfigurasi bisa menang karena keberuntungan.
2. **RQ2 sangat tipis pada seed:** `ptq vs fp32` adalah **1 seed vs 1 seed**; `qat vs fp32` adalah
   3 vs 1. Selang kepercayaannya berasal dari resampling *mata*, bukan *model* — sehingga tidak
   menangkap variasi antar-seed sama sekali.
3. **Tidak memuat Set-C.** Eksternalnya memakai partisi train/validation DeepDRiD, bukan partisi
   konfirmatori yang dipra-registrasi.
4. **Keunggulan CSD eksternal adalah n=1 vs n=1** — metode dan seed terkonfound sepenuhnya.

Ditambah **dua cacat figur**: `fig_11` kehilangan bar internal untuk `best_csd_fp32`, dan caption
`fig_08` menyebut "ShiftMAE" padahal panelnya memplot "ShiftL1" (dua besaran berbeda,
ShiftMAE = ShiftL1/4).

> **Implikasi praktis:** klaim paling mencolok dari run efficient — "CSD terbaik di 6/6 partisi
> eksternal" dan "retensi INT8 100,2–100,6%" — keduanya adalah artefak dari desain yang lemah.
> Retensi di atas 100% adalah derau, dan 6/6 itu satu model melawan satu model.

### 3.2 Run simple — bersih dan lengkap

32/32 gate, 0 error, 0 peringatan collapse. Memperbaiki **keempat** kelemahan run efficient: grid
3-seed, RQ2 5-seed matched, Set-C konfirmatori, evaluasi eksternal per-seed. Ini adalah run yang
pertama kali layak dikutip.

Satu masalah kebersihan yang tersisa: **tiga figur nyasar** di `figures-simple-notebook/`
(`fig_01_architecture`, `fig_02_experimental_workflow`, `fig_13_qwk_vs_size`) yang berasal dari run
efficient — sehingga terdapat **dua `fig_13` berbeda dalam satu folder**. Periksa nama berkas
terhadap daftar resmi (`fig_01_dataset` … `fig_14_internal_vs_external`) sebelum mengutip apa pun
dari folder itu.

### 3.3 Run enhanced — paling ketat

Menambahkan **empat perbaikan yang dipra-registrasi** di atas run simple:

| Perbaikan | Efek terukur |
|---|---|
| Seleksi resep Stage A (sebelum teacher dilatih) | terpilih 384/standard, val QWK 0,6491 vs 0,5549 |
| Kalibrasi threshold t\* per kondisi dari validasi | t\* = 0,40–0,50 tergantung kondisi |
| sqrt class-balanced sampling | — |
| Dua gate baru, termasuk audit-mandiri *blocking* | **265 nilai direkomputasi, 0 selisih** |

Gate audit-mandiri itu penting secara khusus: ia merekomputasi setiap angka headline dari prediksi
per-sampel dan memblokir run bila ada yang tidak cocok. **Tidak ada run lain yang punya
pemeriksaan ini.** Folder figurnya juga bersih — tidak ada tabrakan `fig_13` seperti pada folder
simple.

---

## 4. RQ1 Sisi Prediktif — Tiga Run

| Perbandingan | efficient | simple | enhanced |
|---|---|---|---|
| CSD vs no-distillation | −0,0082 [−0,0491, +0,0322] | +0,0171 [−0,0276, +0,0648] | −0,0024 [−0,0336, +0,0285] |
| CSD vs logit-KD | +0,0019 [−0,0370, +0,0405] | −0,0250 [−0,0781, +0,0254] | +0,0077 [−0,0304, +0,0463] |
| CSD vs feature-KD | **−0,0382 [−0,0772, −0,0007] KALAH KREDIBEL** | −0,0189 [−0,0639, +0,0263] | −0,0143 [−0,0445, +0,0153] |
| **Putusan** | 2 null + 1 kalah | **3 null** | **3 null** |

**Arah efek tidak stabil.** CSD vs no-distillation: −0,0082 → +0,0171 → −0,0024. Tandanya berubah
dua kali. Karena semuanya null, tidak ada kontradiksi statistik — tetapi ini bukti tambahan bahwa
efek prediktifnya, bila ada, lebih kecil daripada yang dapat dideteksi 5 seed di DRTiD.

### ⚠ Temuan Lintas Run yang Paling Penting

**CSD menempati peringkat 3 dari 4 pada test QWK di KETIGA run.**

| Run | Peringkat 1 | Peringkat 2 | Peringkat 3 | Peringkat 4 |
|---|---|---|---|---|
| efficient | feature-KD 0,5190 | no-distill 0,4890 | **CSD 0,4809** | logit-KD 0,4790 |
| simple | logit-KD 0,5546 | feature-KD 0,5484 | **CSD 0,5296** | no-distill 0,5124 |
| enhanced | feature-KD 0,6161 | no-distill 0,6042 | **CSD 0,6018** | logit-KD 0,5942 |

Setiap perbandingan individual memang null. **Tetapi konsistensi peringkat lintas tiga run
independen adalah bukti yang lebih kuat daripada tiap null secara terpisah.** Bila CSD benar-benar
netral terhadap baseline, peringkat 3 sebanyak tiga kali berturut-turut punya peluang sekitar
1/64. Ini bukan uji formal — run tidak sepenuhnya independen karena berbagi data dan arsitektur —
tetapi polanya terlalu konsisten untuk diabaikan.

Sebaliknya, **feature-KD menempati peringkat 1 pada dua run dan peringkat 2 pada satu run.**

> **Kesimpulan jujur yang harus masuk paper:** bila tujuannya adalah akurasi prediktif,
> **feature-KD adalah metode yang lebih baik**, dan CSD tidak pernah unggul di run mana pun.
> Nilai CSD bersifat **murni mekanistik**, bukan prediktif. Menyatakan ini secara eksplisit jauh
> lebih kuat daripada bersembunyi di balik "semua perbandingan null".

---

## 5. RQ1 Sisi Mekanisme — Inilah yang Mereplikasi

| Kondisi | efficient ShiftL1↓ | simple ShiftL1↓ | enhanced ShiftL1↓ |
|---|---|---|---|
| no-distillation | 0,3534 | 0,4605 | 0,3759 |
| logit-KD | 0,3875 | 0,4524 | 0,3840 |
| feature-KD | 0,3469 | 0,4489 | 0,3718 |
| **CSD** | **0,3218** ✅ | **0,4320** ✅ | **0,3509** ✅ |

| Kondisi | efficient CosAgree↑ | simple CosAgree↑ | enhanced CosAgree↑ |
|---|---|---|---|
| no-distillation | +0,2634 | +0,3180 | +0,3509 |
| logit-KD | +0,1881 | +0,3468 | +0,2858 |
| feature-KD | +0,2785 | +0,3721 | +0,3815 |
| **CSD** | **+0,3621** ✅ | **+0,4257** ✅ | **+0,4361** ✅ |

| Kondisi | efficient BenefitCorr↑ | simple BenefitCorr↑ | enhanced BenefitCorr↑ |
|---|---|---|---|
| no-distillation | +0,1408 | +0,1850 | +0,2193 |
| logit-KD | +0,0954 | +0,2161 | +0,1795 |
| feature-KD | +0,1652 | +0,2330 | +0,1943 |
| **CSD** | **+0,3101** ✅ | **+0,2902** ✅ | **+0,3075** ✅ |

### 🎯 **CSD unggul pada SETIAP metrik mekanisme di SETIAP run. Tanpa kecuali. 9 dari 9.**

Nilai BenefitCorr CSD sangat stabil: **+0,3101 / +0,2902 / +0,3075** — rentang hanya 0,02 pada tiga
pelatihan independen dengan resolusi berbeda (224/224/384), GPU berbeda, dan rezim seleksi berbeda.
Ini adalah **hasil paling kuat dalam seluruh penelitian**.

**Yang TIDAK stabil adalah urutan di antara baseline.** Pada run enhanced, logit-KD justru lebih
buruk daripada no-distillation pada **ketiga** metrik — kebalikan dari run simple. Pada run
efficient, logit-KD juga terburuk.

> **Rumusan yang dapat dipertahankan:** jarak antara CSD dan kelompok baseline bersifat **robust**;
> urutan **di dalam** kelompok baseline **tidak**.

---

## 6. RQ2 — Kuantisasi

| | efficient | simple | enhanced |
|---|---|---|---|
| PTQ retensi | 100,2% (derau) | 98,3% | 97,3% |
| FT-PTQ retensi | — | 97,5% | 96,8% |
| QAT retensi | 100,6% (derau) | 94,7% | **99,0%** |
| Percepatan CPU | 1,45–1,47× | ~2,47× | **2,86–2,89×** |
| Pengecilan artefak | 1,36× | 1,36× | 1,36× |
| Degradasi kredibel? | **tidak ada** | **tidak ada** | **tidak ada** |
| Kontrol FP32-FT | ✅ | ✅ | ✅ |

### ✅ RQ2 mereplikasi bersih di ketiga run: **tidak ada degradasi INT8 yang kredibel.**

Ini adalah **hasil paling aman dalam paper**, dan satu-satunya yang konsisten baik pada sisi
mekanisme maupun prediktif.

Catatan per run:

- **efficient** — retensi >100% adalah derau, bukan peningkatan. Jangan kutip.
- **simple** — ada ketidaksepakatan CI vs uji permutasi pada QAT (CI memuat nol, p = 0,001).
  Laporkan keduanya, klaim tidak ada.
- **enhanced** — ada satu ketidaksepakatan serupa pada `ptq vs best_fp32` (CI [−0,0360, +0,0023],
  p_holm = 0,0243). Perlakuan sama.

---

## 7. Validasi Eksternal — Di Sinilah Ketiganya Paling Berbeda

| | efficient | simple | enhanced |
|---|---|---|---|
| Partisi | train/val DeepDRiD | **Set-C konfirmatori** | **Set-C konfirmatori** |
| Desain | 1 model vs 1 model | per-seed | **5 seed matched** |
| Teacher QWK | — | 0,7788 | **0,7923** |
| Student terbaik | CSD 0,5537 | **CSD 0,7346** | PTQ 0,6729 |
| M\* | featkd 0,4955 | logitkd 0,6442 | = CSD (identik) |
| CSD > M\* eksternal? | ✅ 6/6 (tapi n=1) | ✅ +0,090 (CI tumpang tindih) | **⛔ tidak dapat diuji** |

### 7.1 Titik Buta Struktural Run Enhanced

Karena M\* = `dual_csd`, maka `csd_fp32` dan `best_fp32` adalah **model yang sama persis** — QWK
0,6688 dengan sd 0,0415 pada kedua baris, identik hingga digit terakhir. Notebook menanganinya
dengan benar dan **melewati** perbandingannya:

```
csd_fp32 vs best_fp32 SKIPPED -- M* is dual_csd, so the two are the same models
```

Konsekuensinya: **run terbaik justru tidak dapat menguji klaim eksternal yang paling menarik.**
Klaim "CSD adalah student terkuat pada data eksternal" hanya didukung oleh run simple (dengan CI
tumpang tindih) dan run efficient (dengan n=1). **Itu klaim yang lemah, dan harus dinyatakan
lemah.**

### 7.2 Efek Fine-Tuning Eksternal TIDAK Mereplikasi

| Perbandingan (Set-C) | simple | enhanced |
|---|---|---|
| FT-PTQ vs FP32 | **+0,0766 [+0,0137, +0,1452] KREDIBEL** | −0,0175 [−0,0546, +0,0142] tidak kredibel |
| QAT vs FP32 | **+0,0738 [+0,0069, +0,1468] KREDIBEL** | −0,0344 [−0,0747, +0,0018] tidak kredibel |
| fp32_ft_control vs FP32 | *(tidak dievaluasi eksternal)* | −0,0121 [−0,0383, +0,0152] tidak kredibel |

Run simple menemukan bahwa varian ber-*fine-tune* **lebih baik secara kredibel** di Set-C, dan
menyimpulkan keuntungan itu berasal dari fine-tuning, bukan kuantisasi. **Run enhanced sama sekali
tidak menemukan efek itu** — bahkan tandanya negatif.

> **Konsekuensi untuk paper:** temuan "INT8 ber-fine-tune membantu di bawah pergeseran distribusi"
> dari run simple **tidak boleh dikutip sebagai mapan**. Ia gagal replikasi pada run yang lebih
> ketat. Nyatakan kedua hasil.

### 7.3 Satu-satunya Perbandingan Eksternal Kredibel di Seluruh Penelitian

Run enhanced: **`qat_int8` vs `ptq_int8` = −0,0384 [−0,0826, −0,0006]**.

QAT — model yang justru dipilih untuk deployment — secara kredibel **lebih buruk** daripada PTQ di
Set-C. Arahnya **berbalik** dari hasil internal (+0,0101, tidak kredibel). Aturan deployment memilih
QAT berdasarkan retensi validasi 99,0%, dan aturan itu dibekukan sebelum test dibuka — jadi
pilihannya sah. Tetapi ini menunjukkan **kriteria seleksi internal tidak selaras dengan performa
eksternal**, dan itu wajib masuk bab keterbatasan.

---

## 8. Ketidakstabilan Seleksi — Tiga Run, Tiga Pemenang Berbeda

| Run | M\* terpilih | Dasar val QWK | Model deployment |
|---|---|---|---|
| efficient | `dual_featkd` (seed 123) | 0,5633 | `qat_int8` |
| simple | `dual_logitkd` (seed 8888) | 0,5670 | `ft_ptq_int8` |
| enhanced | `dual_csd` (seed 3407) | 0,6490 | `qat_int8` |

**Ketiga run memilih metode yang berbeda.** Pada run enhanced, jarak validasi antara `dual_csd`
(0,6490) dan `dual_featkd` (0,6477) hanya **0,0013** — notebook sendiri mencetak
`2 methods within 0.005 mean QWK -- tie-break chain applied`.

> Ini bukan kegagalan protokol; protokolnya justru bekerja dengan benar dan konsisten. **Ini adalah
> bukti langsung bahwa keempat metode secara praktis tidak dapat dibedakan pada skala data ini.**
> Yang menentukan pemenang bukan metodenya, melainkan derau seleksi.
>
> Ini adalah temuan yang layak satu paragraf tersendiri di bab Pembahasan, dan ia **memperkuat**
> kesimpulan null RQ1 alih-alih melemahkannya.

---

## 9. Trade-off Akurasi vs Latensi — Enhanced Tidak Menang Mutlak

Satu hal yang harus jujur: keunggulan akurasi run enhanced **dibayar dengan latensi**, karena
resolusinya 384 bukan 224.

| | simple (224) | enhanced (384) |
|---|---|---|
| Teacher test QWK | 0,6544 | **0,7364** |
| Student test QWK | ~0,5546 | **0,6018** |
| Latensi teacher | — | 627,6 ms |
| Latensi student FP32 | — | 32,6 ms |
| **Latensi deployment** | **6,22 ms** | 11,35 ms |

**Model deployment run enhanced ~1,8× lebih lambat** daripada run simple. Kedua angka itu
**tidak dapat dibandingkan langsung** karena resolusi masukannya berbeda — dan itu sendiri harus
dinyatakan di paper.

> **Pengungkit terbesar dalam seluruh studi ini adalah resolusi, bukan distilasi.** Stage A
> memilih 384/standard dengan margin **+0,094 val QWK** atas 224/standard. Itu sekitar **7× lebih
> besar** daripada efek CSD mana pun yang terukur. Fakta ini layak masuk Pembahasan: bila tujuannya
> menaikkan QWK, menaikkan resolusi jauh lebih efektif daripada mengganti fungsi loss distilasi.

Jadi:
- Butuh **akurasi terbaik** → enhanced
- Butuh **latensi terendah** → simple (6,22 ms)
- Keduanya berada di frontier Pareto yang berbeda

---

## 10. Apa yang Mereplikasi dan Apa yang Tidak

| Temuan | efficient | simple | enhanced | Status |
|---|---|---|---|---|
| CSD terbaik di semua metrik mekanisme | ✅ | ✅ | ✅ | 🟢 **REPLIKASI PENUH (9/9)** |
| CSD peringkat 3/4 pada test QWK | ✅ | ✅ | ✅ | 🟢 **REPLIKASI PENUH** |
| Tidak ada keunggulan prediktif CSD | ✅ | ✅ | ✅ | 🟢 **REPLIKASI PENUH** |
| Tidak ada degradasi INT8 kredibel | ✅ | ✅ | ✅ | 🟢 **REPLIKASI PENUH** |
| Dual-view > single-view terbaik | ✅ | ✅ | ✅ | 🟢 **REPLIKASI PENUH** |
| Kompresi ~119× / percepatan ~19× | ✅ | ✅ | ✅ | 🟢 **REPLIKASI PENUH** |
| Recall Grade 1 ≈ 0 | ✅ ~0,04 | ✅ | ✅ 0,068 | 🟢 **REPLIKASI PENUH** |
| CSD terbaik pada data eksternal | ✅ (n=1) | ✅ (CI tumpang tindih) | ⛔ tidak dapat diuji | 🟡 **LEMAH** |
| Arah efek CSD vs no-distill | − | + | − | 🔴 **TIDAK STABIL** |
| M\* terpilih | featkd | logitkd | csd | 🔴 **TIDAK STABIL** |
| Efek FT eksternal | — | ✅ kredibel | ❌ tidak ada | 🔴 **GAGAL REPLIKASI** |
| Model deployment | qat | ft_ptq | qat | 🔴 **TIDAK STABIL** |

**Tujuh temuan mereplikasi penuh lintas tiga run.** Itu fondasi paper.
**Empat temuan tidak stabil.** Itu bab keterbatasan.

---

## 11. Cara Memakai Ketiganya di Paper

### ✅ Yang dikutip dari **enhanced** (run utama)

Semua angka headline:
```
Teacher       : 40.313.932 parameter · test QWK 0,7364 · 154,09 MB · 627,6 ms
Student (M*)  : 328.588 parameter    · test QWK 0,6018 ·   1,29 MB ·  32,6 ms
Deployment    : qat_int8 seed 42     ·   0,95 MB · 11,35 ms · retensi validasi 99,0%
Kompresi      : 119,0x lebih kecil · 19,3x lebih cepat · 81,7% QWK teacher
Eksternal     : Set-C 0,6688 (student) vs 0,7923 (teacher) — retensi 84,4%
RQ1 mekanisme : ShiftL1 0,3509 · CosAgree +0,4361 · BenefitCorr +0,3075
RQ1 prediktif : 3/3 null
RQ2           : tidak ada degradasi kredibel; QAT retensi 99,0%
```
Figur: seluruhnya dari `enhanched-notebook/figures/` (folder bersih, tanpa tabrakan nama).

### ✅ Yang dikutip dari **simple**

- Kontras eksternal **CSD vs M\*** di Set-C (0,7346 vs 0,6442) — **satu-satunya sumber** untuk ini,
  selalu dengan peringatan CI tumpang tindih dan catatan bahwa CSD justru lebih buruk di Set-B
- Efek FT eksternal (+0,0766) — **selalu berpasangan** dengan kegagalan replikasinya di enhanced
- Titik latensi 6,22 ms sebagai varian efisiensi @224
- Observasi CSD punya Macro-F1 **terendah** di Set-C meski QWK tertinggi — pengamatan tajam bahwa
  kesepakatan ordinal dan keseimbangan antar-kelas dapat terpisah

### ✅ Yang dikutip dari **efficient**

**Hanya satu kalimat:** replikasi ketiga untuk urutan mekanisme. Jangan kutip angka apa pun —
retensi >100%, klaim eksternal 6/6, dan seluruh statistik RQ2-nya berasal dari desain yang terlalu
tipis.

### ❌ Yang TIDAK boleh ditulis

- ❌ "CSD mengungguli baseline" — CI memuat nol di ketiga run, dan CSD peringkat 3/4 di ketiganya
- ❌ "Kuantisasi INT8 meningkatkan generalisasi" — gagal replikasi di enhanced
- ❌ "CSD adalah student terbaik pada data eksternal" — hanya n=1 dan CI tumpang tindih
- ❌ "Retensi INT8 100%" — itu derau dari run efficient
- ❌ Angka apa pun dari run efficient tanpa disclaimer desain
- ❌ Mengutip figur dari `figures-simple-notebook/` tanpa mengecek nama (ada dua `fig_13`)

---

## 12. Kesimpulan

**Run enhanced adalah yang terbaik** — paling ketat protokolnya (36/36 gate, satu-satunya dengan
audit-mandiri hasil), paling higienis seleksinya (Stage A + kalibrasi threshold + grid 3-seed),
dan paling tinggi performa absolutnya (teacher 0,7364, student 0,6018). Jadikan ia run utama.

**Tetapi tidak satu pun run mengubah kesimpulan ilmiahnya**, dan itulah kekuatan sebenarnya dari
penelitian ini. Tiga pelatihan independen, tiga resolusi/perangkat/rezim seleksi, tiga pemenang
seleksi berbeda — namun **sembilan dari sembilan** pengukuran mekanisme menempatkan CSD di puncak,
dan **tiga dari tiga** run menempatkannya di peringkat 3 dari 4 pada akurasi prediktif.

> **Disosiasi itu nyata, terukur, dan tereplikasi tiga kali.** Sinyal komplementaritas dapat
> didistilasi; distilasi itu tidak menjadi akurasi ordinal yang lebih baik. Melaporkan keduanya
> dengan bobot setara adalah kontribusi paper ini — dan itu lebih bernilai daripada peningkatan
> 0,01 QWK yang tidak dapat direproduksi.

---

*Disusun dari `efficient-notebook/RESULTS_OVERVIEW.md`, `simple-notebook/RESULTS_OVERVIEW.md`, dan
`enhanched-notebook/RESULTS_OVERVIEW.md`. Setiap angka dapat dilacak ke dokumen sumbernya.*
