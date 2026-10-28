# 🗃️ dataset/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

DR-VERGE menggunakan tiga dataset publik. **Tidak ada yang di-commit ke git** — ukurannya besar dan masing-masing memiliki lisensi sendiri. Dokumen ini menjelaskan tata letak yang diharapkan dan tempat memperoleh setiap dataset.

```text
dataset/
├── DRTiD/              utama — pelatihan, validasi, dan uji internal
├── APTOS/              prapelatihan backbone
└── DeepDRiD-master/    evaluasi konfirmatori eksternal
```

`.gitignore` mengecualikan `DRTiD/`, `APTOS/`, `DeepDRiD/`, dan `DeepDRiD-master/` berdasarkan nama folder, sehingga ketiganya tetap tidak terlacak di mana pun letaknya.

| Dataset | Peran | Ukuran | Sumber |
|---|---|---|---|
| **DRTiD** | Utama | 1.550 _examined-eye records_ · 3.100 citra · _grade_ 0–4 | [github.com/fdu-vts/drtid](https://github.com/fdu-vts/drtid) |
| **APTOS 2019** | Prapelatihan _backbone_ | 3.662 citra _single-view_ | [Kaggle — APTOS 2019 Blindness Detection](https://www.kaggle.com/competitions/aptos2019-blindness-detection) |
| **DeepDRiD** | Evaluasi eksternal | Set-C: 100 pasien · 200 mata · 400 citra | [github.com/deepdrdoc/DeepDRiD](https://github.com/deepdrdoc/DeepDRiD) |

---

## 👁️ DRTiD — dataset utama

**1.550 mata · 3.100 citra · _grade_ 0–4 · benar-benar _dual-view_.** Setiap mata memiliki dua foto — satu berpusat makula, satu berpusat diskus optik. Pasangan inilah objek penelitian; tanpa pasangan ini tidak ada komplementaritas yang dapat didistilasi.

```text
DRTiD/
├── Original Images/
└── Ground Truths/
    ├── DR_grade/
    │   ├── a. DR_grade_Training.csv    1.000 baris
    │   └── b. DR_grade_Testing.csv       550 baris
    └── Optic_Macula_Localization/
```

Partisi resmi dipakai **apa adanya**. 1.000 baris latih dibagi terstratifikasi menjadi **800 latih / 200 validasi** (_seed_ 42); 550 baris uji tidak disentuh hingga evaluasi akhir. Partisi persis yang dipakai run final ada di [`../experiments/results/splits/`](../experiments/results/splits/).

**Mengapa DRTiD:** dataset ini juga dipakai oleh **CrossFiT (2022)**, sehingga hasil makula-saja / diskus-saja / _dual-view_ DR-VERGE dapat dibandingkan langsung dengan _benchmark_ tersebut.

### Urutan _field_ dan lateralitas — diverifikasi, bukan diasumsikan

Kolom `Macula` dan `Optic disc` menunjuk dua berkas per mata, dengan konvensi akhiran **`_1` = berpusat makula, `_2` = berpusat diskus optik**. Diperiksa terhadap `op_ma_localization.csv` pada seluruh 3.100 citra: pada `_1` makula lebih dekat ke pusat bingkai daripada diskus pada **99,4%** kasus, dan sebaliknya pada `_2` untuk **99,3%** kasus. Kolom `LR` konsisten dengan geometri citra pada **1.550 dari 1.550** _record_.

**DRTiD tidak memiliki pengenal pasien.** Setiap ID milik tepat satu mata (1.550 ID untuk 1.550 mata), dan ID berurutan berpasangan sebagai mata kiri–kanan hanya **50,2%** — setara peluang acak. Pengelompokan pasien tidak dapat dipulihkan, sehingga _split_ internal bersifat **_eye-disjoint_** dan _bootstrap_ internal berklaster pada mata. Contoh kasus: [`../research/knowledge/drtid-laterality-examples/`](../research/knowledge/drtid-laterality-examples/).

---

## 🧠 APTOS 2019 — prapelatihan

**3.662 citra fundus _single-view_**, dibagi 2.930 latih / 366 validasi. Dipakai hanya untuk memberi _backbone_ representasi retina yang kuat sebelum _fine-tuning_ _dual-view_ — DRTiD terlalu kecil untuk melatih _backbone_ dari nol. APTOS tidak pernah dipakai untuk evaluasi _dual-view_.

---

## 🌍 DeepDRiD — evaluasi eksternal

Sepenuhnya dipisahkan dari pelatihan; dipakai untuk menguji generalisasi di bawah pergeseran distribusi. Dibagi menjadi **Set-A / Set-B / Set-C**, dengan **Set-C ditetapkan sejak awal sebagai partisi konfirmatori** (100 pasien · 200 mata · 400 citra, partisi saling lepas). Set-A dan Set-B bersifat suplementer.

- **Bukan data latih.** CSV publik DeepDRiD tidak menandai _field_ mana (`_1`/`_2`) yang berpusat makula atau diskus — perbedaan yang menjadi dasar DR-VERGE. Karena pemetaannya disimpulkan, hasil eksternal dilaporkan pada **kedua urutan _field_**, dengan `_1 = makula` sebagai urutan utama.
- **Memiliki `patient_id`.** Interval kepercayaan eksternal karenanya berklaster pada **pasien** — standar yang lebih ketat — sementara internal berklaster pada mata. Kedua dataset saling menutupi kekurangan masing-masing.

---

## ☁️ Notebook tidak membaca dari folder ini

Pipeline berjalan di Google Colab dan membaca data dari Google Drive:

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"   # dataset diletakkan di DRIVE_BASE/dataset/
```

Lokasi DRTiD dan DeepDRiD dicari otomatis. Folder `dataset/` di repositori ini adalah **salinan kerja lokal** untuk [`../experiments/scripts/make_splits.py`](../experiments/scripts/make_splits.py) dan modul [`../experiments/src/`](../experiments/src/); memindahkan atau mengganti namanya tidak akan merusak notebook.

> [!IMPORTANT]
> **Tidak ada data yang didistribusikan ulang melalui repositori ini.** Akses ke setiap dataset harus diperoleh langsung dari penyedianya sesuai ketentuan penggunaan yang berlaku.
