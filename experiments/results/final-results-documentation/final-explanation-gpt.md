Berikut **summary overview menyeluruh hasil DR-VERGE berdasarkan Enhanced Notebook saja**, tanpa membandingkan dengan notebook atau run lain.

Secara keseluruhan, Enhanced run dapat dianggap sebagai **hasil final DR-VERGE yang lengkap, bersih, dan research-grade**. Run ini selesai dengan **36/36 gate lulus, 0 error, dan `FINAL_RUN_COMPLETE.txt` berhasil dibuat**. Selain itu, notebook melakukan audit mandiri terhadap 265 angka headline dengan hasil **265 cocok dan 0 mismatch**, sehingga seluruh angka utama dapat ditelusuri kembali ke raw prediction per-sample. 

# 1. Gambaran besar DR-VERGE

DR-VERGE adalah framework **dual-view ordinal diabetic retinopathy grading** yang menerima dua citra fundus:

[
\text{Macula-centered}
+
\text{Optic-disc-centered}
]

Kemudian kedua view diproses oleh shared encoder dan interaction fusion untuk menghasilkan grading DR lima tingkat:

[
0 \rightarrow 1 \rightarrow 2 \rightarrow 3 \rightarrow 4
]

Model teacher menggunakan backbone besar, sedangkan student dirancang sangat ringan. Salah satu kontribusi utama penelitian adalah **Complementarity-Shift Distillation (CSD)**, yang tidak hanya mendistilasi output akhir teacher, tetapi mencoba mentransfer pola perubahan keputusan ordinal yang muncul ketika dua view digunakan bersama.

Secara deployment, student kemudian dikompresi lebih lanjut melalui:

[
PTQ
]

dan:

[
QAT
]

INT8.

---

# 2. Integrity dan kualitas eksperimen

Enhanced run memiliki kontrol eksperimen yang cukup ketat.

Beberapa hasil penting:

* **36/36 gates passed**
* **0 execution error**
* QWK implementation diverifikasi terhadap sklearn dengan maksimum error sekitar:

[
1.11\times10^{-16}
]

* ordinal monotonicity violation:

[
0
]

* PTQ/QAT/FT-PTQ menggunakan matched quantization operator sets pada 5 seeds
* DeepDRiD partitions diverifikasi tidak overlap
* Set-C lengkap:

  * 100 patients
  * 200 eyes
  * 400 images
* FP32 ONNX parity berhasil
* seluruh headline values diaudit ulang dari raw predictions. 

Jadi hasil akhir bukan berasal dari partial execution atau satu lucky checkpoint saja.

---

# 3. Recipe terbaik yang dipilih

Enhanced notebook melakukan Stage-A selection sebelum training final.

Recipe terbaik yang dipilih adalah:

[
\boxed{384\times384,\ standard\ sampling}
]

dengan validation QWK:

[
0.6491
]

dibanding baseline 224-standard:

[
0.5549.
]

Improvement validation QWK-nya sekitar:

[
+0.0942.
]

Ini menunjukkan bahwa **peningkatan resolusi input menjadi improvement terbesar dalam pipeline**, karena retinal detail yang lebih baik tampaknya sangat membantu grading DR. 

Threshold inference juga dipilih menggunakan validation-only protocol. Untuk CSD sendiri threshold akhirnya tetap:

[
t^*=0.50.
]

---

# 4. Teacher model

Final teacher memiliki:

[
40,313,932
]

parameters.

Test QWK:

[
\boxed{0.7364}
]

Teacher juga benar-benar memanfaatkan dua retinal views.

Pada validation:

[
QWK_{dual}=0.8133
]

sedangkan auxiliary single-view terbaik:

[
0.7664.
]

Sehingga:

[
G_{aux}=+0.0469.
]

Artinya kombinasi kedua view memang memberikan tambahan informasi dibandingkan hanya menggunakan salah satu view.

Ini penting karena seluruh premise CSD membutuhkan teacher yang memang mendapatkan benefit dari dual-view input. 

---

# 5. Single-view versus dual-view student

Hasil test:

### Macula-only

[
QWK=0.5175
]

### Optic-disc-only

[
QWK=0.5502
]

### Dual-view CSD

[
\boxed{QWK=0.6018}
]

Jadi dibandingkan single-view terbaik:

[
0.6018-0.5502
=============

\boxed{+0.0516}.
]

Ini menunjukkan bahwa **dual-view information tetap memberi benefit pada lightweight student**, bukan hanya pada teacher. 

---

# 6. RQ1 — predictive performance CSD

RQ1 menguji apakah CSD memberikan improvement dibandingkan:

* no distillation;
* logit KD;
* feature KD.

Pada DRTiD test, dengan matched 5 seeds:

### CSD vs NoDistill

[
\Delta QWK=-0.0024
]

[
95%CI=[-0.0336,+0.0285]
]

### CSD vs LogitKD

[
\Delta QWK=+0.0077
]

[
95%CI=[-0.0304,+0.0463]
]

### CSD vs FeatureKD

[
\Delta QWK=-0.0143
]

[
95%CI=[-0.0445,+0.0153].
]

Seluruh confidence interval melintasi nol. 

Jadi conclusion predictive RQ1 adalah:

[
\boxed{
\text{CSD tidak menunjukkan predictive superiority yang konklusif.}
}
]

Artinya CSD secara statistik tidak terbukti lebih baik maupun secara kredibel lebih buruk dibanding baseline pada QWK.

---

# 7. RQ1 — mechanism fidelity CSD

Di sinilah hasil CSD paling kuat.

Enhanced memperoleh:

| Condition |  ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
| --------- | ---------: | ---------: | ------------: |
| NoDistill |     0.3759 |     0.3509 |        0.2193 |
| LogitKD   |     0.3840 |     0.2858 |        0.1795 |
| FeatureKD |     0.3718 |     0.3815 |        0.1943 |
| **CSD**   | **0.3509** | **0.4361** |    **0.3075** |

CSD merupakan kondisi terbaik pada **seluruh tiga mechanism metrics**. 

Interpretasinya:

### ShiftL1 ↓

CSD menghasilkan decision shift student yang paling dekat dengan teacher.

### CosAgree ↑

Arah perubahan keputusan student paling selaras dengan teacher.

### BenefitCorr ↑

Student memperoleh manfaat dual-view pada sampel yang paling serupa dengan sampel di mana teacher juga memperoleh manfaat dual-view.

BenefitCorr CSD:

[
0.3075
]

sekitar 40% lebih tinggi dibanding runner-up:

[
0.2193.
]

Jadi jawaban utama mekanistik RQ1:

[
\boxed{
\text{CSD berhasil mentransfer dual-view ordinal decision-shift structure dengan lebih baik.}
}
]

---

# 8. Insight utama RQ1

Hasil paling menarik justru adanya:

[
\boxed{
\text{Mechanism–Performance Dissociation}
}
]

CSD jelas meningkatkan:

* ShiftL1;
* CosAgree;
* BenefitCorr;

tetapi:

[
\text{higher mechanism fidelity}
\not\Rightarrow
\text{higher QWK secara otomatis}.
]

Ini bukan kontradiksi.

Ini menunjukkan bahwa **mampu meniru mekanisme teacher dengan lebih baik tidak selalu identik dengan meningkatkan final classification score**.

Secara ilmiah, ini merupakan finding yang cukup insightful.

---

# 9. Model selection

Validation-only model selection menghasilkan:

[
\boxed{M^*=dual_csd}
]

Mean validation QWK:

[
0.6490.
]

Feature-KD sangat dekat:

[
0.6477.
]

Perbedaannya hanya:

[
0.0013.
]

Sehingga notebook menggunakan predefined tie-break chain.

Representative CSD checkpoint yang dipilih berasal dari:

[
seed=3407.
]

Hal pentingnya adalah pemilihan ini dilakukan **sebelum membuka test result**.

---

# 10. Final student architecture

Final lightweight student memiliki:

[
\boxed{328,588\ parameters}
]

dibanding teacher:

[
40,313,932.
]

Ratio:

[
\frac{40,313,932}{328,588}
\approx
123.
]

Jadi student memiliki sekitar:

[
\boxed{123\times\ fewer\ parameters}.
]

Ini merupakan compression architecture yang sangat besar.

---

# 11. Model size

Teacher artifact:

[
154.09,MB
]

Student FP32:

[
1.29,MB.
]

Teacher → student compression:

[
\approx119\times.
]

Setelah INT8:

[
0.95,MB.
]

Jadi dari sisi memory footprint, DR-VERGE menghasilkan model yang sangat kecil dibanding teacher. 

---

# 12. CPU latency

Teacher:

[
627.6,ms
]

Student FP32:

[
32.6,ms.
]

Teacher→student acceleration:

[
\approx19.3\times.
]

Setelah QAT INT8:

[
\boxed{11.35,ms}.
]

FP32→QAT acceleration:

[
\frac{32.6}{11.35}
\approx
\boxed{2.86\times}.
]

Jadi ada dua jenis efficiency gain:

### Architecture compression

[
627.6
\rightarrow
32.6ms
]

### Quantization

[
32.6
\rightarrow
11.35ms.
]

---

# 13. RQ2 — PTQ

PTQ menghasilkan:

[
97.3%
]

QWK retention.

CPU acceleration:

[
2.89\times.
]

Artifact reduction:

[
1.36\times.
]

Internal difference terhadap FP32:

[
\Delta QWK=-0.0164
]

dengan:

[
95%CI=[-0.0360,+0.0023].
]

Karena CI masih melintasi nol, degradasi tidak dianggap konklusif. 

---

# 14. RQ2 — QAT

QAT merupakan hasil quantization paling menarik pada validation/deployment selection.

QWK retention:

[
\boxed{99.0%}
]

FP32→QAT speedup:

[
\boxed{2.86\times}
]

artifact:

[
1.29MB
\rightarrow
0.95MB.
]

Internal test difference:

[
\Delta QWK=-0.0063
]

dengan:

[
95%CI=[-0.0293,+0.0175].
]

Jadi tidak ada evidence degradasi QWK yang kredibel.

Ini menjawab RQ2 secara kuat:

[
\boxed{
\text{INT8 dapat meningkatkan efficiency secara signifikan sambil mempertahankan hampir seluruh performa ordinal.}
}
]

---

# 15. Deployment model final

Deployment selection dilakukan berdasarkan validation-only rule:

* QWK retention ≥95%;
* severe error tidak credibly worse;
* kemudian pilih latency terbaik.

Hasil:

### PTQ

Retention validation:

[
93.4%
]

→ tidak eligible.

### FT-PTQ

[
93.6%
]

→ tidak eligible.

### QAT

[
99.0%
]

→ eligible.

Sehingga final deployment:

[
\boxed{QAT\ INT8}
]

seed:

[
42
]

latency:

[
\boxed{11.35ms}.
]

Artifact tersebut juga berhasil diverifikasi dapat dimuat ulang dari disk. 

---

# 16. External validation — DeepDRiD Set-C

External validation menggunakan:

* 100 patients;
* 200 eyes;
* 400 images;
* matched 5-seed evaluation untuk main student variants.

Mean QWK:

| Model    |  Set-C QWK |
| -------- | ---------: |
| Teacher  | **0.7923** |
| PTQ      | **0.6729** |
| FP32 CSD |     0.6688 |
| FP32-FT  |     0.6567 |
| FT-PTQ   |     0.6513 |
| QAT      |     0.6344 |



Selected student mempertahankan sekitar:

[
\frac{0.6688}{0.7923}
=====================

84.4%
]

teacher external QWK.

Ini menunjukkan model tetap mempertahankan meaningful ordinal performance ketika diuji pada dataset eksternal.

---

# 17. External PTQ vs FP32

PTQ:

[
0.6729
]

FP32:

[
0.6688.
]

Difference:

[
+0.0040
]

CI:

[
[-0.0191,+0.0294].
]

Tidak ada difference kredibel.

Artinya PTQ cukup stabil secara eksternal.

---

# 18. External QAT

QAT:

[
0.6344.
]

Versus FP32:

[
\Delta=-0.0344
]

CI:

[
[-0.0747,+0.0018].
]

Masih tidak conclusively different dari FP32.

Tetapi QAT vs PTQ:

[
-0.0384
]

CI:

[
[-0.0826,-0.0006].
]

Ini merupakan satu external comparison yang menunjukkan PTQ lebih kuat secara kredibel daripada QAT pada Set-C. 

Jadi insight-nya:

> QAT merupakan pilihan deployment terbaik berdasarkan internal validation efficiency-retention criterion, sementara PTQ terlihat lebih stable pada external Set-C.

Ini menunjukkan adanya trade-off antara internal model selection dan external distribution robustness.

---

# 19. Overall internal performance

Final selected CSD student:

[
QWK=0.6018.
]

Teacher:

[
0.7364.
]

Retention student terhadap teacher:

[
\approx81.7%.
]

Dan student hanya:

[
328K
]

parameters.

Jadi model mempertahankan sekitar 82% teacher QWK menggunakan sekitar:

[
\frac1{123}
]

jumlah parameter teacher.

Ini adalah efficiency-performance trade-off yang sangat menarik.

---

# 20. Per-grade behavior

Enhanced juga mengevaluasi recall setiap grade.

Contoh:

### Teacher

* Grade 0: 0.932
* Grade 1: 0.000
* Grade 2: 0.260
* Grade 3: 0.362
* Grade 4: 0.750

### CSD student

* Grade 0: 0.803
* Grade 1: 0.068
* Grade 2: 0.192
* Grade 3: 0.304
* Grade 4: 0.580. 

Ini menunjukkan grading task masih jauh lebih sulit pada intermediate grades dibanding extreme grades.

Untuk paper, hasil ini paling berguna sebagai discussion mengenai:

> ordinal class difficulty dan fine-lesion discrimination.

Tidak perlu dijadikan headline.

---

# 21. CSD training stability

Selected CSD configuration:

[
\alpha=0.5
]

[
\tau=2.0
]

[
\beta=0.1
]

variant:

[
smoothl1_norm.
]

Global CSD scale:

[
0.107276.
]

CSD/task gradient ratio:

[
0.5335.
]

Ini berada dalam predefined sanity band:

[
[0.01,10].
]

Jadi CSD bukan sekadar loss tambahan yang numerically negligible; gradient-nya memang cukup meaningful selama training. 

---

# 22. Selected hyperparameters

Final Enhanced configuration:

### Resolution

[
384\times384
]

### Sampling

standard.

### Logit KD

[
\alpha=0.5
]

[
\tau=2.
]

### Feature KD

[
\gamma=2.
]

### CSD

[
smoothl1_norm
]

[
\beta=0.1.
]

### QAT

learning rate:

[
3\times10^{-5}.
]

### Threshold CSD

[
0.5.
]

Seluruhnya dipilih dari validation. 

---

# 23. Tiga finding paling penting

Kalau seluruh Enhanced result harus diringkas menjadi hanya tiga findings:

## Finding 1 — Dual-view works

[
\boxed{
\text{Macula + optic-disc memberikan benefit dibanding single-view.}
}
]

---

## Finding 2 — CSD works mechanistically

[
\boxed{
\text{CSD paling baik mentransfer dual-view decision-shift structure teacher.}
}
]

Tetapi:

[
\boxed{
\text{mechanism fidelity tidak otomatis menjadi QWK improvement.}
}
]

---

## Finding 3 — Lightweight quantization works

Student:

[
328K
]

parameters,

sekitar:

[
123\times
]

lebih sedikit dari teacher.

QAT:

[
99.0%
]

validation QWK retention,

dengan:

[
2.86\times
]

CPU acceleration dari FP32.

---

# 24. Jawaban final RQ1

Secara lengkap:

> **RQ1 menunjukkan bahwa Complementarity-Shift Distillation secara konsisten menghasilkan transfer fidelity terbaik terhadap dual-view ordinal decision shift teacher. CSD memperoleh ShiftL1 terendah serta cosine agreement dan benefit correlation tertinggi dibandingkan no-distillation, logit KD, dan feature KD. Namun, peningkatan mechanism fidelity tersebut tidak menghasilkan perbedaan predictive QWK yang konklusif pada DRTiD. Dengan demikian, kontribusi utama CSD adalah preservation of dual-view decision structure, bukan predictive superiority secara langsung.**

Secara singkat:

[
\boxed{
\textbf{CSD succeeds mechanistically; predictive superiority is not established.}
}
]

---

# 25. Jawaban final RQ2

> **RQ2 menunjukkan bahwa INT8 quantization mampu meningkatkan efficiency DR-VERGE secara substansial sambil mempertahankan sebagian besar ordinal grading performance. QAT mempertahankan 99.0% validation QWK dengan sekitar 2.86× CPU acceleration dan artifact sekitar 1.36× lebih kecil daripada FP32 student. Secara keseluruhan, lightweight student memiliki sekitar 123× lebih sedikit parameter dibanding teacher dan tetap mempertahankan performa ordinal yang bermakna.**

Ringkas:

[
\boxed{
\textbf{Quantization works: large efficiency gain, minimal performance sacrifice.}
}
]

---

# 26. Headline angka Enhanced

Kalau perlu satu kotak “Key Results” untuk paper:

[
\boxed{
Teacher\ QWK=0.7364
}
]

[
\boxed{
Student\ QWK=0.6018
}
]

[
\boxed{
328,588\ parameters
}
]

[
\boxed{
123\times\ fewer\ parameters
}
]

[
\boxed{
119\times\ teacher\rightarrow student\ artifact\ compression
}
]

[
\boxed{
QAT\ retention=99.0%
}
]

[
\boxed{
FP32\rightarrow QAT=2.86\times\ faster
}
]

[
\boxed{
QAT\ latency=11.35ms
}
]

[
\boxed{
CSD:
ShiftL1=0.3509
}
]

[
\boxed{
CosAgree=0.4361
}
]

[
\boxed{
BenefitCorr=0.3075
}
]

dan:

[
\boxed{
36/36\ gates,\ 265/265\ audit
}
]

Semua angka headline Enhanced tersebut dirangkum langsung dalam output final notebook. 

## Kesimpulan keseluruhan

Enhanced DR-VERGE berhasil menghasilkan sebuah **dual-view ordinal DR grading framework yang jauh lebih ringan daripada teacher, tetap memperoleh benefit dari dua anatomical retinal views, dan dapat dikompresi lebih lanjut ke INT8 dengan high performance retention**.

Kontribusi paling pentingnya bukan sekadar bahwa model menjadi kecil. DR-VERGE menunjukkan bahwa:

[
\boxed{
\text{dual-view decision-shift information itself can be transferred into a lightweight student}
}
]

melalui CSD.

Dan pada saat yang sama:

[
\boxed{
\text{lightweight dual-view grading can be made computationally practical through INT8}
}
]

Itu adalah inti outcome Enhanced Notebook: **strong dual-view evidence, interpretable mechanistic distillation, rigorous ordinal evaluation, dan practical efficiency gains dalam satu pipeline yang sama.**
