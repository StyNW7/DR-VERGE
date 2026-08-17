# Run Enhanced — DR-VERGE

**Run utama penelitian ini.** Tindak lanjut yang dipra-registrasi dari run *simple*, dengan
protokol yang lebih ketat.

```
Run ID   : artifacts_enhanced_v1_20260811
Tanggal  : 11 Agustus 2026
Perangkat: NVIDIA A100-SXM4-80GB (Google Colab)
Status   : 36/36 gate lolos · 0 error · FINAL_RUN_COMPLETE.txt tertulis
```

---

## Isi Folder

| Berkas | Isi |
|---|---|
| **[`RESULTS_OVERVIEW.md`](RESULTS_OVERVIEW.md)** | **Baca ini dulu.** Seluruh hasil, penilaian jujur atas kekuatan dan kelemahan, jawaban RQ1 & RQ2, verifikasi integritas |
| `full_pipeline_notebook_enhanced.ipynb` | Notebook tereksekusi lengkap dengan seluruh keluaran |
| `outputs/results/figures/` | 14 figur × 5 berkas (`.png` `.svg` `.pdf` `_caption.txt` `_data.csv`) |
| `outputs/results/tables/` | 34 tabel hasil dalam `.csv` — angka mentah di balik setiap klaim |
| `outputs/results/predictions/` | Prediksi per sampel untuk setiap model, seed, dan partisi |
| `outputs/configs/` | Konfigurasi terkunci, manifest split, info kuantisasi, versi paket persis |

> **Baca `RESULTS_OVERVIEW.md` sebelum membuka figur mana pun.** Sebuah figur tanpa konteks
> hasilnya mudah disalahtafsirkan — terutama `fig_07` yang menampilkan keunggulan mekanisme CSD
> tanpa menampilkan bahwa hasil prediktifnya null.

---

## Hasil dalam Sepuluh Baris

```
Teacher       : 40.313.932 parameter · test QWK 0,7364 · 154,09 MB · 627,6 ms
Student (M*)  : 328.588 parameter    · test QWK 0,6018 ·   1,29 MB ·  32,6 ms
Deployment    : qat_int8 seed 42     ·   0,95 MB · 11,35 ms · retensi validasi 99,0%
Kompresi      : 119,0x lebih kecil · 19,3x lebih cepat · 81,7% QWK teacher dipertahankan
Eksternal     : Set-C QWK 0,6688 (student) vs 0,7923 (teacher) — retensi 84,4%

RQ1 prediktif : NULL — 3/3 perbandingan, seluruh CI memuat nol
RQ1 mekanisme : CSD UNGGUL 3/3 metrik (ShiftL1 0,3509 · CosAgree +0,4361 · BenefitCorr +0,3075)
RQ2           : tidak ada degradasi INT8 yang kredibel; QAT retensi 99,0%
Integritas    : 36/36 gate · audit-mandiri 265/265 nilai cocok
```

---

## Temuan Inti: Disosiasi

CSD **berhasil** mentransfer pergeseran komplementaritas — terbaik pada ketiga metrik mekanisme,
tereplikasi di tiga run independen. CSD **tidak** menghasilkan QWK yang lebih tinggi secara
kredibel — ketiga selang kepercayaan memuat nol, dan pada run ini estimasi titiknya bahkan
negatif terhadap no-distillation.

**Kedua bagian ini adalah temuannya.** Melaporkan hanya salah satunya adalah menyesatkan.

---

## Empat Perubahan Protokol yang Dipra-registrasi

Ditetapkan **sebelum** run dieksekusi:

1. **Seleksi resep Stage A** — 224/384 × standard/balanced, dipilih sebelum teacher dilatih
   → terpilih **384/standard** (val QWK 0,6491 vs 0,5549)
2. **Kalibrasi threshold** — satu `t*` global per kondisi, hanya dari validasi
3. **sqrt class-balanced sampling** pada loader pelatihan
4. **Dua gate integritas baru**, termasuk audit-mandiri hasil yang bersifat *blocking*

Aturan pelaporan yang ikut dibekukan: **jika run simple dan enhanced berbeda, keduanya
dilaporkan.** Aturan ini kini berlaku pada dua butir (arah efek RQ1, efek fine-tuning eksternal)
— lihat §9 `RESULTS_OVERVIEW.md`.

---

## Catatan tentang Figur

✅ Penamaan folder ini **bersih**: `fig_01_dataset` … `fig_14_internal_vs_external`, tanpa
duplikasi. Masalah dua `fig_13` berbeda yang ada pada folder run *simple* **tidak terjadi di
sini** — folder ini aman dikutip langsung.

Tiga figur yang memikul paper:

| Figur | Menampilkan |
|---|---|
| `fig_07_csd_mechanism` | CSD unggul pada ketiga panel mekanisme |
| `fig_12_forest` | Seluruh perbandingan dengan CI — null RQ1 tampil jujur |
| `fig_13_external_setc` | Hasil Set-C DeepDRiD |

---

## Terkait

- Run pendukung → [`../simple-notebook/`](../simple-notebook/) · [`../efficient-notebook/`](../efficient-notebook/)
- Perbandingan lintas run → [`../final-results-documentation/final-comparison.md`](../final-results-documentation/final-comparison.md)
- Kode pipeline → [`../../pipeline/`](../../pipeline/)
- Argumen penelitian → [`../../../research/`](../../../research/)
- Demo yang menjalankan model ini → [`../../../frontend/`](../../../frontend/)

---

> **Disclaimer.** Prototipe riset, bukan alat medis. Recall Grade 1 sebesar 0,068 saja sudah
> mendiskualifikasinya untuk penggunaan klinis mandiri. Keluaran model adalah *Ordinal Threshold
> Score*, bukan probabilitas klinis terkalibrasi.
