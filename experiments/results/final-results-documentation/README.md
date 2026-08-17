# final-results-documentation/

Dokumentasi hasil lintas run: satu tempat untuk membandingkan ketiga eksekusi pipeline dan melihat ringkasan masing-masing tanpa harus membuka tiap folder run.

## Isi

| Berkas | Isi |
|---|---|
| [`final-comparison.md`](final-comparison.md) | Perbandingan menyeluruh ketiga run beserta alasan run *enhanced* dipilih sebagai hasil final |
| [`overview-result-enhanched-notebook.md`](overview-result-enhanched-notebook.md) | Ringkasan hasil run **enhanced** — run final, sumber seluruh angka paper |
| [`overview-result-simple-notebook.md`](overview-result-simple-notebook.md) | Ringkasan hasil run **simple** |
| [`overview-result-efficient-notebook.md`](overview-result-efficient-notebook.md) | Ringkasan hasil run **efficient** |
| `final-results.zip` | Arsip keluaran hasil final |

> Nama berkas `overview-result-enhanched-notebook.md` memuat salah eja yang dipertahankan apa adanya agar tautan lama tidak putus.

## Urutan membaca

1. **[`final-comparison.md`](final-comparison.md)** — mulai di sini. Menjelaskan perbedaan ketiga run dan mengapa hanya satu yang dipakai sebagai hasil.
2. **[`overview-result-enhanched-notebook.md`](overview-result-enhanched-notebook.md)** — detail hasil run final.
3. Kedua ringkasan lainnya bila ingin melihat bagaimana temuan bertahan lintas protokol.

## Peringatan penting

Ketiga run memakai resolusi masukan, jumlah *seed*, dan protokol statistik yang berbeda. **Angka dari run berbeda tidak sebanding dan tidak boleh dicampur dalam satu tabel.** Untuk penulisan paper, gunakan hanya angka dari run *enhanced*.

## Rujukan lain

| Yang dicari | Lokasi |
|---|---|
| Notebook tereksekusi dan 14 gambar run final | [`../enhanced-notebook/`](../enhanced-notebook/) |
| Tabel hasil mentah | [`../enhanced-notebook/outputs/results/tables/`](../enhanced-notebook/outputs/results/tables/) |
| Angka penyusun tiap gambar | `../enhanced-notebook/outputs/results/figures/*_data.csv` |
| Kode pipeline | [`../../pipeline/`](../../pipeline/) |
