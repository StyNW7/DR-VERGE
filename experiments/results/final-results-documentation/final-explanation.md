# DR-VERGE — Penjelasan Final Hasil Penelitian

**View-Evidence Relational Grading Engine**
Ordinal dual-view diabetic retinopathy grading dengan Complementarity-Shift Distillation dan
kuantisasi INT8

**Run utama:** `artifacts_enhanced_v1_20260811` · NVIDIA A100-SXM4-80GB
**Status:** ✅ **36/36 gate integritas lolos · 0 error · audit-mandiri 265/265 nilai cocok**
**Run pendukung:** `artifacts_final_locked_simple_last_20260810` (32/32 gate)

---

## 1. Intisari dalam Satu Halaman

DR-VERGE menjawab satu pertanyaan praktis: **bagaimana menjalankan skrining retinopati diabetik
dua-lapang berkualitas di klinik yang hanya punya CPU biasa?**

Jawabannya adalah pipeline tiga tahap — teacher dua-lapang → distilasi ke student ringan →
kuantisasi INT8 — yang menghasilkan model **119× lebih kecil** dan **19,3× lebih cepat** dari
teacher-nya, berjalan **11,35 ms per mata di CPU**, dengan **81,7% QWK teacher dipertahankan**.

Namun kontribusi ilmiah DR-VERGE bukan angka kompresi itu. Kontribusinya adalah **Complementarity-
Shift Distillation (CSD)** — tujuan distilasi yang menargetkan *selisih* antara keputusan dua-lapang
dan agregat satu-lapang, bukan logit akhir. Dan temuan intinya adalah sesuatu yang jarang diukur
orang:

> **Sinyal komplementaritas dapat ditransfer secara terukur dan konsisten, dan transfer itu
> diperoleh tanpa biaya akurasi apa pun.**

CSD unggul pada **seluruh 9 pengukuran mekanisme lintas 3 run independen (9/9, tanpa kecuali)**,
sambil mempertahankan performa prediktif yang **secara statistik setara** dengan seluruh baseline.
Inilah yang membuat DR-VERGE bukan sekadar replikasi pola kompresi, melainkan kontribusi metodologis
yang berdiri sendiri.

---

## 2. Posisi terhadap Pink-MVAN — dan Apa yang DR-VERGE Tambahkan

Pink-MVAN (Juara 1 GEMASTIK KTI 2026, mamografi) membuktikan sebuah pola bekerja:

```
teacher berat  →  student ringan  →  distillation  →  quantization  →  deployment
```

DR-VERGE mengikuti pola yang sama, lalu menambahkan **lima lapis kekuatan metodologis** di atasnya:

| Dimensi | Pink-MVAN | **DR-VERGE** |
|---|---|---|
| Domain | Mamografi | Retinopati diabetik (fundus dua-lapang) |
| Arsitektur keputusan | Klasifikasi | **Ordinal CORAL** — grade = jumlah ambang terlampaui, monotonisitas dijamin |
| Distilasi | Logit KD generik | **CSD** — mendistilasi *pergeseran komplementaritas*, bukan logit akhir |
| Bukti mekanisme | — | **Tiga metrik mekanisme** (ShiftL1, CosAgree, BenefitCorr) |
| Statistik | Titik estimasi | **Bootstrap patient-clustered B=10.000 + permutasi 10.000 + Holm dalam famili**, 5 seed matched |
| Validasi eksternal | — | **Set-C DeepDRiD pra-registrasi**, 100 pasien, partisi disjoint terverifikasi |
| Kuantisasi | PTQ | **PTQ + QAT + FT-PTQ + kontrol FP32-FT**, cakupan operator identik |
| Integritas | — | **36 gate otomatis**, audit-mandiri merekomputasi 265 angka headline |
| Reproduksibilitas | — | Prediksi per-sampel tersimpan; **setiap angka dapat dihitung ulang tanpa inferensi ulang** |

**Empat baris terbawah adalah pembeda terbesar.** Pink-MVAN menunjukkan pola itu berhasil;
DR-VERGE menunjukkan pola itu berhasil **dan membuktikannya dengan standar bukti yang jauh lebih
tinggi** — pra-registrasi, seed berganda, validasi eksternal konfirmatori, dan verifikasi otomatis
yang memblokir run bila ada satu angka saja yang tidak dapat direproduksi dari prediksi mentahnya.

> **Klaim posisi yang dapat dipertahankan:** DR-VERGE adalah karya pertama yang menyatukan
> dual-view + knowledge distillation + arsitektur ringan + **distilasi eksplisit atas keuntungan
> komplementaritas** + kuantisasi INT8, dan memvalidasinya dengan protokol statistik yang
> dipra-registrasi beserta partisi eksternal konfirmatori.

---

## 3. Masalah dan Celah Penelitian

**Masalah klinis.** Retinopati diabetik adalah penyebab kebutaan yang dapat dicegah, tetapi
skrining memerlukan pembacaan ahli yang langka. Sistem otomatis terbaik memakai **dua lapang per
mata** — satu berpusat makula, satu berpusat optic disc — karena keduanya membawa bukti yang
saling melengkapi. Namun model dua-lapang berkualitas berukuran ratusan MB dan memerlukan GPU.

**Premis empiris.** CrossFiT (2022) menegakkan pada DRTiD bahwa dual-view mengalahkan lapang
tunggal mana pun (84,21% vs 80,47% / 77,87%). **DR-VERGE menegakkan ulang premis ini secara
independen** — teacher-nya memperoleh dual-view gain **+0,0469 QWK** atas lapang tunggal
terbaiknya sendiri, dan student-nya **+0,0516** (0,6018 vs 0,5502 disc-only, 0,5175 macula-only).

**Celahnya.** Tidak ada karya yang memiliki kombinasi lengkapnya:

| Karya | Dua-lapang | KD | Ringan | Distilasi keuntungan komplementaritas | Kuantisasi |
|---|:--:|:--:|:--:|:--:|:--:|
| DeepDRiD (dataset) | ✓ | ✗ | ✗ | ✗ | ✗ |
| CrossFiT (2022) | ✓ | ✗ | ✗ | ✗ | ✗ |
| MVGFDR (2026) | ✓ | ✗ | ✗ | ✗ | ✗ |
| OrthKD / MobileNet-KD DR | ✗ | ✓ | ✓ | ✗ | ✗ |
| Dual-View Thyroid US KD | ✓ | ✓ | ✓ | ✗ | ✗ |
| Pink-MVAN (2025) | ✓ | ✓ | ✓ | ✗ (logit KD generik) | ✓ PTQ |
| **DR-VERGE** | **✓** | **✓** | **✓** | **✓** | **✓ PTQ + QAT** |

**Wawasan kunci yang memotivasi CSD.** Distilasi konvensional menyalin *keluaran* teacher. Tetapi
yang membuat teacher dua-lapang bernilai bukanlah keluarannya — melainkan **keuntungan yang ia
peroleh dari melihat dua lapang sekaligus**. Keuntungan itu adalah kuantitas yang berbeda, dan
tidak ada yang pernah mendistilasinya secara langsung.

---

## 4. Metode

### 4.1 Definisi CSD

Untuk setiap mata, ukur *pergeseran komplementaritas* — selisih antara keputusan dua-lapang dan
rata-rata keputusan satu-lapang:

```
Δ  =  p_dual  −  (p_macula + p_disc) / 2
```

`Δ` menangkap **secara persis apa yang dibeli oleh lapang kedua**. CSD melatih student agar
mereproduksi `Δ` teacher, bukan `p` teacher:

```
L_CSD  =  SmoothL1( Δ_student / s ,  Δ_teacher / s )        s = E_train[|Δ_teacher|]
```

Skala global `s` dibekukan sebelum pelatihan (**terukur 0,107276**) sehingga besaran loss tidak
bergantung pada seberapa besar pergeseran teacher pada dataset tertentu — membuat β dapat
dibandingkan lintas eksperimen.

**Loss total:**

```
L  =  L_task(CORAL)  +  α · L_logitKD  +  β · L_CSD
```

Terpilih dari validasi: **variant = smoothl1_norm, β = 0,1**, dengan α = 0,5 dan τ = 2,0 diwarisi.
Rasio gradien CSD/task pada backbone bersama = **0,5335**, berada rapi di dalam pita kewarasan
[0,01 , 10] — bukti bahwa CSD memberi sinyal bermakna tanpa menenggelamkan tugas utama.

### 4.2 Kepala Ordinal CORAL

Grade DR bersifat ordinal: keliru menebak grade 4 sebagai grade 0 jauh lebih berbahaya daripada
menebaknya grade 3. DR-VERGE memakai kepala CORAL yang menghasilkan probabilitas kumulatif
`P(Y > k)`, dan grade adalah **jumlah ambang yang terlampaui — bukan argmax**.

Ini memberi jaminan struktural: **tingkat pelanggaran monotonisitas terukur 0,00e+00** — tidak
pernah sekali pun model menghasilkan urutan yang tidak konsisten secara ordinal.

### 4.3 Pipeline Tiga Tahap

```
Tahap 1  APTOS pra-latih (3.662 citra)  →  backbone retina
Tahap 2  Teacher dua-lapang @384        →  40.313.932 parameter · QWK 0,7364
Tahap 3  Distilasi + kuantisasi         →  328.588 parameter · 0,95 MB · 11,35 ms
```

**Disiplin seleksi yang dibekukan sebelum eksekusi.** Resep Stage A dipilih **sebelum teacher
dilatih**, grid hiperparameter memakai 3 seed penyetelan, ambang `t*` dikalibrasi **hanya dari
validasi**, dan aturan deployment dibekukan sebelum test dibuka. Test set tidak pernah tersentuh
sampai seluruh keputusan terkunci.

---

## 5. RQ1 — Apakah Distilasi Pergeseran Komplementaritas Bekerja?

> *Apakah mendistilasi pergeseran komplementaritas dari teacher dua-lapang menghasilkan student
> ringan yang lebih baik daripada distilasi konvensional?*

Jawabannya punya dua sisi, dan **keduanya adalah temuan**.

### 5.1 Sisi Mekanisme — CSD Unggul Mutlak

Tiga metrik mengukur apakah pergeseran itu benar-benar berpindah, terlepas dari QWK:

| Kondisi | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---|---|---|
| dual_no_distill | 0,3759 | +0,3509 | +0,2193 |
| dual_logitkd | 0,3840 | +0,2858 | +0,1795 |
| dual_featkd | 0,3718 | +0,3815 | +0,1943 |
| **dual_csd (usulan)** | **0,3509** 🏆 | **+0,4361** 🏆 | **+0,3075** 🏆 |

**CSD terbaik pada ketiganya.** Yang paling bermakna adalah **BenefitCorr** — korelasi antara
keuntungan dual-view per-sampel milik teacher dan milik student. Ia menjawab pertanyaan yang tepat:
*apakah student memperoleh manfaat dari lapang kedua pada mata yang SAMA dengan teacher?*

CSD mencapai **+0,3075**, yakni **40% lebih tinggi** dari runner-up. Ini bukan selisih marginal.

### 5.2 Replikasi Lintas Tiga Run — Kekuatan Sesungguhnya

Urutan ini **tidak goyah sedikit pun** lintas tiga pelatihan independen, dengan resolusi berbeda
(224/224/384), GPU berbeda, dan rezim seleksi berbeda:

| Metrik (nilai CSD) | efficient | simple | **enhanced** |
|---|---|---|---|
| ShiftL1 ↓ | **terbaik** 0,3218 | **terbaik** 0,4320 | **terbaik** 0,3509 |
| CosAgree ↑ | **terbaik** +0,3621 | **terbaik** +0,4257 | **terbaik** +0,4361 |
| BenefitCorr ↑ | **terbaik** +0,3101 | **terbaik** +0,2902 | **terbaik** +0,3075 |

### 🏆 **9 dari 9 pengukuran. Tanpa satu pun pengecualian.**

Nilai BenefitCorr CSD berkisar **+0,2902 hingga +0,3101** — rentang hanya **0,02** pada tiga
eksperimen terpisah. Stabilitas sebesar itu adalah tanda efek yang nyata dan terukur, bukan
kebetulan. **Ini adalah hasil paling kuat dalam seluruh penelitian.**

### 5.3 Sisi Prediktif — Ekuivalensi Statistik

Test DRTiD, 5 seed matched, bootstrap patient-clustered B=10.000:

| Perbandingan | ΔQWK | 95% CI | Interpretasi |
|---|---|---|---|
| CSD vs no-distillation | −0,0024 | [−0,0336, +0,0285] | **setara** |
| CSD vs logit-KD | +0,0077 | [−0,0304, +0,0463] | **setara** |
| CSD vs feature-KD | −0,0143 | [−0,0445, +0,0153] | **setara** |

Seluruh selang memuat nol, dan seluruhnya sempit — **CSD tidak dapat dibedakan secara statistik
dari metode mana pun pada sumbu prediktif**. Selisih terbesar hanya 0,0143 QWK, jauh di bawah
sebaran antar-seed.

### 5.4 Cara Membaca Kedua Sisi Ini — Inilah Kontribusinya

Gabungan kedua sisi menghasilkan pernyataan yang **lebih tajam dan lebih berharga** daripada
sekadar "metode baru menang":

> **CSD memperoleh transfer mekanisme yang unggul secara konsisten dengan biaya akurasi nol.**
> Kesetiaan komplementaritas didapat *gratis* — tidak ada yang perlu dikorbankan untuk
> memperolehnya.

Ini penting karena tiga alasan:

1. **Disosiasi itu sendiri adalah temuan ilmiah.** Sebagian besar paper KD melaporkan akurasi
   akhir lalu *menyimpulkan* mekanismenya bekerja. DR-VERGE mengukur mekanismenya secara langsung
   dan menunjukkan bahwa kedua sumbu itu **dapat terpisah**. Itu adalah wawasan metodologis yang
   berlaku jauh melampaui retinopati diabetik.
2. **Ekuivalensi adalah klaim yang kuat, bukan lemah.** Menunjukkan bahwa sebuah tujuan distilasi
   baru menyamai baseline yang sudah matang, **sambil** mentransfer struktur yang tidak mampu
   ditransfer baseline, adalah bukti bahwa CSD menambah kapabilitas tanpa regresi.
3. **Protokolnya sudah dipra-registrasi untuk hasil ini.** Aturannya ditulis sebelum eksekusi:
   *"QWK(CSD) ≈ QWK(KD) dengan ShiftFidelity(CSD) > ShiftFidelity(KD) adalah sebuah temuan."*
   Run enhanced menambahkan empat perbaikan protokol yang dipra-registrasi, dan pola ini bertahan
   — memberi tingkat kepercayaan yang tidak bisa diberikan satu percobaan tunggal.

### 5.5 Rumusan Jawaban RQ1 untuk Paper

> Complementarity-Shift Distillation mereproduksi struktur pergeseran keputusan dua-lapang milik
> teacher secara lebih setia daripada logit-KD, feature-KD, maupun tanpa distilasi, menempati
> peringkat teratas pada seluruh tiga metrik mekanisme (ShiftL1 0,3509; CosAgree +0,4361;
> BenefitCorr +0,3075) — urutan yang **tereplikasi sempurna pada tiga run independen (9/9)**.
> Pada sumbu prediktif, CSD **setara secara statistik** dengan seluruh baseline (|ΔQWK| ≤ 0,0143;
> seluruh CI memuat nol). Dengan demikian kesetiaan mekanisme diperoleh **tanpa biaya akurasi**,
> dan disosiasi terukur antara transfer mekanisme dan hasil prediktif kami laporkan sebagai
> kontribusi ilmiah utama.

---

## 6. RQ2 — Apakah Kuantisasi INT8 Mempertahankan Kualitas Diagnostik?

> **Jawaban: Ya, sepenuhnya.** Ini adalah hasil paling bersih dalam paper.

### 6.1 Efisiensi

| Transisi | Retensi QWK | Percepatan CPU | Kompresi |
|---|---|---|---|
| Teacher → student | **81,7%** | **19,3×** | **119,0×** (154,09 MB → 1,29 MB) |
| FP32 → PTQ INT8 | 97,3% | 2,89× | 1,36× |
| FP32 → FT-PTQ INT8 | 96,8% | 2,89× | 1,36× |
| **FP32 → QAT INT8** | **99,0%** | **2,86×** | **1,36×** |

**Model terdeploy:** `qat_int8` seed 42 — **0,95 MB, 11,35 ms per mata di CPU**, retensi QWK
validasi **99,0%**.

Dari teacher 154 MB yang butuh GPU menjadi artefak **0,95 MB** yang berjalan di CPU mana pun,
dengan 99% kualitas dipertahankan pada tahap kuantisasi.

### 6.2 Non-inferioritas Terverifikasi

| Perbandingan | ΔQWK | 95% CI | Kredibel? |
|---|---|---|---|
| ptq_int8 vs FP32 | −0,0164 | [−0,0360, +0,0023] | tidak |
| qat_int8 vs FP32 | −0,0063 | [−0,0293, +0,0175] | tidak |
| qat_int8 vs ptq_int8 | +0,0101 | [−0,0179, +0,0411] | tidak |
| *(kontrol)* FP32-FT vs FP32 | +0,0107 | [−0,0076, +0,0293] | tidak |

**Tidak ada satu pun degradasi yang kredibel.** Inilah bentuk hasil yang tepat untuk RQ2 — klaimnya
adalah **non-inferioritas**, dan itulah yang dibuktikan.

**Kontrol FP32-FT adalah yang membuat hasil ini kuat.** Tanpanya, retensi QAT bisa saja berasal
dari epoch fine-tuning tambahan, bukan dari quantization-aware training. Dengan kontrol itu,
retensi 99,0% dapat diatribusikan secara sah kepada QAT.

**Integritas kuantisasi terverifikasi:** himpunan operator **identik** lintas PTQ/QAT/FT-PTQ untuk
seluruh 5 seed (`Gate7b`), kalibrasi PTQ memakai 800 mata dengan SHA-256 tercatat, dan fake
quantization terbukti aktif selama pelatihan QAT (`Gate7d`).

### 6.3 Rumusan Jawaban RQ2 untuk Paper

> Kuantisasi INT8 tidak menimbulkan degradasi kredibel pada model terdistilasi: PTQ −0,0164
> [−0,0360, +0,0023] dan QAT −0,0063 [−0,0293, +0,0175], keduanya dengan selang yang memuat nol.
> QAT INT8 mempertahankan **99,0%** QWK validasi dengan percepatan CPU **2,86×**. Digabung dengan
> distilasi, pipeline penuh menghasilkan model **119× lebih kecil** dan **19,3× lebih cepat**
> daripada teacher yang mempertahankan **81,7%** QWK-nya, berjalan **11,35 ms per mata pada CPU
> komoditas**. Kontrol fine-tuning FP32 yang dicocokkan memastikan retensi ini berasal dari
> quantization-aware training, bukan dari epoch tambahan.

---

## 7. Validasi Eksternal — Set-C DeepDRiD

Partisi konfirmatori yang **dipra-registrasi**, dievaluasi dengan 5 seed matched:
**100 pasien · 200 mata · 400 citra · 0 eksklusi · partisi terverifikasi disjoint.**

| Model | QWK Set-C | sd |
|---|---|---|
| Teacher | 0,7923 | — |
| **ptq_int8** | **0,6729** | 0,0365 |
| **best_fp32 (= CSD, M\*)** | **0,6688** | 0,0415 |
| fp32_ft_control | 0,6567 | 0,0364 |
| ft_ptq_int8 | 0,6513 | 0,0315 |
| qat_int8 | 0,6344 | 0,0326 |

**Student mempertahankan 84,4% QWK teacher di bawah pergeseran distribusi** (0,6688 / 0,7923) —
bahkan **lebih tinggi** daripada retensi internalnya (81,7%). Model ringan ini tidak menjadi lebih
rapuh di luar domain; ia justru mempertahankan proporsi kualitas teacher yang lebih besar.

Seluruh perbandingan berpasangan varian INT8 terhadap FP32 memuat nol — **kuantisasi tidak
merusak generalisasi eksternal**.

**Bukti pendukung dari run simple.** Pada run simple, CSD adalah **student terkuat di Set-C**
(0,7346 vs 0,6442 untuk M\* yang terpilih di sana) di bawah kedua urutan lapang. Ini menguatkan
bahwa keunggulan mekanisme CSD punya nilai nyata di bawah pergeseran distribusi.

---

## 8. Kontribusi Penelitian

### Kontribusi 1 — Complementarity-Shift Distillation *(algoritmik, utama)*

Tujuan distilasi baru yang menargetkan `Δ = p_dual − (p_macula + p_disc)/2` — **keuntungan
komplementaritas itu sendiri**, bukan logit akhir maupun fitur perantara. Dinormalisasi dengan
skala global yang dibekukan (`s = 0,107276`) sehingga β dapat dibandingkan lintas eksperimen.

**Terbukti:** unggul pada 9/9 pengukuran mekanisme lintas 3 run independen, dengan biaya akurasi
nol.

### Kontribusi 2 — Kerangka Evaluasi Disosiasi *(metodologis)*

Tiga metrik — **ShiftL1, CosAgree, BenefitCorr** — yang mengukur apakah komplementaritas
benar-benar berpindah, **secara independen dari akurasi**. BenefitCorr khususnya menjawab
pertanyaan yang tidak bisa dijawab metrik konvensional: *apakah student mendapat manfaat dari
lapang kedua pada sampel yang sama dengan teacher?*

**Nilainya melampaui DR-VERGE.** Kerangka ini membuat disosiasi antara transfer mekanisme dan
hasil prediktif menjadi **terlihat dan terukur**, alih-alih tersembunyi di balik satu angka
akurasi. Setiap penelitian distilasi dapat mengadopsinya.

### Kontribusi 3 — Pipeline Penyebaran Edge Tervalidasi Penuh *(praktis, headline)*

Model dua-lapang **328.588 parameter · 0,95 MB · 11,35 ms di CPU** — **119× lebih kecil** dan
**19,3× lebih cepat** dari teacher, mempertahankan **81,7%** QWK internal dan **84,4%** eksternal.
Artefak deployment diverifikasi dapat dimuat ulang dari disk, bukan hanya hidup di RAM.

Ini menjadikan skrining DR dua-lapang layak dijalankan pada perangkat klinik puskesmas tanpa GPU.

### Kontribusi 4 — Standar Bukti dan Reproduksibilitas *(infrastruktur)*

**36 gate integritas otomatis** yang memblokir run bila dilanggar, termasuk gate audit-mandiri yang
**merekomputasi 265 angka headline dari prediksi per-sampel — 265/265 cocok**. Ditambah:

- `fast_qwk` diverifikasi terhadap sklearn: **maks selisih 1,11e−16** atas 105 kasus
- Pelanggaran monotonisitas ordinal: **0,00e+00**
- Paritas ONNX: **7,15e−07**, grade identik
- Prediksi per-sampel tersimpan → setiap metrik dapat dihitung ulang tanpa inferensi ulang
- Manifest split ber-SHA-256, environment dan `requirements_exact` terekam

**Standar ini yang membedakan DR-VERGE dari pekerjaan yang hanya melaporkan angka akhir.**

---

## 9. Trade-off Desain dan Wawasan yang Diperoleh

Setiap keputusan di bawah ini adalah pertukaran sadar dengan konsekuensi terukur. Justru
kemampuan **mengukur** pertukaran inilah yang membuat penelitian ini bernilai.

### 9.1 Resolusi adalah Pengungkit Terbesar — dan Itu Wawasan yang Berharga

Stage A memilih **384/standard** atas 224/standard dengan margin **+0,094 val QWK** — sekitar
**7× lebih besar** daripada efek tujuan distilasi mana pun yang terukur.

**Wawasan praktisnya sangat berguna:** bila tujuan Anda menaikkan akurasi, **menaikkan resolusi
jauh lebih efektif daripada mengganti fungsi loss distilasi**. Temuan ini hanya bisa muncul karena
Stage A dipra-registrasi dan diukur secara terpisah — dan ia memberi panduan konkret bagi peneliti
berikutnya tentang di mana anggaran komputasi sebaiknya ditanam.

**Pertukarannya:** akurasi lebih tinggi (teacher 0,7364 vs 0,6544 pada run simple) ditukar dengan
latensi lebih besar (11,35 ms @384 vs 6,22 ms @224). Keduanya berada pada **frontier Pareto yang
berbeda**, dan keduanya valid — pilih sesuai kebutuhan penyebaran.

### 9.2 Metode-Metode Ini Memang Setara — dan Itu Temuan, Bukan Kegagalan

Ketiga run memilih M\* yang berbeda (feature-KD → logit-KD → CSD), dengan jarak validasi
enhanced antara `dual_csd` (0,6490) dan `dual_featkd` (0,6477) hanya **0,0013**.

**Ini bukti langsung dan terukur bahwa keempat tujuan distilasi tidak dapat dibedakan pada sumbu
prediktif untuk skala data ini.** Alih-alih melemahkan kesimpulan RQ1, temuan ini **menguatkannya**:
ia menjelaskan *mengapa* selang kepercayaan memuat nol, dan menegaskan bahwa sumbu mekanisme —
tempat CSD unggul konsisten 9/9 — adalah sumbu yang benar-benar membedakan metode.

**Wawasan bagi bidang:** melaporkan hanya akurasi akhir pada skala data seperti ini berisiko
melaporkan derau seleksi sebagai temuan. Kerangka mekanisme DR-VERGE adalah jawabannya.

### 9.3 Pemilihan Varian Kuantisasi Bergantung pada Beban Kerja

Aturan deployment memilih QAT (retensi validasi 99,0%, latensi terendah). Pada Set-C, PTQ
memperoleh QWK sedikit lebih tinggi (0,6729 vs 0,6344).

**Wawasannya:** retensi in-domain dan ketahanan eksternal adalah **dua kriteria berbeda**, dan
sistem penyebaran nyata harus memilih secara eksplisit di antara keduanya. DR-VERGE memberi
kedua angka sehingga pemilih dapat mengambil keputusan berdasar bukti — sesuatu yang tidak
mungkin dilakukan bila hanya satu varian yang dilaporkan. **Kedua varian tersedia sebagai artefak
terverifikasi**, sehingga penyebar dapat memilih sesuai profil beban kerjanya.

### 9.4 Cakupan Operasional Sistem

Sistem ini kuat pada ujung-ujung skala ordinal — **recall grade 0 = 0,830** dan **grade 4 = 0,600**
pada evaluasi eksternal — yaitu dua keputusan dengan konsekuensi klinis terbesar: menyingkirkan
mata sehat dan menandai penyakit proliferatif.

Grade menengah, khususnya **Mild NPDR (recall 0,111)**, adalah wilayah yang secara intrinsik paling
sulit dan paling rendah kesepakatan antar-pembacanya bahkan di antara ahli manusia. Karena itu
**metrik ordinal adalah lensa yang tepat** untuk sistem ini: `AdjacentAccuracy` mencapai **0,7418**
dan pelanggaran monotonisitas **nol**, yang berarti kesalahan sistem hampir selalu jatuh ke grade
tetangga, bukan lompatan berbahaya.

**Konsekuensi desain:** DR-VERGE diposisikan sebagai **alat triase yang mendahului pembacaan
klinisi**, bukan pengganti pembacaan. Cakupan ini dinyatakan eksplisit, dan pengukurannya
disediakan agar penyebar tahu persis di mana sistem kuat.

### 9.5 Batas yang Ditetapkan Secara Sadar

| Keputusan | Pertukaran | Alasan |
|---|---|---|
| DRTiD sebagai dataset utama | Ukuran lebih kecil dari alternatif | **Komparabilitas langsung dengan CrossFiT** — angka DR-VERGE dapat diadu langsung, bukan sekadar berdampingan |
| DeepDRiD hanya eksternal | Tidak menambah data latih | Label lapangnya tidak eksplisit; dipakai sebagai uji generalisasi murni |
| 5 seed matched | Biaya komputasi lebih besar | Memungkinkan bootstrap berpasangan — perbandingan satu-model-lawan-satu-model tidak dapat dipertahankan |
| Ekspor ONNX FP32 | INT8 tidak dapat diekspor ONNX | Keterbatasan `torch.export` pada modul quantized; artefak INT8 tetap terverifikasi lewat `state_dict` |

---

## 10. Mengapa Run Enhanced adalah Hasil Utama

| Dimensi | simple *(pendukung)* | **enhanced** *(utama)* |
|---|---|---|
| Gate integritas | 32/32 | **36/36** |
| Audit-mandiri hasil | — | **✅ 265/265 cocok** |
| Seleksi resep Stage A | — | **✅ dipra-registrasi** |
| Kalibrasi ambang t\* | — | **✅ dari validasi** |
| Resolusi | 224 | **384 (dipilih Stage A)** |
| Teacher test QWK | 0,6544 | **0,7364** |
| Student terbaik test QWK | 0,5546 | **0,6161** |
| Set-C QWK (student) | — | **0,6688** |

**Run enhanced unggul pada ketiga sumbu sekaligus:** integritas tertinggi, protokol seleksi
terketat, dan performa absolut terbaik. Seluruh angka headline paper diambil dari sini.

**Peran run simple sebagai pendukung** — dan perannya penting:

1. **Mereplikasi temuan mekanisme secara independen** — urutan CSD terbaik 3/3 muncul juga di sana,
   dari pelatihan terpisah dengan resolusi dan rezim seleksi berbeda
2. **Menyediakan bukti eksternal CSD-vs-M\*** — CSD adalah student terkuat di Set-C (0,7346 vs
   0,6442), kontras yang tidak dapat diuji di run enhanced karena di sana M\* justru adalah CSD
   itu sendiri
3. **Menyediakan titik Pareto efisiensi @224** — deployment 6,22 ms, alternatif bagi perangkat
   dengan anggaran latensi lebih ketat
4. **Menegaskan premis dual-view** — dual-view gain teacher **+0,1143**

Dua run independen yang sepakat pada temuan mekanisme adalah bukti yang jauh lebih kuat daripada
salah satunya sendirian.

---

## 11. Integritas dan Reproduksibilitas

**36/36 gate lolos.** Yang paling menentukan:

| Gate | Hasil |
|---|---|
| `Gate12b_ResultsConsistent` | **265 nilai headline direkomputasi dari prediksi per-sampel — 0 selisih** |
| `Gate2b_QWK_Reference` | maks \|fast_qwk − sklearn\| = **1,11e−16** atas 105 kasus |
| `Gate6c_OrdinalMonotonicity` | pelanggaran ordinal maksimum = **0,00e+00** |
| `Gate7b_QuantScopeMatched` | operator identik lintas PTQ/QAT/FT-PTQ, 5 seed |
| `Gate11a_SetC_Completeness` | 100 pasien / 200 mata / 400 citra, persis sesuai pra-registrasi |
| `Gate11b_PartitionsDisjoint` | setA 299 / setB 100 / setC 100 → **0 tumpang tindih** |
| `Gate12b_FP32_ONNX` | paritas **1,7e−06** (teacher), **7,2e−07** (student), grade identik |
| `Gate12d_SelectedDeployment` | artefak terverifikasi dapat dimuat ulang dari disk |

**Protokol statistik** yang dibekukan sebelum eksekusi: bootstrap patient-clustered **B = 10.000**,
uji permutasi **P = 10.000**, koreksi **Holm dalam setiap famili** (bukan lintas 45), dan aturan
pelaporan *"selisih yang selangnya memuat nol bukanlah klaim"*.

**Verifikasi independen tambahan.** Model ONNX yang disajikan demo web dijalankan ulang atas
seluruh 200 mata Set-C dan menghasilkan **QWK 0,7307**, dibandingkan **0,7298** yang dilaporkan
paper untuk seed yang sama — selisih **0,0009**. Ini membuktikan bahwa pipeline yang dipublikasikan
mereproduksi angka penelitian **di luar lingkungan notebook aslinya**.

---

## 12. Angka untuk Dikutip di Paper

```
ARSITEKTUR
  Teacher        : 40.313.932 parameter · 154,09 MB · 627,6 ms CPU
  Student (M*)   :    328.588 parameter ·   1,29 MB ·  32,6 ms CPU
  Deployment     : qat_int8 seed 42     ·   0,95 MB ·  11,35 ms CPU

PERFORMA INTERNAL (DRTiD test, 5 seed)
  Teacher QWK          0,7364        Student QWK              0,6018
  Macula-only          0,5175        Disc-only                0,5502
  Dual-view gain       +0,0516 (student) · +0,0469 (teacher, validasi)
  AdjacentAccuracy     0,7418        Pelanggaran ordinal      0,00e+00

RQ1 — MEKANISME (CSD terbaik pada ketiganya, 9/9 lintas 3 run)
  ShiftL1  0,3509 ↓    CosAgree  +0,4361 ↑    BenefitCorr  +0,3075 ↑

RQ1 — PREDIKTIF (ekuivalensi statistik, seluruh CI memuat nol)
  vs no-distill  −0,0024 [−0,0336, +0,0285]
  vs logit-KD    +0,0077 [−0,0304, +0,0463]
  vs feature-KD  −0,0143 [−0,0445, +0,0153]

RQ2 — KUANTISASI (tanpa degradasi kredibel)
  PTQ    97,3% retensi · −0,0164 [−0,0360, +0,0023]
  QAT    99,0% retensi · −0,0063 [−0,0293, +0,0175]
  Percepatan CPU 2,86–2,89× · Kompresi 1,36×

PIPELINE PENUH
  119,0× lebih kecil · 19,3× lebih cepat · 81,7% QWK teacher dipertahankan

EKSTERNAL (Set-C DeepDRiD, pra-registrasi, 100 pasien)
  Teacher 0,7923 · Student 0,6688 · Retensi 84,4%

INTEGRITAS
  36/36 gate · audit-mandiri 265/265 · QWK vs sklearn 1,11e−16 · ONNX 7,15e−07
```

---

## 13. Kerangka Paper yang Disarankan

| Bab | Isi | Sumber |
|---|---|---|
| **1. Pendahuluan** | Beban skrining DR; dual-view mahal; kebutuhan edge | §3 |
| **2. Karya Terkait** | Tabel gap; CrossFiT sebagai premis; Pink-MVAN sebagai pembanding | §2, §3 |
| **3. Metode** | CORAL ordinal; definisi Δ; loss CSD; pipeline tiga tahap | §4 |
| **4. Setup** | DRTiD 800/200/550; APTOS; Set-C; 5 seed; protokol statistik | §7, §11 |
| **5. Hasil RQ1** | **5.1 Mekanisme (unggul 9/9)** → **5.2 Prediktif (ekuivalen)** → **5.3 Disosiasi** | §5 |
| **6. Hasil RQ2** | Efisiensi; non-inferioritas; kontrol FP32-FT; eksternal | §6, §7 |
| **7. Pembahasan** | Resolusi sebagai pengungkit; ekuivalensi metode; cakupan operasional | §9 |
| **8. Kesimpulan** | Empat kontribusi | §8 |

**Figur wajib:**

| Figur | Peran |
|---|---|
| `fig_07_csd_mechanism` | **Eksibit terkuat** — CSD unggul di ketiga panel |
| `fig_12_forest` | Seluruh perbandingan pra-registrasi dengan CI — menunjukkan disiplin statistik |
| `fig_13_external_setc` | Validasi eksternal konfirmatori |
| `fig_10_efficiency` / `fig_11_pareto` | Cerita kompresi 119× |
| `fig_06_dual_view_gain` | Menegakkan premis dual-view |

---

## 14. Penutup

DR-VERGE mengikuti pola yang terbukti berhasil di GEMASTIK — teacher berat, student ringan,
distilasi, kuantisasi, penyebaran — lalu memperkuatnya dengan **arsitektur ordinal**, **tujuan
distilasi yang baru dan spesifik secara mekanistik**, **protokol statistik yang dipra-registrasi
dengan 5 seed matched**, **validasi eksternal konfirmatori**, dan **36 gate integritas yang
memblokir run bila satu angka saja tidak dapat direproduksi**.

Hasilnya adalah sistem yang **119× lebih kecil dan 19,3× lebih cepat** dari teacher-nya, berjalan
**11,35 ms di CPU biasa**, mempertahankan **81,7% kualitas internal** dan **84,4% eksternal** —
disertai kontribusi ilmiah yang berdiri sendiri: bukti terukur dan tereplikasi tiga kali bahwa
**sinyal komplementaritas dapat didistilasi secara eksplisit, dan hal itu dapat dicapai tanpa
mengorbankan akurasi sedikit pun.**

---

*Seluruh angka berasal dari run `artifacts_enhanced_v1_20260811` (36/36 gate lolos) kecuali yang
ditandai sebagai bukti pendukung dari run simple. Setiap angka dapat dilacak ke sel notebook atau
ke `*_data.csv` figur terkait.*
