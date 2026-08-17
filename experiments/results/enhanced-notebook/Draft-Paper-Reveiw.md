Ya, saya menangkap maksudnya. Setelah membaca **Draft DR-VERGE terbaru** dan membandingkannya dengan output **Enhanced Notebook yang kita tetapkan sebagai run final**, ada satu hal yang harus dibereskan **sebelum memperhalus isi paper lebih jauh**:

> **Draft saat ini mencampurkan metodologi Enhanced dengan hasil Simple.**

Ini jauh lebih penting daripada persoalan wording atau layout.

## 1. Apakah pemahaman “CSD menang mekanisme, Logit-KD menang prediktif, lalu Logit-KD → PTQ INT8” benar?

**Benar jika yang dibicarakan adalah Simple Notebook. Tidak benar jika yang menjadi hasil utama paper adalah Enhanced Notebook.**

Perbedaannya:

| Aspek                               | Simple              | **Enhanced / Final**     |
| ----------------------------------- | ------------------- | ------------------------ |
| CSD mechanism fidelity              | **CSD terbaik**     | **CSD terbaik**          |
| Best test QWK point estimate        | **Logit-KD 0,5546** | **Feature-KD 0,6161**    |
| Metode (M^*) berdasarkan validation | **Logit-KD**        | **CSD**                  |
| Model FP32 yang masuk RQ2           | Logit-KD family     | **CSD family**           |
| PTQ/QAT diterapkan ke               | Logit-KD student    | **CSD-selected student** |
| Deployment final                    | **FT-PTQ INT8**     | **QAT INT8**             |
| Deployment latency                  | 6,22 ms @224        | **11,35 ms @384**        |

Pada Enhanced, (M^*) yang dipilih **berdasarkan validation** adalah `dual_csd` dengan mean validation QWK 0,6490, sangat dekat dengan Feature-KD 0,6477. Di test, point estimate tertinggi justru Feature-KD 0,6161, sedangkan CSD 0,6018; tetapi seluruh perbandingan primer CSD tidak konklusif secara statistik. 

Jadi untuk final paper, **jangan menulis “Logit-KD adalah model prediktif terbaik lalu dikuantisasi menjadi PTQ.”**

Yang lebih tepat:

> **Pada Enhanced protocol, CSD dipilih sebagai model (M^*) berdasarkan aturan seleksi validation-only. Meskipun Feature-KD memperoleh point estimate QWK test tertinggi, tidak terdapat keunggulan prediktif yang konklusif antar-metode. Model CSD terpilih kemudian menjadi basis evaluasi PTQ dan QAT INT8.**

Dan final deployment-nya:

[
\boxed{\text{CSD student}\rightarrow\text{QAT INT8}}
]

bukan Logit-KD → PTQ.

Enhanced memilih QAT karena hanya QAT yang memenuhi rule deployment validation dengan retention 99,0%; PTQ dan FT-PTQ tidak memenuhi threshold validation tersebut. 

---

# 2. Masalah paling besar pada draft sekarang: **Simple Results + Enhanced Method**

Ini perlu dibereskan total.

Pada Bab III, draft sudah menulis bahwa konfigurasi final menggunakan **384×384 standard sampling**, yang merupakan Enhanced protocol. 

Draft juga menulis CSD dengan:

[
\beta=0,1
]

yang cocok dengan Enhanced. 

Namun begitu masuk Bab IV, angka yang digunakan adalah **Simple Notebook**:

* Teacher QWK = 0,6544
* Logit-KD = 0,5546
* CSD = 0,5296
* CSD mechanism = 0,4320 / 0,4257 / 0,2902
* deployment = FT-PTQ
* latency ≈6,06–6,22 ms
* external CSD = 0,7346.

 

Bahkan diskusi Grade 1 menyebut citra diperkecil ke **224×224**. 

Sementara Enhanced final adalah:

* resolution **384×384**;
* teacher test QWK **0,7364**;
* selected CSD student **0,6018**;
* CSD mechanism **0,3509 / 0,4361 / 0,3075**;
* QAT deployment **11,35 ms**;
* teacher/student external **0,7923 / 0,6688**.



Jadi kalau Enhanced memang final main experiment, **Bab IV yang sekarang harus direvisi cukup besar**. Jangan hanya mengganti beberapa angka karena interpretasinya juga berubah.

---

# 3. Review BAB I — Pendahuluan

Secara substansi, Bab I sekarang **sudah kuat**. Anda sudah berhasil membangun alur:

[
\text{Clinical problem}
\rightarrow
\text{ordinal grading}
\rightarrow
\text{dual-view}
\rightarrow
\text{KD}
\rightarrow
\text{research gap}
\rightarrow
\text{CSD}.
]

Konteks Indonesia dan kebutuhan komputasi ringan di paragraf awal juga bagus. 

Research gap-nya bahkan termasuk bagian terbaik:

> belum ditemukan pendekatan yang secara eksplisit membentuk perubahan bertanda dari agregasi prediksi individual-field menuju joint two-field dan menggunakannya sebagai target distilasi.



### Yang perlu diperkuat: bagian kontribusi

Saat ini subsection **Tujuan dan Kontribusi** terlalu fokus menjelaskan mekanisme CSD. 

Padahal DR-VERGE punya **empat kontribusi** yang layak terlihat sejak halaman pertama.

Saya akan ubah menjadi seperti ini:

> **Kontribusi penelitian ini mencakup empat aspek.** Pertama, DR-VERGE memformulasikan grading retinopati diabetik lima tingkat sebagai masalah ordinal dual-view dengan mengintegrasikan citra fundus berpusat makula dan diskus optik. Kedua, penelitian ini mengusulkan **Complementarity-Shift Distillation (CSD)** untuk mentransfer perubahan keputusan ordinal yang muncul antara agregasi prediksi individual-view dan inferensi joint dual-view dari teacher menuju lightweight student. Ketiga, transfer tersebut dievaluasi tidak hanya melalui performa grading, tetapi juga melalui **ShiftL1, Cosine Agreement, dan Benefit Correlation**, sehingga fidelity terhadap mekanisme teacher dapat diukur secara langsung. Keempat, DR-VERGE mengevaluasi **PTQ dan QAT INT8** serta validasi eksternal untuk menilai trade-off antara performa ordinal, ukuran model, dan latensi CPU.

Dengan satu paragraf itu reviewer langsung mengetahui:

**apa produknya → apa novelty-nya → bagaimana novelty diuji → apa practical contribution-nya.**

---

# 4. RQ1 perlu disederhanakan

RQ1 draft saat ini akurat tetapi terlalu banyak bahasa campuran:

> “joint-vs-individual cumulative ordinal prediction shift…”



Saya sarankan versi paper:

> **RQ1:** Sejauh mana Complementarity-Shift Distillation mampu mentransfer **pergeseran keputusan ordinal dual-view** dari teacher menuju lightweight student dibandingkan tanpa distilasi, Logit-KD, dan Feature-KD, serta bagaimana pengaruhnya terhadap performa grading?

RQ2:

> **RQ2:** Sejauh mana PTQ dan QAT INT8 dapat meningkatkan efisiensi lightweight dual-view student dengan tetap mempertahankan performa grading ordinal?

Ini jauh lebih mudah dicerna tetapi tetap secara teknis sesuai eksperimen.

---

# 5. BAB II — Studi Literatur: sudah sophisticated, tetapi ada satu bagian yang hilang

Bab II saat ini bagus karena tidak hanya membahas DR generik. Anda sudah memasukkan:

* CrossFiT;
* ordinal modeling;
* CORAL;
* QLOMT;
* conventional KD;
* multi-view KD;
* relational knowledge transfer.



Namun RQ2 adalah bagian besar penelitian, sedangkan **literature review quantization hampir tidak mempunyai subsection sendiri**.

Karena sekarang tidak ada batas halaman, saya sangat menyarankan struktur Bab II menjadi:

### A. Two-Field dan Multi-View Diabetic Retinopathy Grading

Isi sekarang sebagian besar sudah cocok.

### B. Ordinal Learning untuk DR Grading

Pisahkan CORAL dan ordinal KD dari subsection A supaya nature ordinal DR lebih terlihat.

### C. Knowledge Distillation dan Multi-View Knowledge Transfer

Isi sekarang sudah kuat.

### D. Lightweight Model dan Quantization

Ini baru.

Bahas secara ringkas:

* knowledge distillation untuk model ringan;
* FP32 → INT8;
* PTQ;
* QAT;
* alasan PTQ/QAT relevan untuk CNN;
* trade-off accuracy–memory–latency.

### E. Research Gap dan Positioning DR-VERGE

Ini yang akan membuat Bab II terasa sangat profesional.

Buat tabel positioning:

| Pendekatan    | Fundus Dual-View | Ordinal |   KD  | Explicit Decision-Shift Transfer |  INT8 | External Validation |
| ------------- | :--------------: | :-----: | :---: | :------------------------------: | :---: | :-----------------: |
| CrossFiT      |         ✓        |    ✓    |   –   |                 –                |   –   |          –          |
| QLOMT         |    Multi-view    |    ✓    |   ✓   |                 –                |   –   |          ✓          |
| OrthKD        |         –        |   –/✓   |   ✓   |                 –                |   –   |          –          |
| Multi-view KD |         ✓        |    –    |   ✓   |                 –                |   –   |          –          |
| **DR-VERGE**  |       **✓**      |  **✓**  | **✓** |               **✓**              | **✓** |        **✓**        |

Tujuannya bukan bilang “kami pertama melakukan semuanya”, tetapi menunjukkan:

[
\boxed{\text{keunikan DR-VERGE berada pada objek yang didistilasi}}
]

yaitu:

[
\boxed{\Delta=p_{dual}-p_{agg}}
]

bukan hanya logit atau feature.

---

# 6. BAB III — Metodologi: secara rigor sudah bagus, tapi struktur perlu dibuat lebih mudah dibaca

Saat ini Bab III hanya punya A–D dan setiap subsection sangat padat. 

Karena batas halaman sudah dihapus, jangan lagi memadatkan arsitektur, loss, model selection, statistics, quantization, external validation menjadi empat blok besar.

Saya akan ubah Bab III menjadi:

| Subsection                                    | Isi utama                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| **A. Gambaran Umum DR-VERGE**                 | overall pipeline + architecture figure                                    |
| **B. Dataset dan Preprocessing**              | DRTiD, APTOS, DeepDRiD, split, 384×384, augmentation, normalization       |
| **C. Teacher dan Student Architecture**       | ResNet50, lightweight CNN, shared weights, InteractionFusion, CORAL heads |
| **D. Ordinal Grading dengan CORAL**           | target cumulative dan inference                                           |
| **E. Complementarity-Shift Distillation**     | (p_{agg}), (\Delta), scale (s), CSD loss                                  |
| **F. Kondisi Eksperimen RQ1**                 | NoDistill, Logit-KD, Feature-KD, CSD                                      |
| **G. Training dan Validation-Only Selection** | seeds, early stopping, threshold, M* rule                                 |
| **H. PTQ, QAT, dan Deployment Selection**     | quantization protocol dan controls                                        |
| **I. Metrics dan Statistical Analysis**       | predictive, mechanism, efficiency                                         |
| **J. Reproducibility Environment**            | CPU/GPU/software                                                          |

Ini jauh lebih enak dibaca.

---

# 7. Gambar arsitektur sekarang wajib masuk Bab III-A

Gambar yang tadi kita buat sebaiknya ditempatkan setelah paragraf overview DR-VERGE.

Flow narasinya:

[
\text{Dual Fundus Input}
]

[
\downarrow
]

[
\text{ResNet50 Teacher}
]

[
\downarrow
]

[
\text{Dual + Auxiliary CORAL Outputs}
]

[
\downarrow
]

[
\Delta_T
\overset{CSD}{\longrightarrow}
\Delta_S
]

[
\downarrow
]

[
\text{328K Lightweight Student}
]

[
\downarrow
]

[
PTQ/QAT
\rightarrow
CPU.
]

Caption yang saya rekomendasikan:

> **Gambar 1. Arsitektur DR-VERGE. Pasangan citra fundus macula-centered dan optic-disc-centered diproses menggunakan shared-weight encoder. Teacher dan student menghasilkan prediksi individual-view dan joint dual-view melalui CORAL heads. CSD mentransfer normalized cumulative ordinal decision shift (\Delta) dari teacher menuju student, yang selanjutnya dievaluasi dalam format FP32, PTQ INT8, dan QAT INT8.**

---

# 8. Tambahkan tabel kondisi eksperimen

Ini akan sangat membantu memahami paper.

### Tabel — Kondisi Eksperimen RQ1

| Kondisi    | Task Loss | Logit KD | Feature KD |  CSD  |
| ---------- | :-------: | :------: | :--------: | :---: |
| NoDistill  |     ✓     |     –    |      –     |   –   |
| Logit-KD   |     ✓     |     ✓    |      –     |   –   |
| Feature-KD |     ✓     |     ✓    |      ✓     |   –   |
| **CSD**    |     ✓     |     ✓    |      –     | **✓** |

Lalu definisikan:

[
L_{CSD}
=======

SmoothL1
\left(
\frac{\Delta_S}{s},
\frac{\Delta_T}{s}
\right).
]

Dengan tabel ini pembaca langsung tahu **apa yang sebenarnya dibandingkan**.

---

# 9. Tambahkan tabel hyperparameter final

Enhanced final sudah mempunyai konfigurasi validasi yang jelas:

* 384×384 standard;
* (\alpha=0,5);
* (\tau=2,0);
* (\gamma=2,0);
* CSD `smoothl1_norm`, (\beta=0,1);
* QAT LR (3\times10^{-5});
* CSD threshold 0,50.



Ini sebaiknya dijadikan **Tabel Konfigurasi Eksperimen Final**, bukan tersebar dalam paragraf.

---

# 10. FT-PTQ dan FP32 fine-tuning control harus disebut di metodologi

Saat ini Bab III menyebut FP32, PTQ, dan QAT, tetapi eksperimen Anda juga memiliki:

* FP32 fine-tune control;
* FT-PTQ.

Kalau mereka muncul tiba-tiba di Results, reviewer akan bertanya dari mana asalnya.

Tuliskan:

> “Selain PTQ dan QAT sebagai varian utama RQ2, digunakan FP32 fine-tuning dan fine-tune-then-PTQ (FT-PTQ) sebagai kontrol untuk memisahkan pengaruh tambahan training dari pengaruh kuantisasi itu sendiri.”

Ini sangat memperkuat desain eksperimental.

---

# 11. BAB IV harus **dibangun ulang menggunakan Enhanced**

Menurut saya susunan final yang paling kuat adalah seperti berikut.

## IV-A. Validation-Controlled Protocol Refinement

Ini section baru dan menurut saya layak masuk.

Enhanced melakukan Stage A dan ternyata result-nya sangat insightful:

| Resolution | Sampling     |    Val QWK |
| ---------- | ------------ | ---------: |
| 224        | Standard     |     0,5549 |
| **384**    | **Standard** | **0,6491** |
| 224        | Balanced     |     0,5522 |
| 384        | Balanced     |     0,5798 |

384-standard dipilih sebelum final training. 

Point penting:

[
\boxed{+0,0942\ Validation\ QWK}
]

dari 224-standard ke 384-standard.

Jangan framing:

> “kami meningkatkan resolusi sampai hasil bagus.”

Tetapi:

> **“Validation-controlled recipe selection identified 384×384 standard sampling as the final configuration.”**

Insight discussion:

> **retinal detail preservation ternyata merupakan performance lever yang lebih besar daripada pilihan distillation objective.**

Ini salah satu insight terbagus Enhanced. 

---

# 12. IV-B. Validasi Premis Dual-View

Jangan langsung masuk KD.

Pertama buktikan dulu bahwa dua view memang berguna.

Enhanced:

[
Macula=0,5175
]

[
Disc=0,5502
]

[
Dual\ CSD=0,6018.
]

Jadi:

[
\boxed{+0,0516}
]

di atas single-view terbaik.

Teacher validation juga:

[
QWK_{dual}=0,8133
]

versus best auxiliary:

[
0,7664
]

gain:

[
+0,0469.
]



Kalimat:

> “Hasil tersebut memvalidasi premis dasar DR-VERGE bahwa joint dual-view inference memberikan informasi tambahan dibandingkan penggunaan salah satu field secara terpisah.”

---

# 13. IV-C. RQ1 — Predictive Performance

Ini harus menggantikan Tabel 1 Simple sekarang.

Tabel yang lebih baik:

| Metode     |    Val QWK |   Test QWK |
| ---------- | ---------: | ---------: |
| NoDistill  |     0,6228 |     0,6042 |
| Logit-KD   |     0,6308 |     0,5942 |
| Feature-KD |     0,6477 | **0,6161** |
| **CSD**    | **0,6490** |     0,6018 |

Poin penting:

**CSD dipilih berdasarkan validation.**

Jangan tulis:

> CSD adalah model prediktif terbaik.

Karena test point estimate tertinggi adalah Feature-KD.

Namun jangan pula menyimpulkan:

> Feature-KD terbukti lebih baik.

Karena perbandingan CSD–FeatureKD:

[
-0,0143
]

[
95%CI=[-0,0445,+0,0153]
]

tidak konklusif.

Enhanced bahkan menyatakan seluruh tiga CI RQ1 melintasi nol. 

Kalimat paling tepat:

> **“Tidak terdapat keunggulan prediktif yang konklusif di antara CSD dan baseline distilasi. Meskipun Feature-KD menghasilkan point estimate test tertinggi, perbedaannya terhadap CSD berada dalam rentang ketidakpastian statistik.”**

Itu jauh lebih mature.

---

# 14. Tidak perlu lagi bilang “prediktif terbaik = Logit-KD”

Ini penting sekali.

Dengan final Enhanced:

[
\boxed{\text{tidak ada predictive winner yang established}}
]

Bila hanya bicara point estimate test:

[
\boxed{FeatureKD}
]

Bila bicara **validation-selected (M^*)**:

[
\boxed{CSD}
]

Jadi paper harus membedakan:

**best point estimate** ≠ **selected model** ≠ **statistically superior model**.

Ini justru menunjukkan kualitas metodologi tinggi.

---

# 15. IV-D. RQ1 — Mechanism Fidelity

Di sinilah CSD benar-benar kuat.

Gunakan **Enhanced**, bukan angka Simple di draft.

| Kondisi    |  ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
| ---------- | ---------: | ---------: | ------------: |
| NoDistill  |     0,3759 |     0,3509 |        0,2193 |
| Logit-KD   |     0,3840 |     0,2858 |        0,1795 |
| Feature-KD |     0,3718 |     0,3815 |        0,1943 |
| **CSD**    | **0,3509** | **0,4361** |    **0,3075** |



BenefitCorr:

[
0,3075
]

versus runner-up:

[
0,2193,
]

sekitar **40% lebih tinggi**.

Itu sangat bagus.

Masukkan `fig_07_csd_mechanism` langsung setelah tabel. Enhanced sendiri mengidentifikasi figure tersebut sebagai figure paling kuat. 

---

# 16. IV-E. Mechanism–Performance Dissociation

Saya sangat menyarankan membuat subsection khusus.

Karena inilah **finding akademik utama**.

Judulnya bisa:

> **E. Disosiasi antara Fidelity Mekanisme dan Performa Prediktif**

Isinya kira-kira:

> “CSD secara konsisten menghasilkan fidelity tertinggi terhadap dual-view ordinal decision shift teacher, tetapi keunggulan tersebut tidak diikuti peningkatan QWK yang konklusif. Temuan ini menunjukkan bahwa kemampuan student untuk mereplikasi mekanisme perubahan keputusan teacher merupakan objective yang berbeda dari optimasi predictive grading secara langsung. Dengan demikian, kontribusi CSD terletak pada preservation of dual-view decision structure, bukan pada klaim universal peningkatan akurasi.”

Ini sangat kuat.

Dan jauh lebih interesting daripada:

> “CSD kalah QWK.”

---

# 17. Hapus/ubah pembahasan Grade 1 yang sekarang

Draft saat ini mengatakan rendahnya Grade-1 recall:

> “masuk akal karena citra dikecilkan ke 224×224.”



Kalimat ini **tidak boleh ada lagi** dalam final Enhanced karena input final adalah **384×384**.

Dan Enhanced tetap menunjukkan Grade 1 sulit bahkan pada 384:

* teacher = 0,000
* CSD = 0,068
* FeatureKD = 0,080.



Jadi narasi yang aman:

> “Performa per-grade menunjukkan bahwa Grade 1 tetap menjadi kategori yang paling sulit dibedakan meskipun resolusi input ditingkatkan. Hal ini menunjukkan bahwa pemisahan grade ringan membutuhkan analisis lebih lanjut terkait subtle lesion signal, distribusi kelas, dan representasi fitur; penyebabnya tidak dapat ditentukan hanya dari eksperimen saat ini.”

Lebih scientific.

---

# 18. IV-F. RQ2 — Compression dan Quantization

Ganti seluruh angka Simple.

Final Enhanced:

| Transisi          | Retensi QWK | CPU Speed-up | Compression |
| ----------------- | ----------: | -----------: | ----------: |
| Teacher → Student |       81,7% |    **19,3×** |    **119×** |
| FP32 → PTQ        |       97,3% |    **2,89×** |       1,36× |
| FP32 → FT-PTQ     |       96,8% |    **2,89×** |       1,36× |
| **FP32 → QAT**    |   **99,0%** |    **2,86×** |   **1,36×** |

Student:

[
328.588
]

parameters vs teacher:

[
40.313.932.
]

Deployment QAT:

[
\boxed{11,35\ ms}
]



Dan headline efficiency:

[
154,09MB\rightarrow1,29MB
]

teacher→student.

QAT:

[
0,95MB.
]



---

# 19. Jawaban RQ2 final

Enhanced internal comparison:

[
PTQ-FP32=-0,0164
]

CI melintasi 0.

[
QAT-FP32=-0,0063
]

CI juga melintasi 0.

Jadi conclusion:

> **“Tidak terdapat degradasi QWK yang kredibel akibat kuantisasi pada evaluasi internal.”**



Jangan bilang:

> quantization meningkatkan accuracy.

Claim-nya:

[
\boxed{
\text{large efficiency gain + high performance retention}
}
]

---

# 20. IV-G. Deployment Selection

Tuliskan rule secara eksplisit:

[
Retention_{val}\ge95%
]

*

severe error tidak credibly worse

*

latency minimal.

Enhanced:

* PTQ = 93,4% validation retention → tidak eligible
* FT-PTQ = 93,6% → tidak eligible
* **QAT = 99,0% → eligible**.



Maka:

[
\boxed{
Deployment = QAT\ INT8
}
]

Bukan PTQ.

---

# 21. IV-H. External Validation

Ganti tabel Simple sekarang.

Enhanced Set-C:

| Model           |   Mean QWK |
| --------------- | ---------: |
| Teacher         | **0,7923** |
| PTQ INT8        | **0,6729** |
| CSD FP32        |     0,6688 |
| FP32-FT control |     0,6567 |
| FT-PTQ          |     0,6513 |
| QAT             |     0,6344 |



Student FP32 mempertahankan:

[
\boxed{84,4%}
]

teacher external QWK.

Itu cukup kuat untuk headline external validation.

---

# 22. Ada trade-off external QAT vs PTQ yang tetap harus disebut

Walaupun QAT dipilih deployment internally, pada Set-C:

[
QAT-PTQ=-0,0384
]

[
CI=[-0,0826,-0,0006].
]

Artinya PTQ lebih baik secara kredibel pada external Set-C. 

Jangan dibuat headline negatif.

Cukup Discussion:

> “Selection based on internal validation favored QAT for its 99% retention, whereas PTQ showed stronger external Set-C performance. This divergence suggests that deployment efficiency criteria and cross-dataset robustness capture complementary aspects of model quality.”

Itu justru sophisticated.

---

# 23. Studi ablasi yang sekarang **jangan langsung dipakai sebagai hasil Enhanced**

Draft saat ini mempunyai Tabel 9–10 berbasis angka:

* QWK 0,5296;
* β=0,2;
* mechanism 0,4320;
* counterfactual 0,5460.



Itu bukan configuration final Enhanced yang menggunakan:

[
\beta=0,1
]

dan CSD test:

[
0,6018.
]

Jadi jangan meletakkan tabel itu seolah bagian dari Enhanced main run.

Pilihan terbaik:

**pindahkan menjadi supporting experiment dengan label “Original 224×224 protocol”**, atau jangan masukkan dulu ke hasil utama.

Karena sekarang page unlimited, nanti bisa dibuat section terpisah:

> **Supporting Robustness Analysis**

bukan dicampur ke main Enhanced.

---

# 24. Simple tetap bisa sangat berguna — tetapi satu fungsi saja

Kalau ingin menggunakan Simple sebagai supporting evidence, saya hanya pakai untuk menunjukkan mechanism replication:

| Mechanism Metric CSD | Simple |   Enhanced |
| -------------------- | -----: | ---------: |
| ShiftL1 ↓            | 0,4320 | **0,3509** |
| CosAgree ↑           | 0,4257 | **0,4361** |
| BenefitCorr ↑        | 0,2902 | **0,3075** |



Kalimat:

> “The mechanism-fidelity advantage of CSD was reproduced under the original 224×224 protocol and the final 384×384 Enhanced protocol.”

Selesai.

Tidak perlu mencampur semua Simple tables ke main results.

---

# 25. Gaya bahasa Bab IV sekarang perlu sedikit lebih akademik

Saya suka draft Bab IV karena **enak dibaca**, tetapi beberapa kalimat terlalu editorial/conversational.

Contoh:

> “Kalau ada satu hal yang paling jelas dan paling langsung…”

lebih baik:

> **“Efisiensi komputasi merupakan salah satu temuan praktis utama DR-VERGE.”**

“Efisiensi secepat apa pun tidak ada gunanya kalau kemampuan grading runtuh.”

menjadi:

> **“Peningkatan efisiensi perlu dievaluasi bersama retensi performa grading untuk memastikan bahwa keuntungan komputasi tidak diperoleh melalui degradasi prediktif yang substansial.”**

“Inilah bukti paling telak…”

menjadi:

> **“Temuan ini mendukung bahwa peningkatan fidelity CSD berasal dari formulasi shift yang digunakan, bukan sekadar dari penambahan loss term.”**

“Yang berpindah bukan keluaran akhir semata…”

sebenarnya bagus, tetapi versi paper:

> **“Hasil tersebut menunjukkan bahwa CSD mempertahankan pola manfaat dual-view pada tingkat sampel, melampaui sekadar penyelarasan output akhir.”**

Lebih professional.

---

# 26. Heading Bab IV harus restart dari A

Sekarang Bab IV langsung:

> **E. Kinerja Klasifikasi**



Ini karena lettering Bab III diteruskan.

Sebaiknya setiap Bab restart subsection:

### IV-A

Protocol Refinement

### IV-B

Dual-View Premise

### IV-C

RQ1 Predictive Performance

### IV-D

RQ1 Shift Fidelity

### IV-E

Mechanism–Performance Dissociation

### IV-F

RQ2 Compression and Quantization

### IV-G

Deployment Selection

### IV-H

External Validation

### IV-I

Supporting Robustness Analysis

Ini jauh lebih clean.

---

# 27. Struktur final Bab I–IV yang saya rekomendasikan

| Bab                                   | Section final                                |
| ------------------------------------- | -------------------------------------------- |
| **I. Pendahuluan**                    | A. Latar Belakang & Urgensi                  |
|                                       | B. Research Gap                              |
|                                       | C. Tujuan dan Kontribusi                     |
|                                       | D. Pertanyaan Penelitian                     |
| **II. Studi Literatur**               | A. DR & Ordinal Grading                      |
|                                       | B. Two-Field/Multi-View Fundus               |
|                                       | C. Knowledge Distillation                    |
|                                       | D. Lightweight Model & Quantization          |
|                                       | E. Positioning DR-VERGE                      |
| **III. Metode Penelitian**            | A. Overview DR-VERGE                         |
|                                       | B. Dataset & Preprocessing                   |
|                                       | C. Teacher & Student Architecture            |
|                                       | D. CORAL Ordinal Modeling                    |
|                                       | E. Complementarity-Shift Distillation        |
|                                       | F. Experiment Conditions                     |
|                                       | G. Training & Model Selection                |
|                                       | H. PTQ/QAT Protocol                          |
|                                       | I. Evaluation & Statistics                   |
|                                       | J. Reproducibility Environment               |
| **IV. Hasil Eksperimen dan Analisis** | A. Validation-Controlled Protocol Refinement |
|                                       | B. Dual-View Premise                         |
|                                       | C. RQ1 Predictive Performance                |
|                                       | D. RQ1 Mechanism Fidelity                    |
|                                       | E. Mechanism–Performance Dissociation        |
|                                       | F. RQ2 Compression & Quantization            |
|                                       | G. Deployment Selection                      |
|                                       | H. External Validation                       |
|                                       | I. Supporting Robustness                     |

---

# 28. Story utama paper setelah diperbaiki

Kalau semua bagian ini dirapikan, paper tidak lagi memiliki story:

> “CSD kalah dari Logit-KD lalu Logit-KD kita quantize.”

Itu adalah story Simple dan terlalu sempit.

**Story final Enhanced jauh lebih bagus:**

[
\boxed{
\text{Dual-view improves ordinal grading}
}
]

kemudian:

[
\boxed{
\text{CSD most faithfully transfers the dual-view decision-shift mechanism}
}
]

namun:

[
\boxed{
\text{mechanistic fidelity does not imply predictive superiority}
}
]

dan akhirnya:

[
\boxed{
\text{a 328K selected CSD student can be quantized to QAT INT8}
}
]

dengan:

[
\boxed{
123\times\ fewer\ parameters
}
]

[
\boxed{
99%\ QWK\ retention
}
]

[
\boxed{
2,86\times\ faster\ CPU\ inference
}
]

serta external validation pada DeepDRiD.

Itu **lebih kuat secara ilmiah daripada narasi “metode baru mendapat QWK tertinggi”**, karena DR-VERGE mempunyai dua kontribusi yang berbeda dan keduanya dapat dijelaskan dengan jelas:

> **CSD menjawab “what knowledge is transferred?”**

sedangkan

> **Quantization menjawab “can the transferred lightweight model be deployed efficiently?”**

Dan satu keputusan paling penting sebelum Anda lanjut menulis: **jadikan seluruh Bab III dan IV konsisten memakai Enhanced sebagai eksperimen utama.** Draft saat ini sudah punya fondasi Pendahuluan dan Studi Literatur yang sangat bagus, tetapi Bab IV masih secara substansial merupakan hasil Simple. Setelah konsistensi itu diperbaiki, kualitas paper akan naik sangat signifikan. 
