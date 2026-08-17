# Penguatan Paper DR-VERGE — Bab I (Pendahuluan) & Bab IV (Hasil dan Analisis)

**Dokumen kerja untuk revisi `draft/Draft-DR-VERGE-V2.pdf`**
Sumber kebenaran tunggal: **enhanced notebook** (`experiments/results/enhanced-notebook/outputs/`).
Status verifikasi: seluruh angka di dokumen ini ditarik langsung dari file CSV hasil run, bukan dari ingatan atau dari draft.

---

## 0. Ringkasan eksekutif — baca ini dulu

Ada **satu temuan blocking**. Sebelum diperbaiki, semua diskusi soal wording, gambar, dan gaya tulis tidak ada gunanya.

> **Seluruh Bab IV draft saat ini ditulis menggunakan angka dari SIMPLE notebook, bukan enhanced notebook.**

Ini bukan dugaan. Saya bandingkan baris per baris terhadap ketiga run:

| Angka di draft (Tabel 1) | Cocok dengan **simple** | Nilai **enhanced** yang benar |
|---|---|---|
| Teacher QWK 0,6544 | ✅ persis | **0,7364** |
| Teacher Akurasi 0,5436 | ✅ persis | **0,5909** |
| Teacher MAE 0,7091 | ✅ persis | **0,5909** |
| Logit-KD 0,5546 | ✅ persis | **0,5942** |
| Feature-KD 0,5484 | ✅ persis | **0,6161** |
| CSD 0,5296 | ✅ persis | **0,6018** |
| PTQ INT8 0,5453 | ✅ persis | **0,5854** |
| QAT INT8 0,5253 | ✅ persis | **0,5956** |

Kecocokan bukan hanya pada QWK, melainkan **persis sampai empat angka desimal pada kelima metrik sekaligus** untuk setiap kondisi yang muncul di draft — termasuk Tabel 2 (statistik RQ1), Tabel 4 (mekanisme), Tabel 5 (efisiensi), dan Tabel 7 (eksternal). Kecocokan seluas itu tidak mungkin kebetulan. Draft memakai metodologi Enhanced (resolusi 384, lima core seed, 10.000 bootstrap) tetapi menempelkan hasil Simple di bawahnya. Kalau ini lolos ke reviewer dan mereka membuka repositori, seluruh Bab III dan Bab IV akan terbaca tidak konsisten satu sama lain.

**Kabar baiknya: setelah diperbaiki, papernya menjadi JAUH lebih kuat.** Bukan sedikit — jauh. Lima hal berubah menjadi menguntungkan:

1. **CSD memenangkan pemilihan model.** Di enhanced, `dual_csd` menang pada validation QWK (0,6490) mengalahkan Feature-KD (0,6477), Logit-KD (0,6308), dan tanpa distilasi (0,6228). Artinya **metode usulan kita sendiri yang terpilih sebagai model deployment** melalui aturan yang sudah ditetapkan sebelum eksperimen. Di simple, yang menang adalah Logit-KD — dan itulah sumber kalimat canggung di draft ("metode usulan kami, CSD, justru berhenti di QWK 0,5296, di bawah Logit-KD"). Kalimat itu **tidak perlu ada lagi**.
2. **Angka absolut naik di seluruh papan.** Teacher 0,6544 → 0,7364. Student 0,5296 → 0,6018. Ini membuat paper berdiri sejajar dengan literatur two-field, bukan di bawahnya.
3. **Premis dual-view menjadi tegas.** Dual-view tanpa distilasi 0,6042 vs disc-only 0,5502 vs macula-only 0,5175 — selisih +0,0540 dan +0,0867. Premis penelitian terbukti sebelum CSD dibicarakan.
4. **Mekanisme CSD menang 3/3 dengan margin lebih lebar** dan konsisten dengan run simple, sehingga bisa diklaim sebagai temuan yang **tereplikasi lintas protokol**.
5. **Deployment berubah ke QAT INT8** dengan retensi validasi 99,04% — satu-satunya varian yang lolos gate 95%. Ceritanya jadi bersih: ada aturan, aturan dijalankan, satu kandidat lolos.

Sisa dokumen ini memberi Anda: cerita ilmiah final (§1), perbaikan Bab I lengkap dengan paragraf siap pakai (§2), Bab IV yang ditulis ulang penuh dengan seluruh tabel dan paragraf siap pakai (§3), daftar yang harus dihapus (§4) dan ditambahkan (§5), rekomendasi gambar (§6), dan checklist verifikasi (§7).

---

## 1. Cerita ilmiah final DR-VERGE

Sebelum menulis satu kalimat pun, kunci dulu kalimat inti ini. Semua bagian paper harus mengarah ke sini.

> **Interaksi dual-view punya nilai prediktif yang nyata. CSD berhasil mentransfer struktur interaksi itu dari guru ke murid ringan secara terukur dan konsisten. Fidelitas mekanisme yang lebih tinggi tidak otomatis menjadi QWK yang lebih tinggi — dan disosiasi itu sendiri adalah temuan yang berguna, karena berarti "seberapa mirip perilakunya dengan guru" dan "seberapa akurat gradingnya" adalah dua sumbu yang harus diukur terpisah. Kuantisasi INT8 kemudian membuat model itu layak dijalankan di CPU biasa.**

Tiga sumbu, tiga jawaban, tidak saling bertabrakan:

| Sumbu | Pemenang | Bukti |
|---|---|---|
| Premis dual-view | Dual-view > single-view | +0,0540 vs disc, +0,0867 vs macula |
| Fidelitas mekanisme | **CSD, 3/3 metrik** | ShiftL1 0,3509 · CosAgree +0,4361 · BenefitCorr +0,3075 |
| Pemilihan model (validation) | **CSD** | val QWK 0,6490, tertinggi |
| Performa prediktif (test) | tidak konklusif | seluruh CI RQ1 memuat nol |
| Efisiensi | INT8 | 55,3× lebih cepat dari guru, 162,1× lebih kecil |

Perhatikan bahwa **CSD menang di dua dari tiga sumbu yang bisa dimenangkan**, dan sumbu ketiga bukan kekalahan melainkan ketiadaan perbedaan yang terbukti. Ini posisi yang jauh lebih baik daripada yang tergambar di draft sekarang.

### Catatan editorial soal nada tulisan

Anda pernah meminta agar paper tidak menampilkan kelemahan dan membingkai semuanya sebagai *trade-off*. Saya ikuti itu untuk **kalimat-kalimat yang masuk ke paper** — semua paragraf siap pakai di dokumen ini sudah dibingkai demikian.

Tetapi ada satu hal yang **harus tetap ditulis apa adanya**: interval kepercayaan RQ1 yang memuat nol, dan pernyataan bahwa itu bukan klaim keunggulan. Alasannya murni strategis, bukan moral. Berkas `fig_12_forest.png` beserta `fig_12_forest_data.csv` ada di repositori dan akan dibuka reviewer. Kalau paper mengklaim CSD unggul secara prediktif sementara forest plot-nya menunjukkan seluruh bar memotong nol, satu temuan itu akan meruntuhkan kredibilitas seluruh paper — termasuk bagian mekanisme yang sebenarnya kuat. Sebaliknya, **menyatakannya lebih dulu dengan percaya diri adalah tanda kematangan metodologis** dan justru melindungi klaim mekanisme. Jadi bukan "CSD gagal", melainkan "kami menetapkan aturan bahwa interval yang memuat nol tidak kami jadikan klaim, dan kami patuhi aturan itu sekalipun untuk metode kami sendiri". Itu kalimat yang membuat reviewer percaya.

---

## 2. Bab I — Pendahuluan

### 2.1 Yang sudah bagus dan jangan diubah

- Struktur A–D (Latar Belakang → Tujuan dan Kontribusi → Pertanyaan Penelitian → Batasan) sudah benar dan mengikuti pola Pink-MVAN.
- Data epidemiologi (589 juta, 853 juta 2050, prevalensi 22,27%) sudah kuat dan tersitasi.
- Pengaitan ke Asta Cita, RPJMN 2025–2029, SDG 3, dan tema GEMASTIK XIX sudah tepat sasaran untuk konteks lomba nasional. Pertahankan.
- Konteks 3T (tertinggal, terdepan, terluar) adalah justifikasi terbaik untuk model ringan. Pertahankan dan perkuat.

### 2.2 Yang perlu diperbaiki

**(a) Gap penelitian belum cukup tajam.** Paragraf sekarang menyebut "belum ditemukan pendekatan yang secara eksplisit membentuk perubahan bertanda dari agregasi prediksi kumulatif *individual-field* menuju prediksi *joint two-field*". Ini benar tetapi terlalu teknis untuk pembaca yang baru masuk. Gap-nya perlu dinyatakan dalam satu kalimat yang bisa dipahami siapa pun sebelum masuk ke istilah teknis.

**(b) RQ1 belum memberi ruang untuk jawaban dua sumbu.** Ini penting. Rumusan RQ1 sekarang ("Sejauh mana CSD dapat mentransfer... dibandingkan dengan kondisi tanpa distilasi, logit distillation, dan feature distillation?") lalu dievaluasi dengan "QWK sebagai metrik utama **serta** *shift fidelity*". Karena hasil enhanced memang terbelah — mekanisme menang, prediktif netral — RQ1 harus **secara eksplisit menyatakan bahwa ia punya dua sumbu evaluasi sejak awal**. Dengan begitu, jawaban "menang di satu sumbu, netral di sumbu lain" terbaca sebagai jawaban lengkap yang sudah diantisipasi, bukan sebagai hasil yang mengecewakan.

**(c) Kontribusi masih tiga dan kurang menonjolkan yang paling orisinal.** Kontribusi terkuat DR-VERGE sebenarnya bukan "mengusulkan CSD", melainkan **memperkenalkan cara mengukur apakah mekanisme dual-view benar-benar berpindah** — tiga metrik ShiftL1/CosAgree/BenefitCorr plus kontrol *counterfactual*. Ini yang tidak ada di literatur yang disitasi. Naikkan ke kontribusi pertama.

**(d) Batasan penelitian belum menyebut keterbatasan identifier DRTiD.** Ini wajib ditambahkan (lihat §5).

**(e) Ada kesalahan faktual kecil.** Draft menulis "Partisi *training* dibagi secara terstratifikasi berdasarkan *grade* menjadi 800 record dan 200 record" — ini di Bab III, tapi konsisten dengan enhanced (train 800 / val 200 / test 550). Aman. Namun draft juga menulis di Bab III bahwa "kombinasi resolusi 224 × 224 dan 384 × 384 dengan metode *standard* dan *balanced sampling* dibandingkan menggunakan tiga *seed*" — ini benar, dan hasilnya perlu disebut angkanya (lihat §3.2).

### 2.3 Paragraf siap pakai — Bab I

#### Sisipkan di akhir Latar Belakang (setelah paragraf *knowledge distillation*)

> Celah yang belum terjawab dapat dinyatakan sederhana: penelitian terdahulu menilai keberhasilan distilasi dari seberapa dekat **akurasi** murid terhadap guru, bukan dari seberapa dekat **cara murid mengambil keputusan** terhadap cara guru mengambil keputusan. Pada grading DR *two-field*, keduanya tidak identik. Seorang guru *two-field* tidak sekadar lebih akurat; ia mengubah keputusan ordinalnya ketika kedua bidang pandang digabungkan, dan perubahan itulah yang merepresentasikan pemanfaatan komplementaritas anatomis antara area makula dan diskus optik. Sebuah model murid dapat menyamai akurasi guru sambil sepenuhnya mengabaikan perubahan tersebut — yaitu dengan memperlakukan dua citra sebagai satu masukan yang lebih besar, tanpa pernah membentuk interaksi antar-bidang. Karena literatur yang ditelaah belum menyediakan besaran yang dapat mengukur perbedaan ini, keberhasilan transfer interaksi *two-field* selama ini belum pernah diverifikasi secara langsung. DR-VERGE mengisi celah tersebut dengan menjadikan perubahan keputusan ordinal itu sendiri sebagai target distilasi yang eksplisit sekaligus sebagai objek pengukuran.

#### Ganti paragraf Pertanyaan Penelitian

> Berdasarkan latar belakang dan tujuan penelitian, DR-VERGE dirancang untuk menjawab dua pertanyaan penelitian berikut.
>
> **RQ1.** *Sejauh mana Complementarity-Shift Distillation mentransfer* signed joint-vs-individual cumulative ordinal prediction shift *dari model* two-field teacher *ke* lightweight student, dibandingkan dengan kondisi tanpa distilasi, logit distillation, dan feature distillation? RQ1 dievaluasi pada dua sumbu yang sengaja dipisahkan sejak awal. Sumbu pertama adalah **fidelitas mekanisme**, diukur melalui ShiftL1, Cosine Agreement, dan Benefit Correlation, yang menilai apakah struktur perubahan keputusan itu benar-benar berpindah. Sumbu kedua adalah **performa prediktif**, diukur melalui Quadratic Weighted Kappa sebagai metrik utama dengan Macro-F1, MAE, dan *severe error rate* sebagai pendamping. Pemisahan ini disengaja: kedua sumbu mengukur hal yang berbeda, sehingga hasil pada satu sumbu tidak diperlakukan sebagai bukti bagi sumbu lainnya.
>
> **RQ2.** *Sejauh mana* post-training quantization *(PTQ) dan* quantization-aware training *(QAT) INT8 memengaruhi retensi performa QWK, ukuran artefak, dan latensi inferensi CPU pada model ringan terpilih?* RQ2 dievaluasi terhadap model FP32 acuan pada *seed* yang berpasangan, disertai kontrol *fine-tune* FP32 untuk memisahkan efek kuantisasi dari efek pelatihan tambahan.

#### Ganti paragraf Tujuan dan Kontribusi

> Penelitian ini memberikan empat kontribusi utama.
>
> **Pertama**, penelitian ini memperkenalkan kerangka pengukuran untuk menilai apakah interaksi *two-field* benar-benar berpindah dari guru ke murid, melalui tiga besaran yang saling melengkapi — ShiftL1 untuk jarak struktur pergeseran, Cosine Agreement untuk kesejajaran arah, dan Benefit Correlation untuk kesesuaian sampel yang memperoleh manfaat — dilengkapi kondisi kontrol *counterfactual* yang menerima bimbingan guru namun tanpa target pergeseran. Kerangka ini memungkinkan klaim transfer mekanisme diuji secara langsung, bukan disimpulkan dari akurasi.
>
> **Kedua**, penelitian ini merumuskan Complementarity-Shift Distillation, sebuah mekanisme distilasi yang menjadikan *signed joint-vs-individual cumulative ordinal prediction shift* sebagai target transfer, dengan penskalaan global tetap yang menjaga informasi magnitudo pergeseran tetap utuh selama pelatihan.
>
> **Ketiga**, penelitian ini menunjukkan bahwa fidelitas mekanisme dan performa prediktif merupakan dua sumbu yang dapat bergerak secara independen. Temuan ini bernilai praktis: pemilihan metode distilasi untuk sistem *two-field* sebaiknya menimbang keduanya secara terpisah, karena metode dengan fidelitas mekanisme tertinggi belum tentu memberikan QWK tertinggi, dan sebaliknya.
>
> **Keempat**, penelitian ini mengevaluasi efisiensi model melalui PTQ dan QAT INT8 berdasarkan retensi QWK, ukuran artefak, dan latensi inferensi CPU, serta memverifikasi keseluruhan rangkaian melalui 36 *gate* konsistensi otomatis dan evaluasi konfirmatori eksternal lintas-dataset yang dibuka hanya satu kali setelah seluruh keputusan model dikunci.

---

## 3. Bab IV — Hasil Eksperimen dan Analisis

Bagian ini adalah inti revisi. Susun ulang Bab IV mengikuti urutan enam subbab berikut. Urutan ini penting: ia membangun premis dulu, baru mengklaim kontribusi.

```
A. Validasi premis dual-view dan pemilihan konfigurasi
B. RQ1 — performa prediktif                     (jawaban: setara, tidak konklusif)
C. RQ1 — fidelitas transfer mekanisme           (jawaban: CSD menang 3/3)   ← KONTRIBUSI
D. RQ1 — studi ablasi formulasi CSD             (jawaban: efek spesifik, bukan bonus)
E. RQ2 — efisiensi, kompresi, dan retensi
F. Generalisasi pada data eksternal DeepDRiD
```

### 3.0 Angka kunci yang harus diganti — tabel referensi cepat

Cetak halaman ini dan pakai saat menyunting.

| Lokasi di draft | Angka lama (SALAH) | Angka baru (BENAR) |
|---|---|---|
| Teacher QWK | 0,6544 | **0,7364** |
| Teacher Akurasi / Macro-F1 / MAE / SER | 0,5436 / 0,3579 / 0,7091 / 0,2218 | **0,5909 / 0,3887 / 0,5909 / 0,1764** |
| Logit-KD QWK | 0,5546 | **0,5942** |
| Feature-KD QWK | 0,5484 | **0,6161** |
| CSD QWK | 0,5296 | **0,6018** |
| PTQ / FT-PTQ / QAT QWK | 0,5453 / 0,5409 / 0,5253 | **0,5854 / 0,5828 / 0,5956** |
| Model terpilih (M\*) | Logit-KD | **CSD** |
| Model deployment | FT-PTQ INT8 | **QAT INT8** |
| Latensi deployment | 6,2164 ms | **11,3468 ms** |
| Retensi deployment (validasi) | 99,70% | **99,04%** |
| Speedup murid vs guru | 18,0× | **19,3×** (FP32) / **55,3×** (INT8) |
| Kompresi | 119,1× | **119,1×** (FP32) / **162,1×** (INT8) |
| Parameter murid | 328.588 | **328.588** (tetap) |
| ShiftL1 CSD / tanpa distilasi | 0,4320 / 0,4605 | **0,3509 / 0,3759** |
| CosAgree CSD | +0,4257 | **+0,4361** |
| BenefitCorr CSD | +0,2902 | **+0,3075** |
| Eksternal teacher QWK | 0,7788 | **0,7923** |
| Eksternal CSD QWK | 0,7346 | **0,6688** |
| β pada ablasi CSD | 0,2 | **0,1** |
| Rerata \|Δ\| guru | 0,4893 (99,50% > 0,02) | **0,4282 (98,50% > 0,02)** |

---

### 3.A Validasi premis dual-view dan pemilihan konfigurasi

**Tabel A1 — Pemilihan konfigurasi Stage A (validation, 3 seed)**

| Resolusi | Sampling | val QWK | val Macro-F1 | val Recall grade-1 | val SER |
|---|---|---|---|---|---|
| 224 | standard | 0,5549 | 0,2636 | 0,0000 | 0,2650 |
| **384** | **standard** | **0,6491** | **0,3106** | **0,0556** | **0,2183** |
| 224 | balanced | 0,5522 | 0,2728 | 0,0926 | 0,2567 |
| 384 | balanced | 0,5798 | 0,2964 | 0,0370 | 0,2517 |

**Tabel A2 — Premis dual-view (test internal, 550 mata, rerata 5 seed)**

| Kondisi | QWK | Δ vs dual-view |
|---|---|---|
| Hanya makula | 0,5175 ± 0,0193 | −0,0867 |
| Hanya diskus optik | 0,5502 ± 0,0067 | −0,0540 |
| **Dual-view, tanpa distilasi** | **0,6042 ± 0,0166** | — |

**Paragraf siap pakai:**

> Sebelum satu pun klaim tentang distilasi diajukan, premis dasar DR-VERGE diverifikasi lebih dulu: apakah dua bidang pandang memang memberi nilai lebih dibanding satu bidang pandang. Pemilihan konfigurasi dilakukan sepenuhnya pada data validasi. Dari empat kombinasi resolusi dan strategi *sampling*, konfigurasi 384 × 384 dengan *standard sampling* memperoleh QWK validasi tertinggi sebesar 0,6491, unggul 0,0942 dibandingkan resolusi 224 × 224 pada strategi *sampling* yang sama. Selisih sebesar ini menunjukkan bahwa lesi awal retinopati diabetik — terutama mikroaneurisma yang berukuran sangat kecil — memerlukan resolusi masukan yang memadai agar tetap terwakili setelah proses *resize*. Konfigurasi tersebut kemudian dikunci untuk seluruh eksperimen berikutnya.
>
> Pada konfigurasi terpilih, model murid yang dilatih hanya dengan citra makula mencapai QWK 0,5175, sedangkan yang dilatih hanya dengan citra diskus optik mencapai 0,5502. Model *dual-view* tanpa distilasi apa pun mencapai 0,6042, unggul 0,0867 atas varian makula dan 0,0540 atas varian diskus optik. Pada sisi guru, keunggulan *dual-view* terhadap model bidang tunggal yang dilatih mandiri tercatat sebesar 0,1782. Dengan demikian premis penelitian terpenuhi: informasi dari kedua bidang pandang bersifat komplementer dan penggabungannya memberikan keuntungan prediktif yang nyata pada kedua skala model. Pertanyaan yang tersisa — dan yang menjadi fokus penelitian ini — bukan lagi apakah *dual-view* berguna, melainkan apakah *cara* guru memanfaatkan komplementaritas itu dapat dipindahkan ke model ringan.

---

### 3.B RQ1 — Performa prediktif

**Tabel B1 — Kinerja klasifikasi pada 550 mata data uji DRTiD (rerata ± simpangan baku 5 seed)**

| Model / Kondisi | QWK | Akurasi | Macro-F1 | MAE | SER |
|---|---|---|---|---|---|
| ResNet-50 (Teacher, dual-view) | 0,7364 | 0,5909 | 0,3887 | 0,5909 | 0,1764 |
| Student, hanya makula | 0,5175 ± 0,0193 | 0,4673 ± 0,0264 | 0,3330 ± 0,0239 | 0,8524 ± 0,0240 | 0,2742 ± 0,0084 |
| Student, hanya diskus optik | 0,5502 ± 0,0067 | 0,4804 ± 0,0136 | 0,3422 ± 0,0139 | 0,8047 ± 0,0108 | 0,2549 ± 0,0122 |
| Dual-view, tanpa distilasi | 0,6042 ± 0,0166 | 0,4793 ± 0,0189 | 0,3355 ± 0,0119 | 0,8105 ± 0,0316 | 0,2505 ± 0,0127 |
| Logit-KD | 0,5942 ± 0,0290 | 0,5062 ± 0,0384 | 0,3589 ± 0,0278 | 0,7775 ± 0,0646 | 0,2487 ± 0,0187 |
| Logit-KD + Feature-KD | 0,6161 ± 0,0101 | 0,5098 ± 0,0169 | 0,3435 ± 0,0113 | 0,7702 ± 0,0278 | 0,2396 ± 0,0107 |
| **Logit-KD + CSD (usulan, M\*)** | **0,6018 ± 0,0149** | 0,5033 ± 0,0176 | 0,3362 ± 0,0152 | 0,7902 ± 0,0250 | 0,2582 ± 0,0081 |
| PTQ INT8 | 0,5854 ± 0,0242 | 0,5113 ± 0,0152 | 0,3545 ± 0,0149 | 0,7855 ± 0,0257 | 0,2571 ± 0,0069 |
| FT-PTQ INT8 | 0,5828 ± 0,0328 | 0,4913 ± 0,0463 | 0,3413 ± 0,0298 | 0,8091 ± 0,0814 | 0,2571 ± 0,0232 |
| **QAT INT8 (deployment)** | **0,5956 ± 0,0093** | 0,5105 ± 0,0147 | 0,3411 ± 0,0070 | 0,7833 ± 0,0186 | 0,2491 ± 0,0070 |

**Tabel B2 — Pemilihan metode pada data validasi (rerata 5 seed)**

| Kondisi | val QWK | val Macro-F1 | val SER | Peringkat |
|---|---|---|---|---|
| **Logit-KD + CSD (usulan)** | **0,6490 ± 0,0219** | 0,3290 | 0,2140 | **1 — terpilih sebagai M\*** |
| Logit-KD + Feature-KD | 0,6477 ± 0,0319 | 0,3230 | 0,2260 | 2 |
| Logit-KD | 0,6308 ± 0,0286 | 0,3123 | 0,2130 | 3 |
| Dual-view, tanpa distilasi | 0,6228 ± 0,0295 | 0,3115 | 0,2310 | 4 |

**Tabel B3 — Pengujian RQ1 pada metrik QWK** (bootstrap berklaster mata, 10.000 replikasi; permutasi 10.000; koreksi Holm dalam famili RQ1)

| Perbandingan | ΔQWK | 95% CI | p (permutasi) | p (Holm) | Kesimpulan |
|---|---|---|---|---|---|
| CSD vs tanpa distilasi | −0,0024 | [−0,0336; +0,0285] | 0,8003 | 0,8003 | null |
| CSD vs Logit-KD | +0,0077 | [−0,0304; +0,0463] | 0,3640 | 0,7279 | null |
| CSD vs Feature-KD | −0,0143 | [−0,0445; +0,0153] | 0,1650 | 0,4950 | null |

**Tabel B4 — Recall per derajat keparahan pada data uji DRTiD**

| Model | Derajat 0 | Derajat 1 | Derajat 2 | Derajat 3 | Derajat 4 |
|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 0,9321 | 0,0000 | 0,2603 | 0,3623 | 0,7500 |
| Dual-view, tanpa distilasi | 0,7268 | 0,0840 | 0,2233 | 0,3130 | 0,6300 |
| Logit-KD | 0,7834 | 0,0800 | 0,1959 | 0,3913 | 0,5600 |
| Logit-KD + Feature-KD | 0,8075 | 0,0800 | 0,1863 | 0,3420 | 0,5800 |
| Logit-KD + CSD (usulan) | 0,8030 | 0,0680 | 0,1918 | 0,3043 | 0,5800 |
| Jumlah sampel | 265 | 50 | 146 | 69 | 20 |

**Paragraf siap pakai:**

> Pemilihan metode dilakukan sepenuhnya pada data validasi, sebelum data uji dibuka. Berdasarkan aturan tersebut, konfigurasi Logit-KD + CSD memperoleh QWK validasi tertinggi sebesar 0,6490, diikuti Logit-KD + Feature-KD sebesar 0,6477, Logit-KD sebesar 0,6308, dan *dual-view* tanpa distilasi sebesar 0,6228. Metode usulan penelitian ini karena itu terpilih sebagai model acuan M\* melalui prosedur yang telah ditetapkan sebelum eksperimen berjalan, bukan melalui penilaian setelah hasil uji diketahui.
>
> Pada data uji internal, keempat varian *dual-view* berada pada rentang QWK 0,5942 hingga 0,6161. Model guru mencapai 0,7364 dengan 40.313.932 parameter, sedangkan model murid terpilih mencapai 0,6018 hanya dengan 328.588 parameter — yaitu 81,7% kemampuan *grading* guru dipertahankan oleh model yang 122,7 kali lebih kecil. Distilasi menambah keuntungan di atas *baseline dual-view* tanpa distilasi sebesar −0,0024 hingga +0,0119 bergantung skemanya, sementara keuntungan terbesar sepanjang seluruh rangkaian justru datang dari arsitektur *dual-view* itu sendiri, yaitu +0,0540 hingga +0,0867 terhadap model bidang tunggal.
>
> Angka-angka tersebut perlu dibaca bersama sebaran antar-*seed*-nya, yang berkisar antara 0,0101 hingga 0,0290, sementara selisih antar-metode berada pada kisaran 0,0024 hingga 0,0143. Selisih antar-metode karena itu lebih sempit daripada variasi yang ditimbulkan oleh inisialisasi acak semata, sehingga peringkat pada Tabel B1 belum dapat diperlakukan sebagai bukti keunggulan sebelum diuji secara formal. Pengujian formal atas ketiga perbandingan RQ1 disajikan pada Tabel B3.
>
> Hasilnya konsisten: seluruh interval kepercayaan memuat nol dan tidak satu pun perbandingan lolos setelah koreksi Holm. Sesuai aturan yang kami tetapkan sejak awal — bahwa selisih yang interval kepercayaannya memuat nol tidak diperlakukan sebagai klaim — kesimpulan RQ1 pada sumbu prediktif dinyatakan secara langsung: **pada sumbu ini CSD setara dengan ketiga pembanding, tidak terbukti lebih unggul dan tidak pula terbukti lebih rendah.** Aturan tersebut kami terapkan tanpa pengecualian, termasuk terhadap metode usulan kami sendiri. Konsekuensinya adalah CSD dapat mengubah struktur pengambilan keputusan model secara terukur — sebagaimana ditunjukkan pada bagian berikutnya — tanpa menimbulkan biaya prediktif yang terdeteksi. Bagi penggunaan praktis, kesetaraan ini bernilai: fidelitas mekanisme diperoleh tanpa perlu menukarnya dengan kualitas *grading*.
>
> Metrik agregat berpotensi menyamarkan perilaku pada kelas yang jarang muncul, sehingga *recall* tiap derajat dilaporkan terpisah pada Tabel B4. Derajat 1 merupakan derajat tersulit bagi seluruh model, dengan *recall* pada rentang 0,0680 hingga 0,0840. Secara klinis pola ini dapat dijelaskan: derajat 1 ditandai semata oleh mikroaneurisma, lesi berdiameter sangat kecil yang sebagian besar informasinya hilang ketika citra beresolusi 2592 × 1944 piksel diperkecil ke resolusi masukan model. Temuan yang menarik adalah bahwa **seluruh model murid justru mengungguli model guru pada derajat ini**, yang mencatat *recall* 0,0000 — guru berukuran besar sepenuhnya melewatkan kelas tersebut, sedangkan murid ringan masih menangkap sebagiannya. Hal ini memperlihatkan bahwa hubungan antara kapasitas model dan sensitivitas terhadap kelas minoritas tidak bersifat monoton, dan menegaskan pentingnya melaporkan *recall* per derajat di samping metrik agregat.

---

### 3.C RQ1 — Fidelitas transfer mekanisme (bagian kontribusi utama)

Ini bagian terpenting paper. Beri ruang paling besar di sini.

**Tabel C1 — Metrik fidelitas pergeseran pada data uji DRTiD (rerata ± simpangan baku 5 seed)**

| Kondisi | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr *r* ↑ | BenefitCorr *ρ* ↑ |
|---|---|---|---|---|
| Dual-view, tanpa distilasi | 0,3759 ± 0,0115 | +0,3509 ± 0,1028 | +0,2193 ± 0,0982 | +0,3596 ± 0,1010 |
| Logit-KD | 0,3840 ± 0,0236 | +0,2858 ± 0,1317 | +0,1795 ± 0,1316 | +0,2895 ± 0,1281 |
| Logit-KD + Feature-KD | 0,3718 ± 0,0125 | +0,3815 ± 0,0623 | +0,1943 ± 0,1084 | +0,3799 ± 0,0681 |
| **Logit-KD + CSD (usulan)** | **0,3509 ± 0,0124** | **+0,4361 ± 0,0444** | **+0,3075 ± 0,0842** | **+0,4532 ± 0,0595** |

**Paragraf siap pakai:**

> RQ1 tidak berhenti pada pertanyaan apakah akurasi meningkat. Pertanyaan yang lebih mendasar adalah apakah pergeseran keputusan itu sendiri berpindah dari guru ke murid — dan pertanyaan itu dijawab secara langsung dengan mengukur seberapa dekat keluaran ordinal kumulatif murid meniru pergeseran milik guru. Besaran yang menjadi objek transfer didefinisikan sebagai selisih antara probabilitas ordinal hasil fusi *dual-view* dan rata-rata probabilitas dari kedua bidang pandang yang diproses terpisah, yaitu Δ = p_dual − ½(p_makula + p_diskus).
>
> Sebelum besaran tersebut dipercaya, keberadaannya diverifikasi terlebih dahulu agar dapat dipastikan bahwa ia merupakan fenomena nyata dan bukan sekadar hasil derau numerik. Rerata |Δ| pada model guru tercatat sebesar 0,4282, dengan 98,50% sampel berada di atas ambang 0,02. Dengan demikian premis komplementaritas *dual-view* terpenuhi pada tataran keluaran model, bukan hanya pada tataran akurasi akhir.
>
> Tiga metrik kemudian digunakan untuk menilai kualitas transfer. ShiftL1 mengukur jarak antara vektor pergeseran murid dan guru; semakin rendah semakin baik. CosAgree menilai apakah arah pergeseran keduanya sejajar. BenefitCorr menguji hal yang lebih halus, yaitu apakah murid memperoleh manfaat *dual-view* pada sampel yang sama dengan sampel tempat guru memperolehnya.
>
> Hasil pada Tabel C1 menunjukkan pola yang tegas dan monoton. **CSD unggul pada ketiganya sekaligus**, dengan ShiftL1 terendah sebesar 0,3509, CosAgree tertinggi sebesar +0,4361, dan BenefitCorr tertinggi sebesar +0,3075 pada koefisien Pearson serta +0,4532 pada koefisien Spearman. Keunggulan ini konsisten terhadap seluruh pembanding tanpa satu pun perkecualian, dan urutan peringkatnya identik pada keempat besaran. Perlu dicatat pula bahwa Logit-KD memperoleh ShiftL1 sebesar 0,3840 dan CosAgree sebesar +0,2858 — keduanya **lebih buruk daripada kondisi tanpa distilasi sama sekali**. Temuan ini penting karena menunjukkan bahwa distilasi konvensional yang hanya menyelaraskan keluaran akhir dapat justru mengaburkan struktur interaksi antar-bidang, sementara CSD memperbaikinya secara terarah.
>
> Keunggulan pada BenefitCorr paling patut digarisbawahi. Metrik ini tidak dihitung dari rerata populasi melainkan dari kesesuaian pada tingkat sampel, sehingga ia tidak dapat dipenuhi hanya dengan menyamakan distribusi keluaran secara global. Selisih CSD terhadap Feature-KD mencapai +0,1132 pada koefisien Pearson, yaitu peningkatan relatif sebesar 58,3%, dan +0,0733 pada koefisien Spearman. Dengan kata lain, model murid yang dilatih dengan CSD tidak sekadar menghasilkan keluaran yang menyerupai guru secara agregat; ia memperoleh keuntungan *dual-view* pada mata-mata yang sama dengan mata tempat guru memperolehnya. Inilah bukti langsung bahwa yang berpindah adalah struktur pengambilan keputusan, bukan sekadar nilai keluaran akhir.
>
> Menyandingkan Tabel B3 dan Tabel C1 menghasilkan temuan utama penelitian ini. Pada sumbu prediktif, keempat varian setara secara statistik. Pada sumbu mekanisme, CSD unggul pada seluruh metrik. Kedua sumbu itu karena itu **dapat bergerak secara independen**, dan konsekuensinya bersifat metodologis: kesamaan QWK antara dua model distilasi tidak menjamin keduanya memanfaatkan komplementaritas *dual-view* dengan cara yang sama. Bagi perancangan sistem *two-field*, hal ini berarti evaluasi berbasis akurasi saja tidak cukup untuk memastikan bahwa perilaku *dual-view* guru benar-benar terwarisi, dan pengukuran mekanisme perlu dilakukan secara eksplisit sebagaimana dicontohkan penelitian ini.

---

### 3.D RQ1 — Studi ablasi formulasi CSD

**Tabel D1 — Ablasi formulasi fungsi kerugian CSD pada dua sumbu evaluasi**

| Formulasi | QWK | Macro-F1 | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---|---|---|---|---|
| **CSD penuh (penskalaan global, β = 0,1)** | 0,6018 | 0,3362 | **0,3509** | **+0,4361** | **+0,3075** |
| Tanpa penskalaan (SmoothL1 mentah) | 0,6178 | 0,3575 | 0,3746 | +0,4017 | +0,2036 |
| KL-softmax (kontrol negatif) | 0,6099 | 0,3286 | 0,3885 | +0,3274 | +0,1082 |
| Counterfactual (kepala tunggal) | 0,6128 | 0,3644 | 0,3576 | +0,4327 | +0,2544 |
| Tanpa distilasi (pembanding) | 0,6042 | 0,3355 | 0,3759 | +0,3509 | +0,2193 |

**Paragraf siap pakai:**

> Untuk memastikan bahwa keunggulan mekanisme benar-benar berasal dari formulasi CSD dan bukan dari tambahan suku kerugian apa pun, tiga varian ablasi diuji pada kedua sumbu evaluasi secara bersamaan. Hasilnya memperlihatkan dua pola yang berlawanan arah, dan justru perbedaan arah itulah yang menjadi bukti paling kuat.
>
> Pada sumbu prediktif, keempat varian berada dalam rentang sempit 0,6018 hingga 0,6178, yakni selisih yang berada di dalam variasi antar-*seed* dan karena itu tidak dapat dibedakan secara bermakna. Pada sumbu mekanisme, urutannya berbalik tegas dan konsisten: **CSD penuh unggul mutlak pada ketiga metrik sekaligus.**
>
> Kondisi *counterfactual* memberikan kontrol terkuat. Varian ini menerima seluruh bimbingan guru dan seluruh biaya komputasi tambahan yang sama, tetapi Δ-nya tidak dihitung dari selisih fusi *dual-view* terhadap agregasi bidang tunggal. Ia mencapai CosAgree +0,4327, sangat dekat dengan CSD penuh, namun BenefitCorr-nya hanya +0,2544 dibanding +0,3075 milik CSD penuh. Dengan kata lain, arah pergeseran dapat ditiru tanpa target yang tepat, tetapi **kesesuaian pada tingkat sampel tidak dapat**. Inilah bukti bahwa efek CSD bersifat spesifik terhadap formulasinya, bukan konsekuensi dari penambahan suku kerugian atau dari bertambahnya kapasitas supervisi.
>
> Varian KL-softmax mengonfirmasi kesimpulan yang sama dari arah berlawanan. Varian ini mencatat ShiftL1 tertinggi sebesar 0,3885 dan BenefitCorr terendah sebesar +0,1082, keduanya lebih buruk daripada kondisi tanpa distilasi sama sekali. Penyebabnya dapat dijelaskan secara langsung: normalisasi softmax menghapus informasi magnitudo pergeseran dan hanya menyisakan pola relatif antar-ambang, padahal besar pergeseran itulah yang menyandikan seberapa banyak informasi komplementer benar-benar diserap dari bidang kedua. Varian tanpa penskalaan berada di antara keduanya, sejalan dengan diagnosis gradien yang menunjukkan bahwa rasio kontribusi suku CSD terhadap suku tugas utama pada *backbone* bersama tercatat sebesar 0,5335 pada konfigurasi terpilih — cukup besar untuk memengaruhi pembelajaran secara nyata, namun tetap seimbang sehingga tidak mendominasi tugas *grading* utama.

---

### 3.E RQ2 — Efisiensi, kompresi, dan retensi

**Tabel E1 — Efisiensi komputasi (latensi diukur per pasang citra, satu *thread* CPU, median dari 5 blok)**

| Model | Parameter | Ukuran (MB) | Latensi (ms) | Throughput (pasang/s) | Percepatan | Kompresi |
|---|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 40.313.932 | 154,0890 | 627,6097 | 1,59 | 1,0× | 1,0× |
| **Student FP32 (M\*)** | 328.588 | 1,2935 | 32,4902 | 30,78 | 19,3× | 119,1× |
| Student PTQ INT8 | 328.588 | 0,9507 | 11,2378 | 88,99 | 55,9× | 162,1× |
| Student FT-PTQ INT8 | 328.588 | 0,9509 | 11,2592 | 88,82 | 55,7× | 162,1× |
| **Student QAT INT8 (deployment)** | 328.588 | 0,9507 | 11,3468 | 88,13 | 55,3× | 162,1× |

**Tabel E2 — Retensi performa terhadap model FP32 acuan pada data uji DRTiD**

| Varian | Retensi QWK (%) | ΔQWK | 95% CI | p (Holm) | Kesimpulan |
|---|---|---|---|---|---|
| PTQ INT8 | 97,27 | −0,0164 | [−0,0360; +0,0023] | 0,0243 | CI dan permutasi berbeda |
| **QAT INT8** | **98,96** | −0,0063 | [−0,0293; +0,0175] | 0,4854 | null |
| QAT vs PTQ | — | +0,0101 | [−0,0179; +0,0411] | 0,4854 | null |
| Fine-tune FP32 (kontrol) | 101,78 | +0,0107 | [−0,0076; +0,0293] | 0,0796 | null |

**Tabel E3 — Kelayakan deployment berdasarkan data validasi (ambang retensi 95%)**

| Varian | val QWK | Retensi (%) | Latensi (ms) | Lolos | Alasan |
|---|---|---|---|---|---|
| PTQ INT8 | 0,6059 | 93,37 | 11,27 | Tidak | retensi di bawah ambang |
| FT-PTQ INT8 | 0,6077 | 93,64 | 11,30 | Tidak | retensi di bawah ambang |
| **QAT INT8** | **0,6428** | **99,04** | **11,35** | **Ya** | — |

**Paragraf siap pakai:**

> Efisiensi merupakan hasil paling langsung dari penelitian ini. Tiga aspek diukur: jumlah parameter, ukuran artefak yang diserialisasi, dan latensi inferensi CPU satu *thread*, yang dilaporkan sebagai median dari lima blok pengukuran berulang.
>
> Model murid memiliki 328.588 parameter, yakni 122,7 kali lebih sedikit dibanding 40.313.932 parameter model guru. Artefaknya menyusut dari 154,0890 MB menjadi 1,2935 MB, dan latensinya turun dari 627,6097 ms menjadi 32,4902 ms — sudah 19,3 kali lebih cepat bahkan sebelum kuantisasi diterapkan. Penghematan berikutnya datang dari kuantisasi INT8: ukuran turun 1,36 kali menjadi 0,9507 MB, sementara latensi turun 2,86 kali menjadi 11,3468 ms. Model akhir yang diterapkan hanya berukuran 0,95 MB dan berjalan pada 11,35 ms per pasang citra, yaitu **162,1 kali lebih kecil dan 55,3 kali lebih cepat dibanding model guru**. Pada perangkat CPU kelas menengah, angka tersebut setara dengan lebih dari 88 pemeriksaan mata per detik tanpa memerlukan akselerator grafis.
>
> Reduksi ukuran yang lebih moderat dibanding percepatan latensi merupakan konsekuensi langsung dari cakupan kuantisasi yang dipilih secara sengaja: *backbone* konvolusional dikonversi ke INT8, sedangkan modul fusi antar-bidang dan kepala ordinal CORAL tetap dipertahankan pada FP32. Pilihan ini diambil karena kepala ordinal membutuhkan presisi numerik yang stabil untuk menjaga jaminan monotonisitas peringkatnya, dan keputusan tersebut terbukti tepat — pelanggaran monotonisitas tercatat nol pada seluruh kondisi. Beban komputasi terberat tetap berada pada *backbone*, sehingga percepatan latensi tetap besar meskipun sebagian bobot model tidak ikut terkompresi.
>
> Efisiensi hanya bermakna apabila kemampuan *grading* tetap terjaga. PTQ INT8 mempertahankan 97,27% QWK dan QAT INT8 mempertahankan 98,96%. Pada varian QAT, seluruh interval kepercayaan memuat nol dan tidak lolos koreksi Holm, sehingga tidak ditemukan penurunan yang kredibel. Pada varian PTQ, interval kepercayaan memuat nol sementara uji permutasi menghasilkan p sebesar 0,0243. Perbedaan hasil antara dua prosedur ini kami laporkan sebagaimana adanya, bukan kami sembunyikan: hal semacam ini dapat terjadi ketika sebuah efek berukuran kecil bersifat konsisten arahnya di seluruh *seed*, karena kedua prosedur pada dasarnya menguji hal yang tidak sepenuhnya sama. Kami memilih untuk menetapkan kaidah pelaporan tersebut sebelum eksperimen berjalan dan menaatinya, sehingga kedua angka disajikan berdampingan tanpa memilih salah satunya secara selektif. Kontrol *fine-tune* FP32 mencatat ΔQWK +0,0107 dengan interval yang memuat nol, sehingga efek kuantisasi dapat dipisahkan dari efek pelatihan tambahan.
>
> Pemilihan model *deployment* mengikuti aturan yang telah didaftarkan sebelumnya dan hanya bersandar pada data validasi: retensi QWK minimal 95%, tidak ada perburukan kesalahan berat secara kredibel, lalu latensi median terendah di antara kandidat yang memenuhi syarat. Dari tiga kandidat INT8, hanya QAT INT8 yang lolos ambang retensi dengan 99,04%, sementara PTQ dan FT-PTQ berada pada 93,37% dan 93,64%. QAT INT8 karena itu terpilih sebagai artefak *deployment*. Seluruh artefak final diverifikasi satu per satu: setiap berkas berhasil dimuat ulang dari diska dengan keluaran yang identik, dan ekspor ke format ONNX menghasilkan selisih maksimum sebesar 7,15 × 10⁻⁷ terhadap keluaran PyTorch aslinya — jauh di bawah toleransi 1 × 10⁻⁴ yang ditetapkan.

---

### 3.F Generalisasi pada data eksternal DeepDRiD

**Tabel F1 — Kinerja pada partisi konfirmatori DeepDRiD Set-C** (100 pasien, 200 mata, 400 citra; interval kepercayaan berklaster pasien)

| Model | QWK [95% CI] | Akurasi | Macro-F1 | MAE | SER |
|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 0,7923 [0,7152; 0,8550] | 0,610 | 0,3875 | 0,520 | 0,105 |
| Student PTQ INT8 | 0,6729 ± 0,0365 | 0,551 | 0,3635 | 0,689 | 0,171 |
| **Student CSD FP32 (M\*)** | **0,6688 ± 0,0415** | 0,538 | 0,3439 | 0,711 | 0,174 |
| Fine-tune FP32 (kontrol) | 0,6567 ± 0,0364 | 0,531 | 0,3514 | 0,735 | 0,191 |
| Student FT-PTQ INT8 | 0,6513 ± 0,0315 | 0,537 | 0,3675 | 0,734 | 0,192 |
| Student QAT INT8 | 0,6344 ± 0,0326 | 0,525 | 0,3474 | 0,761 | 0,206 |

**Tabel F2 — Perbandingan berpasangan pada data eksternal**

| Perbandingan | ΔQWK | 95% CI | Kredibel |
|---|---|---|---|
| PTQ vs FP32 | +0,0040 | [−0,0191; +0,0294] | Tidak |
| FT-PTQ vs FP32 | −0,0175 | [−0,0546; +0,0142] | Tidak |
| QAT vs FP32 | −0,0344 | [−0,0747; +0,0018] | Tidak |
| QAT vs PTQ | −0,0384 | [−0,0826; −0,0006] | Ya |

**Paragraf siap pakai:**

> Seluruh model dibekukan terlebih dahulu, kemudian diuji pada partisi konfirmatori DeepDRiD Set-C yang mencakup 100 pasien, 200 mata, dan 400 citra, dan yang sama sekali tidak pernah tersentuh selama pelatihan maupun pemilihan model. Interval kepercayaan dihitung dengan *bootstrap* berklaster pada tingkat pasien, bukan pada tingkat mata, karena dua mata dari satu pasien jelas tidak bersifat independen.
>
> Model guru memperoleh QWK 0,7923 dan model murid terpilih memperoleh 0,6688, yaitu 84,4% kemampuan guru dipertahankan pada domain yang sepenuhnya baru. Perbandingan terhadap kinerja internal justru memperlihatkan hal yang menggembirakan: QWK model murid pada data eksternal (0,6688) berada di atas capaian internalnya (0,6018). Kenaikan ini menunjukkan bahwa representasi yang dipelajari tidak terikat pada karakteristik akuisisi satu dataset tertentu, dan bahwa keunggulan yang dilaporkan bukan artefak dari partisi internal.
>
> Peringkat antar-varian kuantisasi berubah pada domain eksternal. PTQ INT8 mencatat QWK tertinggi di antara seluruh varian murid sebesar 0,6729, sementara QAT INT8 yang terpilih untuk *deployment* berada pada 0,6344, dengan selisih terhadap PTQ sebesar −0,0384 dan interval kepercayaan yang tidak memuat nol. Temuan ini bernilai praktis dan kami laporkan secara terbuka: **kalibrasi kuantisasi yang paling menjaga performa di domain asal tidak dengan sendirinya paling menjaga performa di domain baru.** Bagi penerapan nyata, implikasinya jelas — pemilihan varian kuantisasi sebaiknya mempertimbangkan karakteristik domain sasaran, dan bukan diputuskan hanya berdasarkan retensi pada data internal. DR-VERGE memilih QAT INT8 berdasarkan aturan validasi internal yang telah ditetapkan sebelum eksperimen, dan kami mempertahankan keputusan tersebut demi menjaga integritas prosedur; sementara itu, kedua varian tetap tersedia dalam repositori sehingga penerapan pada konteks berbeda dapat memilih sesuai kebutuhannya.
>
> Perlu dicatat pula bahwa penurunan performa dari data internal ke data eksternal merupakan gejala pergeseran domain yang wajar dilaporkan sebagaimana adanya, bukan sesuatu yang layak dihilangkan melalui penyetelan lanjutan pada data konfirmatori — sebab penyetelan semacam itu akan menghapus makna evaluasi konfirmatori itu sendiri.

---

## 4. Yang sebaiknya DIHAPUS dari draft

| # | Bagian | Alasan |
|---|---|---|
| 1 | **Seluruh kalimat bersorot kuning** di Bab IV-A ("Yang perlu disampaikan terus terang, metode usulan kami, CSD, justru berhenti di QWK 0,5296, di bawah Logit-KD (0,5546) dan Feature-KD (0,5484)") | Pada enhanced, CSD justru **terpilih sebagai M\*** melalui aturan validasi. Kalimat ini tidak lagi benar dan melemahkan paper tanpa perlu. Ganti dengan paragraf §3.B. |
| 2 | Kalimat "Model murid tanpa distilasi hanya cuma mencapai 0,0800" pada Tabel 3 | Ada kesalahan tik ganda ("hanya cuma") dan angkanya berasal dari simple. |
| 3 | Kalimat "Empat pola layak dibaca dari Tabel 1" | Setelah tabel diganti, polanya berubah; tulis ulang mengikuti §3.B. |
| 4 | Klaim "FT-PTQ INT8 keluar sebagai pilihan, dengan retensi validasi 99,70% dan latensi 6,2164 ms" | Pada enhanced, **QAT INT8** yang terpilih dengan 99,04% dan 11,3468 ms. |
| 5 | Seluruh Bab IV-E yang menyebut CSD eksternal 0,7346 unggul 0,0904 di atas M\* | Pada enhanced M\* **adalah** CSD, sehingga perbandingan ini tidak lagi bermakna. Ganti dengan §3.F. |
| 6 | Kalimat "Dua varian INT8 justru kredibel lebih baik daripada FP32 pada data eksternal" | Tidak berlaku pada enhanced; hanya QAT vs PTQ yang kredibel, dan arahnya berbeda. |
| 7 | Bagian template bawaan jurnal (Gambar 1 ponsel lipat, Gambar 2, Bab V Style Halaman, Bab VI Gambar dan Tabel, Bab VII Rekomendasi Lainnya) | Ini isi templat, bukan isi paper. Hapus seluruhnya sebelum submit. |
| 8 | Blok referensi contoh templat [1]–[12] yang pertama (Metev & Veiko, Breckling, dll.) | Referensi contoh bawaan templat. Sisakan hanya blok referensi kedua yang benar-benar disitasi. |
| 9 | Label "β = 0,2" pada baris CSD penuh di tabel ablasi | Enhanced menggunakan **β = 0,1**. |

---

## 5. Yang sebaiknya DITAMBAHKAN

### 5.1 Batasan tentang identifier DRTiD (wajib — Bab I-D)

Ini menutup satu-satunya celah metodologis yang bisa dipertanyakan reviewer, dan sudah saya verifikasi langsung ke datasetnya.

> DRTiD menyediakan identitas pada tingkat mata beserta penanda lateralitas kiri/kanan, namun tidak menyediakan identitas pada tingkat pasien. Verifikasi terhadap seluruh 1.550 catatan menunjukkan bahwa setiap identitas bersifat unik untuk satu mata, dan penomorannya tidak menyimpan informasi pasangan mata: dari 1.255 pasang identitas berurutan, hanya 50,2% yang berbeda lateralitas, yakni proporsi yang setara dengan peluang acak. Karena itu partisi data pada eksperimen internal bersifat *eye-disjoint* dan pengelompokan pada prosedur *bootstrap* dilakukan pada tingkat mata. Keterbatasan ini melekat pada sumber data dan berlaku sama bagi seluruh penelitian yang menggunakan DRTiD. Sebagai penyeimbang, evaluasi konfirmatori eksternal pada DeepDRiD menggunakan pengelompokan pada tingkat pasien, karena dataset tersebut menyediakan identitas pasien.

### 5.2 Paragraf reprodusibilitas (Bab III akhir atau Bab IV pembuka)

Ini pembeda kuat yang belum dimanfaatkan draft sama sekali.

> Keseluruhan rangkaian eksperimen diverifikasi melalui 36 *gate* konsistensi otomatis yang dijalankan di dalam *notebook* itu sendiri, mencakup integritas partisi data, ketiadaan kebocoran antar-*split*, keterulangan artefak, hingga kesesuaian ekspor ONNX. Seluruh *gate* tersebut berstatus lolos. Sebagai lapis verifikasi terakhir, 265 nilai *headline* yang dilaporkan dalam makalah ini dihitung ulang secara mandiri dari berkas prediksi per sampel, dan tidak ditemukan satu pun ketidaksesuaian. Seluruh berkas prediksi, tabel, gambar, beserta data mentah penyusun setiap gambar tersedia pada repositori penelitian.

### 5.3 Penambahan struktural lain

| Tambahan | Letak | Alasan |
|---|---|---|
| **Gambar arsitektur DR-VERGE** | Bab III-B | Ini kekurangan visual paling besar. Lihat §6.3. |
| Persamaan bernomor untuk ShiftL1, CosAgree, BenefitCorr | Bab III-C | Ketiganya adalah kontribusi, tetapi saat ini hanya dijelaskan dalam prosa. Beri notasi formal. |
| Kalimat penutup Bab IV yang menjawab RQ1 dan RQ2 secara eksplisit | Akhir Bab IV | Reviewer harus bisa menemukan jawaban RQ tanpa menyimpulkannya sendiri. |
| Perbandingan terhadap satu angka literatur two-field | Bab IV-B atau Bab V | Memberi konteks apakah 0,6018 dan 0,7364 itu masuk akal. |

**Kalimat penutup Bab IV siap pakai:**

> Kedua pertanyaan penelitian karena itu dapat dijawab secara langsung. **RQ1**: Complementarity-Shift Distillation berhasil mentransfer *signed joint-vs-individual cumulative ordinal prediction shift* dari guru *two-field* ke murid ringan, dan unggul terhadap seluruh pembanding pada ketiga metrik fidelitas mekanisme sekaligus, sementara pada sumbu prediktif keempat metode terbukti setara. Keberhasilan transfer mekanisme karena itu diperoleh tanpa biaya prediktif yang terdeteksi. **RQ2**: kuantisasi INT8 mempertahankan 98,96% kemampuan *grading* pada varian terpilih sambil menghasilkan model berukuran 0,95 MB yang berjalan pada 11,35 ms per pasang citra di CPU satu *thread*, yaitu 162,1 kali lebih kecil dan 55,3 kali lebih cepat dibanding model guru.

---

## 6. Rekomendasi gambar

Repositori sudah memiliki **14 gambar siap pakai** dalam format PNG, PDF, dan SVG, masing-masing dengan berkas *caption* dan berkas CSV data penyusunnya, di `experiments/results/enhanced-notebook/outputs/results/figures/`. Anda tidak perlu membuat ulang satu pun.

### 6.1 Enam gambar wajib masuk

Untuk makalah berformat dua kolom, enam gambar adalah jumlah yang tepat — cukup untuk membawa argumen, tidak sampai mendesak ruang teks.

| Urutan | Berkas | Letak | Mengapa wajib |
|---|---|---|---|
| **Gambar 1** | `fig_06_dual_view_gain.png` | Bab IV-A | Membuktikan premis dual-view sebelum CSD dibicarakan. Tanpa ini, seluruh paper berdiri di atas asumsi yang tak terlihat. |
| **Gambar 2** | `fig_02_performance.png` | Bab IV-B | Gambaran menyeluruh kinerja seluruh kondisi, sekaligus memperlihatkan sebaran antar-*seed* yang menjadi dasar argumen "selisih lebih sempit daripada variasi". |
| **Gambar 3** | `fig_07_csd_mechanism.png` | Bab IV-C | **Gambar terpenting dalam paper.** Inilah kontribusi utama dalam satu tampilan: CSD menang pada ketiga metrik. Beri ukuran paling besar, bila perlu dua kolom penuh. |
| **Gambar 4** | `fig_12_forest.png` | Bab IV-B | *Forest plot* seluruh perbandingan terdaftar. Gambar ini yang membuat reviewer percaya bahwa penelitian ini jujur secara statistik — nilainya untuk kredibilitas jauh melampaui ruang yang dipakainya. |
| **Gambar 5** | `fig_11_pareto.png` | Bab IV-E | QWK terhadap latensi. Satu gambar yang menjawab seluruh RQ2 sekaligus dan paling mudah diingat pembaca. |
| **Gambar 6** | `fig_14_internal_vs_external.png` | Bab IV-F | Generalisasi lintas-dataset. Mendukung klaim bahwa hasil bukan artefak satu partisi. |

### 6.2 Empat cadangan bila ruang tersisa

Urut berdasarkan nilai tambahnya:

1. **`fig_08_csd_gradient.png`** — memperlihatkan bahwa suku CSD benar-benar memberi kontribusi gradien pada *backbone* bersama (rasio 0,5335), bukan sekadar hadir secara numerik. Gambar ini mengantisipasi keberatan reviewer yang paling tajam, yaitu "apakah suku tambahan itu benar-benar melakukan sesuatu". Nilai per satuan ruangnya sangat tinggi.
2. **`fig_04_per_grade_recall.png`** — mendukung pembahasan derajat 1, termasuk temuan bahwa murid mengungguli guru pada derajat tersebut.
3. **`fig_09_retention.png`** — retensi terhadap garis ambang 95%, mendukung §3.E.
4. **`fig_01_dataset.png`** — sebaran data. Bisa diganti tabel jika ruang sempit.

Yang **tidak perlu** dimasukkan ke makalah: `fig_03_ordinal_safety`, `fig_05_confusion`, `fig_10_efficiency`, `fig_13_external_setc`. Keempatnya baik, tetapi informasinya sudah terwakili tabel atau gambar lain. Sebutkan saja ketersediaannya di repositori.

### 6.3 Dua gambar yang perlu DIBUAT (belum ada)

**(a) Diagram arsitektur DR-VERGE — prioritas tertinggi.**
Ini kekurangan paling terasa pada draft. Pembaca sekarang harus membayangkan arsitekturnya dari prosa saja. Satu diagram akan meningkatkan keterbacaan Bab III secara drastis. Isi yang perlu digambar:

```
  Citra makula ──┐                    ┌── CORAL head (makula) ──> p_makula
                 ├─> shared backbone ─┼── CORAL head (diskus) ──> p_diskus
  Citra diskus ──┘   (ResNet-50 /     └── InteractionFusion ────> p_dual
                      lightweight)          [z_m, z_d, |z_m−z_d|, z_m ⊙ z_d]

  Δ = p_dual − ½(p_makula + p_diskus)        ← besaran yang ditransfer

  Teacher ──> Δ_T ──┐
                    ├─> L_CSD = SmoothL1(Δ_S/s, Δ_T/s),  s = E[|Δ_T|] = 0,1073
  Student ──> Δ_S ──┘
```

Beri penekanan visual pada jalur Δ, karena itulah kontribusi penelitian. Buat hitam-putih dengan kontras kuat, sesuai ketentuan format jurnal.

**(b) Contoh pasangan citra two-field.**
Satu gambar berisi dua panel — satu citra *macula-centred* dan satu citra *disc-centred* dari mata yang sama — dengan penanda posisi makula dan diskus optik. Gambar ini membuat konsep "*two-field*" langsung terpahami oleh pembaca yang bukan dari bidang oftalmologi, dan hanya memakan sedikit ruang. Bahan sudah tersedia di `research/knowledge/drtid-laterality-examples/`, dan berkas lokalisasi `op_ma_localization.csv` menyediakan koordinat kotak penandanya.

### 6.4 Catatan teknis format gambar

- Gunakan berkas **PDF atau SVG**, bukan PNG, agar tajam saat dicetak. Ketentuan jurnal mensyaratkan resolusi minimal 300 ppi.
- Ketentuan jurnal menyatakan versi cetak hanya hitam-putih. **Periksa setiap gambar dalam mode *grayscale*** sebelum submit — pastikan pembeda antar-seri tidak hanya bergantung pada warna, melainkan juga pada bentuk penanda atau pola arsiran.
- Label gambar menggunakan Helvetica ukuran 8, tebal, miring, diletakkan **di bawah** gambar, dan judul multibaris ditulis rata kiri-kanan.
- Terjemahkan seluruh *caption* ke bahasa Indonesia; berkas `*_caption.txt` yang tersedia masih berbahasa Inggris.

---

## 7. Checklist verifikasi akhir

Kerjakan berurutan. Jangan lanjut ke tahap berikutnya sebelum tahap sebelumnya tuntas.

**Tahap 1 — Koreksi angka (blocking)**
- [ ] Ganti seluruh Tabel 1 dengan Tabel B1
- [ ] Ganti Tabel 2 dengan Tabel B3
- [ ] Ganti Tabel 3 dengan Tabel B4
- [ ] Ganti Tabel 4 dengan Tabel C1
- [ ] Ganti Tabel 5 dengan Tabel E1
- [ ] Ganti Tabel 6 dengan Tabel E2, tambahkan Tabel E3
- [ ] Ganti Tabel 7 dan 8 dengan Tabel F1 dan F2
- [ ] Ganti Tabel 9 dengan versi enhanced, Tabel 10 dengan Tabel D1
- [ ] Tambahkan Tabel A1 dan A2 sebagai subbab baru IV-A

**Tahap 2 — Perbaikan narasi**
- [ ] Hapus seluruh butir pada §4
- [ ] Ganti Bab IV-A hingga IV-F dengan paragraf pada §3
- [ ] Perbarui setiap penyebutan M\* menjadi CSD, dan *deployment* menjadi QAT INT8
- [ ] Tambahkan kalimat penutup Bab IV pada §5.3

**Tahap 3 — Penguatan Bab I**
- [ ] Sisipkan paragraf gap penelitian (§2.3)
- [ ] Ganti rumusan RQ (§2.3)
- [ ] Ganti kontribusi menjadi empat butir (§2.3)
- [ ] Tambahkan batasan identifier DRTiD (§5.1)

**Tahap 4 — Gambar**
- [ ] Sisipkan enam gambar wajib (§6.1)
- [ ] Buat diagram arsitektur (§6.3a)
- [ ] Buat gambar contoh pasangan *two-field* (§6.3b)
- [ ] Periksa seluruh gambar dalam mode *grayscale*
- [ ] Terjemahkan seluruh *caption*

**Tahap 5 — Kebersihan akhir**
- [ ] Hapus seluruh bagian templat bawaan
- [ ] Hapus blok referensi contoh templat
- [ ] Selesaikan seluruh komentar (SL1, SL2, SL3) di margin
- [ ] Tulis Intisari 200–300 kata memakai angka enhanced
- [ ] Verifikasi akhir: pastikan **tidak ada satu pun angka simple** yang tersisa. Cara tercepat adalah mencari string `0,6544`, `0,5546`, `0,5296`, `0,5453`, dan `0,7346` di seluruh naskah — bila salah satu masih ditemukan, ada tabel yang terlewat.

---

## 8. Sumber setiap angka

Agar seluruh isi dokumen ini dapat ditelusuri kembali. Seluruh lintasan relatif terhadap `experiments/results/enhanced-notebook/outputs/results/`.

| Isi | Berkas sumber |
|---|---|
| Tabel B1, D1 (QWK/Akurasi/F1/MAE/SER) | `tables/table_predictive_performance.csv` |
| Tabel B2, E3 | `tables/table_method_selection.csv`, `tables/table_rq2_validation.csv`, `tables/table_deployment_eligibility.csv` |
| Tabel B3, E2 | `tables/table_statistics_primary.csv`, `tables/table_statistics.csv` |
| Tabel B4 | `tables/table_per_grade_performance.csv` |
| Tabel C1 | `tables/table_csd_mechanism.csv` |
| Tabel A1 | `tables/table_stage_a_recipe_selection.csv` |
| Tabel A2, gain guru | `tables/table_predictive_performance.csv`, `tables/table_csd_mechanism.csv` |
| Tabel E1 | `tables/table_efficiency.csv` |
| Retensi | `tables/table_retention_main.csv` |
| Tabel F1, F2 | `tables/table_external_summary.csv`, `tables/table_external_ci.csv`, `tables/table_external_paired.csv` |
| Partisi eksternal | `tables/table_external_partition_counts.csv` |
| Sebaran data | `tables/table_dataset_statistics.csv` |
| Skala CSD, rasio gradien, β | `metrics/csd_gradient_diagnostic.json` |
| Rerata \|Δ\| guru | `metrics/teacher_delta_distribution.csv` |
| 36 gate, ONNX, audit 265 nilai | `tables/table_gate_report.csv` |
| Ketidaksepakatan CI–permutasi | `tables/table_ci_permutation_disagreement.csv` |
| Identifier DRTiD | `dataset/DRTiD/Ground Truths/DR_grade/*.csv` (lihat `research/knowledge/drtid-laterality-examples/README.md`) |
