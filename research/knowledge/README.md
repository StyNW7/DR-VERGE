# research/knowledge/

Catatan teknis yang menjembatani hasil penelitian dengan penerapannya, serta pemeriksaan terhadap sifat dataset.

| Berkas | Isi |
|---|---|
| [`deployment-guide.md`](deployment-guide.md) | Langkah menghubungkan model hasil notebook dengan web demo: artefak mana yang dipakai, di mana disimpan, dan bagaimana dijalankan di peramban |
| [`model-files-for-deployment.md`](model-files-for-deployment.md) | Berkas model mana saja yang benar-benar dibutuhkan untuk melayani prediksi, dan mana yang tidak |
| [`drtid-laterality-examples/`](drtid-laterality-examples/) | Empat citra contoh yang menunjukkan DRTiD membedakan mata kiri dan kanan, tetapi tidak menyediakan identitas pasien |

Temuan pada `drtid-laterality-examples/` berdampak langsung pada metodologi: karena DRTiD tidak menyediakan identitas pasien, partisi internal bersifat *eye-disjoint* dan pengelompokan *bootstrap* dilakukan pada tingkat mata, bukan tingkat pasien.
