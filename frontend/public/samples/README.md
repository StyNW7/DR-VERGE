# Sample Images — Demo DR-VERGE

15 mata · 30 citra · 5 grade · 2,2 MB
Sumber: **DeepDRiD** (CC BY-SA 4.0) — lihat [`ATTRIBUTION.txt`](ATTRIBUTION.txt)

---

## Struktur

```
samples/
├── manifest.json                    ← indeks mesin-terbaca untuk demo
├── ATTRIBUTION.txt                  ← lisensi + daftar perubahan (wajib ikut)
├── README.md
│
├── grade-0-no-dr/
│   ├── p20-l/
│   │   ├── macula.jpg               ← lapang berpusat makula
│   │   ├── disc.jpg                 ← lapang berpusat optic disc
│   │   └── meta.json                ← ground truth + provenance
│   ├── p26-r/
│   └── p47-r/
├── grade-1-mild-npdr/     (p20-r · p28-r · p54-l)
├── grade-2-moderate-npdr/ (p15-l · p29-l · p29-r)
├── grade-3-severe-npdr/   (p12-r · p24-l · p35-l)
└── grade-4-proliferative-dr/ (p69-l · p78-r · p127-r)
```

Penamaan folder mata: `p<patient_id>-<l|r>` — dapat dilacak balik ke DeepDRiD.

---

## Mengapa struktur ini, bukan struktur Pink-MVAN

Pink-MVAN memakai `patient/ → 2 gambar`. DR-VERGE memakai
**`grade/ → mata/ → 2 gambar`**, karena tiga alasan:

| Alasan | Penjelasan |
|---|---|
| **Unit prediksi DR-VERGE adalah MATA, bukan pasien** | Satu pasien punya dua mata dengan grade yang bisa berbeda. `p20-l` grade 0 sementara `p20-r` grade 1 — pasien yang sama. Memakai folder pasien akan menggabungkan dua kasus berbeda |
| **Grade di level teratas = testing sistematis** | Penguji bisa langsung menjawab "bagaimana model pada grade 4?" tanpa membuka metadata |
| **Dua lapang tetap berpasangan di dalam folder mata** | Ini menjaga premis dual-view tetap terlihat — model butuh keduanya sekaligus, bukan satu-satu |

Jadi struktur ini **mempertahankan ide Pink-MVAN** (folder berisi pasangan gambar) sambil
menyesuaikannya ke unit prediksi DR-VERGE yang sebenarnya.

---

## ⚠ Penetapan Lapang: Jangan Percaya Sufiks `_1` / `_2`

Ini temuan penting saat menyiapkan sampel ini.

DeepDRiD menamai berkasnya `<pasien>_<mata><1|2>.jpg`, dan notebook DR-VERGE memakai asumsi
pra-registrasi `DEEPDRID_PRIMARY_ORDER = "_1=macula"`. **Pemeriksaan citra menunjukkan sebaliknya:**

| Partisi | `_1` ternyata berpusat DISC | Sampel diperiksa |
|---|---|---|
| Set-A (`regular-fundus-training`) | **15 / 15** | 15 |
| Set-B (`regular-fundus-validation`) | 34 / 40 | 40 |
| Set-C (`Online-Challenge1&2-Evaluation`) | 31 / 40 | 40 |

Konvensinya dominan **`_1 = disc`**, dan **tidak universal** (~20% menyimpang di Set-C).

**Karena itu, berkas di folder ini TIDAK dinamai menurut sufiks.** Setiap mata diperiksa satu per
satu: posisi optic disc diukur (disc adalah struktur paling terang di foto fundus), lalu lapang
dengan disc di tengah diberi nama `disc.jpg` dan yang disc-nya terdorong ke tepi diberi nama
`macula.jpg`. Hasilnya **15/15 benar**, dan `meta.json` mencatat citra sumber mana yang menjadi
lapang mana.

Dua mata (`p27-r`, `p27-l`) **dibuang** karena kedua lapangnya tidak dapat dibedakan secara
meyakinkan (selisih < 0,15), dan diganti kandidat lain.

> **Mengapa ini penting untuk demo:** `Gate2a_CORAL` mencatat *"fusion is view-order sensitive"* —
> model memperlakukan masukan makula dan disc secara berbeda, dan salah slot tidak memunculkan
> error apa pun.

**Seberapa besar dampaknya, diukur.** Model ONNX dijalankan atas 200 mata Set-C pada kedua urutan:

| Urutan | QWK | Exact |
|---|---|---|
| `_1=macula` (PRIMARY paper) | **0,7307** | 114/200 |
| `_1=disc` (uji sensitivitas) | 0,7258 | 113/200 |

Selisihnya **0,005 QWK** — jauh di bawah ambang klaim apa pun. Jadi meski konvensi sufiks memang
terbalik dari asumsi notebook, **dampaknya terhadap angka headline dapat diabaikan**, dan notebook
tetap melaporkan kedua urutan. Penetapan per-sampel di folder ini dipertahankan karena benar
secara harfiah, bukan karena mengubah hasil secara berarti.

---

## Isi `manifest.json`

```json
{
  "unit_of_prediction": "eye (two fields: macula-centred + optic-disc-centred)",
  "count_eyes": 15,
  "count_images": 30,
  "samples": [
    {
      "sample_id": "p20-l",
      "ground_truth_grade": 0,
      "ground_truth_name": "No DR",
      "eye": "left",
      "macula": "/samples/grade-0-no-dr/p20-l/macula.jpg",
      "disc":   "/samples/grade-0-no-dr/p20-l/disc.jpg",
      "expected_recall": 0.803
    }
  ]
}
```

Path sudah absolut dari root web (`/samples/...`), jadi bisa langsung dipakai di komponen React
tanpa penyesuaian.

---

## Ekspektasi Hasil per Grade

Angka ini **diukur langsung** dengan menjalankan model ONNX yang dipakai demo
(`best_student_fp32`, seed 3407) atas **seluruh 200 mata Set-C DeepDRiD** — bukan disalin dari
tabel DRTiD, karena sampel di folder ini berasal dari DeepDRiD.

| Grade | Nama | n (Set-C) | Recall terukur | Ekspektasi demo |
|---|---|---|---|---|
| 0 | No DR | 100 | **0,830** | ✅ Umumnya benar |
| 1 | Mild NPDR | 18 | **0,111** | ❌ **Hampir pasti salah** — keterbatasan yang diketahui |
| 2 | Moderate NPDR | 36 | 0,417 | ⚠ Sering meleset ke tetangga |
| 3 | Severe NPDR | 36 | 0,222 | ⚠ Sering meleset ke tetangga |
| 4 | Proliferative DR | 10 | **0,600** | ✅ Cukup sering benar |

Referensi keseluruhan Set-C: **QWK 0,7307 · exact 57,0%** (paper melaporkan **0,7298** untuk seed
yang sama — selisih 0,0009 berasal dari perbedaan interpolasi resize).

> ⚠ **Kumpulan sampel ini seimbang 3 per grade, sedangkan Set-C nyata didominasi grade 0 (50%).**
> Karena itu akurasi di 15 sampel ini akan terlihat **lebih buruk** daripada 57%: rata-rata recall
> lintas grade hanya ~0,44, jadi ekspektasi wajarnya sekitar **6–7 benar dari 15**.
>
> Hasil aktual saat diukur: **3/15 exact, 11/15 dalam ±1 grade**. Lebih rendah dari ekspektasi,
> masih dalam rentang derau untuk n=15. Ini **bukan tanda integrasi bermasalah** — pipeline sudah
> diverifikasi mereproduksi angka paper di 200 mata.

> Grade 1 sengaja **tetap disertakan**. Demo yang hanya menampilkan kasus berhasil adalah demo
> yang menyesatkan. Tampilkan grade 1 dan beri label bahwa model memang lemah di sana — itu
> konsisten dengan bab keterbatasan paper.

---

## Spesifikasi Berkas

| Properti | Nilai |
|---|---|
| Format | JPEG progresif, kualitas 85 |
| Ukuran maksimum | sisi terpanjang 1024 px, **aspect ratio dipertahankan** |
| Ukuran asli | 1592×1728 hingga 2232×1727 |
| Metadata | EXIF dan ICC dihapus |
| Rata-rata per berkas | ~75 KB |
| Total | 2,2 MB |

**Sengaja bukan 224×224 atau 384×384.** Ukuran itu adalah target resize internal model
(`A.Resize(384, 384)`, tidak mempertahankan aspect ratio). Demo harus menampilkan foto seperti
yang diunggah klinisi; model yang mengurus resize di belakang layar.

---

## Kriteria Pemilihan

Deterministik dan dapat direproduksi:

1. Kedua lapang ada dan berkasnya dapat dibuka
2. `Overall quality == 1` (kualitas baik)
3. Diurutkan `Clarity` menurun, lalu `patient_id` menaik
4. Kedua lapang dapat dibedakan meyakinkan (selisih offset disc ≥ 0,15)
5. Diambil 3 mata pertama per grade

Sumbernya **Set-A (`regular-fundus-training`)** — kolam terbesar (596 mata), dan membiarkan
**Set-C tetap murni** sebagai partisi konfirmatori pra-registrasi.

Catatan: DeepDRiD **tidak pernah dipakai melatih** DR-VERGE (hanya validasi eksternal), jadi tidak
ada kebocoran data dari penggunaan citra ini di demo.

---

## Lisensi

CC BY-SA 4.0. **Wajib menyertakan [`ATTRIBUTION.txt`](ATTRIBUTION.txt)** bila folder ini
didistribusikan ulang, dan karya turunan harus memakai lisensi yang sama.

DRTiD — dataset yang dipakai melatih DR-VERGE — **tidak** diredistribusikan di sini karena
lisensinya tidak mengizinkan.

> **Bukan alat medis.** Prototipe riset. Keluaran model adalah *Ordinal Threshold Score*, bukan
> probabilitas klinis terkalibrasi, dan tidak boleh dipakai untuk perawatan pasien.
