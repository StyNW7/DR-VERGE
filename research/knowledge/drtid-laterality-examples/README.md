# DRTiD — Contoh Laterality (Mata Kiri vs Mata Kanan)

Empat gambar contoh dari DRTiD: **2 mata kanan** dan **2 mata kiri**. Tujuannya satu — menunjukkan bahwa DRTiD **membedakan mata kiri/kanan**, tetapi **tidak menyediakan ID pasien** yang menghubungkan dua mata dari orang yang sama.

Semua file di sini adalah **salinan apa adanya** dari `dataset/DRTiD/Original Images/` (tidak di-resize, tidak di-anotasi, tidak di-encode ulang). Yang dipilih adalah **field macula-centred** (`_1`) untuk keempatnya, karena di field inilah posisi optic disc paling jelas menunjukkan laterality.

---

## Isi folder

| File | ID | Grade | LR | Split | File asli | Posisi optic disc (`disc_x`) |
|---|---|---|---|---|---|---|
| `right_id0007_grade0.jpg` | 7 | 0 | **R** | train | `0007_1.jpg` | 0.856 → kanan |
| `right_id0005_grade2.jpg` | 5 | 2 | **R** | train | `0005_1.jpg` | 0.882 → kanan |
| `left_id0033_grade2.jpg` | 33 | 2 | **L** | train | `0033_1.jpg` | 0.164 → kiri |
| `left_id0008_grade3.jpg` | 8 | 3 | **L** | test | `0008_1.jpg` | 0.179 → kiri |

`disc_x` diambil dari `Ground Truths/Optic_Macula_Localization/op_ma_localization.csv`, dinormalisasi 0–1 terhadap lebar gambar (0 = tepi kiri, 1 = tepi kanan).

---

## Cara membacanya

**Mata kanan (`R`)** — makula di tengah, optic disc di **sisi kanan** gambar.
**Mata kiri (`L`)** — makula di tengah, optic disc di **sisi kiri** gambar.

Pola ini bukan kebetulan pada 4 contoh ini saja. Diuji ke seluruh 1.550 mata, aturan sederhana `disc_x < 0.5 ⇒ L` cocok dengan kolom `LR` pada **1550/1550 = 100%** baris. Jadi kolom `LR` konsisten sempurna dengan geometri gambar.

---

## Yang ada dan tidak ada di DRTiD

Label DRTiD (`Ground Truths/DR_grade/`) hanya punya 5 kolom:

```
ID,Grade,Macula,Optic disc,LR
7,0,0007_1,0007_2,R
```

**Ada** → laterality lewat kolom `LR` (R = 783, L = 767 dari 1.550 mata).

**Tidak ada** → identitas pasien. `ID` bersifat *satu-ID-satu-mata*: 1.550 baris dengan 1.550 `ID` unik, tidak ada satupun `ID` yang muncul dua kali. Dugaan bahwa ID berurutan (misal 4 & 5) adalah pasangan mata satu orang **tidak terbukti**: dari 1.255 pasang ID berurutan, hanya **50,2%** yang berbeda laterality — persis angka lemparan koin.

Konsekuensinya untuk DR-VERGE: unit analisis terkecil yang tersedia adalah **mata**, bukan orang. Split bersifat *eye-disjoint* dan clustering pada bootstrap dilakukan di level mata. Ini batas dari sumber datanya, dan berlaku sama untuk semua penelitian yang memakai DRTiD.

---

## Catatan teknis

- Ukuran asli DRTiD **tidak seragam**: tiga gambar di sini 1956×1934, satu gambar (`left_id0008_grade3.jpg`) 2592×1944. Karena itu pipeline selalu melakukan resize eksplisit sebelum inferensi.
- Setiap mata punya **2 field**: `_1` = macula-centred, `_2` = disc-centred. Folder ini sengaja hanya memuat field `_1`. Pasangan disc-centred-nya ada di kolom "File asli" tabel di atas dengan sufiks `_2`.
- Folder `dataset/DRTiD/` ada di `.gitignore`, jadi keempat salinan ini ditaruh di sini agar tetap ikut ter-commit sebagai contoh dokumentasi.
