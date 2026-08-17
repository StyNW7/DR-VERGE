# notebooks/

Notebook pipeline DR-VERGE, disimpan sebagai sumber. Versi yang **benar-benar dieksekusi beserta seluruh keluarannya** berada di [`../../results/`](../../results/).

| Berkas | Peran |
|---|---|
| `full_pipeline_notebook_enhanced.ipynb` | **Run final.** Resolusi 384, lima *core seed*, 10.000 replikasi *bootstrap*, evaluasi konfirmatori eksternal |
| `full_pipeline_notebook_simple.ipynb` | Run pendahulu dengan protokol lebih ringkas |
| `full_pipeline_notebook_final_last_efficient.ipynb` | Varian hemat komputasi |
| `full_pipeline_notebook_final.ipynb` | Versi antara sebelum run *enhanced* |

Penjelasan tiap notebook ada di [`../notebooks-result-explanation/`](../notebooks-result-explanation/).

Notebook dirancang untuk dijalankan di Google Colab dengan GPU. Kebutuhan lingkungan tercantum pada [`../requirements.txt`](../requirements.txt), sedangkan versi paket persis yang dipakai run final terekam di `../../results/enhanced-notebook/outputs/configs/requirements_exact.txt`.
