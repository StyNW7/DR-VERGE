# Perbandingan Hasil: Simple vs Efficient — Dibandingkan dengan PINK-MVAN

**Tujuan dokumen:** memutuskan hasil run mana yang dipakai di paper, dengan tolok ukur
`past-paper-reference/PINK-MVAN - Juara 1 GemasTIK - KTI 2026.pdf`.

> **Kesimpulan: gunakan hasil notebook SIMPLE.** Ia menang pada hampir semua sumbu — termasuk
> sumbu efisiensi yang menjadi kunci kemenangan PINK-MVAN — dan memiliki bukti statistik yang jauh
> melampaui standar paper juara tersebut.

---

## 1. Tolok Ukur: Apa yang Sebenarnya Dilaporkan PINK-MVAN

Penting memahami standar yang sesungguhnya, bukan yang kita bayangkan.

**Yang mereka lakukan:**

| Aspek | PINK-MVAN |
|---|---|
| Dataset | CBIS-DDSM, 3.568 citra |
| Tugas | **biner** (jinak / ganas) |
| Arsitektur | ResNet-50 multi-view (guru) → depthwise-separable multi-view (siswa) |
| Metode | Knowledge distillation + post-training quantization |
| Metrik | Akurasi, Precision, Recall, F1 (macro) |
| Panjang | **6 halaman**, 3 tabel, 3 gambar |

**Hasil utama mereka:**

| Model | Akurasi | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| ResNet-50 (Guru) | 72,79 | 82,60 | 52,28 | 65,52 |
| PINK-MVAN (Siswa) | 63,95 | 59,50 | **75,70** | **66,60** |

| Efisiensi | Guru | Siswa |
|---|---:|---:|
| Ukuran | ≈289 MB | **0,059 MB** (99,9% lebih kecil) |
| Latensi CPU | ≈290 ms | **≈36,4 ms** (8× lebih cepat) |

**Yang TIDAK mereka lakukan — dan ini penting:**

- ❌ **Tidak ada uji statistik sama sekali** — tanpa confidence interval, tanpa p-value
- ❌ **Tanpa multi-seed** — setiap angka berasal dari satu run tunggal
- ❌ **Tanpa validasi eksternal** — hanya test set CBIS-DDSM
- ❌ Tanpa pelaporan integritas run (gate/sanity check)

**Yang mereka lakukan dengan baik dan patut ditiru:**

- ✅ Cerita efisiensi yang dramatis dan mudah diingat (99,9% lebih kecil, 8× lebih cepat)
- ✅ **Jujur soal kelemahan**: mengakui F1 mereka (66,60) sedikit di bawah pembanding
  Tschuchnig dkk. (67,40), dan performa diagnostik siswa "masih tertinggal"
- ✅ Studi ablasi ringkas: 3 varian + 1 pembanding eksternal, dalam **satu tabel**
- ✅ Padat — 6 halaman, tidak bertele-tele

---

## 2. Head-to-Head pada Sumbu PINK-MVAN (Efisiensi)

Inilah sumbu yang memenangkan PINK-MVAN. Kedua run kita diletakkan dalam format Tabel 2 mereka:

| | Ukuran guru | Ukuran INT8 | Reduksi | Latensi guru | Latensi INT8 | **Percepatan** |
|---|---:|---:|---:|---:|---:|---:|
| PINK-MVAN | 289 MB | 0,059 MB | 99,9% | 290 ms | 36,4 ms | **8,0×** |
| **Efficient** | 154 MB | 0,958 MB | 99,4% | 244 ms | 8,65 ms | **28,2×** |
| **Simple** | 154 MB | **0,952 MB** | 99,4% | 271 ms | **6,22 ms** | **43,6×** |

**Bacaan yang jujur:**

- Model siswa PINK-MVAN **lebih kecil secara absolut** (0,059 MB vs 0,95 MB) — wajar, karena tugas
  mereka biner dengan backbone yang lebih mungil, sedangkan kita 5 kelas ordinal dengan dua kepala
  auxiliary.
- Namun **percepatan inferensi kita jauh lebih besar**: 43,6× (Simple) vs 8,0×. Ini angka yang
  layak menjadi headline.
- ⚠ **Jangan mengklaim "kami mengalahkan PINK-MVAN".** Tugas, dataset, framework, dan perangkat
  keras berbeda. Yang boleh dikatakan: *"efisiensi yang dicapai sebanding dengan, dan pada sumbu
  latensi melampaui, pendekatan kompresi hibrida terkini pada domain citra medis multi-view."*

**Pemenang sumbu efisiensi: SIMPLE** (6,22 ms vs 8,65 ms; 43,6× vs 28,2×).

---

## 3. Head-to-Head pada Sumbu Ilmiah

Di sinilah kedua notebook kita **melampaui jauh** standar PINK-MVAN — dan Simple melampaui Efficient.

| Aspek | PINK-MVAN | Efficient | **Simple** |
|---|---|---|---|
| Gate integritas | tidak dilaporkan | 16/17 | **32/32** |
| Seed per kondisi | 1 | 5 | **5** |
| Seleksi hyperparameter | tidak dijelaskan | 1 seed | **rata-rata 3 seed** |
| Confidence interval | ❌ | ✅ cluster bootstrap | ✅ cluster bootstrap |
| Uji permutasi | ❌ | ✅ 5.000 | ✅ **10.000** |
| Koreksi multiplisitas | ❌ | 1 famili | ✅ **Holm per famili** |
| Validasi eksternal | ❌ | DeepDRiD train/val | ✅ **Set-C konfirmatori** |
| Seed RQ2 | 1 | 3 (1v1 untuk PTQ) | ✅ **5 berpasangan** |
| Peringatan collapse | tidak dilaporkan | 10 kondisi | ✅ **0 kondisi** |
| Ekspor ONNX | tidak disebut | ❌ gagal | ✅ berhasil + uji paritas |

**Ini adalah keunggulan kompetitif terbesar paper Anda.** Paper juara 1 tahun lalu tidak memiliki
satu pun interval kepercayaan. Anda memiliki 45 perbandingan dengan bootstrap 10.000, uji permutasi,
koreksi Holm, dan validasi eksternal pada partisi yang benar-benar disisihkan.

---

## 4. Head-to-Head pada Hasil Substantif

| | Efficient | **Simple** | Catatan |
|---|---|---|---|
| Teacher QWK | 0,6610 | 0,6544 | setara |
| Keunggulan dual-view guru | +0,0863 | **+0,1143** | Simple lebih kuat |
| M\* terpilih | feature-KD | logit-KD | berbeda |
| QWK student (test) | 0,4990 | **0,5546** | **Simple +0,056** |
| Retensi QWK guru | 75,5% | **84,7%** | **Simple jauh lebih baik** |
| RQ1 vs feature-KD | **kredibel LEBIH BURUK** (p=0,005) | null | **Simple lebih aman** |
| Shift fidelity | CSD terbaik (4/4) | CSD terbaik (3/3) | **sepakat — tereplikasi** |
| Eksternal | tanpa Set-C | **Set-C: CSD 0,735 vs M\* 0,644** | Simple punya partisi konfirmatori |
| Macro-F1 | ~0,35 | ~0,34 | setara, sama-sama rendah |
| Latensi deployment | 8,65 ms | **6,22 ms** | Simple lebih cepat |

### Satu jebakan yang harus dipahami

Sekilas, retensi INT8 Efficient **terlihat lebih baik**: 100,2% dan 100,6% vs 98,3% dan 94,7% milik
Simple. Pembaca awam akan memilih Efficient.

**Itu keliru.** Angka Efficient bertumpu pada perbandingan **1 seed vs 1 seed** (PTQ) dan **3 vs 1**
(QAT) — intervalnya berasal dari resampling mata, bukan dari variasi model. Angka Simple bertumpu
pada **5 seed berpasangan penuh**. Retensi Simple lebih rendah tetapi **jauh lebih dapat dipercaya**.
Retensi di atas 100% adalah noise, bukan bukti bahwa kuantisasi memperbaiki model.

**Prinsipnya: pilih angka yang benar, bukan angka yang bagus.**

---

## 5. Keputusan: Gunakan SIMPLE

| Sumbu | Pemenang |
|---|---|
| Efisiensi (sumbu PINK-MVAN) | **Simple** — 6,22 ms, 43,6× |
| Retensi terhadap guru | **Simple** — 84,7% vs 75,5% |
| Ketelitian statistik | **Simple** — 5 seed RQ2, Holm per famili |
| Validasi eksternal | **Simple** — Set-C konfirmatori |
| Integritas run | **Simple** — 32/32, 0 collapse |
| Keamanan klaim RQ1 | **Simple** — null, bukan kalah kredibel |
| Kesiapan deployment | **Simple** — ONNX berhasil + `selected_deployment/` |

**Tidak ada satu sumbu pun di mana Efficient lebih unggul secara ilmiah.**

**Peran Efficient:** jadikan *robustness check* satu paragraf. Fakta bahwa peringkat shift fidelity
(CSD terbaik) **tereplikasi pada dua run independen dengan rezim seleksi hyperparameter berbeda**
adalah bukti yang jauh lebih kuat daripada satu run saja. Laporkan juga perbedaannya (M\* berbeda,
retensi INT8 berbeda) — bukan hanya kesamaannya.

---

## 6. Di Mana Kita Lebih Lemah dari PINK-MVAN

Jujur pada diri sendiri sebelum juri yang menemukan.

| Kelemahan | Detail | Mitigasi |
|---|---|---|
| **Headline RQ1 null** | PINK-MVAN punya klaim positif bersih (F1 siswa 66,60 > guru 65,52). RQ1 kita tidak menemukan keunggulan prediktif. | Bingkai sebagai **disosiasi mekanisme–prediksi**; RQ1 Anda memang menanyakan *transfer*, dan transfer itu terbukti |
| Macro-F1 rendah | ~0,34 vs F1 mereka 66,60 (tugas biner, tidak sebanding langsung) | Sebutkan tugas 5-kelas ordinal jauh lebih sulit; gunakan QWK sebagai metrik utama |
| Model siswa lebih besar | 0,95 MB vs 0,059 MB | Jelaskan: 5 kelas + dua kepala auxiliary + fusi interaksi |
| Severe error ~0,26 | satu dari empat mata meleset ≥2 derajat | Tulis di Limitations |

---

## 7. Rencana Konkret Paper (Meniru Struktur PINK-MVAN)

PINK-MVAN memenangkan lomba dengan **6 halaman, 3 tabel, 3 gambar**. Kita punya 24 tabel dan 14
gambar — **jangan dimasukkan semua**. Pilih dengan disiplin.

### Tabel (maksimal 4)

| # | Isi | Sumber |
|---|---|---|
| **1** | Kinerja diagnostik: guru vs 4 kondisi student (QWK, Akurasi, Macro-F1, MAE, Severe Error) | `table_predictive_performance.csv` |
| **2** | **Efisiensi** — tiru Tabel 2 PINK-MVAN persis: ukuran + latensi CPU, guru vs FP32 vs INT8 | `table_efficiency.csv` |
| **3** | Uji statistik: ΔQWK + CI 95% + p permutasi + p Holm untuk seluruh perbandingan terdaftar | `table_statistics_primary.csv` |
| **4** | Ablasi CSD + validasi eksternal Set-C | `table_csd_mechanism.csv` + `table_external_ci.csv` |

Tabel 3 adalah **pembeda utama** Anda — PINK-MVAN tidak memilikinya sama sekali.

### Gambar (maksimal 4)

| # | Gambar | Alasan |
|---|---|---|
| **1** | Arsitektur / alur kerja (buat sendiri) | PINK-MVAN punya 2 gambar arsitektur; ini standar |
| **2** | `fig_07_csd_mechanism` | **bukti terkuat RQ1** — CSD unggul di ketiga panel |
| **3** | `fig_12_forest` | menampilkan CI seluruh perbandingan; sangat jarang di paper KTI |
| **4** | `fig_13_external_setc` | validasi eksternal — PINK-MVAN tidak punya |

### Struktur bab (mengikuti PINK-MVAN)

```
I.   Pendahuluan            — SDG 3, kesenjangan radiolog, rasio 0,02/1.000 penduduk
II.  Studi Literatur        — CORAL, KD, kuantisasi, dual-view fundus
III. Metodologi             — dataset, arsitektur guru/siswa, CSD, protokol terkunci
IV.  Hasil dan Analisis
     A. Kinerja Diagnostik  — Tabel 1, RQ1 sumbu QWK
     B. Transfer Shift      — Tabel 4 + Gambar 2, RQ1 sumbu shift fidelity  ← INTI RQ1
     C. Efisiensi Komputasi — Tabel 2, RQ2
     D. Analisis Statistik  — Tabel 3 + Gambar 3   ← PEMBEDA
     E. Validasi Eksternal  — Gambar 4             ← PEMBEDA
V.   Kesimpulan
```

### Kalimat kunci yang bisa langsung dipakai

**Untuk RQ1:**
> CSD mereproduksi struktur *cumulative ordinal prediction shift* milik guru secara lebih setia
> dibanding logit-KD, feature-KD, maupun tanpa distilasi, unggul pada ketiga metrik shift fidelity
> (ShiftL1 0,432; CosAgree +0,426; BenefitCorr +0,290) — peringkat yang tereplikasi pada dua run
> independen. Transfer ini tidak menghasilkan perbedaan QWK yang kredibel pada data internal
> (│ΔQWK│ ≤ 0,025; seluruh interval melewati nol), namun pada partisi eksternal konfirmatori model
> CSD mencatat QWK student tertinggi (0,735 vs 0,644).

**Untuk RQ2:**
> Kuantisasi INT8 memperkecil artefak model 99,4% terhadap guru dan mempercepat inferensi CPU
> **43,6×** (271 ms → 6,22 ms), dengan retensi QWK 94,7–98,3% terhadap model FP32 terpilih. PTQ
> tidak menunjukkan penurunan yang kredibel (ΔQWK −0,009; CI mencakup nol).

---

## 8. Catatan Kualitas (Pelajaran dari PINK-MVAN)

Satu hal yang **tidak** boleh ditiru: paper PINK-MVAN memuat inkonsistensi internal — abstrak
menyebut recall siswa 68,50% sedangkan Tabel 1 dan Tabel 3 menyebut 75,70%. Bahkan paper juara pun
bisa lolos dengan angka yang tidak sinkron antar bagian.

**Pastikan setiap angka di paper Anda dapat ditelusuri ke satu berkas CSV**, dan lakukan pengecekan
silang abstrak ↔ tabel ↔ teks sebelum submit. Anda memiliki keunggulan di sini: seluruh angka
tersimpan di `artifacts_final_locked_simple_last_20260810/results/`.

**Sebelum menulis, rapikan dulu:** ada 3 gambar nyasar dari run efficient di dalam
`simple-notebook/figures-simple-notebook/` — termasuk **dua berkas `fig_13` yang berbeda**. Hapus
agar tidak salah kutip.

---

## 9. Ringkasan Satu Paragraf

Gunakan hasil **notebook Simple**. Pada sumbu yang memenangkan PINK-MVAN — efisiensi — Simple lebih
unggul (6,22 ms, percepatan 43,6× vs 8,0×), dan pada sumbu yang tidak mereka miliki sama sekali —
ketelitian statistik dan validasi eksternal — Simple jauh melampaui standar tersebut (32/32 gate,
5 seed berpasangan, bootstrap 10.000, Holm per famili, Set-C konfirmatori). Kelemahan utama adalah
RQ1 yang null pada sumbu prediktif; bingkai sebagai disosiasi mekanisme–prediksi, karena RQ1 Anda
memang menanyakan kemampuan *transfer*, dan pada pertanyaan itu jawabannya positif serta
tereplikasi. Gunakan run Efficient hanya sebagai *robustness check* satu paragraf.

*Ringkasan hasil lengkap dalam Bahasa Indonesia: `simple-notebook/OVERVIEW_ID.md`.*
