# final-results-documentation/

Semua dokumen analisis hasil akhir DR-VERGE ada di sini. Folder ini menjawab satu pertanyaan:
**apa hasil penelitian ini, dan apa yang harus ditulis di paper?**

---

## 🚀 Mulai dari Sini

| Kalau Anda ingin… | Baca ini | Waktu |
|---|---|---|
| **Memahami hasil final secara menyeluruh** | **[`final-explanation.md`](final-explanation.md)** | ~20 menit |
| Menulis paper sekarang juga | [`final-explanation.md`](final-explanation.md) §12–13 | ~5 menit |
| Tahu run mana yang dipakai dan kenapa | [`final-comparison.md`](final-comparison.md) §1 | ~3 menit |
| Detail teknis run utama | [`overview-result-enhanched-notebook.md`](overview-result-enhanched-notebook.md) | ~15 menit |

> **Kalau hanya punya waktu untuk satu dokumen: baca [`final-explanation.md`](final-explanation.md).**
> Dokumen itu memuat jawaban RQ1, jawaban RQ2, empat kontribusi, angka untuk dikutip, dan kerangka
> bab paper — semuanya dari run utama.

---

## Isi Folder

### 📌 Dokumen Utama

#### [`final-explanation.md`](final-explanation.md)
**Dokumen final dan paling lengkap.** Basis penulisan paper.

Isinya: intisari satu halaman · posisi terhadap Pink-MVAN · masalah dan celah penelitian ·
metode (definisi CSD, CORAL, pipeline tiga tahap) · **jawaban RQ1** (mekanisme 9/9 + ekuivalensi
prediktif + disosiasi) · **jawaban RQ2** (efisiensi + non-inferioritas) · validasi eksternal
Set-C · **empat kontribusi** · trade-off desain dan wawasan · alasan run enhanced jadi utama ·
integritas 36 gate · **angka siap kutip** · kerangka bab paper + daftar figur wajib.

Angka kunci: `119× lebih kecil` · `19,3× lebih cepat` · `11,35 ms CPU` · `81,7% QWK teacher` ·
`CSD unggul 9/9 metrik mekanisme` · `36/36 gate`.

#### [`final-comparison.md`](final-comparison.md)
**Perbandingan tiga run** (efficient · simple · enhanced) secara menyeluruh: integritas,
metodologi, performa absolut, hasil RQ, dan replikasi lintas run.

Baca ini kalau Anda perlu **membenarkan mengapa run enhanced yang dipakai**, atau perlu tahu
persis temuan mana yang tereplikasi di ketiga run.

---

### 📊 Ringkasan per Run

Ketiganya memakai format sama: verdict → integritas → RQ1 → RQ2 → saran paper.

| Dokumen | Run | Peran |
|---|---|---|
| [`overview-result-enhanched-notebook.md`](overview-result-enhanched-notebook.md) | `artifacts_enhanced_v1_20260811` | 🥇 **UTAMA** — 36/36 gate, seluruh angka headline |
| [`overview-result-simple-notebook.md`](overview-result-simple-notebook.md) | `artifacts_final_locked_simple_last_20260810` | 🥈 **PENDUKUNG** — 32/32 gate, replikasi mekanisme + bukti eksternal CSD |
| [`overview-result-efficient-notebook.md`](overview-result-efficient-notebook.md) | `artifacts_final_efficient_20260810` | 🥉 Arsip — replikasi mekanisme ketiga |

**Mengapa enhanced jadi utama:** protokol paling ketat (seleksi resep Stage A + kalibrasi ambang +
audit-mandiri hasil), gate terbanyak (36), dan performa absolut tertinggi (teacher QWK 0,7364;
student 0,6018).

**Mengapa simple tetap dikutip:** ia mereplikasi temuan mekanisme secara independen, menyediakan
kontras eksternal CSD-vs-M\* yang tidak dapat diuji di run enhanced, dan menawarkan titik Pareto
efisiensi @224 (6,22 ms).

---

### 💬 Catatan Analisis Tambahan

Dokumen berikut adalah **catatan diskusi dan tinjauan silang**, bukan sumber angka. Berguna untuk
memahami *bagaimana* kesimpulan disusun, dan sebagai pembanding sudut pandang.

| Dokumen | Isi |
|---|---|
| [`gpt-paper.md`](gpt-paper.md) | Usulan struktur paper: framing kontribusi, penomoran RQ, draf bagian hasil |
| [`comparison-gpt.md`](comparison-gpt.md) | Tinjauan silang perbandingan ketiga notebook |
| [`gpt-response-to-claude.md`](gpt-response-to-claude.md) | Tanggapan atas `final-comparison.md`; pembahasan framing kontribusi vs Pink-MVAN |

> ⚠ **Kalau ada angka yang berbeda antara dokumen catatan dan dokumen utama, yang berlaku adalah
> dokumen utama** — `final-explanation.md` dan `overview-result-enhanched-notebook.md` bersumber
> langsung dari keluaran notebook tereksekusi.

---

## Alur Baca yang Disarankan

### Untuk menulis paper
```
1. final-explanation.md                    ← seluruh substansi
2. final-explanation.md §12                ← salin angka
3. final-explanation.md §13                ← kerangka bab + figur wajib
4. gpt-paper.md                            ← pembanding struktur (opsional)
```

### Untuk memahami penelitian dari nol
```
1. final-explanation.md §1–4               ← masalah, celah, metode
2. final-explanation.md §5–7               ← RQ1, RQ2, eksternal
3. overview-result-enhanched-notebook.md   ← detail teknis run utama
4. final-comparison.md                     ← konteks lintas run
```

### Untuk memverifikasi klaim
```
1. overview-result-enhanched-notebook.md §7  ← laporan 36 gate
2. ../enhanched-notebook/                    ← notebook tereksekusi + 14 figur
3. ../enhanched-notebook/figures/*_data.csv  ← angka mentah di balik tiap figur
```

---

## Jawaban Singkat RQ

Versi lengkap ada di [`final-explanation.md`](final-explanation.md) §5 dan §6.

**RQ1 — Apakah distilasi pergeseran komplementaritas bekerja?**
> **Ya, pada sumbu yang dirancang untuk diukurnya.** CSD unggul pada **seluruh tiga metrik
> mekanisme** (ShiftL1 0,3509 · CosAgree +0,4361 · BenefitCorr +0,3075), tereplikasi **9/9 lintas
> tiga run independen**, sementara performa prediktifnya **setara secara statistik** dengan seluruh
> baseline. Kesetiaan mekanisme diperoleh **tanpa biaya akurasi**.

**RQ2 — Apakah kuantisasi INT8 mempertahankan kualitas diagnostik?**
> **Ya, sepenuhnya.** Tidak ada degradasi kredibel (PTQ −0,0164 [−0,0360, +0,0023]; QAT −0,0063
> [−0,0293, +0,0175]). QAT INT8 mempertahankan **99,0%** QWK validasi. Pipeline penuh: **119×
> lebih kecil**, **19,3× lebih cepat**, **81,7% QWK teacher**, **11,35 ms per mata di CPU**.

---

## Terkait

| Tujuan | Lokasi |
|---|---|
| Notebook tereksekusi + 14 figur | [`../enhanched-notebook/`](../enhanched-notebook/) |
| Panduan menulis paper per bagian | [`../enhanched-notebook/PANDUAN_PAPER.md`](../enhanched-notebook/PANDUAN_PAPER.md) |
| Run pendukung | [`../simple-notebook/`](../simple-notebook/) |
| Kode pipeline | [`../../pipeline/`](../../pipeline/) |
| Argumen penelitian & literatur | [`../../../research/`](../../../research/) |
| Panduan deploy model | [`../../../research/knowledge/deployment-guide.md`](../../../research/knowledge/deployment-guide.md) |

---

> **Disclaimer.** DR-VERGE adalah prototipe riset, bukan alat medis. Keluaran model adalah
> *Ordinal Threshold Score*, bukan probabilitas klinis terkalibrasi, dan tidak boleh dipakai untuk
> perawatan pasien tanpa peninjauan klinisi.
