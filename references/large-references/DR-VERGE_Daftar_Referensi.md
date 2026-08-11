# Daftar Referensi untuk KTI DR-VERGE

Dikumpulkan dan dikelompokkan berdasarkan komponen DR-VERGE: dataset, metode pembanding (SOTA), fondasi metodologis, dan latar belakang klinis. Semua link sudah diverifikasi lewat pencarian, bukan hasil ingatan/tebakan.

---

## A. Dataset

| Judul / Sumber | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| Cross-Field Transformer for Diabetic Retinopathy Grading on Two-field Fundus Images (memperkenalkan dataset **DRTiD**) | Hou, Xu, Xiao, Zhao, Zhang, Zou, Lu, Xue, Feng — 2022, IEEE BIBM | Sumber dataset primer DR-VERGE (3.100 gambar dual-view). Juga memperkenalkan CrossFiT, metode cross-attention yang jadi rujukan angka benchmark utama (macula 80,47% / disc 77,87% / dual 84,21%; QWK 93,33% di test set publik). **Wajib dikutip** karena DR-VERGE dilatih langsung di atas dataset ini. | arxiv.org/abs/2211.14552 · github.com/FDU-VTS/DRTiD |
| DeepDRiD: Diabetic Retinopathy—Grading and Image Quality Estimation Challenge | Liu, Wang, Wu, Dai, Fang, Yan, dkk. — 2022, *Patterns* (Cell Press) | Dataset dual-view alternatif (500 pasien, 2.000 gambar) yang sempat dipertimbangkan sebagai dataset primer sebelum diputuskan pindah ke DRTiD. Tetap relevan dikutip di studi literatur sebagai konteks tantangan two-field DR grading, meski tidak dipakai sebagai data training. | sciencedirect.com/science/article/pii/S2666389922001040 |
| APTOS 2019 Blindness Detection | Asia Pacific Tele-Ophthalmology Society — Kaggle Competition, 2019 | Dataset single-view (3.662 gambar) untuk pretraining backbone (Bagian 7 master guide) — dipakai apa adanya, tidak berubah oleh keputusan dataset primer. | kaggle.com/c/aptos2019-blindness-detection |

---

## B. Metode Multi-View DR Grading (SOTA — pembanding langsung / studi literatur)

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| Like an Ophthalmologist: Dynamic Selection Driven Multi-View Learning for Diabetic Retinopathy Grading | Luo, Xu, Wu, Liu, Lai, Shen — 2025, AAAI | Multi-View Mixture-of-Experts untuk fusi dinamis antar-view, dievaluasi di 34.452 gambar multi-view. SOTA akurasi tapi berat — pas untuk narasi "model besar akurat tapi tidak bisa di-deploy di edge" di Bagian 2 (Research Gap). | ojs.aaai.org/index.php/AAAI/article/view/34116 |
| Learning to Fuse and Reconstruct Multi-View Graphs for Diabetic Retinopathy Grading (**MVGFDR**) | Li, Lin, Wang, Luo, Zhu, Shi, Chen, Du, Barthelemy, Xue, Shen, Xu — Feb 2026, arXiv | Framework graph fusion yang secara eksplisit men-disentangle fitur shared vs view-specific antar multi-view (via DCT frequency-domain anchors). Paling dekat secara konsep dengan pemisahan "relation vs view-specific" yang jadi motivasi awal CSD — penting untuk positioning gap di Bagian 2. | arxiv.org/abs/2602.21944 |
| A Lesion-Fusion Neural Network for Multi-View Diabetic Retinopathy Grading | Luo, Xu, Wang, Huang, Liu, Jin, Zhang — 2025, *IEEE J. Biomedical and Health Informatics* | Menangani keterbatasan fundus single-field lewat fusi informasi lesi multi-view. Baik sebagai pembanding metode fusion non-attention. | pubmed.ncbi.nlm.nih.gov/38568769 |
| Incomplete Multi-view Diabetic Retinopathy Grading via Self-Supervised Inter- and Intra-View Restoration | — AAAI 2025/2026 | Menangani kasus salah satu view hilang — relevan untuk bagian limitasi/future work DR-VERGE (skenario dunia nyata di mana salah satu foto gagal diambil). | ojs.aaai.org/index.php/AAAI/article/view/38064 |
| Wavelet-based Global-Local Interaction Network with Cross-Attention for Multi-View Diabetic Retinopathy Detection | — 2025, arXiv | Pendekatan cross-attention wavelet-based untuk multi-view DR. Baik sebagai satu lagi pembanding arsitektur fusion di studi literatur. | arxiv.org/pdf/2503.19329 |

---

## C. Ordinal Regression (fondasi CORAL Head)

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| Rank Consistent Ordinal Regression for Neural Networks with Application to Age Estimation (**CORAL**) | Cao, Mirjalili, Raschka — 2020, *Pattern Recognition Letters* | Dasar matematis CORALHead (Bagian 3.1 master guide) — jaminan rank-monotonicity untuk grading ordinal. **Wajib dikutip** sebagai fondasi metode inti. | arxiv.org/abs/1901.07884 |
| Deep Neural Networks for Rank-Consistent Ordinal Regression Based On Conditional Probabilities (**CORN**) | Shi, Cao, Raschka — 2021, arXiv | Versi lanjutan CORAL yang mengklaim performa lebih baik. Baik disebut di studi literatur sebagai alternatif metode ordinal yang dipertimbangkan tapi tidak dipakai (beri alasan kenapa CORAL dipilih, mis. kesederhanaan implementasi untuk konteks kuantisasi). | arxiv.org/abs/2111.08851 |
| Weighted Kappa: Nominal Scale Agreement with Provision for Scaled Disagreement or Partial Credit | Cohen — 1968, *Psychological Bulletin*, 70, 213–220 | Sumber asli metrik QWK (Quadratic Weighted Kappa) yang jadi metrik utama evaluasi DR-VERGE. Kutipan standar di hampir semua paper grading ordinal medis. | doi.org/10.1037/h0026256 |

---

## D. Knowledge Distillation & Quantization (fondasi umum)

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| Distilling the Knowledge in a Neural Network | Hinton, Vinyals, Dean — 2015, arXiv (NIPS DL Workshop 2014) | Paper fondasi knowledge distillation — dasar `L_logit_KD` (Bagian 5.3 master guide) dan seluruh kerangka teacher-student. **Wajib dikutip.** | arxiv.org/abs/1503.02531 |
| A Survey of Quantization Methods for Efficient Neural Network Inference | Gholami, Kim, Dong, Yao, Mahoney, Keutzer — 2021, arXiv | Survei komprehensif teknik kuantisasi (PTQ vs QAT, dsb.) — dasar teoritis Bagian 9-10 master guide (PTQ INT8). Sudah dikutip di draft-draft sebelumnya. | arxiv.org/abs/2103.13630 |
| Self-Supervised Quantization-Aware Knowledge Distillation (**SQAKD**) | Zhao, Zhao — 2024, AISTATS (PMLR 238) | Menggabungkan QAT + KD dalam satu framework self-supervised. Referensi teknis penting untuk bagian future work (QAT) DR-VERGE — menjelaskan kenapa gabungan KD+QAT itu genuinely lebih rumit dari cuma PTQ, mendukung keputusan scoping QAT sebagai future work. | arxiv.org/abs/2403.11106 · proceedings.mlr.press/v238/zhao24d.html |

---

## E. Knowledge Distillation untuk DR Grading (pembanding paling langsung — WAJIB dibahas di Research Gap)

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| OrthKD: Extracting Generalized Clinical Knowledge from Heterogeneous Teachers for Lightweight Deployment | — 2026, arXiv | Multi-teacher KD untuk DR screening edge deployment, dengan constraint orthogonality antar proyeksi teacher agar mendorong bukti komplementer (bukan redundan). **Sangat dekat secara filosofi dengan CSD** — perlu dibedakan eksplisit di Bagian Research Gap: OrthKD orthogonality antar-teacher (multi-teacher, single-view), CSD orthogonality/complementarity antar-view (single-teacher, dual-view). | arxiv.org/html/2607.25545 |
| Knowledge distillation-based lightweight MobileNet model for diabetic retinopathy classification | Dejene, Ayano, Feyisa, dkk. — 2026, *Scientific Reports* | KD standar (bukan ordinal, bukan dual-view) untuk DR classification ringan berbasis MobileNet, dievaluasi di APTOS 2019. Baseline penting di studi literatur untuk menunjukkan KD generik pada DR grading itu sudah ada, tapi single-view. | nature.com/articles/s41598-025-30893-7 |
| Toward Lightweight Diabetic Retinopathy Classification: A Knowledge Distillation Approach for Resource-Constrained Settings | Islam, Jony, Hasan, Sutradhar, Rahman, Islam — 2023, *Applied Sciences* (MDPI) | Teacher ResNet152V2+Swin Transformer → student Xception+CBAM (102MB). Baik sebagai pembanding ukuran model (student DR-VERGE jauh lebih kecil, ~puluhan KB-MB). | doi.org/10.3390/app132212397 |
| Edge-Enhanced Knowledge Distillation System for Diabetic Retinopathy Lesions Computer-Aided Diagnosis | Lopez-Figueroa, Jacome-Herrera, Moya-Albor, Renza, Brieva — 2026, Springer (Studies in Computational Intelligence) | KD ke MobileNet-v2 untuk deteksi lesi DR di edge device. Baik untuk memperkuat narasi kebutuhan edge deployment di Pendahuluan. | doi.org/10.1007/978-3-031-96328-5_1 |

---

## F. Backbone & Arsitektur Efisien

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| Deep Residual Learning for Image Recognition (**ResNet**) | He, Zhang, Ren, Sun — 2016, IEEE CVPR | Fondasi backbone teacher (ResNet-50). **Wajib dikutip.** | cv-foundation.org/openaccess/content_cvpr_2016/papers/He_Deep_Residual_Learning_CVPR_2016_paper.pdf |
| MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications | Howard, Zhu, Chen, Kalenichenko, Wang, Weyand, Andreetto, Adam — 2017, arXiv (Google) | Fondasi depthwise-separable convolution yang dipakai di backbone student (Bagian 4 master guide) dan sebagai referensi fallback (MobileNetV3-Small). **Wajib dikutip.** | arxiv.org/abs/1704.04861 |

---

## G. Precedent Langsung & Domain Analog

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| PINK-MVAN: Quantized Multi-View Adaptive Networks untuk Deteksi Kanker Payudara melalui Citra Mammografi | Prawira, Jocelyn, Rahman, Wicaksono — 2025, GEMASTIK Juara 1 | Precedent langsung — struktur paper, framing SDG/3T, resep KD+PTQ yang jadi acuan awal DR-VERGE. Wajib dikutip dan dibedakan eksplisit di Bagian Research Gap (lihat diskusi diferensiasi sebelumnya). | (dokumen internal tim / buletin GEMASTIK 2025) |
| Deep Neural Networks for Multi-View Mammographic Cancer Detection | Wu, Phang, Park, Shen, Huang, Zorin, Jastrzebski, Fevry, Kats, Kim, dkk. — 2019, *IEEE Trans. Medical Imaging* | Precedent arsitektur dual-view fusion (CC+MLO) yang juga jadi rujukan Pink-MVAN (ref [23] di papernya). Baik untuk menunjukkan pola arsitektur backbone-bersama + fusion itu established lintas modalitas citra medis. | (dikutip via Pink-MVAN ref [23]; IEEE Xplore) |
| Modeling Multiple Views via Implicitly Preserving Global Consistency and Local Complementarity (**CoCoNet**) | — (Rutgers), diterbitkan di venue self-supervised learning | Framework yang secara eksplisit memisahkan sinyal "consistency" (shared) dan "complementarity" antar-view via kontrastif. Relevan sebagai rujukan konsep complementarity yang mendasari CSD, meski domainnya bukan medis. | researchwithrutgers.com/en/publications/modeling-multiple-views-via-implicitly-preserving-global-consiste |
| A Multi-View Deep Learning Model for Thyroid Nodules Detection and Characterization in Ultrasound Imaging | — 2024, PMC | Precedent dual-view (transverse + longitudinal) di domain ultrasound tiroid — bukan DR, bukan KD, tapi menguatkan klaim bahwa pola dual-view medis itu umum lintas modalitas (mendukung klaim generalizability yang HARUS dituliskan hati-hati, tidak overclaim). | pmc.ncbi.nlm.nih.gov/articles/PMC11273835 |

---

## H. Latar Belakang Klinis & Epidemiologi Indonesia

| Judul | Penulis, Tahun, Venue | Ringkasan Isi & Relevansi | Link |
|---|---|---|---|
| Upaya Cegah Kebutaan Akibat Retinopati Diabetik (liputan konsorsium DRIVE Kemenkes–UGM–Roche) | Bisnis.com, Juli 2026 | Sumber paling baru dan spesifik: rasio 1 dokter spesialis mata per ~116.000 penduduk Indonesia, prevalensi RD Yogyakarta 43,1% (vs global 35,4%), proyeksi kerugian ekonomi Rp84,7 triliun akibat DR tidak tertangani. **Sangat kuat untuk Pendahuluan** — angka konkret dan terbaru. | lifestyle.bisnis.com/read/20260721/106/1989652 |
| Epidemiologi Retinopati Diabetik | Alomedika, diperbarui Desember 2025 | Angka global: 95 juta (35,4%) penderita diabetes mengalami DR, sepertiga berisiko kehilangan penglihatan. Baik sebagai rujukan pembanding skala global vs Indonesia. | alomedika.com/penyakit/oftalmologi/retinopati-diabetik/epidemiologi |
| Prevalensi Retinopati Diabetik pada Pasien di Puskesmas Bandung Raya | — 2022, *eJKI* (Universitas Indonesia) | Data lokal Indonesia di layanan primer (Puskesmas) — prevalensi RD 19,46%, VTDR 7,68%. Relevan untuk memperkuat argumen "screening di fasilitas primer/3T" karena datanya memang dari Puskesmas, bukan RS besar. | ejki.fk.ui.ac.id/index.php/journal/article/download/119/45/685 |

---

## Catatan Penggunaan

1. **Kategori B dan E adalah yang paling kritis** untuk Bagian Research Gap — pastikan tabel SOTA di paper (seperti Bagian 2 master guide) memasukkan semua entri ini dengan kolom pembeda yang sama (two-field anatomis / KD / lightweight / preservasi complementarity / quantization), supaya posisi DR-VERGE di antara mereka terlihat jelas dan tidak overclaim.
2. **MVGFDR dan OrthKD** adalah dua paper yang **paling dekat secara konsep** dengan DR-VERGE — pastikan diferensiasi dituliskan eksplisit dan jujur (MVGFDR: disentanglement shared/specific tanpa distilasi atau kuantisasi; OrthKD: distilasi multi-teacher single-view, bukan dual-view).
3. Untuk kutipan Pink-MVAN dan referensi internal lain yang tidak terindeks di database publik (buletin GEMASTIK), gunakan format sitasi sesuai pedoman KTI GEMASTIK — cek dengan pembimbing apakah perlu DOI/link resmi buletin.
4. Semua link di atas sudah diverifikasi bisa diakses saat pencarian dilakukan — tetap disarankan cross-check manual sebelum submit final, terutama untuk paper arXiv yang mungkin sudah naik versi (v2, v3, dst.) dengan sedikit perubahan judul/abstrak.
