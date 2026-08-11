Berikut summary jawaban **RQ1 dan RQ2** untuk dua pendekatan: **Simple Notebook sebagai primary evidence** dan **Efficient Notebook sebagai robustness/secondary evidence**.

---

# RQ1 — Complementarity-Shift Distillation

## Formulasi RQ1

Secara substansi, RQ1 menanyakan:

> **Sejauh mana CSD mampu mentransfer dual-view cumulative ordinal decision shift dari teacher ke lightweight student, dan apakah transfer tersebut juga meningkatkan performa grading dibandingkan no-distillation, logit-KD, dan feature-KD?**

Jawabannya sebaiknya **selalu dipisahkan menjadi dua sumbu**:

1. **Mechanism / shift-transfer fidelity**
2. **Predictive grading performance**

Ini penting karena hasilmu menunjukkan kedua hal tersebut **tidak identik**.

---

# A. Jawaban RQ1 jika menggunakan SIMPLE Notebook

### 1. Jawaban mekanisme: **Ya, CSD paling baik mentransfer shift teacher**

Hasil Simple menunjukkan:

| Method     |  ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
| ---------- | ---------: | ---------: | ------------: |
| NoDistill  |     0.4605 |     0.3180 |        0.1850 |
| Logit-KD   |     0.4524 |     0.3468 |        0.2161 |
| Feature-KD |     0.4489 |     0.3721 |        0.2330 |
| **CSD**    | **0.4320** | **0.4257** |    **0.2902** |

Jadi CSD:

* memiliki **ShiftL1 terendah** → shift student paling dekat dengan teacher;
* memiliki **CosAgree tertinggi** → arah shift paling konsisten;
* memiliki **BenefitCorr tertinggi** → student memperoleh manfaat dual-view pada sampel yang paling serupa dengan teacher. 

Maka jawaban mekanistiknya:

[
\boxed{
\text{CSD berhasil mentransfer struktur dual-view decision shift lebih baik daripada seluruh baseline.}
}
]

---

### 2. Jawaban predictive: **Tidak ada improvement QWK yang kredibel**

Simple memberikan:

[
\Delta QWK_{CSD-NoDistill}=+0.0171
]

[
95%CI=[-0.0276,+0.0648]
]

[
\Delta QWK_{CSD-LogitKD}=-0.0250
]

[
95%CI=[-0.0781,+0.0254]
]

[
\Delta QWK_{CSD-FeatureKD}=-0.0189
]

[
95%CI=[-0.0639,+0.0263]
]

Semua CI melintasi nol. 

Mean test QWK:

[
LogitKD=0.5546
]

[
FeatureKD=0.5484
]

[
CSD=0.5296
]

[
NoDistill=0.5124.
]

Jadi:

[
\boxed{
\text{CSD tidak terbukti meningkatkan maupun menurunkan QWK secara kredibel di DRTiD.}
}
]

---

### 3. External Simple: **CSD memiliki point estimate terbaik pada Set-C**

DeepDRiD Set-C:

[
CSD=0.7346
]

versus selected LogitKD model:

[
0.6442.
]

Tetapi CI overlap dan belum ada paired CSD-vs-M* significance test. Keunggulan tersebut juga tidak konsisten di Set-A/Set-B. 

Jadi bukan:

> CSD significantly generalizes better.

Melainkan:

> CSD achieved the highest student QWK on the confirmatory Set-C partition, but the external advantage remains suggestive rather than conclusive.

---

## Kesimpulan RQ1 — versi Simple

Versi paper yang menurut saya paling tepat:

> **RQ1 menunjukkan bahwa Complementarity-Shift Distillation berhasil mentransfer struktur cumulative ordinal decision shift dari teacher ke lightweight student secara lebih setia dibandingkan no-distillation, standard logit KD, maupun feature KD. CSD memperoleh ShiftL1 terendah serta cosine agreement dan benefit correlation tertinggi. Namun, peningkatan fidelity mekanistik tersebut tidak menghasilkan peningkatan predictive QWK yang kredibel pada DRTiD; seluruh perbandingan utama memiliki confidence interval yang melintasi nol. Pada DeepDRiD Set-C, CSD memperoleh QWK student tertinggi, tetapi keunggulan tersebut belum konklusif secara statistik dan tidak konsisten pada partisi suplementer.**

Kalau dibuat satu kalimat:

[
\boxed{
\textbf{CSD succeeds mechanistically, but not conclusively predictively.}
}
]

---

# B. Jawaban RQ1 jika menggunakan EFFICIENT Notebook

Efficient memberikan cerita yang hampir sama tetapi dengan evidence yang sedikit berbeda.

### 1. Mechanism: **CSD bahkan terlihat lebih kuat**

| Method     |  ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ | Spearman ↑ |
| ---------- | ---------: | ---------: | ------------: | ---------: |
| NoDistill  |     0.3534 |     0.2634 |        0.1408 |     0.2376 |
| Logit-KD   |     0.3875 |     0.1881 |        0.0954 |     0.1506 |
| Feature-KD |     0.3469 |     0.2785 |        0.1652 |     0.2600 |
| **CSD**    | **0.3218** | **0.3621** |    **0.3101** | **0.4134** |

CSD paling baik pada semua metric mechanism. BenefitCorr bahkan sekitar:

[
\frac{0.3101}{0.1652}\approx1.88\times
]

baseline terbaik berikutnya. 

Jadi:

[
\boxed{
\text{Efficient memberi evidence mechanism yang sangat kuat.}
}
]

---

### 2. Predictive: **CSD tidak unggul dan kalah kredibel dari Feature-KD**

Efficient:

[
CSD-NoDistill=-0.0082
]

null.

[
CSD-LogitKD=+0.0019
]

null.

Tetapi:

[
CSD-FeatureKD=-0.0382
]

[
95%CI=[-0.0772,-0.0007]
]

[
p=0.005.
]

Jadi pada run ini:

[
\boxed{
\text{Feature-KD credibly outperforms CSD on internal QWK.}
}
]



Ini harus dilaporkan apa adanya.

---

### 3. External Efficient: **CSD unggul pada 6/6 settings**

Pada DeepDRiD train/validation/pooled dan dua field-orderings, CSD memiliki QWK lebih tinggi daripada selected Feature-KD pada seluruh enam kombinasi. 

Tetapi:

* satu CSD model vs satu Feature-KD model;
* method dan seed confounded;
* tidak ada paired CI;
* pooled partitions tidak independent;
* bukan Set-C confirmatory.

Jadi evidence-nya:

[
\boxed{\text{consistent but exploratory}}
]

bukan confirmatory.

---

## Kesimpulan RQ1 — versi Efficient

Wording yang tepat:

> **Pada Efficient run, CSD kembali menunjukkan fidelity transfer paling kuat terhadap dual-view decision shift teacher, dengan performa terbaik pada seluruh metric mekanistik. Namun, hal tersebut tidak menghasilkan superioritas predictive; CSD setara dengan no-distillation dan logit-KD tetapi secara kredibel lebih buruk daripada feature-KD pada QWK internal. Meskipun demikian, CSD menunjukkan pola keunggulan yang konsisten pada seluruh konfigurasi eksternal DeepDRiD yang diuji, walaupun evidence eksternal ini masih eksploratif karena hanya melibatkan satu checkpoint per metode dan tidak menggunakan confirmatory Set-C.**

Ringkas:

[
\boxed{
\textbf{Mechanism positive, predictive mixed/negative, external pattern suggestive.}
}
]

---

# Perbandingan jawaban RQ1 Simple vs Efficient

| Aspek                   | Simple                        | Efficient                |
| ----------------------- | ----------------------------- | ------------------------ |
| CSD mechanism           | **Best**                      | **Best**                 |
| Mechanism reproduced?   | Ya                            | Ya                       |
| CSD vs NoDistill QWK    | Null                          | Null                     |
| CSD vs LogitKD QWK      | Null                          | Null                     |
| CSD vs FeatureKD        | Null                          | **CSD worse**            |
| External                | Set-C highest, not conclusive | 6/6 pattern, exploratory |
| Methodological strength | **Higher**                    | Lower                    |
| Best use                | **Primary paper**             | Robustness check         |

Jadi combined conclusion RQ1 paling kuat adalah:

[
\boxed{
\text{CSD's mechanistic advantage is reproducible, while predictive superiority is not.}
}
]

Ini sebenarnya merupakan finding yang sangat bagus.

---

# RQ2 — Quantization

## Formulasi RQ2

Secara substansi:

> **Sejauh mana PTQ dan QAT INT8 dapat mengurangi model size dan CPU inference latency sambil mempertahankan categorical dan ordinal grading performance dari lightweight dual-view student?**

Di sini kita jawab tiga hal:

1. performance retention;
2. efficiency;
3. deployment suitability.

---

# A. Jawaban RQ2 jika menggunakan SIMPLE Notebook

Simple adalah evidence utama yang lebih kuat karena menggunakan **5 matched seeds**.

---

### 1. PTQ: degradasi sangat kecil dan tidak kredibel

[
\Delta QWK_{PTQ-FP32}
=====================

-0.0093
]

[
95%CI=[-0.0300,+0.0107]
]

[
p=0.209.
]

Jadi:

[
\boxed{
\text{Tidak ada evidence penurunan QWK yang kredibel akibat PTQ.}
}
]

Retention:

[
98.3%.
]



Ini adalah hasil quantization paling clean.

---

### 2. QAT: evidence mixed

[
\Delta QWK=-0.0293
]

[
CI=[-0.0683,+0.0042]
]

tetapi permutation:

[
p=0.001.
]

Karena CI melintasi nol, protocol notebook menyatakan **no claim**. 

Jadi:

> QAT may show a small systematic paired difference, but the effect is not sufficiently robust for a conclusive degradation claim.

Retention:

[
94.7%.
]

---

### 3. Efficiency

Student:

[
328,588\ parameters
]

Teacher:

[
40,313,932
]

atau:

[
\approx123\times
]

fewer parameters.

Student FP32:

[
15.06,ms
]

selected INT8:

[
6.22,ms.
]

Jadi sekitar:

[
2.47\times
]

CPU speed-up.

Artifact student FP32 vs INT8:

[
1.29\rightarrow0.95,MB
]

sekitar:

[
1.36\times
]

smaller. 

---

### 4. Deployment selection

Selected deployment:

[
\boxed{FT\rightarrow PTQ\ INT8}
]

seed 2026.

Dipilih validation-only karena:

* validation retention 99.7%;
* severe error tidak credibly worse;
* fastest CPU latency 6.22 ms. 

Tetapi FT-PTQ sebaiknya disebut **deployment/control outcome**, bukan novelty utama RQ2.

---

### 5. External RQ2

Set-C:

[
QAT-FP32=+0.0738
]

CI:

[
[+0.0069,+0.1468]
]

dan:

[
FTPTQ-FP32=+0.0766
]

CI:

[
[+0.0137,+0.1452].
]

Plain PTQ tidak menunjukkan gain kredibel. 

Pola:

[
\text{fine-tuned variants improve}
]

sedangkan:

[
\text{plain PTQ does not}.
]

Maka interpretasi yang benar:

[
\boxed{
\text{External gain appears associated with additional fine-tuning, not quantization itself.}
}
]

---

## Kesimpulan RQ2 — versi Simple

> **RQ2 menunjukkan bahwa INT8 quantization secara substansial meningkatkan efisiensi lightweight dual-view student dengan degradasi ordinal performance yang kecil. PTQ mempertahankan 98.3% QWK FP32 dan tidak menunjukkan penurunan yang kredibel, sementara QAT mempertahankan 94.7% dengan evidence internal yang lebih mixed. Quantization memperkecil artifact sekitar 1.36× dan mempercepat CPU inference sekitar 2.47×, dengan selected deployment mencapai 6.22 ms. Pada external Set-C, fine-tuned INT8 variants menunjukkan QWK lebih tinggi daripada FP32, namun pola tersebut lebih konsisten dengan efek fine-tuning daripada quantization itu sendiri.**

Ringkas:

[
\boxed{
\textbf{INT8 gives a strong efficiency gain with limited in-domain performance loss.}
}
]

---

# B. Jawaban RQ2 jika menggunakan EFFICIENT Notebook

Efficient menghasilkan angka RQ2 yang lebih cantik.

### 1. PTQ

[
\Delta QWK=+0.0011
]

[
CI=[-0.0230,+0.0239].
]

### 2. QAT

[
\Delta QWK=+0.0008
]

[
CI=[-0.0329,+0.0329].
]

### 3. QAT vs PTQ

[
-0.0003
]

null.

Jadi:

[
\boxed{
\text{PTQ and QAT are statistically indistinguishable from FP32.}
}
]



Retention bahkan:

[
PTQ=100.2%
]

[
QAT=100.6%.
]

Tetapi jangan menyebut quantization improves performance.

Lebih aman:

> no measurable degradation.

---

### 4. Efficiency Efficient

Student:

[
329,484\ params.
]

Teacher:

[
40,322,124.
]

Sekitar:

[
122\times
]

parameter reduction.

Artifact:

[
154.1,MB
\rightarrow
1.30,MB
]

teacher→student:

[
118\times
]

smaller.

CPU latency:

[
244.1\rightarrow12.7,ms
]

teacher→student:

[
19.2\times
]

faster.

Quantized deployment:

[
8.65,ms.
]



---

### 5. Kelemahan RQ2 Efficient

Ini penting.

Efficient RQ2 tidak menggunakan fully matched 5-seed design:

* PTQ vs FP32 ≈ one seed pairing;
* QAT 3 vs FP32 1;
* uncertainty banyak berasal dari resampling eyes, bukan training-seed variation. 

Jadi angka:

[
100.2%
]

dan:

[
100.6%
]

bagus, tetapi confidence metodologinya lebih rendah daripada Simple.

---

## Kesimpulan RQ2 — versi Efficient

> **Pada Efficient run, baik PTQ maupun QAT mempertahankan QWK FP32 secara praktis penuh, dengan seluruh paired differences mendekati nol dan confidence intervals melintasi nol. INT8 memperkecil artifact student sekitar 1.36× dan mempercepat inference CPU sekitar 1.45–1.47×, sementara lightweight student sendiri memiliki sekitar 122× lebih sedikit parameter dan 19× latency reduction relatif terhadap teacher. Namun, RQ2 pada run ini memiliki keterbatasan karena jumlah seed kuantisasi tidak sepenuhnya matched, sehingga hasilnya lebih tepat dipakai sebagai robustness evidence daripada primary statistical conclusion.**

Ringkas:

[
\boxed{
\textbf{Efficient shows excellent retention, but with weaker seed-level evidence.}
}
]

---

# Perbandingan jawaban RQ2 Simple vs Efficient

| Aspek                     |        Simple |  Efficient |
| ------------------------- | ------------: | ---------: |
| PTQ retention             |     **98.3%** |     100.2% |
| QAT retention             |         94.7% | **100.6%** |
| PTQ degradation credible? |            No |         No |
| QAT degradation credible? |  Inconclusive |         No |
| INT8 latency              |   **6.22 ms** |    8.65 ms |
| Student→INT8 speed-up     |    **~2.47×** |     ~1.47× |
| Artifact FP32→INT8        |        ~1.36× |     ~1.36× |
| Quantization seeds        | **5 matched** | thin/mixed |
| External Set-C            |       **Yes** |         No |
| Statistical rigor         |    **Higher** |      Lower |
| Best use                  |   **Primary** | Robustness |

---

# Cara menjawab RQ1 dan RQ2 di paper

Saya sarankan format seperti ini.

## RQ1

### Pertanyaan

> Does CSD transfer the teacher's dual-view ordinal decision shift more faithfully than conventional training and distillation, and does this translate into better DR grading?

### Answer

> **Yes for transfer fidelity, but not conclusively for predictive performance.** Across both experimental regimes, CSD consistently achieved the strongest teacher–student shift fidelity. In the primary Simple protocol, CSD achieved the lowest ShiftL1 and highest cosine agreement and benefit correlation, but its QWK was statistically indistinguishable from no-distillation, logit-KD, and feature-KD. The Efficient robustness run reproduced the same mechanism ranking, although feature-KD was credibly better than CSD on internal QWK in that regime. Thus, the most robust conclusion is that CSD transfers the dual-view decision-shift structure more faithfully, while predictive superiority is not consistently established.

Dalam satu kalimat Indonesia:

> **CSD secara konsisten lebih baik dalam mentransfer mekanisme pergeseran keputusan dual-view teacher, tetapi keunggulan mekanistik tersebut belum terbukti menghasilkan peningkatan performa grading yang konsisten.**

---

# RQ2

### Pertanyaan

> Can INT8 PTQ/QAT improve computational efficiency while preserving lightweight dual-view grading performance?

### Answer

> **Yes.** In the primary Simple protocol, PTQ retained 98.3% of FP32 QWK without a credible degradation, while QAT retained 94.7% with mixed internal evidence. INT8 reduced the student artifact size by approximately 1.36× and accelerated CPU inference from about 15.1 ms to 6.2 ms, or roughly 2.5×. The Efficient robustness run produced even stronger apparent retention—approximately 100% for both PTQ and QAT—but with a weaker seed-matching design. Taken together, the results consistently support INT8 quantization as an effective efficiency strategy, with the Simple run providing the stronger statistical evidence.

Dalam satu kalimat Indonesia:

> **PTQ dan QAT memungkinkan lightweight dual-view student dijalankan jauh lebih efisien dengan degradasi QWK yang kecil atau tidak terukur, dengan PTQ memberikan trade-off performa–efisiensi yang paling konsisten pada protokol utama.**

---

# Combined overall answer

Kalau kamu ingin menjawab dua RQ sekaligus di Discussion:

> **RQ1 menunjukkan bahwa CSD berhasil melakukan apa yang secara eksplisit dirancang untuk dilakukannya—mentransfer cumulative ordinal decision shift dari dual-view teacher ke lightweight student dengan fidelity yang lebih tinggi daripada baseline—tetapi peningkatan mekanistik ini tidak secara konsisten menghasilkan peningkatan predictive QWK. RQ2 menunjukkan hasil yang lebih jelas secara praktis: INT8 PTQ/QAT secara substansial meningkatkan efisiensi model dengan degradasi grading performance yang kecil, dan PTQ memberikan trade-off paling stabil pada protokol utama.**

Dan kalau harus sangat singkat:

[
\boxed{
\textbf{RQ1: Mechanism works; predictive superiority is not established.}
}
]

[
\boxed{
\textbf{RQ2: Quantization works; efficiency improves with limited performance loss.}
}
]

Untuk **paper utama**, gunakan angka **Simple** sebagai jawaban formal RQ1/RQ2. Angka Efficient dipakai untuk memperkuat kalimat bahwa **mechanism CSD dan quantization robustness muncul kembali di training regime kedua**, tetapi jangan mencampur angka kedua run dalam satu primary results table.
