# 🛠️ scripts/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

| Berkas | Fungsi |
|---|---|
| [`make_splits.py`](make_splits.py) | Membuat _split_ DRTiD (latih 800 / validasi 200 / uji 550) secara deterministik dari partisi resmi |
| [`verification/`](verification/) | Pemeriksaan statis notebook **sebelum** menjalankan run berjam-jam |

Semua perintah dijalankan dari folder `experiments/`.

---

## ✂️ `make_splits.py`

Membaca DRTiD dari `dataset/DRTiD/` di _root_ repositori dan menulis `drtid_{train,val,test}.csv` ke `experiments/data/splits/`. Folder ini **lokal dan tidak di-commit** karena berisi path absolut ke citra di komputer masing-masing.

```bash
python scripts/make_splits.py
```

Partisi yang **persis dipakai** run final tersimpan di [`../results/splits/`](../results/splits/).

---

## ✅ `verification/`

```bash
python scripts/verification/nameorder_check.py  notebooks/full_pipeline_notebook_enhanced.ipynb
python scripts/verification/unbound_check.py    notebooks/full_pipeline_notebook_enhanced.ipynb
python scripts/verification/verify_enhanced.py  notebooks/full_pipeline_notebook_enhanced.ipynb
python scripts/verification/dryrun_enhanced.py
```

| Skrip | Yang dibuktikan | Yang tidak dapat dibuktikan |
|---|---|---|
| `nameorder_check.py` | Setiap nama global terdefinisi, tidak dipakai sebelum sel pendefinisinya, dan tidak dipakai setelah `del` | Bahwa nilainya benar |
| `unbound_check.py` | Tidak ada pemakaian variabel sebelum diisi di dalam fungsi (tingkat AST) | Alur di tingkat modul |
| `verify_enhanced.py` | **Urutan eksekusi** yang disyaratkan metode, _threshold_ di setiap titik prediksi, evaluasi eksternal dengan _seed_ yang sesuai, disiplin _sampler_ | Bahwa pelatihannya berhasil |
| `dryrun_enhanced.py` | **Aturan keputusan** pada data sintetis dengan jawaban yang sudah diketahui: Stage A, `grade_from`, kalibrasi _threshold_, _bootstrap_ berpasangan, sensitivitas _self-audit_ | Apa pun tentang data nyata |

Hasil terhadap notebook final: `nameorder_check` bersih · `unbound_check` bersih · `verify_enhanced` **39/39** · `dryrun_enhanced` **40/40**.

> [!TIP]
> **Pipeline yang berjalan belum tentu pipeline yang benar.** Pemeriksaan kompilasi dan nama tetap lulus ketika Stage A sempat diletakkan setelah pelatihan _teacher_ — yang membuat _teacher_ beresolusi 384 mendistilasi ke _student_ beresolusi 224. Tidak ada yang _crash_; semua angka hanya akan salah. Hanya asersi urutan di `verify_enhanced.py` yang menangkapnya.

`dryrun_enhanced.py` berjalan mandiri tanpa data, GPU, maupun artefak karena mentranskripsikan aturan keputusan notebook. Konsekuensinya: bila aturan di notebook berubah, transkripsi di sini juga harus diperbarui.
