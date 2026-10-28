# 🧱 src/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

Versi **modular** dari komponen pipeline DR-VERGE. Notebook final memuat implementasi lengkapnya sendiri agar dapat berjalan mandiri di Colab; modul di sini menyajikan komponen yang sama dalam bentuk berkas Python terpisah agar mudah dibaca, digunakan ulang, dan diuji.

| Berkas | Isi utama |
|---|---|
| [`models.py`](models.py) | `CORALHead` (_ordered bias_), `DualViewResNetTeacher`, `DepthwiseSeparableBlock`, `LightweightBackbone`, `DualViewLightStudent` |
| [`losses.py`](losses.py) | `coral_loss`, `aux_loss`, `logit_kd_loss`, `csd_loss` (beserta varian ablasi), `ordinal_violation_rate`, `combined_student_loss` |
| [`datasets.py`](datasets.py) | `DRTiDDualViewDataset` (pasangan makula + diskus optik), `APTOSSingleViewDataset`, transformasi augmentasi |
| [`pretrain_aptos.py`](pretrain_aptos.py) | Prapelatihan _backbone_ pada APTOS 2019 dari berkas YAML di [`../configs/`](../configs/) |
| [`utils.py`](utils.py) | Pengaturan _seed_, generator deterministik, pemuat konfigurasi, bobot positif per _threshold_ |
| [`smoke_test.py`](smoke_test.py) | Pemeriksaan cepat bahwa model, _loss_, dan data dapat dirangkai dan dijalankan |

## ▶️ Pemakaian

Jalankan dari folder `experiments/`, setelah _split_ lokal dibuat dengan [`../scripts/make_splits.py`](../scripts/make_splits.py):

```bash
python scripts/make_splits.py                     # menulis experiments/data/splits/ (lokal, tidak di-commit)
python src/smoke_test.py
python src/pretrain_aptos.py configs/pretrain_aptos_lightweight.yaml
```

> [!NOTE]
> Nilai yang benar-benar dipakai run final (resolusi 384, β = 0,1, _threshold_ terkalibrasi, dll.) tercatat di [`../results/configs/`](../results/configs/). Bila ada perbedaan antara modul ini dan notebook, **notebook dan `results/configs/` yang berlaku**.
