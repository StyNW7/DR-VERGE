# src/

Modul Python pendukung pipeline DR-VERGE. Notebook memuat implementasi lengkapnya sendiri agar dapat berjalan mandiri di Colab; berkas di sini adalah versi modular dari komponen yang sama.

| Berkas | Isi |
|---|---|
| `models.py` | Arsitektur *teacher* dual-view, *lightweight student*, modul fusi antar-bidang, dan kepala ordinal CORAL |
| `losses.py` | Fungsi kerugian: CORAL ordinal, distilasi logit, distilasi fitur, dan Complementarity-Shift Distillation |
| `datasets.py` | Pemuat data pasangan *two-field* beserta transformasi citra |
| `pretrain_aptos.py` | Pralatih *backbone* pada APTOS 2019 |
| `utils.py` | Utilitas umum: pengaturan *seed*, metrik, dan pencatatan |
| `smoke_test.py` | Pemeriksaan cepat bahwa seluruh komponen dapat dirangkai dan dijalankan |

Skrip verifikasi terpisah ada di [`../scripts/verification/`](../scripts/verification/).
