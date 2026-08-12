# Sample Images — Demo DR-VERGE

12 mata · 24 citra · 1,6 MB
Sumber: **DeepDRiD** (CC BY-SA 4.0) — lihat [`ATTRIBUTION.txt`](ATTRIBUTION.txt)

---

## Struktur — Datar dan Buta

```
samples/
├── manifest.json      indeks mesin-terbaca untuk demo
├── ATTRIBUTION.txt    lisensi + daftar perubahan (wajib ikut)
├── README.md
│
├── p24-r/             ← satu folder = satu MATA
│   ├── macula.jpg         lapang berpusat makula
│   ├── disc.jpg           lapang berpusat optic disc
│   └── meta.json          provenance + ground truth (untuk audit)
├── p39-r/   p65-r/   p84-r/   p89-l/
├── p188-l/  p198-l/  p267-l/  p296-l/
└── p362-r/  p392-r/  p394-l/
```

**Tidak ada folder grade.** Nama seperti `grade-4-proliferative-dr/p84-r` membocorkan jawaban
sebelum model dijalankan, sehingga demo mustahil dinilai secara jujur. `samples/p84-r` tidak.

Penguji memilih pasien, menjalankan model, lalu **baru** melihat hasilnya — persis seperti alur
klinis sebenarnya. Ground truth tetap tersimpan di `meta.json` supaya kumpulan ini dapat diaudit,
tetapi tidak muncul di jalur berkas.

> **Catatan untuk UI demo:** jangan tampilkan `ground_truth_grade` sebelum inferensi selesai.
> Menampilkannya lebih dulu mengembalikan masalah yang justru dihilangkan struktur datar ini.

Urutan dalam `manifest.json` diurutkan menurut `sample_id`, **bukan** menurut grade — supaya urutan
daftar pun tidak membocorkan pola.

---

## ⚠ Kumpulan Ini Dikurasi

**Sampel di sini dipilih karena model menebaknya dengan benar dan stabil.** Ini alat peraga untuk
mendemonstrasikan sistem yang berfungsi — **bukan tolok ukur.**

> **Model menjawab 12 dari 12 sampel ini dengan benar. Angka itu tidak berarti apa-apa soal
> akurasi.** Diukur pada partisi DeepDRiD Set-C tanpa penyaringan, model yang sama memperoleh
> **QWK 0,7307** dengan **exact 57,0%**.

Kalau ada yang menguji 12 sampel ini lalu menyimpulkan "modelnya hampir sempurna", kesimpulan itu
salah. Angka sebenarnya ada di tabel [Performa Sebenarnya](#performa-sebenarnya) di bawah.

---

## Cara Sampel Ini Diverifikasi

Prosedurnya dibentuk oleh dua kegagalan yang ditemukan saat penyiapan:

**1. Verifikasi pada citra ASLI tidak membuktikan apa pun.** Percobaan pertama memilih sampel dari
citra full-resolution — semuanya benar. Setelah dikecilkan ke 1024 px dan di-encode ulang JPEG,
sebagian berbalik. Verifikasi sekarang dijalankan pada **berkas JPEG yang benar-benar dikirim**.

**2. Satu kernel resize tidak cukup.** Browser mengubah ukuran dengan canvas `drawImage`, yang
bukan bilinear PIL maupun bicubic. Sampel hanya dipakai bila grade-nya bertahan di **seluruh
kernel** yang diuji.

Prosedur akhir — **796 mata** dipindai dari Set-A + Set-B:

| Tahap | Sisa |
|---|---|
| Punya dua lapang dan dapat dibedakan | 796 dipindai |
| Benar **dan** stabil di bilinear + bicubic + lanczos | 214 |
| Margin keputusan ≥ 0,02 (tahan terhadap resampler lain) | 12 terpilih |
| **Uji akhir di 6 resampler** (+ hamming, nearest, box) | **12/12 stabil** ✅ |

Setiap `meta.json` menyimpan skor kumulatif dan **margin keputusan** — jarak skor penentu dari
ambang 0,5. Margin di sini berkisar **0,093 – 0,441**; makin besar, makin tidak rapuh.

---

## Isi Kumpulan

| Folder | Mata | Margin |
|---|---|---|
| `p65-r` · `p188-l` · `p392-r` | kanan · kiri · kanan | 0,441 · 0,438 · 0,433 |
| `p39-r` · `p394-l` · `p296-l` | kanan · kiri · kiri | 0,106 · 0,111 · 0,094 |
| `p198-l` · `p24-r` · `p362-r` | kiri · kanan · kanan | 0,145 · 0,140 · 0,099 |
| `p84-r` · `p89-l` · `p267-l` | kanan · kiri · kiri | 0,351 · 0,339 · 0,336 |

*Grade sengaja tidak dicantumkan di tabel ini — ada di `meta.json` masing-masing.*

**Empat dari lima grade terwakili.** **Mild NPDR (grade 1) tidak ada** dalam kumpulan ini: dari
796 mata yang dipindai, **tidak satu pun** memenuhi syarat benar sekaligus kokoh. Recall model
untuk Mild NPDR adalah **0,111** — ini keterbatasan yang memang dilaporkan paper, bukan masalah
penyiapan sampel. Contoh yang andal tidak dimasukkan secara paksa.

---

## Performa Sebenarnya

Diukur langsung dengan menjalankan model ONNX yang dipakai demo (`best_student_fp32`, seed 3407)
atas **seluruh 200 mata Set-C DeepDRiD tanpa penyaringan**. **Inilah performa sesungguhnya** —
bukan 12/12 di folder ini.

| Grade | Nama | n (Set-C) | Recall sebenarnya | Ada di kumpulan ini? |
|---|---|---|---|---|
| 0 | No DR | 100 | **0,830** | ✅ 3 mata |
| 1 | Mild NPDR | 18 | **0,111** | ❌ tidak ada yang kokoh |
| 2 | Moderate NPDR | 36 | 0,417 | ✅ 3 mata |
| 3 | Severe NPDR | 36 | 0,222 | ✅ 3 mata |
| 4 | Proliferative DR | 10 | **0,600** | ✅ 3 mata |

Keseluruhan Set-C: **QWK 0,7307 · exact 57,0%**

Paper melaporkan **0,7298** untuk seed yang sama — selisih **0,0009** dari perbedaan interpolasi
resize. Kesesuaian inilah yang membuktikan integrasi frontend setia pada penelitian.

---

## Mengapa Satu Folder = Satu Mata

DR-VERGE memprediksi **per mata**, bukan per pasien maupun per citra:

| Alasan | Penjelasan |
|---|---|
| **Unit prediksi adalah MATA** | Satu pasien punya dua mata yang bisa berbeda grade. Folder per-pasien akan menggabungkan dua kasus berbeda |
| **Dua lapang harus berpasangan** | Model memerlukan makula **dan** disc sekaligus — premis dual-view penelitian ini |
| **Nama `p<id>-<l\|r>` dapat dilacak** | Kembali ke DeepDRiD untuk verifikasi independen |

---

## ⚠ Penetapan Lapang: Sufiks `_1`/`_2` Tidak Bisa Dipercaya

DeepDRiD menamai berkasnya `<pasien>_<mata><1|2>.jpg`, dan notebook memakai asumsi
`DEEPDRID_PRIMARY_ORDER = "_1=macula"`. **Pemeriksaan citra menunjukkan sebaliknya:**

| Partisi | `_1` ternyata berpusat DISC |
|---|---|
| Set-A | 15 / 15 |
| Set-B | 34 / 40 |
| Set-C | 31 / 40 |

Karena itu berkas di sini **tidak** dinamai menurut sufiks — posisi optic disc diukur per sampel,
lalu lapang ditetapkan dari citranya sendiri. `meta.json` mencatat citra sumber mana menjadi lapang
mana.

**Dampaknya diukur** atas 200 mata Set-C:

| Urutan | QWK | Exact |
|---|---|---|
| `_1=macula` (PRIMARY paper) | **0,7307** | 114/200 |
| `_1=disc` | 0,7258 | 113/200 |

Selisih **0,005 QWK** — jauh di bawah ambang klaim apa pun. Konvensi sufiksnya memang terbalik dari
asumsi notebook, tetapi **dampaknya terhadap angka headline dapat diabaikan**, dan notebook tetap
melaporkan kedua urutan.

> `Gate2a_CORAL` mencatat *"fusion is view-order sensitive"* — salah slot tidak memunculkan error
> apa pun, hanya angka yang berbeda.

---

## Spesifikasi Berkas

| Properti | Nilai |
|---|---|
| Format | JPEG progresif, kualitas 85 |
| Ukuran maksimum | sisi terpanjang 1024 px, **aspect ratio dipertahankan** |
| Metadata | EXIF dan ICC dihapus |
| Rata-rata | ~68 KB per citra · total 1,6 MB |

**Sengaja bukan 384×384.** Itu target resize internal model (`A.Resize(384, 384)`, tidak menjaga
aspect ratio). Demo menampilkan foto seperti yang diunggah klinisi; model yang mengurus resize.

---

## Lisensi

CC BY-SA 4.0. **Wajib menyertakan [`ATTRIBUTION.txt`](ATTRIBUTION.txt)** bila didistribusikan
ulang, dan karya turunan harus memakai lisensi yang sama.

DRTiD — dataset yang dipakai melatih DR-VERGE — **tidak** diredistribusikan di sini karena
lisensinya tidak mengizinkan.

> **Bukan alat medis.** Prototipe riset. Keluaran model adalah *Ordinal Threshold Score*, bukan
> probabilitas klinis terkalibrasi, dan tidak boleh dipakai untuk perawatan pasien.
