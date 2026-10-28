# ⚙️ configs/

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

Satu berkas YAML untuk setiap kondisi pelatihan. Setiap berkas menetapkan arsitektur, _optimizer_, jadwal, dan bobot _loss_ untuk satu cabang eksperimen, sehingga sebuah kondisi dapat dipahami tanpa membaca notebook.

| Berkas | Kondisi |
|---|---|
| [`teacher.yaml`](teacher.yaml) | _Teacher_ ResNet-50 _dual-view_ |
| [`student_dual_csd.yaml`](student_dual_csd.yaml) | **Usulan** — Logit-KD + _Complementarity-Shift Distillation_ |
| [`student_dual_logitkd.yaml`](student_dual_logitkd.yaml) | Pembanding — distilasi logit saja |
| [`student_dual_no_distill.yaml`](student_dual_no_distill.yaml) | Pembanding — _dual-view_ tanpa distilasi |
| [`student_macula_only.yaml`](student_macula_only.yaml) | Kontrol _single-view_, _field_ makula |
| [`student_disc_only.yaml`](student_disc_only.yaml) | Kontrol _single-view_, _field_ diskus optik |
| [`pretrain_aptos_resnet50.yaml`](pretrain_aptos_resnet50.yaml) | Prapelatihan APTOS untuk _backbone_ _teacher_ |
| [`pretrain_aptos_lightweight.yaml`](pretrain_aptos_lightweight.yaml) | Prapelatihan APTOS untuk _backbone_ _student_ |

Path di dalam YAML (`data/splits/…`, `checkpoints/…`) relatif terhadap folder `experiments/`.

> [!IMPORTANT]
> YAML ini **mendeskripsikan** setiap kondisi. Nilai yang **benar-benar dieksekusi** run final — hasil _grid search_ pada validasi — dikunci di [`../results/configs/`](../results/configs/), terutama `config.json` dan `selected_hyperparameters.json` (α = 0,5 · τ = 2,0 · γ = 2,0 · β = 0,1 · varian `smoothl1_norm`). Itulah catatan otoritatif.
