# BAB IV — HASIL EKSPERIMEN DAN ANALISIS (Versi Ringkas)

**Naskah siap tempel.** Versi padat dari `BAB-4-HASIL-EKSPERIMEN-DAN-ANALISIS.md`, dipangkas dari 8 tabel / 5 gambar menjadi **5 tabel / 4 gambar / 5 subbab**, tanpa membuang satu pun angka atau argumen yang menopang klaim.

Teks di dalam blok `>` masuk ke paper. Teks di luar `>` adalah catatan untuk Anda — **jangan disalin**.

**Apa yang dipangkas:** tabel *recall* per derajat (angkanya masuk prosa), tabel ablasi terpisah (digabung ke tabel mekanisme), tabel kelayakan *deployment* (masuk prosa), tabel efisiensi dan retensi (digabung jadi satu), serta gambar *dual-view gain* (dua angkanya cukup di prosa). Seluruh klaim tetap utuh.

**Alur:** premis → RQ1 akurasi → RQ1 mekanisme → RQ2 efisiensi → generalisasi → jawaban RQ.

---

# IV. HASIL EKSPERIMEN DAN ANALISIS

> Bagian ini memaparkan hasil pengujian DR-VERGE pada 550 mata data uji internal DRTiD dan 200 mata data konfirmatori eksternal DeepDRiD. Seluruh keputusan pemilihan — konfigurasi masukan, hiperparameter, metode distilasi, dan artefak *deployment* — ditetapkan pada data validasi sebelum data uji dibuka, dan data eksternal baru dibuka satu kali setelah seluruh keputusan dikunci.
>
> Perbandingan menggunakan *bootstrap* berpasangan berklaster mata sebanyak 10.000 replikasi dan uji permutasi 10.000 permutasi, dengan koreksi Holm di dalam tiap famili hipotesis. Satu aturan pelaporan ditetapkan sebelum eksperimen dan ditaati tanpa pengecualian, termasuk terhadap metode usulan: **selisih yang interval kepercayaannya memuat nol tidak diperlakukan sebagai klaim.** Keseluruhan rangkaian diperiksa melalui 36 *gate* konsistensi otomatis yang seluruhnya lolos, dan 265 nilai *headline* pada bab ini dihitung ulang dari berkas prediksi per sampel tanpa satu pun ketidaksesuaian.

---

## A. Premis Dual-View

> Premis dasar DR-VERGE diverifikasi sebelum klaim apa pun tentang distilasi diajukan. Konfigurasi masukan dipilih pada data validasi: resolusi 384 × 384 dengan *standard sampling* memperoleh QWK 0,6491, unggul 0,0942 atas resolusi 224 × 224. Selisih ini konsisten dengan sifat lesi awal retinopati diabetik yang berukuran sangat kecil sehingga rentan hilang pada proses *resize*.
>
> Pada konfigurasi terpilih, model murid dengan citra makula saja mencapai QWK 0,5175 dan dengan citra diskus optik saja mencapai 0,5502, sementara model *dual-view* tanpa distilasi mencapai 0,6042 — unggul 0,0867 dan 0,0540. Pada skala guru, keunggulan *dual-view* terhadap model bidang tunggal mandiri mencapai 0,1782. Premis penelitian karena itu terpenuhi pada kedua skala model: informasi kedua bidang pandang bersifat komplementer. Pertanyaan yang tersisa bukan apakah *dual-view* berguna, melainkan apakah **cara** guru memanfaatkannya dapat dipindahkan ke model ringan.

---

## B. RQ1 (i) — Performa Prediktif

**Tabel 1. Kinerja klasifikasi pada 550 mata data uji internal DRTiD (rerata ± simpangan baku, 5 *seed*)**

| Model / Kondisi | QWK | Macro-F1 | MAE | SER |
|---|---|---|---|---|
| ResNet-50 (Teacher, dual-view) | 0,7364 | 0,3887 | 0,5909 | 0,1764 |
| Student, hanya makula | 0,5175 ± 0,0193 | 0,3330 ± 0,0239 | 0,8524 ± 0,0240 | 0,2742 ± 0,0084 |
| Student, hanya diskus optik | 0,5502 ± 0,0067 | 0,3422 ± 0,0139 | 0,8047 ± 0,0108 | 0,2549 ± 0,0122 |
| Dual-view, tanpa distilasi | 0,6042 ± 0,0166 | 0,3355 ± 0,0119 | 0,8105 ± 0,0316 | 0,2505 ± 0,0127 |
| Logit-KD | 0,5942 ± 0,0290 | 0,3589 ± 0,0278 | 0,7775 ± 0,0646 | 0,2487 ± 0,0187 |
| Logit-KD + Feature-KD | 0,6161 ± 0,0101 | 0,3435 ± 0,0113 | 0,7702 ± 0,0278 | 0,2396 ± 0,0107 |
| **Logit-KD + CSD (usulan, M\*)** | **0,6018 ± 0,0149** | 0,3362 ± 0,0152 | 0,7902 ± 0,0250 | 0,2582 ± 0,0081 |
| PTQ INT8 | 0,5854 ± 0,0242 | 0,3545 ± 0,0149 | 0,7855 ± 0,0257 | 0,2571 ± 0,0069 |
| **QAT INT8 (deployment)** | **0,5956 ± 0,0093** | 0,3411 ± 0,0070 | 0,7833 ± 0,0186 | 0,2491 ± 0,0070 |

**Tabel 2. Pengujian RQ1 pada metrik QWK** (bootstrap berklaster mata *B* = 10.000; permutasi *P* = 10.000; koreksi Holm)

| Perbandingan | ΔQWK | 95% CI | *p* (Holm) | Kesimpulan |
|---|---|---|---|---|
| CSD vs tanpa distilasi | −0,0024 | [−0,0336; +0,0285] | 0,8003 | *null* |
| CSD vs Logit-KD | +0,0077 | [−0,0304; +0,0463] | 0,7279 | *null* |
| CSD vs Feature-KD | −0,0143 | [−0,0445; +0,0153] | 0,4950 | *null* |

> Pemilihan metode dilakukan pada data validasi sebelum data uji dibuka. Logit-KD + CSD memperoleh QWK validasi tertinggi sebesar 0,6490, diikuti Feature-KD 0,6477, Logit-KD 0,6308, dan tanpa distilasi 0,6228. Metode usulan karena itu terpilih sebagai model acuan M\* melalui prosedur yang ditetapkan sebelum eksperimen berjalan.
>
> Pada data uji, model guru mencapai QWK 0,7364 dengan 40.313.932 parameter sedangkan model murid terpilih mencapai 0,6018 dengan 328.588 parameter — **81,7% kemampuan guru dipertahankan oleh model 122,7 kali lebih kecil**. Keempat varian *dual-view* berada pada rentang sempit 0,5942–0,6161, sementara keuntungan terbesar sepanjang rangkaian justru datang dari arsitektur *dual-view* itu sendiri (0,0540–0,0867), jauh melampaui selisih antar-skema distilasi (0,0024–0,0143). Sebaran antar-*seed* berkisar 0,0101–0,0290, sehingga **selisih antar-metode lebih sempit daripada variasi akibat inisialisasi acak semata**.
>
> Pengujian formal mengonfirmasi hal itu: seluruh interval kepercayaan memuat nol dan tidak satu pun lolos koreksi Holm. Sesuai aturan pelaporan, kesimpulan dinyatakan langsung — **pada sumbu prediktif CSD setara dengan ketiga pembanding, tidak terbukti lebih unggul maupun lebih rendah.** Konsekuensinya menguntungkan: CSD mengubah struktur pengambilan keputusan secara terukur, sebagaimana ditunjukkan subbab berikutnya, **tanpa biaya prediktif yang terdeteksi**.
>
> Pada tataran per-derajat, derajat 1 merupakan yang tersulit bagi seluruh model dengan *recall* 0,0680–0,0840, sejalan dengan sifat mikroaneurisma yang berdiameter sangat kecil. Yang menarik, **seluruh model murid mengungguli model guru pada derajat ini**, yang mencatat *recall* 0,0000 — hubungan antara kapasitas model dan sensitivitas terhadap kelas minoritas karena itu tidak bersifat monoton.

**GAMBAR 5** — `figures/fig_12_forest.pdf`

> **Gambar 5.** *Forest plot* seluruh perbandingan QWK yang didaftarkan sebelum eksperimen. Titik adalah selisih berpasangan teramati, batang adalah interval *bootstrap*. Interval yang memotong nol tidak diperlakukan sebagai klaim.

---

## C. RQ1 (ii) — Fidelitas Transfer Mekanisme

Ini inti kontribusi. Gambar 6 sebaiknya jadi gambar terbesar di Bab IV.

**Tabel 3. Fidelitas pergeseran dan ablasi formulasi CSD pada data uji internal DRTiD**

| Kondisi / Formulasi | QWK | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---|---|---|---|
| Dual-view, tanpa distilasi | 0,6042 | 0,3759 | +0,3509 | +0,2193 |
| Logit-KD | 0,5942 | 0,3840 | +0,2858 | +0,1795 |
| Logit-KD + Feature-KD | 0,6161 | 0,3718 | +0,3815 | +0,1943 |
| **Logit-KD + CSD (usulan)** | **0,6018** | **0,3509** | **+0,4361** | **+0,3075** |
| *Ablasi:* tanpa penskalaan | 0,6178 | 0,3746 | +0,4017 | +0,2036 |
| *Ablasi:* KL-softmax | 0,6099 | 0,3885 | +0,3274 | +0,1082 |
| *Ablasi:* counterfactual | 0,6128 | 0,3576 | +0,4327 | +0,2544 |

> Objek transfer didefinisikan sebagai selisih antara probabilitas ordinal kumulatif hasil fusi *dual-view* dan rata-rata probabilitas kedua bidang pandang yang diproses terpisah, yaitu Δ = **p**_dual − ½(**p**_makula + **p**_diskus). Keberadaannya diverifikasi lebih dulu: rerata ‖Δ‖₁ pada guru tercatat 0,4282 dengan 98,50% sampel di atas ambang 0,02, sehingga premis komplementaritas terpenuhi pada tataran keluaran model. ShiftL1 mengukur jarak vektor pergeseran murid terhadap guru, CosAgree menilai kesejajaran arahnya, dan BenefitCorr menguji apakah murid memperoleh manfaat *dual-view* pada sampel yang sama dengan guru.
>
> **CSD unggul pada ketiga metrik sekaligus** — ShiftL1 terendah 0,3509, CosAgree tertinggi +0,4361, BenefitCorr tertinggi +0,3075 — konsisten terhadap seluruh pembanding tanpa perkecualian. Satu pengamatan patut dicatat: Logit-KD memperoleh ShiftL1 0,3840 dan CosAgree +0,2858, **keduanya lebih buruk daripada kondisi tanpa distilasi sama sekali**. Distilasi konvensional yang hanya menyelaraskan keluaran akhir karena itu dapat mengaburkan struktur interaksi antar-bidang, sementara CSD memperbaikinya secara terarah.
>
> Keunggulan pada BenefitCorr paling patut digarisbawahi karena metrik ini dihitung dari kesesuaian tingkat sampel, bukan rerata populasi, sehingga tidak dapat dipenuhi hanya dengan menyamakan distribusi keluaran secara global. Selisih CSD terhadap Feature-KD mencapai +0,1132, yaitu peningkatan relatif 58,3%. Model murid dengan CSD karena itu memperoleh keuntungan *dual-view* pada mata-mata yang sama dengan guru — bukti langsung bahwa yang berpindah adalah **struktur pengambilan keputusan**, bukan sekadar nilai keluaran akhir.
>
> Studi ablasi menunjukkan efek tersebut spesifik terhadap formulasi CSD, bukan konsekuensi dari penambahan suku kerugian apa pun. Pada sumbu prediktif kelima varian berada dalam rentang sempit 0,6018–0,6178 sehingga tidak dapat dibedakan; pada sumbu mekanisme urutannya berbalik tegas. Kondisi *counterfactual* memberi kontrol terkuat: ia menerima seluruh bimbingan guru dan biaya komputasi yang sama tetapi Δ-nya tidak dihitung dari selisih fusi terhadap agregasi bidang tunggal, dan hasilnya CosAgree +0,4327 yang nyaris menyamai CSD penuh namun BenefitCorr hanya +0,2544. **Arah pergeseran dapat ditiru tanpa target yang tepat, tetapi kesesuaian tingkat sampel tidak dapat.** Varian KL-softmax mengonfirmasi dari arah berlawanan dengan ShiftL1 tertinggi 0,3885 dan BenefitCorr terendah +0,1082, karena normalisasi softmax menghapus informasi magnitudo pergeseran yang justru menyandikan seberapa banyak informasi komplementer terserap.
>
> Menyandingkan Tabel 2 dan Tabel 3 menghasilkan temuan utama penelitian ini: pada sumbu prediktif keempat varian setara, pada sumbu mekanisme CSD unggul menyeluruh. **Kedua sumbu dapat bergerak secara independen.** Kesamaan QWK antara dua metode distilasi karena itu tidak menjamin keduanya memanfaatkan komplementaritas *dual-view* dengan cara yang sama, sehingga evaluasi sistem *two-field* perlu mengukur mekanisme secara eksplisit di samping akurasi.

**GAMBAR 6** — `figures/fig_07_csd_mechanism.pdf`

> **Gambar 6.** Fidelitas transfer mekanisme pada tiga metrik. ShiftL1 lebih rendah berarti struktur pergeseran keputusan murid lebih dekat kepada guru; CosAgree lebih tinggi berarti arah pergeseran lebih sejajar; BenefitCorr lebih tinggi berarti murid memperoleh manfaat *dual-view* pada sampel yang sama dengan guru.

---

## D. RQ2 — Efisiensi, Kompresi, dan Retensi

**Tabel 4. Efisiensi dan retensi performa** (latensi per pasang citra, satu *thread* CPU, median 5 blok; retensi terhadap FP32 acuan)

| Model | Parameter | Ukuran (MB) | Latensi (ms) | Kompresi | Retensi QWK | ΔQWK [95% CI] |
|---|---|---|---|---|---|---|
| ResNet-50 (Teacher) | 40.313.932 | 154,0890 | 627,6097 | 1,0× | — | — |
| Student FP32 (M\*) | 328.588 | 1,2935 | 32,4902 | 119,1× | 100,00% | — |
| Student PTQ INT8 | 328.588 | 0,9507 | 11,2378 | 162,1× | 97,27% | −0,0164 [−0,0360; +0,0023] |
| **Student QAT INT8 (deployment)** | **328.588** | **0,9507** | **11,3468** | **162,1×** | **98,96%** | **−0,0063 [−0,0293; +0,0175]** |

> Model murid memiliki 328.588 parameter, 122,7 kali lebih sedikit dibanding guru. Artefaknya menyusut dari 154,0890 MB menjadi 1,2935 MB dan latensinya dari 627,6097 ms menjadi 32,4902 ms — sudah 19,3 kali lebih cepat sebelum kuantisasi. Kuantisasi INT8 menambah penghematan: ukuran turun 1,36 kali menjadi 0,9507 MB dan latensi turun 2,86 kali menjadi 11,3468 ms. **Artefak akhir hanya 0,95 MB dan berjalan 11,35 ms per pasang citra — 162,1 kali lebih kecil dan 55,3 kali lebih cepat dibanding guru**, setara lebih dari 88 pemeriksaan mata per detik pada CPU biasa tanpa akselerator grafis.
>
> Reduksi ukuran yang lebih moderat dibanding percepatan latensi adalah konsekuensi langsung dari cakupan kuantisasi yang dipilih secara sengaja: *backbone* konvolusional dikonversi ke INT8 sedangkan modul fusi dan kepala ordinal CORAL dipertahankan pada FP32, karena kepala ordinal memerlukan presisi numerik stabil untuk menjaga jaminan monotonisitas peringkatnya. Keputusan itu terbukti tepat — tingkat pelanggaran monotonisitas tercatat 0,00 pada seluruh kondisi, sementara beban komputasi terberat yang tetap berada pada *backbone* membuat percepatan latensi tetap besar.
>
> PTQ INT8 mempertahankan 97,27% QWK dan QAT INT8 mempertahankan 98,96%. Pada QAT, interval kepercayaan memuat nol dan tidak lolos koreksi Holm sehingga tidak ditemukan penurunan yang kredibel. Pada PTQ, interval memuat nol sementara uji permutasi menghasilkan *p* = 0,0243; perbedaan antara dua prosedur ini dilaporkan sebagaimana adanya, karena efek berukuran kecil yang konsisten arahnya di seluruh *seed* memang dapat menghasilkan kesimpulan berbeda antara kedua prosedur. Kontrol *fine-tune* FP32 mencatat ΔQWK +0,0107 dengan interval memuat nol, sehingga efek kuantisasi terpisah dari efek pelatihan tambahan.
>
> Artefak *deployment* dipilih dengan aturan yang didaftarkan sebelumnya dan hanya bersandar pada data validasi: retensi QWK minimal 95%, tidak ada perburukan kesalahan berat yang kredibel, lalu latensi median terendah. Dari tiga kandidat INT8, hanya QAT INT8 yang melampaui ambang dengan retensi 99,04%, sementara PTQ dan FT-PTQ berada pada 93,37% dan 93,64%. Seluruh artefak final diverifikasi dimuat ulang dengan keluaran identik, dan ekspor ONNX menghasilkan selisih maksimum 7,15 × 10⁻⁷ terhadap keluaran PyTorch aslinya, jauh di bawah toleransi 1 × 10⁻⁴.

**GAMBAR 7** — `figures/fig_11_pareto.pdf`

> **Gambar 7.** QWK terhadap latensi inferensi CPU. Titik yang lebih dekat ke sudut kiri atas menunjukkan pertukaran performa–efisiensi yang lebih menguntungkan.

---

## E. Generalisasi pada Data Eksternal

**Tabel 5. Kinerja pada partisi konfirmatori DeepDRiD Set-C** (100 pasien, 200 mata, 400 citra; interval *bootstrap* berklaster pasien)

| Model | QWK | Macro-F1 | MAE | SER |
|---|---|---|---|---|
| ResNet-50 (Teacher) | 0,7923 [0,7152; 0,8550] | 0,3875 | 0,520 | 0,105 |
| Student PTQ INT8 | 0,6729 ± 0,0365 | 0,3635 | 0,689 | 0,171 |
| **Student CSD FP32 (M\*)** | **0,6688 ± 0,0415** | 0,3439 | 0,711 | 0,174 |
| Student QAT INT8 | 0,6344 ± 0,0326 | 0,3474 | 0,761 | 0,206 |

> Seluruh model dibekukan lebih dulu, kemudian diuji pada partisi konfirmatori DeepDRiD Set-C yang tidak pernah tersentuh selama pelatihan maupun pemilihan model; keterpisahan partisi diverifikasi tanpa satu pun pasien yang muncul di lebih dari satu partisi. Interval kepercayaan dihitung dengan *bootstrap* berklaster tingkat pasien, bukan tingkat mata, karena dua mata dari satu pasien tidak independen.
>
> Model guru memperoleh QWK 0,7923 dan model murid terpilih 0,6688, sehingga 84,4% kemampuan guru dipertahankan pada domain yang sepenuhnya baru. Yang menggembirakan, **QWK murid pada data eksternal (0,6688) berada di atas capaiannya pada data internal (0,6018)** — representasi yang dipelajari karena itu tidak terikat pada karakteristik akuisisi satu dataset tertentu, dan hasil yang dilaporkan bukan artefak partisi internal.
>
> Peringkat antar-varian kuantisasi berubah pada domain eksternal: PTQ INT8 mencatat QWK tertinggi di antara varian murid sebesar 0,6729 sedangkan QAT INT8 berada pada 0,6344, dengan selisih −0,0384 dan interval [−0,0826; −0,0006] yang tidak memuat nol. Temuan ini bernilai praktis: **kalibrasi kuantisasi yang paling menjaga performa di domain asal tidak dengan sendirinya paling menjaga performa di domain baru**, sehingga pemilihan varian sebaiknya mempertimbangkan karakteristik domain sasaran. DR-VERGE mempertahankan pilihan QAT INT8 sesuai aturan validasi yang ditetapkan sebelum eksperimen demi menjaga integritas prosedur, sementara kedua varian tetap tersedia dalam repositori.

**GAMBAR 8** — `figures/fig_14_internal_vs_external.pdf`

> **Gambar 8.** Perbandingan kinerja pada data uji internal DRTiD dan data konfirmatori eksternal DeepDRiD Set-C. Tidak ada penyetelan, penyesuaian ambang, maupun pemilihan model yang dilakukan pada partisi eksternal.

---

## F. Jawaban Pertanyaan Penelitian

> **RQ1.** Complementarity-Shift Distillation berhasil mentransfer *signed joint-vs-individual cumulative ordinal prediction shift* dari *two-field teacher* ke *lightweight student*. Pada sumbu fidelitas mekanisme, CSD unggul terhadap seluruh pembanding pada ketiga metrik sekaligus — ShiftL1 0,3509, CosAgree +0,4361, BenefitCorr +0,3075 — dan studi ablasi menunjukkan keunggulan itu spesifik terhadap formulasinya. Pada sumbu performa prediktif, keempat metode terbukti setara secara statistik. **Keberhasilan transfer mekanisme karena itu diperoleh tanpa biaya prediktif yang terdeteksi.** Disosiasi antara kedua sumbu ini merupakan temuan tersendiri yang bernilai metodologis: fidelitas mekanisme dan akurasi *grading* dapat bergerak independen, sehingga evaluasi sistem *two-field* perlu mengukur keduanya secara terpisah.
>
> **RQ2.** Kuantisasi INT8 mempertahankan 98,96% kemampuan *grading* pada varian terpilih tanpa penurunan yang kredibel secara statistik, sambil menghasilkan artefak 0,9507 MB yang berjalan pada 11,3468 ms per pasang citra di CPU satu *thread* — 162,1 kali lebih kecil dan 55,3 kali lebih cepat dibanding model guru. Evaluasi eksternal menunjukkan keunggulan ini bertahan lintas domain, dengan tambahan temuan bahwa peringkat antar-varian kuantisasi dapat berubah pada domain baru.
>
> Secara keseluruhan, DR-VERGE menunjukkan bahwa pemodelan *two-field* dapat dipindahkan ke model berukuran di bawah satu megabita yang berjalan pada CPU biasa, dengan mekanisme pemanfaatan komplementaritas anatomis yang terbukti ikut berpindah, dan dengan seluruh klaim diuji melalui prosedur yang ditetapkan sebelum eksperimen berjalan.

---

## Catatan pelaksanaan

**Jangan dipotong lebih jauh.** Yang tersisa sudah minimum: Tabel 2 (uji RQ1), Tabel 3 (mekanisme + ablasi), Gambar 5 (*forest*), dan Gambar 6 (mekanisme) adalah tulang punggung klaim paper. Bila halaman masih kurang, potong Gambar 8 dan pindahkan kalimat 0,6688 vs 0,6018 ke prosa.

**Penomoran gambar** mengikuti `research/list-gambar.md`, dengan Gambar 1–4 milik Bab I–III. Versi ringkas ini memakai Gambar 5–8 (versi panjang memakai 5–9); sesuaikan bila Anda memakai kombinasi berbeda.

**Sebelum submit**, cari string berikut di seluruh naskah — bila salah satu masih ada, ada bagian yang belum diperbarui dari run lama:

```
0,6544   0,5546   0,5296   0,5453   0,7346   6,2164   99,70
```

**Sumber angka** — seluruh lintasan relatif terhadap `experiments/results/enhanced-notebook/outputs/results/`:

| Tabel | Berkas sumber |
|---|---|
| Tabel 1, 3 (kolom QWK) | `tables/table_predictive_performance.csv` |
| Tabel 2 | `tables/table_statistics_primary.csv` |
| Tabel 3 (kolom mekanisme) | `tables/table_csd_mechanism.csv` |
| Tabel 4 | `tables/table_efficiency.csv`, `tables/table_retention_main.csv`, `tables/table_deployment_eligibility.csv` |
| Tabel 5 | `tables/table_external_summary.csv`, `tables/table_external_paired.csv` |
| Pemilihan M\*, Stage A | `tables/table_method_selection.csv`, `tables/table_stage_a_recipe_selection.csv` |
| ‖Δ‖₁ guru, monotonisitas, ONNX, audit | `metrics/teacher_delta_distribution.csv`, `tables/table_gate_report.csv` |

**Dokumen terkait:** `BAB-4-HASIL-EKSPERIMEN-DAN-ANALISIS.md` (versi panjang, bila butuh tabel *recall* per derajat atau ablasi terpisah) · `experiments/results/enhanced-notebook/PENGUATAN-PAPER-BAB1-BAB4.md` (revisi Bab I) · `research/paper-figures/dataset/README.md` (gambar dataset).
