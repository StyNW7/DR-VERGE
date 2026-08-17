Ya. Setelah saya baca **dua dokumen Enhanced terbaru**—`PANDUAN_PAPER.md` dan `RESULTS_OVERVIEW(3).md`—serta membandingkannya dengan **Draft DR-VERGE** yang sekarang, saya menyarankan satu keputusan editorial yang sangat tegas:

> **Enhanced run harus menjadi single source of truth untuk paper utama DR-VERGE.**

Artinya **semua angka headline, tabel utama, formula final, hyperparameter, model selection, hasil RQ1/RQ2, external validation, deployment, dan interpretasi utama** harus berasal dari `artifacts_enhanced_v1_20260811`. Run ini selesai 36/36 gate, tanpa error, dan audit mandiri merekomputasi 265 nilai headline tanpa mismatch; seluruh rantai Stage A → teacher → hyperparameter selection → model selection → deployment selection juga tidak menggunakan test set untuk pemilihan.  

**Simple tidak perlu dibuang**, tetapi posisinya cukup sebagai supporting robustness evidence—misalnya satu paragraf bahwa ranking mechanism fidelity CSD juga muncul pada protocol sebelumnya. Jangan lagi mengambil angka Simple lalu memasukkannya ke tabel utama Enhanced. Ini penting karena draft sekarang memang masih mencampurkan keduanya.

---

# A. Scientific story final DR-VERGE

Kalau seluruh paper ingin konsisten, cerita besarnya sebaiknya bukan:

> “CSD menghasilkan model paling akurat kemudian dikuantisasi.”

Karena **data Enhanced tidak mendukung klaim itu**.

Scientific story yang jauh lebih kuat dan benar adalah:

[
\boxed{\text{Dual-view memberikan nilai prediktif}}
]

[
\Downarrow
]

[
\boxed{\text{CSD mentransfer struktur perubahan keputusan dual-view paling faithful}}
]

[
\Downarrow
]

[
\boxed{\text{Tetapi mechanism fidelity tidak otomatis menjadi predictive superiority}}
]

[
\Downarrow
]

[
\boxed{\text{Selected lightweight student dapat dikompresi dengan INT8 secara efisien}}
]

[
\Downarrow
]

[
\boxed{\text{Deployment menjadi sangat kecil dan cepat dengan performa ordinal tinggi}}
]

Inilah **main finding DR-VERGE**.

Enhanced menunjukkan CSD terbaik pada ketiga metrik mekanisme, tetapi ketiga perbandingan prediktif CSD memiliki confidence interval yang melintasi nol. Dokumen panduan bahkan secara eksplisit menyarankan menjadikan **mechanism–performance dissociation** ini sebagai temuan utama, bukan mencoba mengubahnya menjadi klaim peningkatan QWK. 

---

# B. MASTER RESULT — angka resmi yang harus menjadi acuan paper

Saya sarankan simpan bagian berikut sebagai **master numerical reference** selama menyusun paper.

## 1. Integritas eksperimen

| Aspek               | Enhanced Final                    |
| ------------------- | --------------------------------- |
| Run                 | `artifacts_enhanced_v1_20260811`  |
| Status              | **36/36 gates passed**            |
| Error               | **0**                             |
| Self-audit          | **265/265 values matched**        |
| GPU                 | NVIDIA A100-SXM4-80GB             |
| Quantization engine | x86                               |
| External            | DeepDRiD Set-C                    |
| External design     | 5 matched seeds                   |
| External size       | 100 pasien / 200 mata / 400 citra |
| Bootstrap           | 10.000                            |
| Permutation         | 10.000                            |
| Multiple comparison | Holm within family                |

Integritas dan auditability tersebut terdokumentasi langsung pada Enhanced output.  Pemeriksaan tambahan menunjukkan QWK implementation cocok dengan sklearn hingga selisih (1.11\times10^{-16}), ordinal monotonicity violation = 0, quantization scope matched, partisi eksternal tidak overlap, dan completeness Set-C sesuai ekspektasi. 

**Di paper:** tidak perlu membuat “36/36 gates” sebagai selling point utama. Masukkan singkat di bagian reproducibility/experimental integrity atau appendix. Ini memperkuat kepercayaan, tetapi bukan kontribusi algoritmik.

---

# C. Konfigurasi final Enhanced

Ini harus menjadi satu-satunya konfigurasi utama di bagian metode.

## 2. Stage A — pemilihan recipe

Konfigurasi final:

[
\boxed{384\times384+\text{standard sampling}}
]

Validation QWK:

[
0.6491
]

dibandingkan 224-standard:

[
0.5549.
]

Artinya peningkatannya sekitar:

[
\boxed{+0.0942;QWK}
]

dan konfigurasi tersebut dipilih **sebelum final teacher/student experiment**. 

Ini merupakan salah satu insight terpenting Enhanced:

> **Resolusi input ternyata merupakan performance lever yang lebih besar daripada pilihan distillation objective.**

Jangan menyembunyikan hasil ini. Ini bagus untuk Discussion.

---

## 3. Hyperparameter final

| Komponen                   | Final Enhanced          |
| -------------------------- | ----------------------- |
| Resolution                 | **384×384**             |
| Sampling                   | **Standard**            |
| Logit-KD (\alpha)          | **0,5**                 |
| Temperature (\tau)         | **2,0**                 |
| Feature-KD (\gamma_{feat}) | **2,0**                 |
| CSD variant                | **SmoothL1 normalized** |
| CSD (\beta)                | **0,1**                 |
| QAT learning rate          | **(3\times10^{-5})**    |
| NoDistill threshold        | 0,40                    |
| Logit-KD threshold         | 0,50                    |
| Feature-KD threshold       | 0,50                    |
| CSD threshold              | **0,50**                |
| Global CSD scale           | **0,107276**            |

Seluruh pilihan tersebut berasal dari validation, bukan test. 

### Ini penting untuk draft sekarang

Kalau masih ada:

> CSD (\beta=0,2)

di tabel ablasi lama, **jangan tampilkan sebagai konfigurasi utama final**.

Final Enhanced adalah:

[
\boxed{\beta=0.1}
]

---

# D. Formula final CSD

Formula yang harus digunakan secara konsisten:

Untuk teacher/student:

[
v\in{T,S}
]

agregasi dua individual views:

[
\mathbf{p}_{agg}^{v}
====================

\frac{\mathbf{p}*{m}^{v}+\mathbf{p}*{d}^{v}}{2}
]

kemudian decision shift:

[
\Delta^{v}
==========

## \mathbf{p}_{dual}^{v}

\mathbf{p}_{agg}^{v}.
]

Dengan skala global teacher:

[
s
=

\mathbb{E}_{train}
\left[
|\Delta_T|
\right]
=======

0.107276
]

dan loss:

[
\boxed{
\mathcal{L}_{CSD}
=================

SmoothL1
\left(
\frac{\Delta_S}{s},
\frac{\Delta_T}{s}
\right)
}
]

dengan:

[
\boxed{\beta=0.1}.
]

Formula dan nilai scale final ini ditegaskan dalam panduan Enhanced.  

### Interpretasi yang harus dipakai

Jangan berkata:

> “(\Delta) mengukur komplementaritas anatomis.”

Lebih defensible:

> **“(\Delta) merupakan operational proxy untuk perubahan keputusan ordinal kumulatif yang muncul ketika model berpindah dari agregasi individual-view menuju joint dual-view inference.”**

Dengan demikian CSD mentransfer **decision-shift structure**, bukan mengklaim mengukur komplementaritas anatomis secara langsung.

---

# E. Premis pertama: apakah dual-view sendiri memang berguna?

Ini perlu muncul **sebelum membahas CSD**.

Enhanced:

| Model        |   Test QWK |
| ------------ | ---------: |
| Macula-only  |     0,5175 |
| Disc-only    |     0,5502 |
| **Dual CSD** | **0,6018** |

Sehingga:

[
0.6018-0.5502
=============

\boxed{+0.0516}
]

dibanding single-view terbaik.

Pada teacher validation:

[
QWK_{dual}=0.8133
]

dan best auxiliary:

[
0.7664
]

sehingga:

[
\boxed{G_{aux}=+0.0469}.
]



### Interpretasi paper

> “Dual-view inference meningkatkan ordinal agreement dibandingkan penggunaan salah satu field secara individual pada teacher maupun student. Temuan ini memvalidasi premis dasar DR-VERGE bahwa pasangan macula-centered dan optic-disc-centered membawa informasi yang bermanfaat ketika diproses secara joint.”

Ini sangat penting karena **CSD tidak bermakna jika teacher sendiri tidak memperoleh sesuatu dari dual-view**.

---

# F. RQ1 — hasil prediktif final

Ini adalah tabel utama pertama RQ1.

## Predictive performance

| Kondisi    | Validation QWK |   Test QWK |
| ---------- | -------------: | ---------: |
| NoDistill  |         0,6228 |     0,6042 |
| Logit-KD   |         0,6308 |     0,5942 |
| Feature-KD |         0,6477 | **0,6161** |
| **CSD**    |     **0,6490** |     0,6018 |

CSD terpilih sebagai (M^*) dari validation. Feature-KD memiliki test point estimate paling tinggi. Selisih validation CSD dan Feature-KD hanya **0,0013**, sehingga selection memang sangat dekat. 

Tetapi **point estimate bukan bukti superiority**.

### Statistik primer RQ1

| Comparison        | (\Delta QWK) | 95% CI             | Kesimpulan |
| ----------------- | -----------: | ------------------ | ---------- |
| CSD vs NoDistill  |      −0,0024 | [−0,0336; +0,0285] | Null       |
| CSD vs Logit-KD   |      +0,0077 | [−0,0304; +0,0463] | Null       |
| CSD vs Feature-KD |      −0,0143 | [−0,0445; +0,0153] | Null       |

Seluruh confidence interval memuat nol. 

## Jawaban prediktif RQ1

Bukan:

> “CSD meningkatkan grading.”

Bukan juga:

> “Feature-KD terbukti mengalahkan CSD.”

Tetapi:

> **“Tidak terdapat keunggulan prediktif CSD yang konklusif terhadap no-distillation, Logit-KD, maupun Feature-KD. Meskipun Feature-KD memperoleh test point estimate tertinggi, seluruh perbandingan primer terhadap CSD memiliki confidence interval yang melintasi nol.”**

Ini harus sangat konsisten di:

* abstrak;
* hasil;
* discussion;
* conclusion.

---

# G. RQ1 — mechanism fidelity final

Inilah **hasil terkuat CSD**.

| Kondisi    |  ShiftL1 ↓ |  CosAgree ↑ | BenefitCorr ↑ |
| ---------- | ---------: | ----------: | ------------: |
| NoDistill  |     0,3759 |     +0,3509 |       +0,2193 |
| Logit-KD   |     0,3840 |     +0,2858 |       +0,1795 |
| Feature-KD |     0,3718 |     +0,3815 |       +0,1943 |
| **CSD**    | **0,3509** | **+0,4361** |   **+0,3075** |



CSD menang:

[
\boxed{3/3}
]

mechanism metrics.

Yang paling menarik:

[
BenefitCorr_{CSD}=0.3075
]

versus runner-up:

[
0.2193
]

atau kira-kira **40% lebih tinggi**. 

### Interpretasi ketiga metrik

**ShiftL1 ↓**
Seberapa dekat magnitude dan pola shift student dengan teacher.

**CosAgree ↑**
Seberapa selaras arah shift student dan teacher.

**BenefitCorr ↑**
Apakah joint dual-view inference membantu student pada **sampel yang sama** ketika joint inference juga membantu teacher.

BenefitCorr inilah yang menurut saya paling powerful untuk storytelling.

---

# H. Main finding RQ1: Mechanism–Performance Dissociation

Ini sebaiknya punya subsection tersendiri.

Anda bisa menulis kira-kira:

> **“CSD menunjukkan pola yang berbeda pada dua sumbu evaluasi. Pada sumbu mekanisme, CSD menghasilkan ShiftL1 terendah serta CosAgree dan BenefitCorr tertinggi, menunjukkan bahwa perubahan keputusan dual-view teacher ditransfer secara lebih faithful. Namun pada sumbu prediktif, tidak terdapat peningkatan QWK yang konklusif terhadap baseline. Hasil ini menunjukkan adanya disosiasi antara mechanism fidelity dan predictive performance: keberhasilan mentransfer struktur keputusan tertentu tidak menjamin peningkatan ordinal grading secara langsung.”**

Ini persis temuan sentral yang dua dokumen Enhanced minta untuk dijadikan core claim. 

Ini bukan kelemahan yang perlu ditutupi.

Justru **ini novelty empirical-nya**.

---

# I. Jawaban RQ1 final

Saya akan lock wording berikut:

> **RQ1 — Sebagian.** Complementarity-Shift Distillation berhasil mentransfer struktur perubahan keputusan ordinal dual-view teacher secara lebih faithful dibandingkan baseline, ditunjukkan oleh hasil terbaik pada ShiftL1 (0,3509), CosAgree (0,4361), dan BenefitCorr (0,3075). Namun transfer mekanisme tersebut belum terbukti menghasilkan peningkatan predictive QWK yang konklusif karena seluruh tiga confidence interval perbandingan primer memuat nol. Dengan demikian, CSD berhasil pada tujuan mechanism transfer, tetapi predictive superiority belum established.

Itulah jawaban RQ1 paling defensible.

---

# J. RQ2 — compression dan efficiency final

Student:

[
\boxed{328,588\ parameters}
]

Teacher:

[
40,313,932.
]

Artinya student memiliki sekitar:

[
\boxed{123\times}
]

lebih sedikit parameter.

Enhanced headline:

| Transisi               | Retensi QWK | CPU Speed-up |  Kompresi |
| ---------------------- | ----------: | -----------: | --------: |
| Teacher → Student FP32 |       81,7% |    **19,3×** |  **119×** |
| FP32 → PTQ             |       97,3% |    **2,89×** | **1,36×** |
| FP32 → FT-PTQ          |       96,8% |    **2,89×** | **1,36×** |
| **FP32 → QAT**         |   **99,0%** |    **2,86×** | **1,36×** |



Artefak:

[
154.09;MB
\rightarrow
1.29;MB
\rightarrow
0.95;MB
]

dan final QAT latency:

[
\boxed{11.35;ms}
]

di CPU. Ringkasan resmi Enhanced menggunakan teacher QWK 0,7364 dan student selected (M^*) QWK 0,6018, dengan 81,7% QWK teacher dipertahankan. 

---

# K. RQ2 — apakah quantization menurunkan grading?

### Statistik internal

| Comparison      | (\Delta QWK) | 95% CI             | Interpretasi                 |
| --------------- | -----------: | ------------------ | ---------------------------- |
| PTQ vs FP32     |      −0,0164 | [−0,0360; +0,0023] | Tidak ada klaim degradasi    |
| QAT vs FP32     |      −0,0063 | [−0,0293; +0,0175] | Tidak ada degradasi kredibel |
| QAT vs PTQ      |      +0,0101 | [−0,0179; +0,0411] | Tidak berbeda kredibel       |
| FP32-FT vs FP32 |      +0,0107 | [−0,0076; +0,0293] | Tidak ada klaim              |
| QAT vs FP32-FT  |      −0,0170 | [−0,0378; +0,0049] | Tidak ada klaim              |



Ada kasus PTQ di mana CI melintasi nol namun adjusted permutation p dapat tampak signifikan; protocol menetapkan **CI yang memuat nol = tidak dibuat klaim**. Ini harus konsisten. 

### Framing yang tepat

Jangan:

> “INT8 meningkatkan performa.”

Gunakan:

> **“Tidak ditemukan degradasi QWK yang kredibel akibat kuantisasi pada evaluasi internal.”**

Dan saya akan sedikit menghindari istilah **formal non-inferiority**, karena margin 95% di sini adalah engineering criterion, bukan clinical non-inferiority margin.

---

# L. Deployment final

Aturan ditetapkan menggunakan validation:

[
Retention_{QWK}\ge95%
]

dan:

* severe error tidak credibly lebih buruk;
* jika lebih dari satu eligible → latency CPU terendah.

Hasil validation:

| Varian  |                Retensi |
| ------- | ---------------------: |
| PTQ     | 93,4% → tidak eligible |
| FT-PTQ  | 93,6% → tidak eligible |
| **QAT** |   **99,0% → eligible** |

Maka:

[
\boxed{Deployment = QAT\ INT8}
]

seed:

[
42
]

latency:

[
\boxed{11.35ms}
]

dan artefaknya terverifikasi reload. 

Ini menjawab dengan tegas diskusi kita sebelumnya:

> **Final Enhanced bukan Logit-KD → PTQ.**
> **Final Enhanced adalah validation-selected CSD student → QAT INT8 deployment.**

---

# M. External validation final — DeepDRiD Set-C

Ini juga harus **100% Enhanced**.

| Model                |           Set-C QWK |
| -------------------- | ------------------: |
| Teacher              |          **0,7923** |
| PTQ INT8             | **0,6729 ± 0,0365** |
| CSD FP32 / best FP32 | **0,6688 ± 0,0415** |
| FP32-FT              |     0,6567 ± 0,0364 |
| FT-PTQ               |     0,6513 ± 0,0315 |
| QAT                  |     0,6344 ± 0,0326 |



Selected student mempertahankan:

[
\frac{0.6688}{0.7923}
\approx
\boxed{84.4%}
]

external teacher QWK. 

### Paired external comparisons

Yang paling penting:

[
QAT-PTQ=-0.0384
]

[
95%CI=[-0.0826,-0.0006]
]

jadi pada Set-C:

[
\boxed{PTQ > QAT}
]

secara kredibel pada comparison tersebut. 

Ini **tidak membatalkan deployment QAT** karena deployment selection dilakukan berdasarkan validation dan dibekukan sebelum external test.

Tetapi harus dibahas sebagai:

> **internal deployment criterion–external robustness mismatch.**

Ini justru discussion yang bagus.

---

# N. Jawaban RQ2 final

Saya akan lock:

> **RQ2 — Ya, dalam konteks efisiensi dengan retensi performa tinggi.** Kuantisasi INT8 memberikan kompresi artefak 1,36× dan percepatan CPU sekitar 2,86–2,89× tanpa degradasi QWK yang kredibel pada evaluasi internal. QAT INT8 dipilih melalui kriteria validation-only dengan retensi QWK 99,0% dan latency 11,35 ms. Secara end-to-end, lightweight pipeline menghasilkan model sekitar 119× lebih kecil dan 19,3× lebih cepat daripada teacher sambil mempertahankan 81,7% QWK teacher. Namun pada DeepDRiD Set-C, PTQ secara kredibel mengungguli QAT, sehingga pemilihan deployment internal tidak sepenuhnya mencerminkan robustness lintas dataset.

Ini lebih lengkap daripada sekadar:

> “Quantization works.”

---

# O. Apa yang HARUS diperbaiki dari draft sekarang

Bagian ini sangat penting.

Draft saat ini masih menampilkan **Simple results** seperti teacher QWK 0,6544, Logit-KD 0,5546, Feature-KD 0,5484, dan CSD 0,5296. 

Itu harus diganti.

| Draft lama / Simple                | Final Enhanced yang dipakai                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| Teacher QWK **0,6544**             | **0,7364**                                                    |
| CSD **0,5296**                     | **0,6018**                                                    |
| Logit-KD point estimate terbaik    | **Feature-KD 0,6161 test**, tetapi tidak established superior |
| Selected M* Logit-KD               | **Selected M* = CSD**                                         |
| 224×224                            | **384×384**                                                   |
| CSD β = 0,2 pada tabel lama        | **β = 0,1 final**                                             |
| Mechanism 0,4320 / 0,4257 / 0,2902 | **0,3509 / 0,4361 / 0,3075**                                  |
| Deployment FT-PTQ                  | **QAT INT8**                                                  |
| Deployment ~6,06–6,22 ms           | **11,35 ms**                                                  |
| External CSD 0,7346                | **CSD FP32 0,6688**                                           |
| External teacher 0,7788            | **0,7923**                                                    |

Angka headline final Enhanced dikompilasi secara eksplisit dalam output resmi. 

---

# P. Struktur final paper yang saya sarankan

Karena **tidak ada batas halaman**, saya sekarang akan sedikit mengubah struktur dari draft saat ini.

## INTISARI

Urutan:

**Problem → gap → method → RQ1 mechanism → RQ1 null predictive → RQ2 efficiency → contribution.**

Wajib menampilkan **hasil mechanism positif dan predictive null dalam abstrak yang sama**, dengan bobot yang seimbang. Itu juga merupakan aturan eksplisit dari panduan Enhanced. 

Headline abstrak cukup:

* 328.588 params;
* CSD 3/3 mechanism best;
* BenefitCorr 0,3075;
* no credible predictive superiority;
* 119× smaller;
* 19,3× faster;
* QAT 99% validation retention.

Jangan masukkan semua CI ke abstrak.

---

# I. PENDAHULUAN

Saya sarankan:

### A. Urgensi Retinopati Diabetik

Masalah klinis + access gap.

### B. Tiga Tantangan Teknis

1. ordinal nature;
2. limited single-view retinal coverage;
3. computational burden.

### C. Research Gap

KD biasa transfer:

* logit;
* feature.

DR-VERGE mempertanyakan:

> **dapatkah perubahan keputusan yang timbul akibat joint dual-view inference itu sendiri didistilasi?**

### D. Tujuan dan Kontribusi

Saya akan tulis tiga kontribusi utama seperti dokumen Enhanced:

**1. CSD**
Menargetkan selisih joint-vs-aggregated individual-view, bukan hanya output akhir.

**2. Mechanism-aware evaluation**
ShiftL1, CosAgree, BenefitCorr memungkinkan mechanism fidelity diukur independen dari QWK.

**3. End-to-end lightweight deployment**
Dual-view distillation → INT8 → external validation. 

### E. RQ1 dan RQ2

Gunakan pertanyaan pendek dan mudah dibaca.

---

# II. STUDI LITERATUR

Struktur terbaik:

### A. Diabetic Retinopathy dan Ordinal Grading

CORAL, ordinal severity.

### B. Single-Field vs Two-Field Fundus

Macula-centered + optic-disc-centered.

### C. Multi-View DR Learning

CrossFiT dan karya sejenis.

### D. Knowledge Distillation

Response/logit KD, feature KD.

### E. Multi-View Knowledge Transfer

Apa yang sudah ditransfer paper lain.

### F. Lightweight Inference dan Quantization

PTQ vs QAT.

### G. Positioning DR-VERGE

Buat tabel literature-gap.

Kunci kolom:

**Dual-view | Ordinal | Lightweight | KD | Explicit Shift Distillation | INT8**

Jangan claim “pertama di dunia”; cukup:

> “Dalam literatur yang ditelaah, belum ditemukan…”

---

# III. METODOLOGI DR-VERGE

### A. Framework Overview

**Gambar arsitektur DR-VERGE** yang sudah dibuat masuk di sini.

### B. Dataset

* DRTiD;
* 800 train;
* 200 validation;
* 550 test;
* APTOS pretraining;
* DeepDRiD Set-C external.

### C. Stage-A Recipe Selection

384 vs 224; standard vs balanced.

### D. Teacher Architecture

Shared ResNet50.

### E. Student Architecture

328.588 parameter depthwise-separable model.

### F. Interaction Fusion

[
[z_m,z_d,|z_m-z_d|,z_m\odot z_d].
]

### G. CORAL Ordinal Formulation

[
\mathbf p =
[P(y>0),P(y>1),P(y>2),P(y>3)].
]

### H. Complementarity-Shift Distillation

Formula final Enhanced.

### I. Baseline Distillation Conditions

Tabel sederhana:

| Condition | Task | Logit KD | Feature KD | CSD |
| --------- | :--: | :------: | :--------: | :-: |
| NoDistill |   ✓  |     –    |      –     |  –  |
| LogitKD   |   ✓  |     ✓    |      –     |  –  |
| FeatureKD |   ✓  |     ✓    |      ✓     |  –  |
| **CSD**   |   ✓  |     ✓    |      –     |  ✓  |

### J. Quantization

FP32, PTQ, QAT + controls FP32-FT dan FT-PTQ.

---

# IV. DESAIN EKSPERIMEN

Menurut saya **bagian ini layak dipisahkan dari Metodologi** sekarang karena tidak ada limit halaman.

### A. Split dan Data Leakage Control

Train/val/test/external separation.

### B. Hyperparameter Selection

Tabel final parameter.

### C. Multi-Seed Protocol

Teacher 1 seed; student comparisons 5 matched seeds.

Ini penting: **teacher harus ditandai sebagai single seed**, jangan diberi kesan mean. 

### D. Metrics

Predictive:

* QWK primary;
* accuracy;
* Macro-F1;
* MAE;
* SER;
* per-grade recall.

Mechanism:

* ShiftL1;
* CosAgree;
* BenefitCorr.

Efficiency:

* parameter count;
* serialized artifact;
* CPU latency;
* throughput;
* retention.

### E. Statistical Testing

10k bootstrap, 10k permutation, Holm.

### F. Deployment Selection Rule

Validation-only ≥95% retention etc.

### G. Hardware/Reproducibility

A100, Intel Xeon, x86, PyTorch.

---

# V. HASIL EKSPERIMEN DAN ANALISIS

Ini harus menjadi **bagian terpenting paper**.

Saya rekomendasikan urutan berikut.

## V-A. Stage-A Configuration Selection

Tampilkan tabel 224 vs 384.

Main insight:

> 384-standard menjadi recipe final dan meningkatkan validation QWK ~0,094 dibanding 224-standard.

---

## V-B. Validasi Premis Dual-View

Macula / Disc / Dual.

Gunakan `fig_06_dual_view_gain` bila bagus.

---

## V-C. RQ1 — Predictive Performance

Tampilkan point estimate + CI.

**Null lebih dulu.**

Ini memang secara eksplisit dianjurkan panduan Enhanced agar paper tidak terkesan menyembunyikan hasil null di belakang hasil mekanisme positif. 

**Gambar:** `fig_12_forest`.

---

## V-D. RQ1 — Mechanism Fidelity

Tabel 3 mechanism metrics.

**Gambar utama:**

> `fig_07_csd_mechanism`

Dokumen Enhanced menyebutnya figure tunggal terkuat untuk RQ1. 

---

## V-E. Mechanism–Performance Dissociation

Subsection tersendiri.

Ini **academic centerpiece paper**.

---

## V-F. Per-Grade Analysis

Enhanced Grade 1:

Teacher:

[
0.000
]

CSD:

[
0.068
]

FeatureKD:

[
0.080.
]



Jangan lagi menyalahkan resolution 224 karena Enhanced sudah 384.

Interpretasikan:

> Grade 1 tetap menjadi challenge utama bahkan setelah recipe refinement.

**Gambar:** `fig_04_per_grade_recall`.

---

## V-G. RQ2 — Teacher-to-Student Compression

Tampilkan:

[
40.3M\rightarrow328K
]

[
154.09MB\rightarrow1.29MB
]

[
627.6ms\rightarrow32.6ms
]

dan 81,7% QWK retention. 

---

## V-H. RQ2 — PTQ/QAT Performance Retention

Masukkan statistical table RQ2.

**Gambar:** `fig_10_efficiency` atau `fig_11_pareto`.

---

## V-I. Deployment Selection

QAT 99% validation retention → selected.

Jangan berubah setelah test/external.

---

## V-J. External Validation

DeepDRiD Set-C table.

**Gambar:** `fig_13_external_setc`.

---

## V-K. Internal–External Trade-off

Bahas:

QAT chosen internally

tetapi:

[
PTQ>QAT
]

credibly on Set-C.

Ini salah satu discussion terbaik paper.

---

# VI. PEMBAHASAN

Saya sarankan hanya fokus pada **empat insight besar**.

### 1. Dual-view memang bernilai

+0,0516 student dan +0,0469 teacher.

### 2. Mechanism ≠ performance

CSD memindahkan shift tetapi QWK superiority belum terbukti.

### 3. Resolution matters

384 memberikan improvement besar dan menunjukkan small retinal details sangat penting.

### 4. Efficiency and robustness are different objectives

QAT menang internal deployment criterion, PTQ lebih kuat external.

Itu discussion yang matang dan tidak hanya mengulangi tabel.

---

# VII. SUPPORTING ROBUSTNESS

Kalau ingin Simple tetap dipakai, **taruh di sini**, bukan main table.

Cukup:

> “The same ordering of CSD mechanism fidelity was observed under the earlier 224×224 protocol.”

Kalau mau beri angka supporting:

| CSD mechanism | Simple |   Enhanced |
| ------------- | -----: | ---------: |
| ShiftL1       | 0,4320 | **0,3509** |
| CosAgree      | 0,4257 | **0,4361** |
| BenefitCorr   | 0,2902 | **0,3075** |

Enhanced report menyatakan urutan mekanisme konsisten lintas run. 

Tetapi **jangan campur Simple ke headline Enhanced**.

---

# VIII. KETERBATASAN

Ini tidak perlu menjadi “section menghancurkan penelitian”. Buat ringkas tetapi jujur.

Empat yang menurut saya paling penting:

**1. Predictive superiority belum established.**
Mechanism fidelity ≠ QWK gain.

**2. Grade 1 masih sulit.**
Ini limitation paling jelas dari per-grade evaluation.

**3. Teacher hanya satu seed.**

**4. Internal deployment criterion tidak sepenuhnya align dengan external robustness.**

Sisanya—ONNX INT8 limitation, checkpoint reuse, detail ablation seeds—bisa masuk appendix/reproducibility. Dokumen panduan memang mencatat enam limitation lengkap jika ingin menuliskannya secara exhaustive. 

---

# IX. KESIMPULAN

Kesimpulannya jangan berkata:

> “DR-VERGE mengalahkan metode KD lain.”

Saya sarankan struktur akhir:

> **DR-VERGE menunjukkan bahwa perubahan keputusan ordinal yang timbul dari integrasi dua citra fundus dapat ditransfer secara terukur dari teacher menuju lightweight student melalui Complementarity-Shift Distillation. CSD memperoleh fidelity tertinggi pada ketiga metrik mekanisme, tetapi keunggulan predictive QWK terhadap baseline belum terbukti secara konklusif, mengungkap disosiasi antara transfer mekanisme dan performa akhir.**
>
> **Pada sisi deployment, student 328.588 parameter memiliki sekitar 123× lebih sedikit parameter dibanding teacher. Kuantisasi INT8 memberikan kompresi artefak 1,36× dan percepatan CPU sekitar 2,86× tanpa degradasi QWK yang kredibel pada evaluasi internal. QAT INT8 terpilih melalui protokol validation-only dengan retensi 99,0% dan latency 11,35 ms. Secara end-to-end, pipeline mempertahankan 81,7% QWK teacher dengan ukuran model sekitar 119× lebih kecil dan inferensi 19,3× lebih cepat.**

Itu sudah menjawab RQ1 dan RQ2 dengan sangat jelas.

---

# Tabel dan gambar final yang saya rekomendasikan

Karena sekarang **tidak ada batas halaman**, kita bisa sedikit lebih kaya.

| Urutan       | Artefak                               | Lokasi                            |
| ------------ | ------------------------------------- | --------------------------------- |
| **Gambar 1** | DR-VERGE architecture                 | Metodologi                        |
| **Gambar 2** | Contoh macula + optic-disc pair       | Dataset                           |
| **Tabel 1**  | Literature positioning                | Studi Literatur                   |
| **Tabel 2**  | Stage-A recipe selection              | Experimental Setup / Results awal |
| **Tabel 3**  | Final hyperparameters                 | Experimental Setup                |
| **Tabel 4**  | RQ1 predictive performance            | Results                           |
| **Gambar 3** | `fig_12_forest`                       | setelah predictive results        |
| **Tabel 5**  | RQ1 mechanism fidelity                | Results                           |
| **Gambar 4** | `fig_07_csd_mechanism`                | setelah mechanism table           |
| **Gambar 5** | `fig_04_per_grade_recall`             | Error analysis                    |
| **Tabel 6**  | Teacher–student efficiency            | RQ2                               |
| **Gambar 6** | `fig_10_efficiency` / `fig_11_pareto` | RQ2                               |
| **Tabel 7**  | INT8 statistical comparison           | RQ2                               |
| **Tabel 8**  | DeepDRiD Set-C                        | External                          |
| **Gambar 7** | `fig_13_external_setc`                | External                          |

Panduan Enhanced memang menempatkan `fig_07_csd_mechanism`, `fig_12_forest`, `fig_13_external_setc`, dan figure efficiency sebagai figure prioritas utama. 

---

# Satu master rule selama menulis paper

Mulai sekarang, setiap kali ada angka, tanyakan:

> **“Apakah angka ini berasal dari Enhanced?”**

Kalau **ya** → boleh masuk main text.

Kalau **Simple** → hanya supporting robustness, label dengan jelas.

Kalau **Efficient** → tidak perlu digunakan di main paper.

Kalau angka dari draft lama tidak cocok Enhanced → **ganti**, jangan dicampur.

Dan secara khusus, headline final yang harus terus konsisten adalah:

[
\boxed{
\begin{aligned}
Teacher &: 40{,}313{,}932\ params,\ QWK=0.7364\
Student\ CSD &: 328{,}588\ params,\ QWK=0.6018\
CSD\ mechanism &: 0.3509/0.4361/0.3075\
RQ1 &: 3/3\ predictive\ comparisons\ null\
Deployment &: QAT\ INT8,\ 0.95MB,\ 11.35ms\
Retention_{val} &: 99.0%\
Compression &: 119\times\
Teacher\rightarrow deployment\ speed &: 19.3\times\
External &: 0.6688\ student\ vs\ 0.7923\ teacher
\end{aligned}}
]

Semua angka headline tersebut dirangkum langsung oleh output Enhanced final. 

Kalau paper dibangun konsisten berdasarkan fondasi ini, maka **DR-VERGE tidak perlu dipaksa menjadi cerita “metode kami paling akurat.”** Paper ini punya cerita yang lebih menarik: **dual-view information benar-benar memberi nilai, CSD benar-benar mampu mentransfer struktur perubahan keputusan itu, tetapi fidelity terhadap mekanisme dan akurasi prediktif ternyata merupakan dua hal berbeda; lalu model tersebut dapat dibawa ke deployment INT8 dengan footprint dan latency yang jauh lebih rendah.** Itu adalah benang merah yang menurut saya harus menjadi pillar seluruh KTI final.
