# Gambar Dataset untuk Paper DR-VERGE

Folder ini berisi citra fundus asli dari **DRTiD** dan **DeepDRiD** yang sudah dipilih, diverifikasi, dan disusun agar siap dimasukkan ke dalam makalah DR-VERGE — beserta lima gambar komposit yang sudah jadi dan tinggal ditempel.

Seluruh citra mentah di sini adalah **salinan byte-per-byte** dari dataset asli. Tidak ada *resize*, tidak ada *re-encode*, tidak ada penyesuaian warna. Yang masuk ke paper adalah citra dataset yang sebenarnya.

---

## 1. Isi folder

```
research/paper-figures/dataset/
├── README.md                         ← dokumen ini
├── manifest.csv                      ← pemetaan setiap berkas ke berkas sumbernya
│
├── figures/                          ← KOMPOSIT SIAP TEMPEL (PNG 300 dpi + PDF vektor)
│   ├── fig_twofield_pair_drtid.png/.pdf            ← kandidat Gambar 1 (polos)
│   ├── fig_twofield_pair_drtid_annotated.png/.pdf  ← kandidat Gambar 1 (dengan penanda)
│   ├── fig_grade_strip_drtid.png/.pdf              ← DRTiD grade 0–4
│   ├── fig_grade_strip_deepdrid.png/.pdf           ← DeepDRiD grade 0–4
│   └── fig_dataset_comparison.png/.pdf             ← DRTiD vs DeepDRiD berdampingan
│
├── drtid-samples/
│   ├── two-field-pair/               ← 1 mata × 2 field (bahan Gambar 1)
│   └── by-grade/grade-0 … grade-4/   ← 1 mata per derajat × 2 field
│
└── deepdrid-samples/
    ├── two-field-pair/
    └── by-grade/grade-0 … grade-4/
```

Penamaan berkas menjelaskan dirinya sendiri:

```
drtid_id1880_R_grade1_macula.jpg
  │      │    │    │      └── field: macula-centered / disc
  │      │    │    └───────── derajat DR (ICDR 0–4)
  │      │    └────────────── lateralitas: mata kanan (R) / kiri (L)
  │      └─────────────────── ID mata pada DRTiD
  └────────────────────────── dataset asal
```

---

## 2. Gambar yang paling penting: pasangan dual-view (kandidat Gambar 1)

**Berkas:** `figures/fig_twofield_pair_drtid_annotated.pdf`
**Sumber:** DRTiD record 1880, mata kanan, DR grade 1

Gambar ini menampilkan **satu mata yang sama** difoto dua kali: panel (a) memusatkan makula, panel (b) memusatkan diskus optik. Penanda kotak putih menunjukkan letak makula dan diskus optik pada masing-masing panel — koordinatnya bukan tebakan, melainkan diambil langsung dari berkas anotasi resmi DRTiD `op_ma_localization.csv`. Tidak ada anotasi lesi, sesuai prinsip bahwa gambar tidak boleh mengklaim informasi yang tidak disediakan dataset.

Tersedia dua versi. Gunakan **versi `_annotated`** bila ingin pembaca langsung memahami posisi anatomisnya; gunakan **versi polos** bila ruang halaman sempit atau bila pembimbing menilai penanda terlalu ramai.

### Mengapa gambar ini penting, bukan sekadar dekorasi

Letakkan tepat setelah paragraf yang menjelaskan *single-field* versus *two-field*. Fungsinya menjawab satu pertanyaan yang pasti muncul di kepala pembaca — *mengapa penelitian ini butuh dua citra?* — dalam satu tatapan, tanpa perlu satu paragraf tambahan.

Yang terlihat langsung dari gambar:

- Kedua citra berasal dari **mata yang sama**, jadi ini bukan dua pasien dan bukan dua mata berbeda.
- Cakupan retinanya **hanya beririsan sebagian**. Area yang terlihat jelas di panel (a) sebagian tidak tertangkap di panel (b), dan sebaliknya.
- Karena itu **satu citra saja tidak pernah memuat seluruh informasi**. Inilah dasar seluruh argumen DR-VERGE: kalau kedua bidang pandang membawa informasi berbeda, maka menggabungkannya berpotensi mengubah keputusan — dan perubahan keputusan itulah yang menjadi objek transfer pada Complementarity-Shift Distillation.

Tanpa gambar ini, konsep Δ = p_dual − ½(p_makula + p_diskus) pada Bab III terasa abstrak. Dengan gambar ini, pembaca sudah "melihat" mengapa Δ bisa bernilai bukan nol sebelum melihat rumusnya.

**Caption usulan:**

> **Gambar 1.** Contoh pasangan citra fundus *two-field* pada DRTiD yang terdiri atas *macula-centered* dan *optic-disc-centered view* dari *examined-eye record* yang sama. Kedua bidang pandang hanya beririsan sebagian, sehingga masing-masing memuat area retina yang tidak tertangkap oleh yang lain.

---

## 3. Gambar strip derajat keparahan

**Berkas:** `figures/fig_grade_strip_drtid.pdf` dan `figures/fig_grade_strip_deepdrid.pdf`

Lima kolom untuk lima derajat ICDR, dua baris untuk dua bidang pandang. Setiap kolom adalah **satu mata** yang difoto dua kali — bukan sepuluh mata berbeda.

Nilai gambar ini ada dua. Pertama, ia memperlihatkan bahwa tugas *grading* ini bersifat **ordinal**: keparahan meningkat secara bertahap dari kiri ke kanan, bukan lima kategori yang saling lepas. Ini menjustifikasi pemakaian CORAL dan QWK, dua pilihan metodologis yang perlu dibela di Bab III. Kedua, ia menjelaskan secara visual **mengapa derajat 1 sulit**: pada kolom grade 1 hampir tidak ada yang terlihat berbeda dari grade 0 kecuali mikroaneurisma yang sangat kecil, sementara pada grade 3 dan 4 lesinya besar dan mencolok. Ini mendukung langsung pembahasan *recall* derajat 1 pada Bab IV yang berkisar 0,0680–0,0840.

**Caption usulan (DRTiD):**

> **Gambar 2.** Pasangan citra *two-field* DRTiD pada lima derajat keparahan ICDR. Setiap kolom merupakan satu *examined-eye record*; baris atas memusatkan makula dan baris bawah memusatkan diskus optik. Lesi pada derajat 1 berukuran sangat kecil dan nyaris tidak terbedakan secara visual dari derajat 0, berbeda dengan derajat 3 dan 4 yang menampilkan lesi luas.

---

## 4. Gambar perbandingan dua dataset

**Berkas:** `figures/fig_dataset_comparison.pdf`

Menampilkan satu pasangan DRTiD dan satu pasangan DeepDRiD berdampingan, lengkap dengan keterangan kamera dan resolusinya.

Gambar ini mendukung Bab IV-F. Ia memperlihatkan bahwa evaluasi eksternal DR-VERGE **benar-benar melintasi domain**: warna, iluminasi, bentuk lingkaran retina, dan resolusi kedua dataset berbeda secara kasat mata. Dengan gambar ini, klaim "generalisasi lintas-dataset" tidak lagi harus dipercaya begitu saja — pembaca dapat melihat sendiri bahwa kedua domain memang berbeda. Ini membuat angka QWK eksternal 0,6688 menjadi jauh lebih meyakinkan daripada bila hanya disajikan sebagai tabel.

---

## 5. Mengapa kedua dataset ini cocok untuk paper DR-VERGE

### DRTiD — dataset pengembangan internal

| Aspek | Nilai |
|---|---|
| Jumlah mata | 1.550 (*examined-eye records*) |
| Jumlah citra | 3.100 (2 field per mata) |
| Resolusi asli | 2592 × 1944 dan 1956 × 1934 |
| Sebaran derajat | 0: 747 · 1: 140 · 2: 406 · 3: 199 · 4: 58 |
| Lateralitas | R: 783 · L: 767 |
| Partisi DR-VERGE | latih 800 · validasi 200 · uji 550 mata |

**Alasan dataset ini tepat:**

1. **Ia dirancang khusus untuk *two-field*.** Setiap catatan sudah berisi pasangan makula dan diskus optik dari mata yang sama, dengan kolom `Macula` dan `Optic disc` yang eksplisit. Tidak ada langkah penebakan atau pemasangan manual — struktur yang dibutuhkan DR-VERGE sudah tersedia sejak awal. Ini yang membuat DRTiD jauh lebih cocok dibanding dataset fundus umum seperti APTOS yang hanya menyediakan satu citra per mata.
2. **Ia menyediakan anotasi lokalisasi makula dan diskus optik.** Berkas `op_ma_localization.csv` memuat koordinat ternormalisasi untuk seluruh 3.100 citra. Inilah yang memungkinkan penanda pada Gambar 1 dibuat secara terukur, bukan digambar dengan perkiraan.
3. **Penamaan field-nya konsisten dan terverifikasi.** Sufiks `_1` selalu *macula-centered* dan `_2` selalu *disc-centered*. Verifikasi terhadap seluruh 3.100 citra memberikan tingkat kesesuaian 99,4% dan 99,3%, sehingga urutan field dapat dipakai secara otomatis dengan aman.
4. **Sebarannya realistis, bukan seimbang buatan.** Derajat 4 hanya 3,7% dari keseluruhan. Sebaran timpang seperti ini justru mencerminkan kondisi skrining nyata, dan menjustifikasi pemakaian QWK serta *stratified split* — dua pilihan yang dijelaskan di Bab III.
5. **Ada satu batasan yang perlu disebut secara terbuka:** DRTiD tidak menyediakan identitas pasien. Setiap ID berlaku untuk satu mata saja, dan penomorannya tidak menyimpan informasi pasangan mata — dari 1.255 pasang ID berurutan, hanya 50,2% yang berbeda lateralitas, yaitu setara peluang acak. Karena itu partisi internal bersifat *eye-disjoint* dan pengelompokan *bootstrap* dilakukan pada tingkat mata. Ini batas sumber data, berlaku sama bagi semua penelitian yang memakai DRTiD, dan **justru terjawab oleh pemilihan DeepDRiD sebagai dataset eksternal** — lihat di bawah.

### DeepDRiD — dataset konfirmatori eksternal

| Aspek | Nilai |
|---|---|
| Partisi latih | 300 pasien · 600 mata · 1.200 citra → **Set-A** (597 mata, 3 dikecualikan) |
| Partisi validasi | 100 pasien · 200 mata · 400 citra |
| Resolusi asli | 1976 × 1984 dan 1736 × 1824 |
| Sebaran derajat (validasi) | 0: 87 · 1: 23 · 2: 46 · 3: 34 · 4: 10 |
| Peran di DR-VERGE | **Set-C** — evaluasi konfirmatori, dibuka satu kali |

**Alasan dataset ini tepat:**

1. **Ia juga *two-field*, sehingga arsitektur DR-VERGE dapat dipakai tanpa modifikasi.** Ini syarat mutlak. Dataset eksternal yang hanya menyediakan satu citra per mata tidak akan bisa menguji model *dual-view* secara adil.
2. **Ia benar-benar dataset yang berbeda domain.** Kamera, iluminasi, dan resolusinya berbeda dari DRTiD. Inilah yang membuat evaluasi Set-C bermakna sebagai uji generalisasi, bukan sekadar pengulangan.
3. **Ia menyediakan identitas pasien** melalui kolom `patient_id`, beserta derajat DR terpisah untuk mata kiri dan kanan (`left_eye_DR_Level`, `right_eye_DR_Level`). Ini persis yang tidak dimiliki DRTiD, dan karena itu **evaluasi eksternal DR-VERGE dapat memakai *bootstrap* berklaster pada tingkat pasien** — standar statistik yang lebih ketat. Pasangan kedua dataset ini karena itu saling menutup kelemahan masing-masing, dan itu argumen desain yang kuat untuk ditulis di paper.
4. **Ia menyediakan metadata kualitas citra** (`Overall quality`, `Clarity`, `Artifact`), yang dipakai untuk menyaring kandidat gambar di folder ini.
5. **Satu catatan teknis penting:** urutan field DeepDRiD adalah **kebalikan** dari DRTiD — `_1` adalah *disc-centered* dan `_2` adalah *macula-centered*. DeepDRiD juga tidak menyertakan berkas lokalisasi, sehingga urutan ini tidak dapat diverifikasi secara otomatis dengan tingkat keyakinan yang memadai. Karena itu **setiap pasangan DeepDRiD di folder ini diperiksa satu per satu secara visual** sebelum diberi label. Prosedurnya dijelaskan di §6.

---

## 6. Cara gambar-gambar ini dipilih dan diverifikasi

Bagian ini ada agar setiap klaim label pada gambar dapat ditelusuri.

**DRTiD — verifikasi otomatis, dapat diandalkan penuh.**
Urutan field diambil langsung dari kolom `Macula` dan `Optic disc` pada berkas label resmi. Sebagai pemeriksaan silang, seluruh 3.100 citra diuji terhadap `op_ma_localization.csv`: pada citra bersufiks `_1`, makula lebih dekat ke pusat gambar dibanding diskus optik pada 99,4% kasus, dan pola sebaliknya berlaku pada `_2` untuk 99,3% kasus. Lateralitas juga terverifikasi sempurna — aturan "diskus di sisi kiri gambar berarti mata kiri" cocok dengan kolom `LR` pada 1.550 dari 1.550 baris.

**DeepDRiD — verifikasi visual, karena verifikasi otomatis tidak cukup akurat.**
DeepDRiD tidak menyertakan berkas lokalisasi, sehingga tidak ada label rujukan. Pendekatan otomatis sempat diuji: sebuah detektor diskus optik berbasis kecerahan dibangun, lalu **dikalibrasi terhadap DRTiD yang memiliki *ground truth***. Hasilnya, aturan berpasangan "citra yang diskusnya lebih dekat ke pusat adalah yang *disc-centered*" hanya mencapai akurasi **81,0%** pada DRTiD. Tingkat itu memadai untuk menyaring kandidat, tetapi **tidak memadai untuk melabeli gambar yang akan masuk ke makalah ilmiah**. Karena itu detektor hanya dipakai sebagai penyaring awal, dan **kesepuluh citra DeepDRiD di folder ini diperiksa satu per satu secara visual** sebelum diberi label *macula* atau *disc*. Satu kandidat awal (pasien 332, grade 0) dibuang pada tahap ini karena kedua field-nya hampir identik sehingga tidak layak dipakai sebagai ilustrasi perbedaan cakupan.

**Kriteria pemilihan citra:**
- kualitas visual baik — bebas dari *flare*, goresan, dan artefak besar;
- perbedaan cakupan antar-field terlihat jelas, agar gambar menjalankan fungsinya;
- untuk DeepDRiD, hanya mata dengan `Overall quality = 1` dan `Clarity` tertinggi;
- satu mata per derajat, agar strip grade dapat dibaca sebagai perbandingan yang adil.

---

## 7. Ringkasan usulan penempatan di paper

| Gambar | Berkas | Letak | Prioritas |
|---|---|---|---|
| Pasangan *two-field* | `fig_twofield_pair_drtid_annotated.pdf` | Bab I atau Bab III-A, setelah penjelasan *single-field* vs *two-field* | **Sangat disarankan** |
| Strip derajat DRTiD | `fig_grade_strip_drtid.pdf` | Bab III-A (Data dan Protokol Eksperimen) | Disarankan |
| Perbandingan dua dataset | `fig_dataset_comparison.pdf` | Bab III-A atau Bab IV-F | Opsional, kuat untuk Bab IV-F |
| Strip derajat DeepDRiD | `fig_grade_strip_deepdrid.pdf` | Bab IV-F | Opsional |

Catatan format, mengikuti ketentuan jurnal:

- Gunakan berkas **`.pdf`**, bukan `.png`. Ketentuan mensyaratkan resolusi minimal 300 ppi, dan versi PDF bebas dari penurunan kualitas saat diperbesar.
- Versi cetak jurnal hanya hitam-putih. Seluruh gambar di folder ini **aman dalam mode *grayscale*** karena tidak ada informasi yang hanya dibedakan oleh warna — pembeda antar-panel sepenuhnya berupa teks dan posisi. Tetap lakukan pemeriksaan akhir sebelum submit.
- Label gambar ditulis dengan Helvetica ukuran 8, tebal, miring, diletakkan **di bawah** gambar. Judul multibaris ditulis rata kiri-kanan.
- Teks pada komposit sengaja dibuat berukuran besar agar tetap terbaca setelah gambar dikecilkan ke lebar satu kolom (7,1 mm antar-kolom pada halaman A4 dua kolom). Bila ditempatkan melintang dua kolom, keterbacaannya tentu lebih longgar.

---

## 8. Lisensi dan atribusi

Kedua dataset adalah dataset penelitian publik yang harus disitasi saat digunakan. Pastikan makalah menyebut keduanya di bagian Metode dan mencantumkannya di Referensi:

- **DRTiD** — *Diabetic Retinopathy Two-field image Dataset*. Sudah disitasi pada draft sebagai referensi [2] (Hou dkk., *Cross-Field Transformer for Diabetic Retinopathy Grading on Two-field Fundus Images*, IEEE BIBM 2022).
- **DeepDRiD** — *Deep Diabetic Retinopathy Image Dataset*. Perlu ditambahkan ke daftar referensi bila belum ada.

Citra di folder ini disertakan **semata sebagai ilustrasi dalam publikasi ilmiah**. Jangan redistribusikan sebagai dataset tersendiri, dan jangan gunakan di luar konteks makalah ini tanpa memeriksa ketentuan lisensi masing-masing dataset.

---

## 9. Telusur balik

`manifest.csv` memetakan setiap berkas di folder ini ke berkas sumbernya:

| Kolom | Arti |
|---|---|
| `dataset` | DRTiD atau DeepDRiD |
| `folder` | derajat DR tempat berkas disimpan |
| `file` | nama berkas di folder ini |
| `source_file` | nama berkas asli di dataset |
| `field` | macula atau disc |

Lokasi dataset asli di repositori — keduanya berada di `.gitignore` sehingga tidak ikut ter-*commit*:

- `dataset/DRTiD/Original Images/`
- `dataset/DeepDRiD-master/regular_fundus_images/regular-fundus-validation/Images/`

Dokumen terkait:

- `research/knowledge/drtid-laterality-examples/README.md` — pembahasan lateralitas dan ketiadaan identitas pasien pada DRTiD.
- `experiments/results/enhanced-notebook/PENGUATAN-PAPER-BAB1-BAB4.md` — panduan revisi Bab I dan Bab IV, termasuk rekomendasi gambar hasil eksperimen.
