Saya sudah review **DR-VERGE-V3** dan saya akan fokus ke pertanyaan Anda: **gambar apa saja yang benar-benar layak dimasukkan untuk Bab I–IV agar paper terasa kuat, evidence-driven, dan konsisten dengan Enhanced notebook.**

Saat ini draft sudah kuat secara teks—pendahuluan sudah punya problem, gap, kontribusi, RQ, dan batasan; metode juga sudah menjelaskan dataset, Stage A, arsitektur, CSD, evaluasi RQ1, serta quantization protocol.   Yang masih kurang adalah **visual evidence layer**: pembaca belum cepat “melihat” apa problemnya, apa novelty CSD, dan apa bukti eksperimennya.

## Rekomendasi inti

Kalau saya ingin membuat paper ini sekuat mungkin, saya akan punya **8–10 gambar utama**, tetapi tidak semuanya sama penting. Prioritas tertinggi adalah:

> **Dual-view illustration → DR-VERGE architecture → CSD mechanism → Dual-view gain → RQ1 forest plot → CSD mechanism result → Efficiency/Pareto → External validation**

Itu sudah membentuk cerita visual lengkap.

---

# BAB I — PENDAHULUAN

## 1. Gambar pasangan fundus dual-view

**Prioritas: Sangat disarankan**

Taruh setelah Anda menjelaskan single-field vs two-field.

Isi:

```text
Same Examined Eye
        │
 ┌──────┴──────┐
 │             │
Macula       Optic Disc
Centered     Centered
Fundus       Fundus
 │             │
 └──── Different retinal coverage ────┘
```

Gunakan **contoh asli DRTiD** jika lisensi/publikasinya memungkinkan.

Tujuan gambar ini bukan dekorasi. Ia langsung menjelaskan mengapa penelitian Anda membutuhkan dua input.

Caption contoh:

> **Gambar 1. Contoh pasangan citra fundus two-field pada DRTiD yang terdiri atas macula-centered dan optic-disc-centered view dari examined-eye record yang sama.**

Draft Anda memang menjelaskan kedua field berasal dari mata yang sama dan bahwa coverage berbeda menjadi motivasi two-field learning. 

### Sangat bagus jika ditambah penanda ringan

Misalnya:

* label `Macula-centered`
* label `Optic-disc-centered`
* tidak perlu anotasi lesi kalau dataset tidak menyediakannya.

---

## 2. Conceptual problem figure: single-view → dual-view → lightweight challenge

**Prioritas: Opsional tapi bagus**

Bisa menjadi mini figure di Pendahuluan:

```text
Single-view
Limited retinal coverage
        ↓
Dual-view
Richer evidence
        ↓
Large teacher
Higher computational cost
        ↓
DR-VERGE
Transfer → Lightweight → INT8
```

Tujuannya membuat **research motivation** langsung terbaca dalam 10 detik.

Tetapi jika halaman tetap ingin clean, ini boleh dilewatkan karena arsitektur DR-VERGE nanti sudah menjelaskan sebagian besar cerita.

---

# BAB II — STUDI LITERATUR

## 3. Research gap / positioning figure atau matrix

**Prioritas: Sangat disarankan**

Menurut saya lebih kuat kalau berupa **tabel visual**, bukan diagram besar.

Kolom misalnya:

| Method        |   Dual-view  |  Ordinal  | Lightweight KD | Explicit Shift Transfer |  INT8 |
| ------------- | :----------: | :-------: | :------------: | :---------------------: | :---: |
| CrossFiT      |       ✓      |     ✓     |        –       |            –            |   –   |
| QLOMT         | ✓/multi-view |     ✓     |        ✓       |            –            |   –   |
| OrthKD        |       –      | ✓/partial |        ✓       |            –            |   –   |
| Multi-view KD |       ✓      |     –     |        ✓       |            –            |   –   |
| **DR-VERGE**  |     **✓**    |   **✓**   |      **✓**     |          **✓**          | **✓** |

Tujuannya bukan “kami punya centang paling banyak”, tetapi menunjukkan:

> **Novelty DR-VERGE bukan sekadar dual-view + KD, tetapi explicit transfer of the joint-vs-individual ordinal decision shift.**

Bab II Anda sudah menjelaskan bahwa literature sebelumnya transfer logit, feature, atau relational knowledge, sedangkan CSD mentransfer selisih bertanda antara aggregated individual-view dan joint prediction. 

Jika ingin lebih visual, beri highlight hanya pada kolom:

> **Explicit decision-shift transfer**

---

# BAB III — METODE PENELITIAN

## 4. DR-VERGE Overall Architecture

**Prioritas: WAJIB**

Ini gambar paling penting di metode.

Taruh langsung pada subsection:

> **B. Arsitektur dan Complementarity-Shift Distillation**

Gambar harus menunjukkan:

```text
Macula ───────┐
              ├─ Shared ResNet50 Teacher ── Interaction Fusion ── Dual CORAL
Disc ─────────┘                  │                        │
                                Aux heads               ΔT
                                                         │
                                                         ▼
                                                       CSD
                                                         ▲
                                                         │
Macula ───────┐                                         ΔS
              ├─ Lightweight Student ─ InteractionFusion ─ Dual CORAL
Disc ─────────┘
                                                         │
                                                    Selected M*
                                                         │
                                                   PTQ / QAT
                                                         │
                                                     INT8 CPU
```

Pastikan gambar konsisten dengan draft:

* teacher = shared ResNet50;
* student = custom depthwise-separable CNN;
* interaction fusion = (z_m,z_d,|z_m-z_d|,z_m\odot z_d);
* tiga CORAL heads;
* teacher frozen saat distillation. 

**Gambar arsitektur yang kita generate sebelumnya bisa menjadi basisnya**, tetapi saya sarankan final version lebih paper-like: sedikit teks, lebih banyak flow.

---

## 5. Gambar khusus mekanisme CSD

**Prioritas: WAJIB**

Menurut saya architecture figure saja belum cukup untuk menjelaskan novelty.

Buat satu conceptual equation diagram:

```text
Teacher

Macula head ── p_m^T ─┐
                      ├─ Average ── p_agg^T ─┐
Disc head ─── p_d^T ──┘                     │
                                            ├─ ΔT = p_dual^T − p_agg^T
Dual head ─── p_dual^T ─────────────────────┘

                         ↓ CSD
                 SmoothL1(ΔS/s, ΔT/s)

Student

Macula + Disc → p_agg^S
Dual head     → p_dual^S
               ↓
             ΔS
```

Tambahkan formula:

[
p_{agg}^{v}
===========

\frac{p_m^v+p_d^v}{2}
]

[
\Delta^v
========

p_{dual}^v-p_{agg}^v
]

[
L_{CSD}
=======

SmoothL1
\left(
\frac{\Delta_S}{s},
\frac{\Delta_T}{s}
\right)
]

Gambar ini akan membuat reviewer **langsung paham novelty** tanpa harus membaca seluruh formula.

---

## 6. Experimental workflow

**Prioritas: Sangat disarankan**

Buat flow horizontal/vertical:

```text
DRTiD
  ↓
Stratified Split
800 Train / 200 Val / 550 Test
  ↓
Stage A
224/384 × Standard/Balanced
  ↓
384 Standard Selected
  ↓
Teacher Training
  ↓
RQ1 Student Conditions
NoDistill / LogitKD / FeatureKD / CSD
  ↓
Validation-only Selection
  ↓
M* = CSD
  ↓
RQ2
FP32 / PTQ / FT-PTQ / QAT
  ↓
Deployment Rule
  ↓
QAT INT8
  ↓
Frozen External Evaluation
DeepDRiD Set-C
```

Ini **sangat kuat** karena salah satu strengths Enhanced adalah selection hygiene: Stage A, thresholding, model selection, deployment selection semuanya dibekukan sebelum test/external dibuka. 

Gambar ini membuat rigor eksperimen mudah dilihat.

---

## 7. Stage-A recipe selection figure

**Prioritas: Disarankan**

Bisa berupa grouped bar chart:

X:

* 224 Standard
* 384 Standard
* 224 Balanced
* 384 Balanced

Y:

* Validation QWK

Highlight:

[
384\times384\ Standard = 0.6491
]

vs:

[
224\times224\ Standard = 0.5549
]

Enhanced menunjukkan +0,094 QWK dan menyimpulkan resolusi adalah performance lever terbesar dalam refinement. 

Ini bisa masuk akhir Bab III atau awal Bab IV.

Kalau ingin flow hasil lebih clean, saya lebih suka menaruhnya di **awal Bab IV**.

---

# BAB IV — HASIL EKSPERIMEN DAN ANALISIS

Di sinilah gambar harus paling banyak, karena paper harus **membuktikan**, bukan hanya menjelaskan.

## 8. `fig_06_dual_view_gain`

**Prioritas: Sangat disarankan**

Ini sebaiknya menjadi figure pertama Results.

Tujuan:

> Membuktikan premis dual-view sebelum menguji CSD.

Show:

* macula-only
* disc-only
* dual-view
* teacher auxiliary vs dual

Angka utama:

[
0.5175,\quad0.5502,\quad0.6018
]

dan:

[
G_{student}=+0.0516
]

serta teacher:

[
G_{aux}=+0.0469.
]

Ini penting karena kalau dual-view sendiri tidak memberikan gain, tidak ada dasar kuat untuk bicara complementarity-shift.

Panduan Enhanced memang merekomendasikan `fig_06_dual_view_gain` untuk menegakkan premis dual-view. 

---

## 9. `fig_12_forest`

**Prioritas: WAJIB**

Menurut saya ini **salah satu dua figure terpenting seluruh paper**.

Taruh pada:

> **RQ1 – Predictive Performance**

Forest plot menampilkan:

* CSD vs NoDistill
* CSD vs LogitKD
* CSD vs FeatureKD

dengan CI.

Karena semua CI melintasi nol, visual ini langsung menunjukkan:

> **no conclusive predictive superiority**

Panduan Enhanced bahkan menegaskan `fig_12_forest` harus dimasukkan karena membuat null result transparan dan paper lebih dipercaya. 

Caption contoh:

> **Gambar X. Forest plot perbandingan QWK CSD terhadap baseline pada internal test DRTiD. Seluruh 95% confidence interval melintasi nol sehingga tidak terdapat keunggulan prediktif yang konklusif.**

---

## 10. `fig_07_csd_mechanism`

**Prioritas: WAJIB — figure terkuat**

Taruh langsung setelah forest plot.

Ini menjawab sisi kedua RQ1.

Panel:

* ShiftL1 ↓
* CosAgree ↑
* BenefitCorr ↑

Enhanced final:

[
CSD=
0.3509,\quad0.4361,\quad0.3075.
]

Panduan Enhanced menyebut ini **figur tunggal terkuat** untuk RQ1. 

Caption:

> **Gambar X. Fidelity transfer dual-view decision shift pada empat kondisi training. CSD memperoleh ShiftL1 terendah serta CosAgree dan BenefitCorr tertinggi.**

Lalu discussion tepat di bawah:

> **Mechanism improves, predictive superiority does not follow.**

Ini menciptakan visual pair yang sangat kuat:

### Figure A

**Forest plot → predictive null**

### Figure B

**Mechanism plot → CSD best 3/3**

Dua gambar berdampingan atau berurutan akan menyampaikan seluruh RQ1 secara hampir sempurna.

---

# 11. Gambar baru: Mechanism–Performance Dissociation plot

**Prioritas: Sangat saya rekomendasikan**

Ini belum tentu ada di 14 figure Enhanced, tetapi menurut saya bisa menjadi **figure original paper yang sangat powerful**.

Scatter plot:

* X-axis = Test QWK
* Y-axis = BenefitCorr atau composite mechanism fidelity
* points:

  * NoDistill
  * LogitKD
  * FeatureKD
  * CSD

Maka secara visual terlihat:

* FeatureKD berada tinggi di QWK;
* CSD berada tinggi di mechanism fidelity;
* dua objective tidak bergerak bersama.

Ini benar-benar memvisualisasikan main scientific finding:

[
\boxed{
mechanism\ fidelity
\neq
predictive\ performance
}
]

Kalau hanya boleh membuat **satu figure baru selain output notebook**, saya pilih ini.

---

## 12. `fig_04_per_grade_recall`

**Prioritas: Disarankan**

Gunakan untuk error analysis.

Enhanced Grade 1:

* teacher = 0.000
* CSD = 0.068
* FeatureKD = 0.080.

Panduan Enhanced memang merekomendasikannya dan menganggap Grade 1 limitation penting. 

Jangan framing seolah “model gagal total”.

Gunakan:

> “Intermediate/mild grade discrimination remains challenging.”

Figure ini menunjukkan paper Anda tidak hanya melihat aggregate QWK.

---

# 13. `fig_10_efficiency` atau `fig_11_pareto`

**Prioritas: WAJIB**

Pilih **satu**, jangan dua kalau informasinya sangat overlap.

### Jika `fig_10_efficiency`

Bagus untuk showing:

* model size;
* latency;
* compression;
* speed-up.

### Jika `fig_11_pareto`

Bagus kalau menunjukkan trade-off:

X = latency / size
Y = QWK.

Saya lebih suka **Pareto figure** jika jelas, karena juri bisa langsung melihat:

> teacher = accurate but expensive
> student FP32 = small/faster
> QAT INT8 = much faster/smaller with high retention.

Headline Enhanced:

* teacher → student: 119× smaller, 19.3× faster;
* FP32 → QAT: 1.36× smaller, 2.86× faster;
* QAT deployment: 11.35 ms. 

Panduan paper Enhanced memang mensyaratkan `fig_10_efficiency` atau `fig_11_pareto`. 

---

# 14. Deployment selection figure

**Prioritas: Disarankan**

Bisa dibuat simpel:

```text
Candidate       Val retention      Eligible?

PTQ INT8            93.4%             ✕
FT-PTQ INT8         93.6%             ✕
QAT INT8            99.0%             ✓
                                      ↓
                          Selected Deployment
                          0.95 MB · 11.35 ms
```

Ini sangat membantu karena otherwise reviewer bisa bertanya:

> “Kalau PTQ external lebih bagus, kenapa QAT yang dipilih?”

Gambar ini memperlihatkan bahwa selection dilakukan berdasarkan **validation-only frozen rule**.

---

# 15. `fig_13_external_setc`

**Prioritas: WAJIB**

Taruh setelah internal quantization results.

Ini membuktikan bahwa Anda tidak hanya menguji in-domain DRTiD.

Set-C:

* teacher;
* CSD FP32;
* PTQ;
* QAT;
* FT-PTQ.

Panduan Enhanced menyebutnya salah satu dari tiga figure yang memikul paper. 

Caption harus jujur:

> **Gambar X. External validation pada DeepDRiD Set-C. Error bars menunjukkan patient-clustered 95% CI; interval yang tumpang tindih tidak diinterpretasikan sebagai keunggulan.**

Dan perlu disebut:

[
QAT-PTQ=-0.0384
]

credible externally.

---

# 16. Internal vs External comparison figure

**Prioritas: Opsional tetapi sangat kuat untuk Discussion**

Bisa berupa dumbbell / slope chart:

```text
                Internal          External
PTQ                ●──────────────●
QAT                ●──────────●
```

Atau plot (\Delta QWK):

* internal QAT–PTQ = +0.0101, null
* external QAT–PTQ = −0.0384, credible.

Tujuan:

> memperlihatkan bahwa **deployment selection ≠ external robustness**.

Ini bagus sebagai Discussion figure, bukan hasil utama.

---

# Jadi berapa banyak gambar yang ideal?

Kalau ingin paper **kuat tapi tidak penuh sesak**, saya sarankan **8 gambar utama**.

## Final shortlist saya

| No.    | Gambar                                   | Bab | Priority |
| ------ | ---------------------------------------- | --- | -------- |
| **1**  | Paired DRTiD macula + optic-disc images  | I   | ★★★      |
| **2**  | Literature gap/positioning matrix        | II  | ★★★      |
| **3**  | DR-VERGE overall architecture            | III | ★★★★★    |
| **4**  | CSD mechanism schematic                  | III | ★★★★★    |
| **5**  | Dual-view gain (`fig_06`)                | IV  | ★★★★     |
| **6**  | RQ1 forest (`fig_12`)                    | IV  | ★★★★★    |
| **7**  | CSD mechanism fidelity (`fig_07`)        | IV  | ★★★★★    |
| **8**  | Efficiency/Pareto (`fig_10` or `fig_11`) | IV  | ★★★★★    |
| **9**  | External Set-C (`fig_13`)                | IV  | ★★★★★    |
| **10** | Per-grade recall (`fig_04`)              | IV  | ★★★      |

Kalau harus mengurangi ke **6 gambar**, pilih:

1. paired fundus;
2. architecture;
3. CSD mechanism schematic;
4. `fig_12_forest`;
5. `fig_07_csd_mechanism`;
6. efficiency/Pareto;
7. external Set-C.

Saya bahkan masih akan mempertahankan 7.

---

# Yang menurut saya jangan dijadikan gambar utama

Jangan terlalu banyak visual untuk:

* hyperparameter grid lengkap;
* every ablation;
* all confusion matrices;
* training curves untuk semua seed;
* integrity gates;
* ONNX parity;
* all 14 notebook figures.

Itu lebih cocok appendix.

Enhanced sendiri menyebut figure lain seperti `fig_01`, `fig_03`, `fig_05`, `fig_08`, `fig_09`, dan `fig_14` sebagai supporting/lampiran, bukan pillar utama. 

---

# Urutan visual terbaik di paper

Saya akan buat flow visual paper seperti ini:

> **Gambar 1 — “Apa input-nya?”**
> Paired two-field fundus.

↓

> **Gambar 2 — “Apa gap-nya?”**
> Literature positioning.

↓

> **Gambar 3 — “Bagaimana DR-VERGE bekerja?”**
> Overall architecture.

↓

> **Gambar 4 — “Apa yang novel?”**
> CSD mechanism schematic.

↓

> **Gambar 5 — “Apakah dual-view memang berguna?”**
> Dual-view gain.

↓

> **Gambar 6 — “Apakah CSD lebih akurat?”**
> Forest plot → tidak konklusif.

↓

> **Gambar 7 — “Kalau begitu apa yang CSD berhasil transfer?”**
> Mechanism fidelity → best 3/3.

↓

> **Gambar 8 — “Apakah modelnya benar-benar ringan?”**
> Pareto/efficiency.

↓

> **Gambar 9 — “Apakah hasilnya bertahan di luar DRTiD?”**
> DeepDRiD Set-C.

Ini membuat paper punya **visual storytelling lengkap dari problem → method → proof → deployment → generalization**.

Dan khusus untuk draft V3 sekarang, saya akan prioritaskan pertama-tama **mengganti semua hasil Simple pada halaman 4–7 dengan Enhanced**, karena saat ini bagian hasil masih menampilkan teacher 0,6544, CSD 0,5296, FT-PTQ deployment 6,06 ms, dan external CSD 0,7346—itu bukan main Enhanced final.   Setelah angka sudah konsisten, baru gambar-gambar di atas akan benar-benar memperkuat paper, bukan justru memperlihatkan inkonsistensi.
