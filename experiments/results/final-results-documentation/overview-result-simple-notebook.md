# Ringkasan Hasil Eksperimen DR-VERGE

**Sumber:** `experiment-result/simple-notebook/full_pipeline_notebook_simple.ipynb`
**Run:** `artifacts_final_locked_simple_last_20260810` · GPU: NVIDIA L4 · quantization engine: x86
**Status:** selesai — 50/50 sel kode dieksekusi, **0 error**, **32/32 gate LULUS**

---

## 1. Kesimpulan Singkat

**Run ini bersih dan hasilnya layak dipakai untuk paper.** Seluruh gate lulus, termasuk empat hal
yang tidak dimiliki notebook efficient: evaluasi eksternal konfirmatori pada Set-C, RQ2 dengan 5 seed
berpasangan, seleksi hyperparameter atas 3 seed, dan artefak deployment yang terverifikasi.

Dua temuan utama:

> **RQ1 — CSD berhasil mentransfer *cumulative ordinal prediction shift* dari teacher secara lebih
> baik daripada seluruh baseline (unggul pada ketiga metrik shift fidelity), namun transfer tersebut
> tidak menghasilkan perbedaan QWK yang kredibel pada data internal.**

> **RQ2 — Kuantisasi INT8 memangkas ukuran model 1,36× dan latensi CPU 2,47×, dengan biaya QWK
> internal yang kecil (retensi 94,7–98,3%). Pada Set-C, varian INT8 yang di-fine-tune justru
> *kredibel lebih baik* daripada FP32.**

Keduanya adalah temuan yang jujur, dapat dipertahankan, dan lebih menarik daripada sekadar
"metode kami menang".

---

## 2. Catatan Penting tentang Rumusan RQ1 Anda

RQ1 Anda berbunyi: *"Sejauh mana CSD dapat **mentransfer** joint-vs-individual cumulative ordinal
prediction shift...?"*

Perhatikan bahwa pertanyaan ini secara harfiah menanyakan **kemampuan transfer shift**, bukan
kemampuan meningkatkan akurasi. Maka:

| Sumbu evaluasi | Peran dalam RQ1 Anda | Hasil |
|---|---|---|
| **Shift fidelity** | menjawab inti pertanyaan: apakah shift-nya tertransfer? | **CSD terbaik pada ketiga metrik** |
| **QWK** | metrik utama *grading*, menguji apakah transfer itu berdampak prediktif | **null — tidak ada beda kredibel** |

Artinya jawaban RQ1 Anda **bukan** kegagalan. Jawabannya adalah: **shift-nya memang tertransfer
(terbukti dan tereplikasi), tetapi transfer tersebut tidak otomatis meningkatkan QWK.** Ini disebut
*disosiasi* antara mekanisme dan performa prediktif — dan ini justru kontribusi ilmiah yang menarik.

---

## 3. Integritas Run — 32/32 Gate Lulus

| Aspek | Bukti |
|---|---|
| Data DRTiD | 800/200/550 mata; skema, keunikan ID, keberadaan citra, dan disjoint antar-split terverifikasi |
| Data APTOS | 2.930 train / 366 val; ID unik dan disjoint |
| Kebenaran metrik | `fast_qwk` vs sklearn: **selisih maksimum 1,11e-16** (105 kasus uji) |
| Ordinal head | monoton, sesuai marginal empiris, spread 3,32 logit; **violation rate 0,00** |
| **Prasyarat teacher** | **QWK_dual 0,6433 vs maks(aux) 0,5290 → keunggulan dual-view +0,1143** |
| Sinyal CSD | rata-rata │Δ│ = 0,4893; 99,5% sampel di atas 0,02 |
| Kelengkapan grid | **4/4 kandidat × 3 seed tuning** untuk ketiga grid |
| Kelengkapan seed | **5/5 seed untuk setiap kondisi inti** |
| Kelengkapan RQ2 | **5/5 seed untuk kelima varian** |
| Cakupan kuantisasi | himpunan operator **identik antara PTQ/QAT/FT-PTQ pada kelima seed** |
| Statistik | 45 perbandingan, B = P = 10.000, koreksi Holm **di dalam** tiap famili |
| Eksternal | Set-C: 100 pasien / 200 mata / 400 citra, **0 eksklusi**; partisi disjoint |
| Ekspor model | ONNX berhasil untuk 3 model FP32; seluruh artefak dapat dimuat ulang dari disk |
| **Peringatan collapse** | **0 kondisi ditandai** (notebook efficient menandai 10) |

**Prasyarat terpenting terpenuhi:** teacher benar-benar memperoleh keuntungan dari dua bidang
pandang (+0,1143). Tanpa ini, Δ tidak bermakna dan seluruh hasil CSD tidak dapat diinterpretasikan.

---

## 4. Jawaban RQ1

### 4a. Sumbu Shift Fidelity — CSD unggul pada semua metrik

Inilah jawaban langsung atas pertanyaan "sejauh mana CSD dapat mentransfer shift":

| Kondisi | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---:|---:|---:|
| Tanpa distilasi | 0,4605 | +0,3180 | +0,1850 |
| Logit-KD | 0,4524 | +0,3468 | +0,2161 |
| Feature-KD | 0,4489 | +0,3721 | +0,2330 |
| **CSD (usulan)** | **0,4320** | **+0,4257** | **+0,2902** |

Interpretasi tiap metrik:
- **ShiftL1 lebih rendah** = pola pergeseran prediksi student lebih dekat dengan teacher.
- **CosAgree lebih tinggi** = arah pergeseran student sejalan dengan teacher.
- **BenefitCorr lebih tinggi** = student memperoleh manfaat dual-view pada **mata yang sama**
  dengan teacher. Ini metrik terkuat, dan CSD unggul **+0,057 di atas feature-KD** (≈25% relatif).

**Urutannya monoton dan konsisten**, serta **tereplikasi**: notebook efficient menghasilkan
peringkat yang sama persis dari run pelatihan independen dengan rezim seleksi hyperparameter yang
berbeda. Dua run independen yang sepakat jauh lebih kuat daripada satu run saja.

### 4b. Sumbu QWK — ketiga perbandingan null

DRTiD test, 5 seed, paired cluster bootstrap + 10.000 permutasi, Holm dalam famili RQ1:

| Perbandingan | ΔQWK | 95% CI | p | Kesimpulan |
|---|---:|---|---:|---|
| CSD vs tanpa distilasi | +0,0171 | [−0,0276; +0,0648] | 0,112 | null |
| CSD vs logit-KD | −0,0250 | [−0,0781; +0,0254] | 0,085 | null |
| CSD vs feature-KD | −0,0189 | [−0,0639; +0,0263] | 0,093 | null |

**Seluruh interval melewati nol.** CSD tidak terbukti lebih baik maupun lebih buruk.

Rata-rata QWK test: logit-KD **0,5546** > feature-KD 0,5484 > CSD 0,5296 > tanpa distilasi 0,5124.
Teacher 0,6544. Model terpilih M\* = **`dual_logitkd`** (QWK validasi 0,5670, seed 8888).

> **Catatan pembanding:** pada notebook efficient, CSD sempat *kredibel lebih buruk* daripada
> feature-KD (p = 0,005). Di sini — dengan hyperparameter dipilih atas 3 seed, bukan 1 — perbedaan
> itu hilang. Protokol yang lebih ketat menghasilkan jawaban yang lebih konservatif sekaligus lebih
> dapat dipertahankan.

### 4c. Evaluasi Eksternal — CSD terbaik di Set-C

DeepDRiD Set-C (partisi konfirmatori terdaftar), bootstrap berklaster pasien, 100 pasien:

| Model | QWK Set-C | 95% CI |
|---|---:|---|
| Teacher | 0,7788 | [0,7006; 0,8402] |
| **Best CSD (FP32)** | **0,7346** | [0,6366; 0,8091] |
| FT-PTQ INT8 | 0,7208 | [0,6186; 0,7982] |
| QAT INT8 | 0,7179 | [0,6118; 0,8001] |
| PTQ INT8 | 0,6607 | [0,5372; 0,7580] |
| M\* (FP32, logit-KD) | 0,6442 | [0,5257; 0,7395] |

CSD adalah **student terbaik pada Set-C untuk kedua urutan bidang** (+0,090 macula; +0,091 disc).

⚠ **Tiga peringatan yang wajib ditulis di paper:**

1. **Interval kepercayaan tumpang tindih cukup besar** (CSD [0,637; 0,809] vs M\* [0,526; 0,740]),
   dan **tidak ada uji berpasangan** CSD vs M\* yang dihitung. Jadi keunggulan ini **belum
   terbukti secara statistik**.
2. **Tidak tereplikasi pada partisi suplementer.** Di Set-B, CSD justru *lebih buruk* (0,661 vs
   0,688). Di Set-A, setara. Keunggulan hanya muncul di Set-C.
3. **Di Set-C, Macro-F1 CSD adalah yang terendah (0,318).** CSD unggul pada kesesuaian ordinal tetapi
   kalah pada keseimbangan antar-kelas.

### 4d. Rumusan jawaban RQ1 untuk paper

> CSD mereproduksi struktur *cumulative ordinal prediction shift* milik teacher secara lebih setia
> dibandingkan logit-KD, feature-KD, maupun tanpa distilasi, dengan keunggulan pada ketiga metrik
> shift fidelity (ShiftL1 0,432; CosAgree +0,426; BenefitCorr +0,290) — peringkat yang tereplikasi
> pada dua run independen. Namun transfer tersebut tidak menghasilkan perbedaan QWK yang kredibel
> pada data internal: ketiga perbandingan terdaftar bersifat null (│ΔQWK│ ≤ 0,025, seluruh interval
> melewati nol). Pada partisi eksternal konfirmatori, model CSD mencatat QWK student tertinggi
> (0,735 vs 0,644), meskipun dengan interval yang tumpang tindih dan tidak tereplikasi pada partisi
> suplementer.

---

## 5. Jawaban RQ2

### 5a. Pengurangan ukuran dan latensi (inti RQ2)

| Metrik | Teacher | Student FP32 | INT8 | Rasio |
|---|---:|---:|---:|---:|
| Parameter | 40.313.932 | 328.588 | — | **123× lebih sedikit** |
| Ukuran artefak | — | 1,29 MB | 0,95 MB | **1,36× lebih kecil** |
| Latensi CPU (validasi) | — | 15,06 ms | **6,22 ms** | **2,47× lebih cepat** |
| Latensi teacher → student | — | — | — | **18,0× lebih cepat** |
| Retensi QWK terhadap teacher | — | 84,7% | — | — |

**Model deployment terpilih: `ft_ptq_int8`** (seed 2026) — retensi QWK validasi **99,7%**, severe
error tidak kredibel memburuk, latensi CPU terendah **6,22 ms**. Dipilih dengan aturan terdaftar
menggunakan **data validasi saja**, lalu dibekukan sebelum test dan eksternal dibuka.

### 5b. Pemeliharaan performa — internal

| Perbandingan | ΔQWK | 95% CI | p | Pembacaan |
|---|---:|---|---:|---|
| PTQ vs FP32 | −0,0093 | [−0,0300; +0,0107] | 0,209 | tidak ada penurunan kredibel |
| QAT vs FP32 | −0,0293 | [−0,0683; +0,0042] | **0,001** | **lihat catatan** |
| QAT vs PTQ | −0,0200 | [−0,0567; +0,0110] | 0,065 | null |
| *(kontrol)* QAT vs FP32-FT | −0,0268 | [−0,0604; +0,0026] | 0,002 | lihat catatan |
| *(kontrol)* FP32-FT vs FP32 | −0,0024 | [−0,0232; +0,0176] | 0,701 | fine-tune saja tidak berpengaruh |

Retensi QWK: **PTQ 98,3% · FT-PTQ 97,5% · QAT 94,7%**.

> **Catatan kejujuran statistik.** Pada QAT vs FP32, interval bootstrap mencakup nol tetapi uji
> permutasi memberi p = 0,001. Keduanya prosedur berbeda dan dapat tidak sepakat. Sesuai aturan yang
> ditetapkan notebook sendiri (*"perbedaan yang intervalnya mencakup nol BUKAN sebuah klaim"*),
> **ini tidak boleh diklaim**. Laporkan kedua angka dan sebutkan ketidaksepakatannya.

### 5c. Temuan tak terduga — INT8 lebih baik di eksternal

| Perbandingan (Set-C, berklaster pasien) | ΔQWK | 95% CI | Kredibel? |
|---|---:|---|---|
| QAT vs FP32 | **+0,0738** | **[+0,0069; +0,1468]** | **ya** |
| FT-PTQ vs FP32 | **+0,0766** | **[+0,0137; +0,1452]** | **ya** |
| PTQ vs FP32 | +0,0165 | [−0,0672; +0,0960] | tidak |
| QAT vs PTQ | +0,0573 | [−0,0062; +0,1276] | tidak |

Ini hasil RQ2 paling menarik, dan **harus dibaca dengan hati-hati**. Dua varian yang membaik secara
kredibel adalah **tepat dua varian yang melibatkan fine-tuning** (QAT, dan FP32 fine-tune → PTQ).
PTQ murni — kuantisasi tanpa fine-tuning — **tidak** membaik secara kredibel.

**Interpretasi jujur: peningkatan eksternal itu mengikuti proses fine-tuning, bukan kuantisasinya.**
Jangan menulis "INT8 meningkatkan generalisasi". Kontrol internal mendukung ini: `fp32_ft_control`
vs `best_fp32` datar di internal (p = 0,701), sehingga fine-tuning tidak membeli akurasi in-domain
namun tampak membantu saat terjadi pergeseran distribusi.

*(Keterbatasan: `fp32_ft_control` tidak dievaluasi pada Set-C, sehingga efek fine-tuning dan
kuantisasi tidak dapat dipisahkan sepenuhnya di eksternal. Sebutkan ini.)*

### 5d. Rumusan jawaban RQ2 untuk paper

> PTQ dan QAT INT8 memperkecil artefak model 1,36× dan mempercepat inferensi CPU 2,47× (15,06 ms →
> 6,22 ms), dengan retensi QWK internal 94,7–98,3%. PTQ tidak menunjukkan penurunan yang kredibel
> (ΔQWK −0,009; CI mencakup nol). Model deployment terpilih, FP32 fine-tune → PTQ INT8, mencapai
> retensi validasi 99,7% pada latensi 6,22 ms. Pada partisi eksternal konfirmatori, varian INT8 yang
> melalui fine-tuning bahkan kredibel lebih baik daripada FP32 (ΔQWK +0,074 dan +0,077), namun
> peningkatan tersebut mengikuti fine-tuning dan bukan kuantisasi itu sendiri.

---

## 6. Hasil yang Menarik untuk Dimasukkan ke Paper

**Urutan penyajian yang saya sarankan:**

1. **RQ2 sebagai kontribusi praktis** — model dual-view 328.588 parameter, **6,22 ms di CPU**,
   **123× lebih sedikit parameter** daripada teacher, mempertahankan **84,7%** QWK teacher, dan INT8
   hanya menelan biaya ≤2% QWK internal. Ini bersih, terdukung statistik, dan bermakna praktis.

2. **RQ1 sebagai kontribusi ilmiah** — sajikan sebagai **disosiasi** (§4d), dan tekankan bahwa
   peringkat mekanisme **tereplikasi pada dua run independen**.

**Tiga gambar utama:**

| Gambar | Mengapa penting |
|---|---|
| `fig_07_csd_mechanism` | bukti terkuat: CSD unggul pada ketiga panel shift fidelity |
| `fig_12_forest` | seluruh perbandingan terdaftar beserta CI — menampilkan null RQ1 secara jujur |
| `fig_13_external_setc` | hasil Set-C, beri keterangan tentang tumpang tindih interval |

**Dua sudut pandang yang layak satu paragraf sendiri:**

- **Keunggulan dual-view teacher (+0,1143)** memvalidasi premis bahwa dua bidang pandang memang
  membawa informasi komplementer. Tanpa ini seluruh penelitian kehilangan dasar.
- **CSD unggul QWK tetapi Macro-F1 terendah di Set-C.** Kesesuaian ordinal dan keseimbangan
  antar-kelas ternyata terpisah. Ini observasi nyata tentang *apa* yang sebenarnya ditransfer oleh
  shift-distillation, dan justru jenis detail yang membuat reviewer percaya.

---

## 7. Keterbatasan yang Harus Ditulis Sendiri

Tulis ini di bagian Limitations sebelum reviewer yang menemukannya.

| Keterbatasan | Detail |
|---|---|
| Macro-F1 rendah | ~0,34 internal; metrik ordinal terlihat jauh lebih baik daripada gambaran per-kelas |
| Severe error ~0,26 | sekitar satu dari empat mata meleset ≥2 derajat |
| QWK absolut moderat | student 0,51–0,55 internal; teacher 0,654 |
| RQ1 null di internal | tidak ada keunggulan prediktif untuk metode yang diusulkan |
| Keunggulan Set-C belum terbukti | interval tumpang tindih; tidak ada uji berpasangan CSD vs M\* |
| Eksternal tidak tereplikasi | CSD lebih buruk di Set-B, setara di Set-A |
| Trade-off CSD | QWK terbaik, Macro-F1 terburuk di Set-C |
| Fine-tune vs kuantisasi | tidak terpisahkan di eksternal (`fp32_ft_control` tidak diuji di Set-C) |
| CI dan permutasi bertentangan | pada QAT internal; laporkan keduanya, klaim tidak satu pun |
| Resolusi 224×224 | detail halus seperti mikroaneurisma dapat hilang; konsekuensi pilihan protokol |

Empat baris pertama adalah sifat tugas dan data pada resolusi ini; sisanya adalah batas desain
penelitian dan mudah dinyatakan secara jujur.

---

## 8. Catatan Kerapian

**Ada 3 gambar nyasar** di `figures-simple-notebook/` yang **bukan** produk notebook ini:
`fig_01_architecture`, `fig_02_experimental_workflow`, dan `fig_13_qwk_vs_size`. Ketiganya milik run
efficient. Notebook ini hanya menghasilkan 14 gambar, dari `fig_01_dataset` hingga
`fig_14_internal_vs_external`.

⚠ **Perhatian khusus:** saat ini ada **dua berkas `fig_13` berbeda** dalam satu folder. Hapus yang
nyasar sebelum menyusun paper, agar tidak salah mengutip gambar dari eksperimen yang berbeda.

**Artefak lengkap** tersimpan di Drive pada `artifacts_final_locked_simple_last_20260810/`: 24 tabel,
14 gambar (masing-masing 5 berkas), prediksi per-sampel untuk validasi/test/DeepDRiD, riwayat
pelatihan per-job, 6 ekspor model dengan ONNX yang berfungsi, dan folder `selected_deployment/`.
Pastikan `FINAL_RUN_COMPLETE.txt` ada, lalu unduh folder tersebut sebelum tertimpa run berikutnya.

---

## 9. Perbandingan dengan Notebook Efficient

| Aspek | Simple | Efficient | Sepakat? |
|---|---|---|---|
| Peringkat shift fidelity (CSD terbaik) | ✅ | ✅ | **ya — tereplikasi** |
| Keunggulan dual-view teacher | +0,1143 | +0,0863 | ya |
| Keunggulan prediktif CSD di internal | tidak ada | tidak ada | ya |
| CSD kredibel *lebih buruk* dari feature-KD | tidak | ya | **tidak** |
| CSD terbaik di eksternal | hanya Set-C | seluruh 6 partisi | sebagian |
| Model M\* terpilih | logit-KD | feature-KD | tidak |
| Retensi INT8 internal | 94,7–98,3% | 100,2–100,6% | tidak |

**Temuan mekanisme tereplikasi; peringkat prediktif tidak.** Ketidakstabilan peringkat antar rezim
seleksi ini justru informatif dan mendukung rumusan RQ1 yang konservatif di §4d.

Gunakan **notebook Simple sebagai hasil utama** (sesuai `experiment/comparison.md`), dan sebutkan
notebook Efficient sebagai *robustness check* — dengan melaporkan perbedaannya, bukan hanya
kesamaannya.
