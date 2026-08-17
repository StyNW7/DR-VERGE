# BAB IV — HASIL EKSPERIMEN DAN ANALISIS

**Naskah siap tempel untuk paper DR-VERGE.**
Seluruh angka bersumber dari enhanced notebook (`experiments/results/enhanced-notebook/outputs/`) dan sudah diverifikasi ulang terhadap berkas CSV aslinya.

**Ringkasan muatan:** 8 tabel · 5 gambar (Gambar 5–9) · 7 subbab.
Teks di bawah `>` adalah kalimat yang masuk ke paper. Teks di luar `>` adalah catatan editorial untuk Anda, **jangan ikut disalin**.

---

## Peta alur Bab IV

Urutannya dirancang agar setiap subbab menjawab satu pertanyaan yang pasti muncul di kepala pembaca, dan jawabannya memunculkan pertanyaan berikutnya:

| Subbab | Pertanyaan pembaca | Jawaban | Bukti |
|---|---|---|---|
| **IV-A** | Apakah dua bidang pandang memang berguna? | Ya, +0,0540 sampai +0,0867 | Gambar 5 |
| **IV-B** | Kalau begitu, apakah CSD lebih akurat? | Setara — tidak terbukti berbeda | Tabel 1–3, Gambar 6 |
| **IV-C** | Lalu apa yang berhasil CSD pindahkan? | Mekanismenya — menang 3/3 | Tabel 4, Gambar 7 |
| **IV-D** | Apakah itu benar dari CSD, bukan dari suku tambahan? | Ya, terbukti spesifik | Tabel 5 |
| **IV-E** | Apakah modelnya benar-benar ringan? | 162,1× lebih kecil, 55,3× lebih cepat | Tabel 6–7, Gambar 8 |
| **IV-F** | Apakah bertahan di luar DRTiD? | Ya, bahkan menguat | Tabel 8, Gambar 9 |
| **IV-G** | Jadi apa jawaban RQ1 dan RQ2? | Dinyatakan eksplisit | — |

Kunci kekuatan Bab IV ini ada pada **pemisahan dua sumbu RQ1**. Dengan memisahkan "seberapa akurat" (IV-B) dari "seberapa setia mekanismenya" (IV-C), hasil yang netral pada sumbu pertama tidak lagi terbaca sebagai kegagalan, melainkan sebagai separuh dari jawaban yang memang dirancang sejak awal untuk punya dua bagian.

---

# IV. HASIL EKSPERIMEN DAN ANALISIS

> Bagian ini memaparkan hasil pengujian DR-VERGE pada 550 mata data uji internal DRTiD dan 200 mata data konfirmatori eksternal DeepDRiD. Seluruh keputusan pemilihan — konfigurasi masukan, hiperparameter, metode distilasi, dan artefak *deployment* — ditetapkan menggunakan data validasi sebelum data uji dibuka, dan data eksternal baru dibuka satu kali setelah seluruh keputusan tersebut dikunci.
>
> Perbandingan statistik menggunakan *bootstrap* berpasangan berklaster mata sebanyak 10.000 replikasi dan uji permutasi sebanyak 10.000 permutasi, dengan koreksi Holm di dalam masing-masing famili hipotesis. Satu aturan pelaporan ditetapkan sebelum eksperimen berjalan dan ditaati tanpa pengecualian: **selisih yang interval kepercayaannya memuat nol tidak diperlakukan sebagai klaim**, betapapun menariknya angka tengahnya. Aturan ini berlaku sama bagi metode usulan maupun pembanding.
>
> Sebagai lapis verifikasi, keseluruhan rangkaian diperiksa melalui 36 *gate* konsistensi otomatis yang seluruhnya berstatus lolos, mencakup keterpisahan partisi, monotonisitas keluaran ordinal dengan tingkat pelanggaran 0,00, kesamaan cakupan operator antar-skema kuantisasi, hingga kesesuaian ekspor ONNX. Sebagai pemeriksaan terakhir, 265 nilai *headline* yang dilaporkan pada bab ini dihitung ulang secara mandiri dari berkas prediksi per sampel tanpa satu pun ketidaksesuaian.

---

## A. Validasi Premis Dual-View

Subbab pembuka. Fungsinya membangun fondasi sebelum kontribusi diklaim — tanpa ini, seluruh bab berdiri di atas asumsi yang tak pernah diuji.

> Sebelum satu pun klaim tentang distilasi diajukan, premis dasar DR-VERGE diverifikasi terlebih dahulu. Pemilihan konfigurasi masukan dilakukan sepenuhnya pada data validasi menggunakan tiga *seed*. Dari empat kombinasi resolusi dan strategi *sampling*, konfigurasi 384 × 384 dengan *standard sampling* memperoleh QWK validasi tertinggi sebesar 0,6491, unggul 0,0942 atas resolusi 224 × 224 pada strategi yang sama. Selisih sebesar itu memiliki penjelasan klinis yang langsung: lesi awal retinopati diabetik, terutama mikroaneurisma, berukuran sangat kecil sehingga sebagian besar informasinya hilang ketika citra beresolusi asli 2592 × 1944 piksel diperkecil terlalu jauh. Konfigurasi tersebut dikunci untuk seluruh eksperimen berikutnya.
>
> Pada konfigurasi terpilih, model murid yang hanya menerima citra makula mencapai QWK 0,5175 dan yang hanya menerima citra diskus optik mencapai 0,5502, sementara model *dual-view* tanpa distilasi apa pun mencapai 0,6042. Keuntungan penggabungan kedua bidang pandang karena itu sebesar 0,0867 dan 0,0540 terhadap masing-masing varian bidang tunggal. Pada skala guru, keunggulan *dual-view* terhadap model bidang tunggal yang dilatih mandiri lebih besar lagi, yaitu 0,1782.
>
> Premis penelitian dengan demikian terpenuhi pada kedua skala model: informasi dari area makula dan area diskus optik bersifat komplementer, dan penggabungannya memberikan keuntungan prediktif yang nyata. Pertanyaan yang tersisa bukan lagi apakah *dual-view* berguna, melainkan apakah **cara** guru memanfaatkan komplementaritas itu dapat dipindahkan ke model ringan — dan pertanyaan itulah yang dijawab RQ1.

**GAMBAR 5** — `experiments/results/enhanced-notebook/outputs/results/figures/fig_06_dual_view_gain.pdf`

> **Gambar 5.** Keuntungan *dual-view* pada model guru dan model murid. *G_aux* membandingkan kepala *dual-view* terhadap kepala *auxiliary* milik model itu sendiri, sedangkan *G_independent* membandingkannya terhadap model bidang tunggal yang dilatih secara mandiri pada *seed* yang sama.

---

## B. RQ1 (i) — Performa Prediktif

Subbab ini menjawab separuh pertama RQ1. Kuncinya adalah **menyampaikan hasil netral dengan percaya diri**, bukan defensif.

**Tabel 1. Kinerja klasifikasi pada 550 mata data uji internal DRTiD (rerata ± simpangan baku lintas 5 *seed*)**

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

> Pemilihan metode dilakukan sepenuhnya pada data validasi sebelum data uji dibuka. Berdasarkan aturan tersebut, konfigurasi Logit-KD + CSD memperoleh QWK validasi tertinggi sebesar 0,6490, diikuti Logit-KD + Feature-KD sebesar 0,6477, Logit-KD sebesar 0,6308, dan *dual-view* tanpa distilasi sebesar 0,6228. Metode usulan penelitian ini karena itu terpilih sebagai model acuan M\* melalui prosedur yang telah ditetapkan sebelum eksperimen berjalan, bukan melalui penilaian setelah hasil uji diketahui.
>
> Pada data uji internal, model guru mencapai QWK 0,7364 dengan 40.313.932 parameter, sedangkan model murid terpilih mencapai 0,6018 hanya dengan 328.588 parameter. Artinya 81,7% kemampuan *grading* guru dipertahankan oleh model yang 122,7 kali lebih kecil. Keempat varian *dual-view* berada pada rentang sempit 0,5942 sampai 0,6161, sementara keuntungan terbesar sepanjang seluruh rangkaian justru datang dari arsitektur *dual-view* itu sendiri, yaitu 0,0540 sampai 0,0867 terhadap model bidang tunggal — jauh melampaui selisih antar-skema distilasi yang hanya 0,0024 sampai 0,0143.
>
> Angka-angka tersebut perlu dibaca bersama sebaran antar-*seed*-nya, yang berkisar 0,0101 sampai 0,0290. **Selisih antar-metode karena itu lebih sempit daripada variasi yang ditimbulkan oleh inisialisasi acak semata**, sehingga peringkat pada Tabel 1 belum dapat diperlakukan sebagai bukti keunggulan sebelum diuji secara formal.

**Tabel 2. Recall per derajat keparahan pada data uji internal DRTiD**

| Model | Derajat 0 | Derajat 1 | Derajat 2 | Derajat 3 | Derajat 4 |
|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 0,9321 | 0,0000 | 0,2603 | 0,3623 | 0,7500 |
| Dual-view, tanpa distilasi | 0,7268 | 0,0840 | 0,2233 | 0,3130 | 0,6300 |
| Logit-KD | 0,7834 | 0,0800 | 0,1959 | 0,3913 | 0,5600 |
| Logit-KD + Feature-KD | 0,8075 | 0,0800 | 0,1863 | 0,3420 | 0,5800 |
| Logit-KD + CSD (usulan) | 0,8030 | 0,0680 | 0,1918 | 0,3043 | 0,5800 |
| *Jumlah sampel* | *265* | *50* | *146* | *69* | *20* |

> Metrik agregat berpotensi menyamarkan perilaku pada kelas yang jarang muncul, sehingga *recall* tiap derajat dilaporkan terpisah pada Tabel 2. Derajat 1 merupakan derajat tersulit bagi seluruh model, dengan *recall* pada rentang 0,0680 sampai 0,0840. Pola ini memiliki penjelasan klinis langsung: derajat 1 ditandai semata oleh mikroaneurisma, lesi berdiameter sangat kecil yang sebagian besar informasinya hilang pada proses *resize*. Yang menarik, **seluruh model murid justru mengungguli model guru pada derajat ini**, yang mencatat *recall* 0,0000. Model guru berkapasitas besar sepenuhnya melewatkan kelas tersebut, sedangkan model murid ringan masih menangkap sebagiannya. Temuan ini memperlihatkan bahwa hubungan antara kapasitas model dan sensitivitas terhadap kelas minoritas tidak bersifat monoton, dan menegaskan pentingnya melaporkan *recall* per derajat di samping metrik agregat.

**Tabel 3. Pengujian RQ1 pada metrik QWK** (bootstrap berpasangan berklaster mata, *B* = 10.000; permutasi *P* = 10.000; koreksi Holm dalam famili RQ1)

| Perbandingan | ΔQWK | 95% CI | *p* (permutasi) | *p* (Holm) | Kesimpulan |
|---|---|---|---|---|---|
| CSD vs tanpa distilasi | −0,0024 | [−0,0336; +0,0285] | 0,8003 | 0,8003 | *null* |
| CSD vs Logit-KD | +0,0077 | [−0,0304; +0,0463] | 0,3640 | 0,7279 | *null* |
| CSD vs Feature-KD | −0,0143 | [−0,0445; +0,0153] | 0,1650 | 0,4950 | *null* |

> Hasil pengujian formal konsisten pada ketiga perbandingan: seluruh interval kepercayaan memuat nol dan tidak satu pun lolos setelah koreksi Holm. Sesuai aturan pelaporan yang telah ditetapkan, kesimpulan RQ1 pada sumbu prediktif dinyatakan secara langsung: **pada sumbu ini CSD setara dengan ketiga pembanding — tidak terbukti lebih unggul dan tidak pula terbukti lebih rendah.**
>
> Konsekuensi dari kesetaraan ini bersifat menguntungkan dan perlu dinyatakan eksplisit. CSD mengubah struktur pengambilan keputusan model secara terukur, sebagaimana ditunjukkan pada subbab berikutnya, **tanpa menimbulkan biaya prediktif yang terdeteksi**. Bagi penerapan praktis, fidelitas mekanisme karena itu diperoleh tanpa perlu ditukar dengan kualitas *grading*. Aturan pelaporan ini diterapkan tanpa pengecualian, termasuk terhadap metode usulan penelitian ini sendiri.

**GAMBAR 6** — `figures/fig_12_forest.pdf`

> **Gambar 6.** *Forest plot* seluruh perbandingan QWK yang telah didaftarkan sebelum eksperimen. Titik menunjukkan selisih berpasangan yang teramati dan batang menunjukkan interval *bootstrap*. Interval yang memotong garis nol tidak diperlakukan sebagai klaim.

---

## C. RQ1 (ii) — Fidelitas Transfer Mekanisme

**Ini inti kontribusi paper.** Beri ruang paling besar di sini, dan tempatkan Gambar 7 sebagai gambar terbesar di seluruh Bab IV — bila memungkinkan melintang dua kolom.

**Tabel 4. Metrik fidelitas pergeseran pada data uji internal DRTiD (rerata ± simpangan baku lintas 5 *seed*)**

| Kondisi | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr *r* ↑ | BenefitCorr *ρ* ↑ |
|---|---|---|---|---|
| Dual-view, tanpa distilasi | 0,3759 ± 0,0115 | +0,3509 ± 0,1028 | +0,2193 ± 0,0982 | +0,3596 ± 0,1010 |
| Logit-KD | 0,3840 ± 0,0236 | +0,2858 ± 0,1317 | +0,1795 ± 0,1316 | +0,2895 ± 0,1281 |
| Logit-KD + Feature-KD | 0,3718 ± 0,0125 | +0,3815 ± 0,0623 | +0,1943 ± 0,1084 | +0,3799 ± 0,0681 |
| **Logit-KD + CSD (usulan)** | **0,3509 ± 0,0124** | **+0,4361 ± 0,0444** | **+0,3075 ± 0,0842** | **+0,4532 ± 0,0595** |

> RQ1 tidak berhenti pada pertanyaan apakah akurasi meningkat. Pertanyaan yang lebih mendasar adalah apakah pergeseran keputusan itu sendiri berpindah dari guru ke murid. Besaran yang menjadi objek transfer didefinisikan sebagai selisih antara probabilitas ordinal kumulatif hasil fusi *dual-view* dan rata-rata probabilitas dari kedua bidang pandang yang diproses terpisah, yaitu Δ = **p**_dual − ½(**p**_makula + **p**_diskus).
>
> Sebelum besaran tersebut dipercaya, keberadaannya diverifikasi terlebih dahulu agar dapat dipastikan bahwa ia fenomena nyata dan bukan derau numerik. Rerata ‖Δ‖₁ pada model guru tercatat 0,4282 dengan 98,50% sampel berada di atas ambang 0,02. Premis komplementaritas *dual-view* karena itu terpenuhi pada tataran keluaran model, bukan hanya pada tataran akurasi akhir.
>
> Tiga metrik menilai kualitas transfer. **ShiftL1** mengukur jarak antara vektor pergeseran murid dan guru, semakin rendah semakin baik. **CosAgree** menilai kesejajaran arah pergeseran keduanya. **BenefitCorr** menguji hal yang lebih halus, yaitu apakah murid memperoleh manfaat *dual-view* pada sampel yang sama dengan sampel tempat guru memperolehnya.
>
> Hasil pada Tabel 4 menunjukkan pola yang tegas: **CSD unggul pada seluruh metrik sekaligus**, dengan ShiftL1 terendah 0,3509, CosAgree tertinggi +0,4361, dan BenefitCorr tertinggi +0,3075 pada koefisien Pearson serta +0,4532 pada koefisien Spearman. Keunggulan ini konsisten terhadap seluruh pembanding tanpa perkecualian, dan urutan peringkatnya identik pada keempat besaran.
>
> Satu pengamatan tambahan patut dicatat. Logit-KD memperoleh ShiftL1 0,3840 dan CosAgree +0,2858 — keduanya **lebih buruk daripada kondisi tanpa distilasi sama sekali**. Distilasi konvensional yang hanya menyelaraskan keluaran akhir karena itu dapat mengaburkan struktur interaksi antar-bidang, sementara CSD memperbaikinya secara terarah. Temuan ini menjelaskan mengapa keberhasilan transfer mekanisme tidak dapat disimpulkan dari akurasi: dua metode dengan QWK yang setara secara statistik ternyata berperilaku sangat berbeda pada tataran struktur keputusan.
>
> Keunggulan pada BenefitCorr paling patut digarisbawahi. Metrik ini dihitung dari kesesuaian pada tingkat sampel, bukan dari rerata populasi, sehingga tidak dapat dipenuhi hanya dengan menyamakan distribusi keluaran secara global. Selisih CSD terhadap Feature-KD mencapai +0,1132 pada koefisien Pearson, yaitu peningkatan relatif sebesar 58,3%. Model murid yang dilatih dengan CSD karena itu tidak sekadar menghasilkan keluaran yang menyerupai guru secara agregat; ia memperoleh keuntungan *dual-view* pada mata-mata yang sama dengan mata tempat guru memperolehnya. Inilah bukti langsung bahwa yang berpindah adalah **struktur pengambilan keputusan**, bukan sekadar nilai keluaran akhir.
>
> Menyandingkan Tabel 3 dan Tabel 4 menghasilkan temuan utama penelitian ini. Pada sumbu prediktif, keempat varian setara secara statistik; pada sumbu mekanisme, CSD unggul pada seluruh metrik. **Kedua sumbu karena itu dapat bergerak secara independen.** Konsekuensinya bersifat metodologis: kesamaan QWK antara dua metode distilasi tidak menjamin keduanya memanfaatkan komplementaritas *dual-view* dengan cara yang sama. Bagi perancangan sistem *two-field*, evaluasi berbasis akurasi saja tidak cukup untuk memastikan perilaku *dual-view* guru benar-benar terwarisi, dan pengukuran mekanisme perlu dilakukan secara eksplisit sebagaimana dicontohkan penelitian ini.

**GAMBAR 7** — `figures/fig_07_csd_mechanism.pdf`

> **Gambar 7.** Fidelitas transfer mekanisme pada tiga metrik. ShiftL1 yang lebih rendah menunjukkan struktur pergeseran keputusan murid lebih dekat kepada guru; CosAgree yang lebih tinggi menunjukkan arah pergeseran lebih sejajar; BenefitCorr yang lebih tinggi menunjukkan murid memperoleh manfaat *dual-view* pada sampel yang sama dengan guru.

---

## D. RQ1 (iii) — Ablasi Formulasi CSD

Subbab pendek tapi penting: ia mematikan keberatan reviewer yang paling tajam — *"jangan-jangan efeknya hanya karena ada suku kerugian tambahan"*.

**Tabel 5. Ablasi formulasi fungsi kerugian CSD pada dua sumbu evaluasi**

| Formulasi | QWK | Macro-F1 | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---|---|---|---|---|
| **CSD penuh (penskalaan global, β = 0,1)** | 0,6018 | 0,3362 | **0,3509** | **+0,4361** | **+0,3075** |
| Tanpa penskalaan (SmoothL1 mentah) | 0,6178 | 0,3575 | 0,3746 | +0,4017 | +0,2036 |
| KL-softmax (kontrol negatif) | 0,6099 | 0,3286 | 0,3885 | +0,3274 | +0,1082 |
| Counterfactual (kepala tunggal) | 0,6128 | 0,3644 | 0,3576 | +0,4327 | +0,2544 |
| Tanpa distilasi (pembanding) | 0,6042 | 0,3355 | 0,3759 | +0,3509 | +0,2193 |

> Untuk memastikan keunggulan mekanisme benar-benar berasal dari formulasi CSD dan bukan dari tambahan suku kerugian apa pun, tiga varian ablasi diuji pada kedua sumbu secara bersamaan. Hasilnya memperlihatkan dua pola yang berlawanan arah, dan justru perbedaan arah itulah yang menjadi bukti terkuat. Pada sumbu prediktif, kelima varian berada dalam rentang sempit 0,6018 sampai 0,6178, yakni di dalam variasi antar-*seed* sehingga tidak dapat dibedakan secara bermakna. Pada sumbu mekanisme, urutannya berbalik tegas: CSD penuh unggul mutlak pada ketiga metrik sekaligus.
>
> Kondisi *counterfactual* memberikan kontrol terkuat. Varian ini menerima seluruh bimbingan guru dan seluruh biaya komputasi tambahan yang sama, tetapi Δ-nya tidak dihitung dari selisih fusi *dual-view* terhadap agregasi bidang tunggal. Ia mencapai CosAgree +0,4327, sangat dekat dengan CSD penuh, namun BenefitCorr-nya hanya +0,2544 dibanding +0,3075. Dengan kata lain, arah pergeseran dapat ditiru tanpa target yang tepat, tetapi **kesesuaian pada tingkat sampel tidak dapat**. Efek CSD karena itu bersifat spesifik terhadap formulasinya, bukan konsekuensi dari penambahan suku kerugian atau bertambahnya kapasitas supervisi.
>
> Varian KL-softmax mengonfirmasi kesimpulan yang sama dari arah berlawanan, dengan ShiftL1 tertinggi 0,3885 dan BenefitCorr terendah +0,1082 — keduanya lebih buruk daripada kondisi tanpa distilasi. Penyebabnya langsung: normalisasi softmax menghapus informasi magnitudo pergeseran dan hanya menyisakan pola relatif antar-ambang, padahal besar pergeseran itulah yang menyandikan seberapa banyak informasi komplementer diserap dari bidang kedua. Hal ini sejalan dengan diagnosis gradien yang menunjukkan rasio kontribusi suku CSD terhadap suku tugas utama pada *backbone* bersama sebesar 0,5335 pada konfigurasi terpilih — cukup besar untuk memengaruhi pembelajaran secara nyata, namun tetap seimbang sehingga tidak mendominasi tugas *grading* utama.

---

## E. RQ2 — Efisiensi, Kompresi, dan Retensi Performa

**Tabel 6. Efisiensi komputasi** (latensi per pasang citra, satu *thread* CPU, median dari 5 blok pengukuran)

| Model | Parameter | Ukuran (MB) | Latensi (ms) | Throughput (pasang/s) | Percepatan | Kompresi |
|---|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 40.313.932 | 154,0890 | 627,6097 | 1,59 | 1,0× | 1,0× |
| Student FP32 (M\*) | 328.588 | 1,2935 | 32,4902 | 30,78 | 19,3× | 119,1× |
| Student PTQ INT8 | 328.588 | 0,9507 | 11,2378 | 88,99 | 55,9× | 162,1× |
| Student FT-PTQ INT8 | 328.588 | 0,9509 | 11,2592 | 88,82 | 55,7× | 162,1× |
| **Student QAT INT8 (deployment)** | **328.588** | **0,9507** | **11,3468** | **88,13** | **55,3×** | **162,1×** |

**Tabel 7. Retensi performa INT8 terhadap model FP32 acuan pada data uji internal**

| Varian | Retensi QWK (%) | ΔQWK | 95% CI | *p* (Holm) | Kesimpulan |
|---|---|---|---|---|---|
| PTQ INT8 | 97,27 | −0,0164 | [−0,0360; +0,0023] | 0,0243 | CI dan permutasi berbeda |
| **QAT INT8** | **98,96** | −0,0063 | [−0,0293; +0,0175] | 0,4854 | *null* |
| QAT vs PTQ | — | +0,0101 | [−0,0179; +0,0411] | 0,4854 | *null* |
| Fine-tune FP32 (kontrol) | 101,78 | +0,0107 | [−0,0076; +0,0293] | 0,0796 | *null* |

> Model murid memiliki 328.588 parameter, yaitu 122,7 kali lebih sedikit dibanding 40.313.932 parameter model guru. Artefaknya menyusut dari 154,0890 MB menjadi 1,2935 MB dan latensinya turun dari 627,6097 ms menjadi 32,4902 ms — sudah 19,3 kali lebih cepat bahkan sebelum kuantisasi diterapkan. Penghematan berikutnya datang dari kuantisasi INT8: ukuran turun 1,36 kali menjadi 0,9507 MB dan latensi turun 2,86 kali menjadi 11,3468 ms. **Model akhir yang diterapkan hanya berukuran 0,95 MB dan berjalan pada 11,35 ms per pasang citra, yaitu 162,1 kali lebih kecil dan 55,3 kali lebih cepat dibanding model guru.** Pada CPU kelas menengah, angka tersebut setara dengan lebih dari 88 pemeriksaan mata per detik tanpa akselerator grafis.
>
> Reduksi ukuran yang lebih moderat dibanding percepatan latensi merupakan konsekuensi langsung dari cakupan kuantisasi yang dipilih secara sengaja: *backbone* konvolusional dikonversi ke INT8, sedangkan modul fusi antar-bidang dan kepala ordinal CORAL dipertahankan pada FP32. Pilihan ini diambil karena kepala ordinal memerlukan presisi numerik yang stabil untuk menjaga jaminan monotonisitas peringkatnya, dan keputusan tersebut terbukti tepat — tingkat pelanggaran monotonisitas tercatat 0,00 pada seluruh kondisi. Beban komputasi terberat tetap berada pada *backbone*, sehingga percepatan latensi tetap besar meskipun sebagian bobot tidak ikut terkompresi. Cakupan operator diverifikasi identik antar-skema PTQ, QAT, dan FT-PTQ pada kelima *seed*, sehingga ketiganya dapat dibandingkan secara adil.
>
> Efisiensi hanya bermakna apabila kemampuan *grading* tetap terjaga. PTQ INT8 mempertahankan 97,27% QWK dan QAT INT8 mempertahankan 98,96%. Pada varian QAT, interval kepercayaan memuat nol dan tidak lolos koreksi Holm, sehingga tidak ditemukan penurunan yang kredibel. Pada varian PTQ, interval kepercayaan memuat nol sementara uji permutasi menghasilkan *p* = 0,0243. Perbedaan hasil antara dua prosedur ini dilaporkan sebagaimana adanya: hal semacam ini dapat terjadi ketika sebuah efek berukuran kecil bersifat konsisten arahnya di seluruh *seed*, karena kedua prosedur tidak menguji hal yang sepenuhnya sama. Kaidah pelaporan tersebut ditetapkan sebelum eksperimen berjalan dan ditaati, sehingga kedua angka disajikan berdampingan tanpa memilih salah satunya secara selektif. Kontrol *fine-tune* FP32 mencatat ΔQWK +0,0107 dengan interval yang memuat nol, sehingga efek kuantisasi dapat dipisahkan dari efek pelatihan tambahan.
>
> Pemilihan artefak *deployment* mengikuti aturan yang telah didaftarkan sebelumnya dan hanya bersandar pada data validasi: retensi QWK minimal 95%, tidak ada perburukan kesalahan berat secara kredibel, kemudian latensi median terendah di antara kandidat yang memenuhi syarat. Dari tiga kandidat INT8, hanya QAT INT8 yang melampaui ambang retensi dengan 99,04%, sementara PTQ dan FT-PTQ berada pada 93,37% dan 93,64%. **QAT INT8 karena itu terpilih sebagai artefak *deployment*.** Seluruh artefak final diverifikasi satu per satu: setiap berkas berhasil dimuat ulang dari diska dengan keluaran identik, dan ekspor ke format ONNX menghasilkan selisih maksimum 7,15 × 10⁻⁷ terhadap keluaran PyTorch aslinya, jauh di bawah toleransi 1 × 10⁻⁴ yang ditetapkan.

**GAMBAR 8** — `figures/fig_11_pareto.pdf`

> **Gambar 8.** QWK terhadap latensi inferensi CPU. Titik yang lebih dekat ke sudut kiri atas menunjukkan pertukaran performa–efisiensi yang lebih menguntungkan.

---

## F. Generalisasi pada Data Eksternal

**Tabel 8. Kinerja pada partisi konfirmatori DeepDRiD Set-C** (100 pasien, 200 mata, 400 citra; interval kepercayaan *bootstrap* berklaster pasien)

| Model | QWK | Akurasi | Macro-F1 | MAE | SER |
|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 0,7923 [0,7152; 0,8550] | 0,610 | 0,3875 | 0,520 | 0,105 |
| Student PTQ INT8 | 0,6729 ± 0,0365 | 0,551 | 0,3635 | 0,689 | 0,171 |
| **Student CSD FP32 (M\*)** | **0,6688 ± 0,0415** | 0,538 | 0,3439 | 0,711 | 0,174 |
| Fine-tune FP32 (kontrol) | 0,6567 ± 0,0364 | 0,531 | 0,3514 | 0,735 | 0,191 |
| Student FT-PTQ INT8 | 0,6513 ± 0,0315 | 0,537 | 0,3675 | 0,734 | 0,192 |
| Student QAT INT8 | 0,6344 ± 0,0326 | 0,525 | 0,3474 | 0,761 | 0,206 |

> Seluruh model dibekukan terlebih dahulu, kemudian diuji pada partisi konfirmatori DeepDRiD Set-C yang mencakup 100 pasien, 200 mata, dan 400 citra, dan yang tidak pernah tersentuh selama pelatihan maupun pemilihan model. Keterpisahan partisi diverifikasi: tidak ada satu pun pasien yang muncul di lebih dari satu partisi. Interval kepercayaan dihitung dengan *bootstrap* berklaster pada tingkat pasien, bukan tingkat mata, karena dua mata dari satu pasien tidak bersifat independen.
>
> Model guru memperoleh QWK 0,7923 dan model murid terpilih memperoleh 0,6688, sehingga 84,4% kemampuan guru dipertahankan pada domain yang sepenuhnya baru. Perbandingan terhadap kinerja internal memperlihatkan hal yang menggembirakan: **QWK model murid pada data eksternal (0,6688) berada di atas capaiannya pada data internal (0,6018).** Kenaikan ini menunjukkan representasi yang dipelajari tidak terikat pada karakteristik akuisisi satu dataset tertentu, dan bahwa hasil yang dilaporkan bukan artefak dari partisi internal.
>
> Peringkat antar-varian kuantisasi berubah pada domain eksternal. PTQ INT8 mencatat QWK tertinggi di antara seluruh varian murid sebesar 0,6729, sementara QAT INT8 yang terpilih untuk *deployment* berada pada 0,6344, dengan selisih terhadap PTQ sebesar −0,0384 dan interval kepercayaan [−0,0826; −0,0006] yang tidak memuat nol. Temuan ini bernilai praktis dan dilaporkan secara terbuka: **kalibrasi kuantisasi yang paling menjaga performa di domain asal tidak dengan sendirinya paling menjaga performa di domain baru.** Implikasinya jelas bagi penerapan nyata — pemilihan varian kuantisasi sebaiknya mempertimbangkan karakteristik domain sasaran, bukan hanya retensi pada data internal. DR-VERGE mempertahankan pilihan QAT INT8 sesuai aturan validasi yang telah ditetapkan sebelum eksperimen demi menjaga integritas prosedur, sementara kedua varian tetap tersedia dalam repositori sehingga penerapan pada konteks berbeda dapat memilih sesuai kebutuhannya.

**GAMBAR 9** — `figures/fig_14_internal_vs_external.pdf`

> **Gambar 9.** Perbandingan kinerja pada data uji internal DRTiD dan data konfirmatori eksternal DeepDRiD Set-C. Tidak ada penyetelan, penyesuaian ambang, maupun pemilihan model yang dilakukan pada partisi eksternal.

---

## G. Sintesis dan Jawaban Pertanyaan Penelitian

Subbab penutup, wajib ada. Reviewer harus menemukan jawaban RQ tanpa perlu menyimpulkannya sendiri.

> Hasil pada bagian ini menjawab kedua pertanyaan penelitian secara langsung.
>
> **RQ1.** Complementarity-Shift Distillation berhasil mentransfer *signed joint-vs-individual cumulative ordinal prediction shift* dari model *two-field teacher* ke *lightweight student*. Pada sumbu fidelitas mekanisme, CSD unggul terhadap seluruh pembanding pada ketiga metrik sekaligus — ShiftL1 0,3509, CosAgree +0,4361, dan BenefitCorr +0,3075 — dan studi ablasi menunjukkan keunggulan tersebut bersifat spesifik terhadap formulasinya, bukan konsekuensi dari penambahan suku kerugian. Pada sumbu performa prediktif, keempat metode terbukti setara secara statistik dengan seluruh interval kepercayaan memuat nol. **Keberhasilan transfer mekanisme karena itu diperoleh tanpa biaya prediktif yang terdeteksi.** Disosiasi antara kedua sumbu ini merupakan temuan tersendiri yang bernilai metodologis: fidelitas mekanisme dan akurasi *grading* dapat bergerak independen, sehingga evaluasi sistem *two-field* perlu mengukur keduanya secara terpisah.
>
> **RQ2.** Kuantisasi INT8 mempertahankan 98,96% kemampuan *grading* pada varian terpilih tanpa penurunan yang kredibel secara statistik, sambil menghasilkan artefak berukuran 0,9507 MB yang berjalan pada 11,3468 ms per pasang citra di CPU satu *thread*. Dibanding model guru, artefak akhir 162,1 kali lebih kecil dan 55,3 kali lebih cepat. Evaluasi eksternal menunjukkan bahwa keunggulan ini bertahan lintas domain, dengan tambahan temuan bahwa peringkat antar-varian kuantisasi dapat berubah pada domain baru — informasi praktis yang relevan bagi penerapan di lapangan.
>
> Secara keseluruhan, DR-VERGE menunjukkan bahwa pemodelan *two-field* dapat dipindahkan ke model berukuran di bawah satu megabita yang berjalan pada CPU biasa, dengan mekanisme pemanfaatan komplementaritas anatomis yang terbukti ikut berpindah, dan dengan seluruh klaim diuji melalui prosedur yang ditetapkan sebelum eksperimen berjalan.

---

## Catatan pelaksanaan

### Bila halaman tidak mencukupi

Prioritas pemangkasan, dari yang paling aman dipotong:

1. **Tabel 2** (*recall* per derajat) → pindahkan angka derajat 1 dan temuan "murid mengungguli guru" ke dalam prosa IV-B. Menghemat satu tabel penuh.
2. **Tabel 6** (efisiensi) → buang kolom *Throughput* dan *Percepatan*, karena keduanya dapat dihitung pembaca dari kolom latensi.
3. **Gambar 9** → gabungkan ke Gambar 8 bila jurnal mengizinkan gambar dua panel.

Yang **tidak boleh** dipotong dalam keadaan apa pun: Tabel 3 (uji RQ1), Tabel 4 (mekanisme), Tabel 5 (ablasi), Gambar 6 (*forest*), dan Gambar 7 (mekanisme). Kelimanya adalah tulang punggung klaim paper.

### Konsistensi angka

Setiap angka di Bab IV harus cocok dengan Bab I dan Bab III. Sebelum submit, cari string berikut di seluruh naskah — bila salah satu masih ditemukan, ada bagian yang masih memakai hasil run lama dan belum diperbarui:

```
0,6544   0,5546   0,5296   0,5453   0,7346   6,2164   99,70
```

### Sumber setiap angka

Seluruh lintasan relatif terhadap `experiments/results/enhanced-notebook/outputs/results/`.

| Tabel / klaim | Berkas sumber |
|---|---|
| Tabel 1, 5 | `tables/table_predictive_performance.csv` |
| Tabel 2 | `tables/table_per_grade_performance.csv` |
| Tabel 3, 7 | `tables/table_statistics_primary.csv`, `tables/table_ci_permutation_disagreement.csv` |
| Tabel 4, 5 (kolom mekanisme) | `tables/table_csd_mechanism.csv` |
| Tabel 6 | `tables/table_efficiency.csv` |
| Tabel 7 (retensi) | `tables/table_retention_main.csv` |
| Tabel 8 | `tables/table_external_summary.csv`, `tables/table_external_ci.csv`, `tables/table_external_paired.csv` |
| Pemilihan M\*, kelayakan deployment | `tables/table_method_selection.csv`, `tables/table_deployment_eligibility.csv` |
| Stage A (384 vs 224) | `tables/table_stage_a_recipe_selection.csv` |
| Rerata ‖Δ‖₁ guru, rasio gradien | `metrics/teacher_delta_distribution.csv`, `metrics/csd_gradient_diagnostic.json` |
| 36 gate, monotonisitas, ONNX, audit 265 nilai | `tables/table_gate_report.csv` |

Dokumen terkait:

- `experiments/results/enhanced-notebook/PENGUATAN-PAPER-BAB1-BAB4.md` — panduan revisi Bab I dan daftar hal yang perlu dihapus dari draft.
- `research/paper-figures/dataset/README.md` — gambar dataset untuk Bab I dan Bab III.
- `research/list-gambar.md` — rencana penomoran Gambar 1–9 untuk keseluruhan paper.
