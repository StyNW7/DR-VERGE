# experiments/results/

Hasil tereksekusi dari tiga kali eksekusi penuh pipeline DR-VERGE. Setiap folder run memuat notebook yang benar-benar dijalankan beserta seluruh keluarannya, sehingga setiap angka dalam paper dapat ditelusuri kembali ke berkas asalnya.

## Run mana yang dipakai

| Folder | Status | Keterangan |
|---|---|---|
| **`enhanced-notebook/`** | **RUN FINAL — sumber kebenaran tunggal** | Resolusi 384, lima *core seed*, 10.000 replikasi *bootstrap*, evaluasi konfirmatori eksternal. Seluruh angka paper berasal dari sini. |
| `simple-notebook/` | Pendukung | Run pendahulu dengan protokol lebih ringkas. Berfungsi sebagai bukti bahwa peringkat fidelitas mekanisme CSD juga muncul pada protokol berbeda. |
| `efficient-notebook/` | Pendukung | Varian hemat komputasi. Dipertahankan untuk keterlacakan proses. |

> **Penting.** Angka dari run yang berbeda tidak boleh dicampur dalam satu tabel. Ketiga run memakai resolusi, jumlah *seed*, dan protokol statistik yang berbeda, sehingga nilainya tidak sebanding satu sama lain.

## Struktur tiap folder run

```
<run>/
├── README.md                 penjelasan run (bila tersedia)
├── RESULTS_OVERVIEW.md       ringkasan hasil dan jawaban RQ
├── *.ipynb                   notebook yang benar-benar dieksekusi
└── outputs/
    ├── configs/              konfigurasi terkunci, manifest split, info kuantisasi
    ├── splits/               partisi latih / validasi / uji tingkat mata
    └── results/
        ├── tables/           tabel hasil dalam .csv
        ├── figures/          gambar .pdf/.png/.svg + caption + data mentah tiap gambar
        ├── metrics/          matriks konfusi dan diagnostik per kondisi
        ├── predictions/      prediksi per sampel untuk setiap model dan seed
        └── logs/             catatan eksekusi
```

## Folder pendamping

| Folder | Isi |
|---|---|
| `final-results-documentation/` | Perbandingan lintas run dan ringkasan hasil tiap run dalam satu tempat |
| `knowledge/` | Ringkasan dan perbandingan hasil yang ditulis selama penelitian berlangsung |

## Cara mulai membaca

1. `enhanced-notebook/RESULTS_OVERVIEW.md` — seluruh hasil run final beserta jawaban RQ1 dan RQ2.
2. `final-results-documentation/final-comparison.md` — mengapa run *enhanced* yang dipilih.
3. `enhanced-notebook/outputs/results/tables/` — angka mentah di balik setiap klaim.

Setiap gambar disertai berkas `*_data.csv` yang memuat angka penyusunnya, sehingga gambar dapat diperiksa tanpa perlu menjalankan ulang notebook.
