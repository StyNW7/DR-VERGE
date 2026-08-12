# Panduan Penulisan Paper — Berdasarkan Run Enhanced

Dokumen ini menjawab dua pertanyaan: **apa yang ditulis di paper** dan **bagaimana menjawab
Research Question**. Semua angka diambil dari `RESULTS_OVERVIEW.md` di folder yang sama.

---

## Bagian 1 — Cara Menjawab Research Question

### RQ1

> *Apakah mendistilasi pergeseran komplementaritas (complementarity shift) dari teacher dual-view
> menghasilkan student ringan yang lebih baik daripada distilasi konvensional?*

### ❌ Jawaban yang SALAH

> "Ya, CSD meningkatkan QWK dibandingkan logit-KD dan feature-KD."

Salah karena seluruh CI memuat nol, dan pada run ini estimasi titik CSD **negatif** terhadap
no-distillation (−0,0024) dan feature-KD (−0,0143). Menulis ini akan langsung terbantah oleh
`fig_12_forest` yang ada di repositori yang sama.

### ✅ Jawaban yang BENAR — Format Dua Bagian

> **Sebagian.** CSD mentransfer pergeseran komplementaritas secara terukur lebih baik daripada
> seluruh baseline pada ketiga metrik mekanisme — ShiftL1 0,3509 (terendah), CosAgree +0,4361
> (tertinggi), dan BenefitCorr +0,3075 (tertinggi, 40% di atas runner-up). Namun transfer
> tersebut **tidak** menghasilkan peningkatan akurasi ordinal yang kredibel: ketiga perbandingan
> QWK yang dipra-registrasi menghasilkan selang kepercayaan yang memuat nol
> (vs no-distillation −0,0024 [−0,0336, +0,0285]; vs logit-KD +0,0077 [−0,0304, +0,0463];
> vs feature-KD −0,0143 [−0,0445, +0,0153]).
>
> **Kami melaporkan disosiasi ini sebagai temuan utama, bukan sebagai kegagalan.** Sinyal
> komplementaritas dapat didistilasi; distilasi itu belum terbukti menjadi akurasi ordinal yang
> lebih tinggi pada skala data ini.

**Mengapa ini jawaban yang kuat**, bukan jawaban yang lemah:

1. **Tereplikasi tiga kali.** Urutan mekanisme identik di run simple, efficient, dan enhanced —
   dari pelatihan independen dengan resolusi dan rezim seleksi berbeda.
2. **Sudah diberi kesempatan untuk berubah.** Run enhanced menambahkan empat perbaikan protokol
   (seleksi resep Stage A, kalibrasi threshold, sqrt class-balanced sampling, dua gate baru) yang
   ditetapkan **sebelum** eksekusi. Null-nya bertahan. Null yang bertahan setelah perbaikan yang
   dipra-registrasi jauh lebih informatif daripada null dari satu percobaan.
3. **Mekanismenya positif dan besar.** BenefitCorr +0,3075 vs +0,2193 bukan selisih remeh.

### RQ2

> *Apakah kuantisasi INT8 mempertahankan kualitas diagnostik pada model yang telah didistilasi?*

### ✅ Jawaban

> **Ya.** Tidak ada varian INT8 yang menunjukkan degradasi kredibel terhadap basis FP32 pada test
> internal: PTQ −0,0164 [−0,0360, +0,0023], QAT −0,0063 [−0,0293, +0,0175]. QAT INT8
> mempertahankan **99,0%** QWK validasi sambil memberi percepatan CPU **2,86×** dan pengecilan
> artefak **1,36×**. Digabung dengan distilasi, pipeline penuh menghasilkan model **119× lebih
> kecil** dan **19,3× lebih cepat** daripada teacher, dengan **81,7%** QWK teacher dipertahankan.
>
> Klaimnya adalah **non-inferioritas**, bukan peningkatan. Kami tidak menyatakan bahwa kuantisasi
> memperbaiki apa pun.

**Wajib disertakan** — satu-satunya perbandingan eksternal yang kredibel dalam seluruh studi:

> Pada partisi eksternal konfirmatori (Set-C DeepDRiD), QAT INT8 secara kredibel **lebih buruk**
> daripada PTQ INT8 (−0,0384 [−0,0826, −0,0006]) — arah yang **berlawanan** dengan hasil internal
> (+0,0101, tidak kredibel). Kriteria deployment kami memilih QAT berdasarkan retensi validasi;
> kriteria tersebut bersifat *engineering* dan dibekukan sebelum test dibuka. Ketidaksesuaian
> antara kriteria seleksi internal dan performa eksternal ini kami laporkan sebagai keterbatasan.

Menuliskan ini **memperkuat** paper. Penulis yang melaporkan hasil yang merugikan posisinya
sendiri jauh lebih dipercaya untuk hasil yang menguntungkannya.

---

## Bagian 2 — Struktur Paper yang Disarankan

### Abstrak — kerangka kalimat

```
[Masalah]     Skrining DR dua-lapang memerlukan model besar; klinik dengan sumber daya
              terbatas tidak dapat menjalankannya.
[Metode]      Kami memperkenalkan Complementarity-Shift Distillation (CSD), yang mendistilasi
              selisih Δ = p_dual − (p_macula + p_disc)/2 dari teacher dual-view ke student
              328.588-parameter, lalu mengkuantisasinya ke INT8.
[Hasil A]     CSD mentransfer pergeseran komplementaritas lebih baik daripada seluruh baseline
              pada ketiga metrik mekanisme (BenefitCorr +0,3075 vs +0,2193).
[Hasil B]     Namun transfer ini TIDAK menghasilkan QWK yang lebih tinggi secara kredibel;
              ketiga selang kepercayaan memuat nol.
[Hasil C]     Pipeline penuh mencapai kompresi 119×, percepatan 19,3×, retensi 81,7% QWK
              teacher, dan tidak ada degradasi INT8 yang kredibel.
[Kontribusi]  Kami melaporkan disosiasi antara transfer mekanisme dan hasil prediktif sebagai
              temuan utama, tereplikasi pada tiga run independen.
```

> **Aturan mutlak:** Hasil A dan Hasil B harus berada dalam **satu abstrak** dengan bobot yang
> setara. Abstrak yang hanya memuat A adalah menyesatkan.

### Kerangka Bab

| Bab | Isi | Sumber angka |
|---|---|---|
| **1. Pendahuluan** | Gap: tidak ada karya yang menggabungkan dual-view + KD + ringan + distilasi komplementaritas + kuantisasi | `references/README.md` (tabel gap) |
| **2. Karya Terkait** | CrossFiT (premis dual-view), Pink-MVAN (pembanding terdekat) | `references/` |
| **3. Metode** | CORAL ordinal, definisi Δ, `L_CSD = SmoothL1(Δ_S/s, Δ_T/s)` dengan `s = E_train[\|Δ_T\|] = 0,107276` | §5 RESULTS_OVERVIEW |
| **4. Setup Eksperimen** | DRTiD 800/200/550, APTOS pra-latih, DeepDRiD Set-C eksternal; 5 seed; protokol statistik | §1, §3c |
| **5. Hasil RQ1** | Dua sub-bab: **5.1 Prediktif (null)** dan **5.2 Mekanisme (positif)** | §2 |
| **6. Hasil RQ2** | Efisiensi + non-inferioritas + hasil eksternal | §3 |
| **7. Pembahasan** | Disosiasi, ketidakstabilan seleksi, resolusi sebagai pengungkit terbesar | §1, §5 |
| **8. Keterbatasan** | Enam butir di bawah — **jangan dipangkas** | §1 |
| **9. Kesimpulan** | Klaim berbatas | §10 |

> **Catatan urutan penting:** tulis §5.1 (null) **sebelum** §5.2 (mekanisme). Menyajikan hasil
> positif lebih dulu lalu null belakangan terbaca seperti upaya menutupi. Sebaliknya terbaca
> seperti kejujuran ilmiah.

### Figur yang Dimasukkan

| Prioritas | Figur | Alasan |
|---|---|---|
| **Wajib** | `fig_07_csd_mechanism` | Bukti terkuat untuk RQ1 mekanisme |
| **Wajib** | `fig_12_forest` | Menampilkan seluruh CI termasuk null — ini yang membuat paper dipercaya |
| **Wajib** | `fig_13_external_setc` | Validasi eksternal; caption harus memuat peringatan tumpang-tindih interval |
| **Wajib** | `fig_10_efficiency` atau `fig_11_pareto` | Cerita kompresi RQ2 |
| Disarankan | `fig_04_per_grade_recall` | Menampilkan masalah Grade 1 secara jujur |
| Disarankan | `fig_06_dual_view_gain` | Menegakkan premis dual-view |
| Lampiran | `fig_01`, `fig_03`, `fig_05`, `fig_08`, `fig_09`, `fig_14` | Pendukung |

Semua figur tersedia dalam `.pdf` (untuk LaTeX) dan `.svg`. Setiap figur punya `_caption.txt`
yang sudah ditulis untuk paper dan `_data.csv` berisi angka persis di baliknya.

### Tabel Utama yang Dimasukkan

1. **Tabel performa prediktif** — semua kondisi × QWK/Accuracy/MacroF1/MAE/SER (§3 RESULTS_OVERVIEW)
2. **Tabel mekanisme** — 4 kondisi × 3 metrik (§2b)
3. **Tabel efisiensi** — parameter, ukuran, latensi, percepatan (§3a)
4. **Tabel statistik pra-registrasi** — seluruh perbandingan dengan CI dan p Holm (§2a, §3b)
5. **Tabel eksternal Set-C** (§3c)

---

## Bagian 3 — Bab Keterbatasan (Jangan Dipangkas)

Salin enam butir ini. Semuanya terlihat dari berkas di repositori, jadi menghilangkannya justru
berisiko.

1. **Grade 1 hampir tidak pernah terdeteksi.** Recall Grade 1: teacher **0,000**, student
   **0,068**. NPDR ringan adalah kelas yang penting untuk deteksi dini, dan sistem ini tidak
   dapat diandalkan untuk itu. Ini adalah keterbatasan klinis paling serius dalam studi ini.

2. **Ketidakstabilan seleksi.** M\* dipilih sebagai `dual_csd` (val QWK 0,6490) tetapi menempati
   peringkat **3 dari 4** pada test (0,6018, di bawah feature-KD 0,6161 dan no-distillation
   0,6042). Selisih validasi terhadap runner-up hanya **0,0013**. Rezim seleksi memilih di antara
   metode-metode yang secara praktis tidak dapat dibedakan.

3. **Arah efek RQ1 tidak stabil antar run.** CSD vs no-distillation: **+0,0171** pada run simple,
   **−0,0024** pada run enhanced. Keduanya null, sehingga tidak saling bertentangan secara
   statistik, tetapi ketidakstabilan arah adalah bukti tambahan bahwa efek prediktifnya — jika
   ada — lebih kecil daripada yang dapat dideteksi 5 seed pada DRTiD.

4. **Efek fine-tuning eksternal tidak mereplikasi.** Run simple menemukan FT-PTQ unggul kredibel
   di Set-C (+0,0766) yang dapat dilacak ke fine-tuning, bukan kuantisasi. Run enhanced **tidak**
   menemukannya (`fp32_ft_control` −0,0121, tidak kredibel). Temuan run simple **tidak boleh**
   dikutip sebagai mapan.

5. **Kriteria deployment tidak selaras dengan performa eksternal.** QAT dipilih karena retensi
   validasi 99,0%, namun secara kredibel lebih buruk dari PTQ di Set-C (−0,0384
   [−0,0826, −0,0006]).

6. **Skala dan cakupan.** DRTiD 1.550 mata; teacher hanya 1 seed; ablasi hanya 3 seed dan tidak
   diuji statistik; pemetaan lapang DeepDRiD disimpulkan sehingga hasil eksternal dilaporkan pada
   kedua urutan lapang; ekspor ONNX gagal untuk model INT8 karena keterbatasan `torch.export`.

---

## Bagian 4 — Kalimat Klaim yang Aman

Gunakan persis. Setiap kalimat dapat dipertahankan dari data di repositori.

**Boleh ditulis:**

- "CSD mencapai kesetiaan transfer pergeseran tertinggi pada ketiga metrik mekanisme, tereplikasi
  pada tiga run independen."
- "Tidak ada perbandingan prediktif RQ1 yang mencapai signifikansi; seluruh selang kepercayaan
  memuat nol."
- "Pipeline penuh menghasilkan model 119× lebih kecil dan 19,3× lebih cepat yang mempertahankan
  81,7% QWK teacher."
- "Kuantisasi INT8 tidak menghasilkan degradasi kredibel pada test internal."
- "Fusi dual-view mengungguli lapang tunggal terbaik sebesar +0,0516 QWK pada student dan +0,0469
  pada teacher."
- "Skor keluaran adalah *Ordinal Threshold Score*, bukan probabilitas klinis terkalibrasi."

**Tidak boleh ditulis:**

- ❌ "CSD mengungguli logit-KD/feature-KD" — CI memuat nol
- ❌ "CSD meningkatkan akurasi diagnostik" — estimasi titik negatif pada run ini
- ❌ "Kuantisasi INT8 memperbaiki generalisasi" — tidak didukung; efek FT tidak mereplikasi
- ❌ "Model mencapai performa setingkat dokter spesialis" — tidak pernah diuji
- ❌ Angka apa pun tanpa selang kepercayaan yang menyertainya

---

## Bagian 5 — Pernyataan Kontribusi

Tulis tiga, dengan batasan yang melekat:

1. **Complementarity-Shift Distillation (CSD)** — tujuan distilasi yang menargetkan *selisih*
   antara prediksi dual-view dan agregat single-view, bukan logit akhir atau fitur perantara.
   *Batas: transfer mekanisme terbukti; keunggulan prediktif tidak.*

2. **Kerangka evaluasi disosiasi** — tiga metrik mekanisme (ShiftL1, CosAgree, BenefitCorr) yang
   mengukur apakah komplementaritas benar-benar berpindah, secara independen dari QWK. Inilah
   yang memungkinkan disosiasi terlihat dan bukan tersembunyi sebagai "metode gagal".

3. **Pipeline penyebaran end-to-end tervalidasi** — distilasi + kuantisasi + validasi eksternal
   dengan 36 gate integritas, audit-mandiri 265/265, dan artefak deployment terverifikasi.
   *Batas: kriteria seleksi internal terbukti tidak selaras dengan performa eksternal.*

---

## Bagian 6 — Menghadapi Pertanyaan Juri/Reviewer

**"Metode Anda tidak mengalahkan baseline. Mengapa ini layak dipublikasi?"**

> Karena studi ini mengukur sesuatu yang biasanya tidak diukur. Sebagian besar paper KD
> melaporkan akurasi akhir dan menyimpulkan mekanismenya bekerja. Kami mengukur mekanismenya
> secara langsung dan menemukan bahwa keduanya dapat terpisah: sinyal berpindah, akurasi tidak
> mengikuti. Kami mereplikasi ini tiga kali, termasuk pada run dengan empat perbaikan protokol
> yang dipra-registrasi. Hasil null yang tereplikasi dan terukur mekanismenya lebih bernilai
> daripada peningkatan 0,01 QWK yang tidak dapat direproduksi.

**"Mengapa memilih dual_csd sebagai M\* padahal feature-KD lebih baik di test?"**

> Karena seleksi dilakukan pada validasi dan dibekukan sebelum test dibuka. Melihat test lalu
> mengganti M\* akan membatalkan seluruh protokol. Selisih validasinya 0,0013 — kami melaporkan
> ini sebagai ketidakstabilan seleksi di bab keterbatasan.

**"Mengapa mendeploy QAT jika PTQ lebih baik secara eksternal?"**

> Aturan deployment dibekukan sebelum run dan hanya boleh menggunakan validasi: retensi ≥95%,
> severe error tidak lebih buruk, latensi terendah. PTQ gagal ambang retensi (93,4%). Hasil
> eksternal kami peroleh setelahnya dan kami laporkan apa adanya sebagai keterbatasan.

**"Apakah ini dapat digunakan di klinik?"**

> Tidak. Ini prototipe riset, bukan alat medis. Recall Grade 1 sebesar 0,068 saja sudah
> mendiskualifikasinya untuk penggunaan mandiri. Kontribusinya adalah metodologis.

---

## Bagian 7 — Checklist Sebelum Submit

- [ ] Abstrak memuat hasil mekanisme **dan** hasil null dengan bobot setara
- [ ] Setiap angka QWK disertai selang kepercayaan
- [ ] `fig_12_forest` disertakan (menampilkan null secara jujur)
- [ ] Bab keterbatasan memuat keenam butir, termasuk Grade 1 dan ketidaksesuaian QAT eksternal
- [ ] Catatan kaki menjelaskan `best_fp32` = `csd_fp32` (model yang sama, karena M\* = dual_csd)
- [ ] Perbedaan run simple vs enhanced dinyatakan (arah RQ1, efek FT eksternal)
- [ ] Tidak ada klaim "mengungguli" untuk perbandingan yang CI-nya memuat nol
- [ ] Disclaimer medis muncul di paper dan demo
- [ ] Keluaran disebut *Ordinal Threshold Score*, bukan "confidence" atau "probabilitas"
- [ ] Angka teacher ditandai sebagai 1 seed (bukan rerata)

---

*Panduan ini dibuat dari run `artifacts_enhanced_v1_20260811` (36/36 gate lolos). Untuk detail
angka lihat `RESULTS_OVERVIEW.md` di folder yang sama.*
