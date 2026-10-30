# DR-VERGE — Kamus Matematika

Daftar lengkap simbol, notasi, rumus, dan konstanta matematika yang dipakai di DR-VERGE, dari
arsitektur model, fungsi loss, CSD, metrik, statistik, kuantisasi, sampai inferensi di browser.
Setiap baris menjelaskan **apa simbolnya**, **bagaimana rumusnya**, dan **apa maknanya** di
penelitian ini.

> **Sumber kebenaran.** Rumus diambil dari kode yang benar-benar dieksekusi pada run final
> (`experiments/notebooks/full_pipeline_notebook_enhanced.ipynb`, run
> `artifacts_enhanced_v1_20260811`). Angka contoh diambil dari
> `experiments/results/`. Kalau rencana awal (`research/documentation/overview.md`)
> atau kode lama (`experiments/src/`) berbeda, perbedaannya dicatat di
> [§19](#19-evolusi-rumus-rencana--kode-lama--run-final).

**Cara membaca tabel**

| Kolom | Isi |
|---|---|
| **Simbol / Nama** | Notasi matematika yang dipakai di dokumen ini, plus nama variabel di kode bila ada (`monospace`) |
| **Rumus / Definisi** | Definisi formal. Indeks $i$ = sampel (mata), $k$ = threshold ordinal, $s$ = seed, $b$ = replikasi bootstrap |
| **Arti & Makna** | Apa artinya, dan kenapa penting untuk DR-VERGE |
| **Lokasi** | Tempat rumus itu didefinisikan di repositori |

Singkatan lokasi: **NB-E** = notebook enhanced (run final), **NB-S** = notebook simple,
**NB-Ef** = notebook efficient, **src** = `experiments/src/`, **FE** = `frontend/src/`.

---

## Daftar Isi

1. [Notasi dasar, himpunan, dan indeks](#1-notasi-dasar-himpunan-dan-indeks)
2. [Operator dan fungsi matematika umum](#2-operator-dan-fungsi-matematika-umum)
3. [Data, split, dan preprocessing](#3-data-split-dan-preprocessing)
4. [Arsitektur model](#4-arsitektur-model)
5. [Head ordinal CORAL](#5-head-ordinal-coral)
6. [Fungsi loss](#6-fungsi-loss)
7. [Complementarity-Shift Distillation (CSD)](#7-complementarity-shift-distillation-csd)
8. [Metrik mekanisme (RQ1)](#8-metrik-mekanisme-rq1)
9. [Metrik prediktif, ordinal, dan kalibrasi](#9-metrik-prediktif-ordinal-dan-kalibrasi)
10. [Optimisasi dan training](#10-optimisasi-dan-training)
11. [Hyperparameter, threshold, dan aturan seleksi](#11-hyperparameter-threshold-dan-aturan-seleksi)
12. [Statistik inferensial](#12-statistik-inferensial)
13. [Kuantisasi INT8 (RQ2)](#13-kuantisasi-int8-rq2)
14. [Efisiensi dan retensi](#14-efisiensi-dan-retensi)
15. [Ekspor, verifikasi, dan gate numerik](#15-ekspor-verifikasi-dan-gate-numerik)
16. [Inferensi di browser (frontend)](#16-inferensi-di-browser-frontend)
17. [Hipotesis dan perbandingan yang dipra-registrasi](#17-hipotesis-dan-perbandingan-yang-dipra-registrasi)
18. [Konstanta dan angka kunci](#18-konstanta-dan-angka-kunci)
19. [Evolusi rumus: rencana → kode lama → run final](#19-evolusi-rumus-rencana--kode-lama--run-final)
20. [Simbol tipografis di dokumen dan tabel hasil](#20-simbol-tipografis-di-dokumen-dan-tabel-hasil)
21. [Analisis suplementer v2: dekomposisi dan inferensi mekanisme](#21-analisis-suplementer-v2-dekomposisi-dan-inferensi-mekanisme)

---

## 1. Notasi dasar, himpunan, dan indeks

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $K$ · `NUM_CLASSES` | $K = 5$ | Jumlah grade DR: 0 = No DR, 1 = Mild NPDR, 2 = Moderate NPDR, 3 = Severe NPDR, 4 = Proliferative DR | NB-E cell 6; FE `data/drGrades.ts` |
| $K-1$ · `NUM_THRESHOLDS` | $K-1 = 4$ | Jumlah threshold kumulatif CORAL. Model **tidak** mengeluarkan 5 probabilitas kelas, melainkan 4 skor $P(Y>k)$ | NB-E cell 6 |
| $k$ | $k \in \{0,1,2,3\}$ | Indeks threshold ordinal. Threshold ke-$k$ menjawab "apakah grade **lebih dari** $k$?" | seluruh kode CORAL |
| $g$ | $g \in \{0,\dots,4\}$ | Indeks grade (kelas) | metrik per-grade |
| $Y,\ y_i$ | $y_i \in \{0,1,2,3,4\}$ | Grade sebenarnya (ground truth) untuk mata ke-$i$. Bersifat **ordinal**: $0<1<2<3<4$ | dataset |
| $\hat y_i$ | lihat [§5](#5-head-ordinal-coral) | Grade prediksi model | `grade_from` |
| $i,\ N$ | $i = 1,\dots,N$ | Indeks sampel. Satu sampel = **satu mata** = satu pasangan foto (macula, disc) | dataset |
| $B$ (batch) | $B = 8$ per langkah (384 px), efektif 16 | Ukuran mini-batch saat training. Jangan tertukar dengan $B$ bootstrap ([§12](#12-statistik-inferensial)) | `batch_plan` |
| $x^{m}_i,\ x^{d}_i$ | $x \in \mathbb{R}^{3\times H\times W}$ | Foto fundus **macula-centred** dan **optic-disc-centred** untuk mata yang sama | `DualViewDataset` |
| $H = W$ · `IMG_SIZE` | $384$ (run final), $224$ (run simple/efficient) | Resolusi input; dipilih oleh Stage A | NB-E cell 32 |
| $T,\ S$ (superskrip) | $p^{T},\ p^{S}$ | Penanda besaran milik **Teacher** (ResNet-50) atau **Student** (ringan) | seluruh dokumen |
| $\mathrm{dual},\ m,\ d$ (subskrip) | $p_{\mathrm{dual}},\ p_{m},\ p_{d}$ | Keluaran head dual-view, head auxiliary macula, head auxiliary disc | `forward()` |
| $\theta$ | — | Seluruh parameter yang dilatih (bobot jaringan) | — |
| $\theta_{bb}$ | — | Parameter **backbone bersama** (shared). Dipakai untuk mengukur norma gradien tiap loss | `grad_norms` |
| $s$ (seed) | $s \in \{42, 123, 2026, 3407, 8888\}$ | Seed acak. Jangan tertukar dengan skala CSD $s_{\mathrm{CSD}}$ | `SEEDS_CORE` |
| $S$ (jumlah seed) | $S = 5$ (core), $3$ (tuning/ablasi) | Banyak seed per kondisi | `SEEDS_*` |
| $c,\ \mathcal{C}$ | $c \in \mathcal{C}$ | Cluster resampling bootstrap: **mata** untuk DRTiD, **pasien** untuk DeepDRiD | `cluster_id` |
| $\mathcal{D}_{\mathrm{train}},\ \mathcal{D}_{\mathrm{val}},\ \mathcal{D}_{\mathrm{test}}$ | $800 / 200 / 550$ mata | Split DRTiD. Test **tidak pernah** dipakai untuk seleksi apa pun | `make_splits` |
| $M$ (kondisi/metode) | mis. `dual_csd`, `dual_logitkd` | Satu konfigurasi training yang dibandingkan | `CORE_CONDITIONS` |
| $M^{\ast}$ · `BEST_CONDITION` | lihat [§11](#11-hyperparameter-threshold-dan-aturan-seleksi) | Metode terbaik yang dipilih di validasi (run final: `dual_csd`) | `select_method` |
| $\mathcal{M}(\cdot)$ | fungsi metrik | Notasi umum untuk metrik apa pun (QWK, MAE, …) di rumus bootstrap | `metric_fns` |

---

## 2. Operator dan fungsi matematika umum

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $\sigma(\cdot)$ — sigmoid | $\sigma(x) = \dfrac{1}{1+e^{-x}}$ | Mengubah logit menjadi skor di $(0,1)$. Di CORAL, $\sigma(\ell_k) = P(Y>k)$ | `torch.sigmoid` |
| $\operatorname{logit}(\cdot)$ | $\operatorname{logit}(p) = \ln\dfrac{p}{1-p}$ | Kebalikan sigmoid. Dipakai untuk inisialisasi threshold dari marginal data | `init_thresholds` |
| $\operatorname{softplus}(\cdot)$ | $\operatorname{softplus}(x) = \ln(1+e^{x}) > 0$ | Menjamin langkah antar-threshold **selalu positif** → monotonicity CORAL terjamin secara konstruksi | `CORALHead.biases` |
| $\operatorname{softplus}^{-1}(\cdot)$ | $\ln(e^{x}-1)$ = `log(expm1(x))` | Dipakai saat inisialisasi agar $\operatorname{softplus}(\delta_k)$ tepat sama dengan jarak threshold empiris | `CORALHead.__init__` |
| $\operatorname{softmax}(\cdot)$ | $\operatorname{softmax}(v)_k = \dfrac{e^{v_k}}{\sum_j e^{v_j}}$ | Hanya dipakai di varian ablasi `kl_softmax` (kontrol negatif) | `csd_loss` |
| $\operatorname{ReLU}(\cdot)$ | $\max(0, x)$ | Aktivasi. Dipakai ReLU (bukan ReLU6) karena eager quantization punya fuser Conv-BN-ReLU | `DWSepBlock` |
| $[a;\,b]$ / $\operatorname{concat}$ | penggabungan vektor | Konkatenasi fitur (mis. input InteractionFusion) | `torch.cat` |
| $\odot$ | $(a\odot b)_j = a_j b_j$ | Perkalian elemen-per-elemen (Hadamard). Menangkap **interaksi** antar-view | `InteractionFusion` |
| $\lvert a \rvert$ | nilai mutlak (elemen-per-elemen untuk vektor) | Dipakai di $\lvert z_m - z_d\rvert$, $\lvert\Delta\rvert$, MAE, severe error | — |
| $\lVert v\rVert_1$ | $\sum_k \lvert v_k\rvert$ | Norma L1. Dipakai di ShiftL1 dan statistik $\Delta$ | `shift_fidelity` |
| $\lVert v\rVert_2$ | $\sqrt{\sum_k v_k^2}$ | Norma L2 (Euclid). Dipakai di bobot magnitudo CSD dan norma gradien | `csd_loss`, `grad_norms` |
| $\cos(a,b)$ | $\dfrac{a^{\top}b}{\max(\lVert a\rVert_2\lVert b\rVert_2,\ \epsilon)}$, $\epsilon=10^{-6}$ | Cosine similarity: kesamaan **arah** dua vektor, tanpa melihat besarnya | `F.cosine_similarity` |
| $\mathbf{1}[\cdot]$ | $1$ jika kondisi benar, $0$ jika salah | Fungsi indikator. Dasar aturan grade CORAL dan banyak metrik | — |
| $\mathbb{E}[\cdot]$ | ekspektasi / rata-rata | Mis. $\mathbb{E}_{\mathrm{train}}[\lvert\Delta^T\rvert]$ = rata-rata atas seluruh data training | `global_delta_scale` |
| $\operatorname{median}(\cdot)$ | nilai tengah | Dipakai di latency, threshold $t^{\ast}$, bobot magnitudo CSD | — |
| $Q_{q}(\cdot)$ | persentil ke-$q$ | Batas CI bootstrap ($Q_{2.5}, Q_{97.5}$), latency p95/p99 | `np.percentile` |
| $\arg\max$ | argumen yang memaksimalkan | Dipakai untuk **seleksi** (metode, seed, threshold), **tidak pernah** untuk menentukan grade | `select_method` |
| $\operatorname{sg}(\cdot)$ — stop-gradient | $\operatorname{sg}(x) = x$, $\nabla \operatorname{sg}(x) = 0$ | `.detach()`. Target teacher tidak menerima gradien, sehingga hanya student yang belajar | `csd_loss`, `logit_kd_loss` |
| $\nabla_{\theta}\mathcal{L}$ | gradien loss terhadap parameter | Dasar update optimizer dan diagnosa kontribusi tiap loss | `grad_norms` |
| $\operatorname{clamp}(x, a, b)$ | $\min(\max(x,a),b)$ | Membatasi nilai; mis. $p$ dibatasi ke $[10^{-6}, 1-10^{-6}]$ sebelum $\log$ | `_nll` |
| $\operatorname{round}(\cdot)$ | pembulatan ke integer terdekat | Inti operasi kuantisasi INT8 | [§13](#13-kuantisasi-int8-rq2) |
| $\epsilon$ | konstanta kecil ($10^{-3}$ s.d. $10^{-12}$) | Mencegah pembagian nol / $\log 0$. Nilainya disebut di tiap rumus | berbagai |

---

## 3. Data, split, dan preprocessing

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| Jumlah data DRTiD | $1550$ mata $= 1000$ (train resmi) $+ 550$ (test resmi); $3100$ gambar | Dataset primer, dua foto per mata | `dataset/README.md` |
| Split internal | $1000 \rightarrow 800$ train $+ 200$ val; `VAL_FRACTION = 0.20` | Validasi dipotong dari train resmi, **stratified by grade** (deviasi proporsi kelas maks $0.0025$) | `make_splits` |
| Eye-disjoint | $\mathcal{D}_{\mathrm{train}}\cap\mathcal{D}_{\mathrm{val}}\cap\mathcal{D}_{\mathrm{test}} = \varnothing$ (per `record_id`) | Tidak ada mata yang muncul di dua split. DRTiD tidak punya ID pasien, jadi cluster = mata | Gate 1 |
| Peluang pasangan kebetulan | ID berurutan berpasangan L/R hanya $50.2\%$ | Setara peluang acak → patient grouping **tidak bisa** direkonstruksi dari DRTiD | `research/knowledge/drtid-laterality-examples/` |
| APTOS 2019 | $3662$ gambar single-view | Hanya untuk pre-training backbone | `APTOSDataset` |
| DeepDRiD Set-C | $100$ pasien · $200$ mata · $400$ gambar | Set eksternal **konfirmatori**, dibuka sekali; cluster = pasien | `SetCDataset` |
| ID DeepDRiD | `image_id = 347_l1` → pasien $347$, mata $l$, field $1$; `sample_id = 347_l` | Satu mata wajib punya tepat field $\{1,2\}$ | `SetCDataset` |
| Urutan field | primer `_1 = macula`; `_1 = disc` = analisis sensitivitas | Dipra-registrasi; urutan yang skornya lebih tinggi **tidak boleh** dipromosikan | `DEEPDRID_ORDERS` |
| Normalisasi | $x'_{c} = \dfrac{x_{c}/255 - \mu_c}{\sigma_c}$ untuk kanal $c \in \{R,G,B\}$ | Skala piksel ke $[0,1]$ lalu standardisasi per kanal | `build_tf`; FE `onnxModel.ts` |
| $\mu,\ \sigma$ DRTiD | $\mu = (0.372487,\ 0.217266,\ 0.119367)$; $\sigma = (0.281526,\ 0.179457,\ 0.109162)$ | Statistik kanal milik DRTiD (dari CrossFiT) — menyelaraskan preprocessing dengan benchmark | `DRTID_MEAN/STD` |
| $\mu,\ \sigma$ ImageNet | $\mu = (0.485,\ 0.456,\ 0.406)$; $\sigma = (0.229,\ 0.224,\ 0.225)$ | Dipakai saat pre-training APTOS | `IMAGENET_MEAN/STD` |
| Resize | $(H_0, W_0) \rightarrow (384, 384)$ tanpa menjaga aspek rasio | Foto non-persegi "dipencet" jadi persegi; frontend **wajib** meniru ini | `A.Resize`; FE `toTensor` |
| Rasio piksel | $(384/224)^2 \approx 2.94$ | Biaya komputasi 384 px ≈ 2,94× dari 224 px; alasan ambang Stage A $+0.01$ QWK | NB-E cell 6 |
| Rotasi | $\phi \sim \mathcal{U}(-15^{\circ}, +15^{\circ})$, dengan peluang $p=0.7$ | Augmentasi geometri, **sama** untuk kedua foto satu mata (`PairedTransform`) | `PairedTransform` |
| Brightness/contrast | faktor $\in [-0.15, +0.15]$, peluang $p=0.5$ | Augmentasi fotometrik, **independen** per foto | `PairedTransform` |
| Horizontal flip | tidak dipakai | Flip mengubah semantik lateralitas (posisi nasal–temporal macula/disc) | `build_tf` |
| Bobot sampler | $w_{y} = \dfrac{1}{\sqrt{n_{y}}}$, $\ P(\text{ambil } i) = \dfrac{w_{y_i}}{\sum_j w_{y_j}}$ | Opsi *sqrt class-balanced sampling*. Versi $1/n_y$ dihindari karena over-koreksi. Run final memilih **standard** sampling di Stage A | `class_balanced_weights` |
| $n_{y}$ | banyak sampel train ber-grade $y$ | Frekuensi kelas | — |
| SHA-256 | hash file split / kalibrasi | Identitas data: menjamin split yang sama dipakai di semua tahap | `split_manifest.json` |

---

## 4. Arsitektur model

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $f_{\theta}(\cdot)$ — backbone | $z = f_{\theta}(x)$ | Ekstraktor fitur. **Bobot dibagi** (shared) antara view macula dan disc | `DualViewBase.forward` |
| $z_m,\ z_d$ | $z_m = f_{\theta}(x^{m})$, $z_d = f_{\theta}(x^{d})$; $z \in \mathbb{R}^{D}$ | Embedding per-view setelah Global Average Pooling | `forward` |
| $D$ (dim. fitur) | $D_T = 2048$ (ResNet-50), $D_S = 224$ (student) | Ukuran vektor fitur | `feat_dim`, `out_dim` |
| GAP | $z_j = \dfrac{1}{H'W'}\sum_{u,v} F_{j,u,v}$ | *Global Average Pooling*: rata-rata spasial peta fitur → vektor | `AdaptiveAvgPool2d(1)` |
| InteractionFusion | $z_f = \operatorname{LN}_{\mathrm{out}}\Big(\operatorname{ReLU}\big(W_f\,\operatorname{LN}_{\mathrm{in}}([z_m;\ z_d;\ \lvert z_m - z_d\rvert;\ z_m\odot z_d]) + b_f\big)\Big)$ | Fusi dua view. $\lvert z_m - z_d\rvert$ = **perbedaan**, $z_m\odot z_d$ = **kesepakatan/interaksi**. Fusi linear biasa hanya bisa membentuk jumlah berbobot | `InteractionFusion` |
| Dimensi fusi | input $4D$, output $D$ (`hidden = feat_dim`) | Teacher: $8192 \rightarrow 2048$; student: $896 \rightarrow 224$ | `InteractionFusion` |
| Sensitivitas urutan view | $\operatorname{Fuse}(a,b) \neq \operatorname{Fuse}(b,a)$ | Diuji di Gate2a: fusi **bukan** jumlah simetris → macula dan disc **tidak boleh tertukar** | `test_coral` |
| $\operatorname{LN}(\cdot)$ — LayerNorm | $\operatorname{LN}(v) = \gamma\odot\dfrac{v - \bar v}{\sqrt{\operatorname{Var}(v) + \epsilon}} + \beta$ | Normalisasi per-sampel. Tidak punya kernel INT8 eager → fusi tetap FP32 | `nn.LayerNorm` |
| $\operatorname{BN}(\cdot)$ — BatchNorm | $\operatorname{BN}(x) = \gamma\dfrac{x - \mu_{\mathcal{B}}}{\sqrt{\sigma^2_{\mathcal{B}} + \epsilon}} + \beta$ | Normalisasi per-batch di backbone. Saat warm-up teacher, bobot dibekukan tetapi **statistik BN tetap beradaptasi** | `nn.BatchNorm2d` |
| Depthwise-separable block | $x \rightarrow \operatorname{ReLU}(\operatorname{BN}(\mathrm{DW}_{3\times3}(x))) \rightarrow \operatorname{ReLU}(\operatorname{BN}(\mathrm{PW}_{1\times1}(\cdot)))$ | Blok efisien student: konvolusi per-kanal lalu konvolusi titik $1\times1$ | `DWSepBlock` |
| Biaya DW vs konvolusi biasa | $\dfrac{C_{in}\cdot 9 + C_{in}C_{out}}{9\,C_{in}C_{out}} = \dfrac{1}{C_{out}} + \dfrac{1}{9}$ | Rasio parameter/FLOP depthwise-separable terhadap konvolusi $3\times3$ penuh — alasan student sangat ringan | teori `DWSepBlock` |
| Kanal student | `STUDENT_CHANNELS` $= (32, 64, 96, 128, 160, 192, 224)$; stem stride 2; stride blok $2,1,2,1,2,1$ | Lebar tiap tahap backbone student | `LightBackbone` |
| Head teacher/student | 3 head CORAL: `main_head` (pada $z_f$), `macula_head` (pada $z_m$), `disc_head` (pada $z_d$) | Head auxiliary memberi $p_m, p_d$ yang dibutuhkan untuk menghitung $\Delta$ | `Teacher`, `Student` |
| Forward counterfactual | $p^{cf}_{m} = h_{\mathrm{main}}(\operatorname{Fuse}(z_m, \mathbf{0}))$, $\ p^{cf}_{d} = h_{\mathrm{main}}(\operatorname{Fuse}(\mathbf{0}, z_d))$ | Versi *same-head*: ketiga prediksi lewat **head yang sama**, sehingga $\Delta$ tidak bisa sekadar mencerminkan perbedaan antar-head | `counterfactual_forward` |
| `forward_single` | $p = h_{m}(f_\theta(x^m))$ atau $h_{d}(f_\theta(x^d))$ | Baseline single-view yang jujur: backbone hanya melihat satu foto | `forward_single` |
| Jumlah parameter | $\lvert\theta\rvert = \sum_{\text{tensor}} \operatorname{numel}$ | Teacher $40{,}313{,}932$; student $328{,}588$ → $122.7\times$ lebih sedikit | `param_count` |
| Projector feature-KD | $P: \mathbb{R}^{224} \rightarrow \mathbb{R}^{2048}$, $P(z) = W_P z + b_P$ | Memetakan fitur student **ke** ruang teacher (target teacher di-detach, jadi tetap) | `train_student` |
| QuantStub / DeQuantStub | $x \xrightarrow{Q} x_q \xrightarrow{f_{\mathrm{INT8}}} \xrightarrow{Q^{-1}} \hat x$ | Batas FP32↔INT8 di sekitar backbone saja | `QuantizableBackbone` |

---

## 5. Head ordinal CORAL

CORAL (*Consistent Rank Logits*) memperlakukan grade sebagai deret pertanyaan biner
"apakah $Y > k$?" dengan satu skor bersama dan $K-1$ bias yang terurut.

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $g(z)$ — skor bersama | $g(z) = w^{\top}z$ (tanpa bias) | **Satu** skor keparahan per sampel, dibagi oleh semua threshold | `CORALHead.fc` |
| $b_0$ · `base_bias` | parameter skalar | Bias threshold pertama ($Y>0$) | `CORALHead` |
| $\delta_j$ · `bias_steps` | $K-2 = 3$ parameter bebas | Parameter mentah langkah antar-threshold | `CORALHead` |
| $b_k$ — bias terurut | $b_k = b_0 - \sum_{j=1}^{k}\operatorname{softplus}(\delta_j)$, $\ k = 0,\dots,3$ | Karena $\operatorname{softplus} > 0$: $b_0 > b_1 > b_2 > b_3$ **dijamin secara konstruksi** | `CORALHead.biases` |
| $\ell_k$ — logit threshold | $\ell_k = g(z) + b_k$ | Logit untuk pertanyaan "$Y > k$?" | `CORALHead.forward` |
| $p_k$ — skor kumulatif | $p_k = \sigma(\ell_k) \approx P(Y > k)$ | Keluaran utama model: vektor $p = (p_0, p_1, p_2, p_3)$ | `CORALHead.forward` |
| Monotonicity | $p_0 \ge p_1 \ge p_2 \ge p_3$ | Konsisten secara ordinal: "lebih dari grade 2" tidak mungkin lebih yakin daripada "lebih dari grade 1" | `test_coral` |
| Makna $p_k$ | $p_0$: ada DR; $p_1$: lebih berat dari NPDR ringan; $p_2$: lebih berat dari NPDR sedang; $p_3$: lebih berat dari NPDR berat | Interpretasi klinis tiap threshold | FE `drGrades.ts` |
| Inisialisasi threshold | $b_k^{(0)} = \operatorname{logit}\big(\operatorname{clamp}(\hat P(Y>k),\ 10^{-3},\ 1-10^{-3})\big)$ | Threshold awal = marginal empiris train → mencegah kolaps grade menengah sejak awal | `init_thresholds` |
| Inisialisasi langkah | $\delta_j^{(0)} = \operatorname{softplus}^{-1}\big(\max(b_{j-1}^{(0)} - b_j^{(0)},\ 10^{-4})\big)$ | Agar $b_k$ awal tepat sama dengan marginal (Gate2a: selisih $<10^{-5}$) | `CORALHead.__init__` |
| Sebaran threshold | $b_0 - b_3 > 1.5$ logit | Syarat Gate2a; jika terlalu sempit, grade akan kolaps | `test_coral` |
| Threshold APTOS | $b_k$ dihitung ulang dari marginal APTOS | APTOS punya distribusi grade berbeda dari DRTiD | `APTOS_INIT_TH` |
| **Aturan grade** | $\hat y = \sum_{k=0}^{K-2}\mathbf{1}[p_k > t]$ | Grade = **banyaknya threshold yang dilewati**, **bukan** argmax | `grade_from`; FE `runLocalInference` |
| $t$ — decision threshold | default $t = 0.5$; $t^{\ast}$ per kondisi dari grid validasi | Titik operasi. Run final: `dual_no_distill` $0.40$, lainnya $0.50$ | `THRESHOLDS` |
| Skor per-grade | $\tilde p = (1,\ p_0,\ p_1,\ p_2,\ p_3,\ 0)$, $\ \pi_g = \max(\tilde p_g - \tilde p_{g+1},\ 0)$ | Turunan dari skor kumulatif: $\pi_g \approx P(Y = g)$ | `predict_dr`; FE |
| Normalisasi skor grade | $\hat\pi_g = \dfrac{\pi_g}{\max(\sum_{g'}\pi_{g'},\ 10^{-9})}$ | Menjadikan jumlahnya 1 | `predict_dr` |
| `uncalibrated_score` | $\hat\pi_{\hat y}$ | Skor relatif grade terpilih. **Sengaja tidak disebut probabilitas/confidence** karena weighted BCE mendistorsi sigmoid | `predict_dr` |
| Ordinal Violation Rate | $\mathrm{OVR} = \dfrac{1}{N(K-2)}\sum_i\sum_{k=0}^{K-3}\mathbf{1}[p_{i,k+1} - p_{i,k} > 0]$ | Proporsi pelanggaran monotonicity. Dengan CORAL terurut **harus 0**; nilai $>0$ berarti bug (Gate6c: $\le 10^{-6}$, terukur $0.00$) | `ordinal_violation_rate` |

---

## 6. Fungsi loss

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $y_{ik}$ — target biner | $y_{ik} = \mathbf{1}[y_i > k]$ | Encoding ordinal grade: mis. grade 2 → $(1,1,0,0)$ | `coral_loss` |
| $w_k$ — `pos_weight` | $w_k = \sqrt{\dfrac{N^{\mathrm{neg}}_k}{N^{\mathrm{pos}}_k}}$, $\ N^{\mathrm{pos}}_k = \#\{y > k\}$, $N^{\mathrm{neg}}_k = \#\{y \le k\}$ | Bobot kelas positif per threshold untuk mengatasi imbalance; versi **akar** (lebih lunak). Dihitung **sekali** dari train | `pos_weights` |
| $\mathcal{L}_{\mathrm{CORAL}}$ | $-\dfrac{1}{B(K-1)}\sum_{i}\sum_{k}\Big[w_k\,y_{ik}\ln\sigma(\ell_{ik}) + (1-y_{ik})\ln\big(1-\sigma(\ell_{ik})\big)\Big]$ | *Weighted binary cross-entropy* atas 4 threshold. Inti supervisi ordinal | `coral_loss` |
| $\mathcal{L}_{\mathrm{task}}$ | $\mathcal{L}_{\mathrm{CORAL}}(\ell_{\mathrm{dual}}, y)$ | Loss tugas utama pada head dual-view (single-view: pada head tunggal) | `combined_loss` |
| $\mathcal{L}_{\mathrm{aux}}$ | $\mathcal{L}_{\mathrm{CORAL}}(\ell_{m}, y) + \mathcal{L}_{\mathrm{CORAL}}(\ell_{d}, y)$ | Melatih head auxiliary agar $p_m, p_d$ bermakna (dibutuhkan untuk $\Delta$) | `aux_loss` |
| $\lambda_{\mathrm{aux}}$ | student $0.5$; teacher $0.3$ | Bobot loss auxiliary | `STUDENT_CFG`, `TEACHER_CFG` |
| $\tau$ · `tau_kd` | grid $\{2, 4\}$; terpilih $2.0$ | Temperatur KD: melunakkan target teacher | `logit_kd_loss` |
| $q_k,\ \hat q_k$ | $q_k = \sigma\big(\operatorname{sg}(\ell^T_{\mathrm{dual},k})/\tau\big)$, $\ \hat q_k = \sigma(\ell^S_{\mathrm{dual},k}/\tau)$ | Target lunak teacher dan prediksi lunak student per threshold | `logit_kd_loss` |
| $\mathcal{L}_{\mathrm{logitKD}}$ | $-\dfrac{1}{B(K-1)}\sum_i\sum_k\big[q_{ik}\ln\hat q_{ik} + (1-q_{ik})\ln(1-\hat q_{ik})\big]$ | KD standar pada **output akhir** (biner per threshold karena CORAL). **Tanpa faktor $\tau^2$** → $\alpha$ dan $\tau$ saling terkait, tidak boleh diklaim independen | `logit_kd_loss` |
| $\alpha$ | grid $\{0.25, 0.5, 1.0\}$; terpilih $0.5$ | Bobot logit-KD. Diwariskan (dibekukan) ke feature-KD dan CSD | `GRID_LOGITKD` |
| $\mathcal{L}_{\mathrm{featKD}}$ | $\dfrac{1}{B\,D_T}\sum_i\big\lVert P(z^S_{f,i}) - \operatorname{sg}(z^T_{f,i})\big\rVert_2^2$ | KD tingkat representasi (MSE fitur fusi). Kontrol utama untuk menguji kebaruan CSD | `feature_kd_loss` |
| $\gamma$ · `gamma_feat` | grid $\{0.1, 0.5, 1.0, 2.0\}$; terpilih $2.0$ | Bobot feature-KD | `GRID_FEATKD` |
| $\mathcal{L}_{\mathrm{CSD}}$ | lihat [§7](#7-complementarity-shift-distillation-csd) | Loss distilasi complementarity shift | `csd_loss` |
| $\beta$ | grid $\{0.1, 0.2, 0.5\}$; terpilih $0.1$ | Bobot CSD | `GRID_CSD` |
| **Loss total student** | $\mathcal{L} = \mathcal{L}_{\mathrm{task}} + \lambda_{\mathrm{aux}}\mathcal{L}_{\mathrm{aux}} + \alpha\,\mathcal{L}_{\mathrm{logitKD}} + \beta\,\mathcal{L}_{\mathrm{CSD}} + \gamma\,\mathcal{L}_{\mathrm{featKD}}$ | Satu rumus untuk semua kondisi; tiap kondisi hanya mengaktifkan sebagian bobot | `combined_loss` |
| Tangga perbandingan | no-distill: $\alpha{=}\beta{=}\gamma{=}0$ → logit-KD: $\alpha{>}0$ → +feature-KD: $\alpha,\gamma{>}0$ → **+CSD**: $\alpha,\beta{>}0$ | Langkah terakhir hanya **menambah satu suku** pada baseline logit-KD yang sama | `train_student` |
| Loss teacher | $\mathcal{L}_T = \mathcal{L}_{\mathrm{task}} + 0.3\,\mathcal{L}_{\mathrm{aux}}$ | Teacher tidak didistilasi dari siapa pun | `train_teacher` |
| Loss pre-training APTOS | $\mathcal{L}_{\mathrm{CORAL}}$ single-view dengan $w_k$ dari APTOS | Membentuk representasi retina sebelum dual-view | `pretrain_backbone` |
| Loss QAT / FP32-FT | $\mathcal{L}_{\mathrm{task}} + 0.5\,\mathcal{L}_{\mathrm{aux}}$ | **Hanya supervisi tugas** — tidak ada KD/CSD selama kuantisasi, agar RQ2 murni mengukur kuantisasi | `finetune` |
| Bobot efektif tercatat | `weighted_X` $= (\text{bobot})\times\mathcal{L}_X$ | Kontribusi yang benar-benar "dilihat" optimizer, dicatat per epoch | `train_student` |

---

## 7. Complementarity-Shift Distillation (CSD)

Inti kebaruan DR-VERGE. $\Delta$ mengukur **apa yang "dibeli" oleh view kedua**: arah dan besar
perubahan keyakinan model saat berhenti melihat satu foto dan mulai melihat dua.

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $p_{\mathrm{agg}}$ — agregasi single-view | $p_{\mathrm{agg}} = \dfrac{p_m + p_d}{2}$ | Baseline "naif": rata-rata keyakinan dari dua view yang dibaca **terpisah** | `delta` |
| $\Delta$ — complementarity shift | $\Delta = p_{\mathrm{dual}} - p_{\mathrm{agg}} = p_{\mathrm{dual}} - \dfrac{p_m + p_d}{2}$, $\ \Delta \in \mathbb{R}^{K-1} = \mathbb{R}^{4}$ | Pergeseran keputusan ordinal kumulatif akibat fusi. $\Delta_k > 0$: fusi **menaikkan** keyakinan bahwa $Y>k$ | `delta` |
| Rentang $\Delta_k$ | $\Delta_k \in (-1, 1)$ | Selisih dua besaran di $(0,1)$ | — |
| $\Delta^T$ | $\Delta^T = \operatorname{sg}\big(p^T_{\mathrm{dual}} - \tfrac{1}{2}(p^T_m + p^T_d)\big)$ | Shift milik teacher = **target** distilasi (selalu di-detach) | `csd_loss` |
| $\Delta^S$ | $\Delta^S = p^S_{\mathrm{dual}} - \tfrac{1}{2}(p^S_m + p^S_d)$ | Shift milik student = yang dioptimasi | `csd_loss` |
| Status ilmiah $\Delta$ | — | **Proksi operasional** dari pergeseran keputusan dual-view, **bukan** "komplementaritas anatomis murni" (karena diukur lewat tiga head berbeda) | NB-E cell 18 |
| $\Delta^{cf}$ — counterfactual | $\Delta^{cf} = p_{\mathrm{dual}} - \tfrac{1}{2}\big(p^{cf}_m + p^{cf}_d\big)$, ketiganya dari `main_head` | Ablasi *same-head*: membatasi kekhawatiran bahwa $\Delta$ hanya selisih kalibrasi antar-head | `counterfactual_forward` |
| $s_{\mathrm{CSD}}$ — skala global | $s_{\mathrm{CSD}} = \max\Big(\dfrac{1}{N_{\mathrm{train}}(K-1)}\sum_{i\in\mathcal{D}_{\mathrm{train}}}\sum_k\lvert\Delta^T_{ik}\rvert,\ 10^{-3}\Big)$ | $\mathbb{E}_{\mathrm{train}}[\lvert\Delta^T\rvert]$ dari teacher beku, dihitung **sekali**. Run final: $0.107276$ (CF: $0.074165$) | `global_delta_scale` |
| Kenapa skala **global** | — | Pembagi per-batch akan memperbesar batch ber-shift kecil dan mengecilkan batch ber-shift besar → diam-diam mengubah bobot relatif sampel. Satu skalar tetap hanya mengatur besar gradien | NB-E cell 18 |
| $\operatorname{SmoothL1}_{\beta_h}(u, v)$ (Huber) | per elemen $r = u - v$: $\ \ell(r) = \begin{cases}0.5\,r^2/\beta_h, & \lvert r\rvert < \beta_h\\ \lvert r\rvert - 0.5\,\beta_h, & \text{selainnya}\end{cases}$, lalu dirata-rata atas $B\times(K-1)$ | Kuadratik untuk galat kecil, linear untuk galat besar → robust terhadap outlier. $\beta_h = 1.0$ | `F.smooth_l1_loss` |
| **$\mathcal{L}_{\mathrm{CSD}}$ (default, `smoothl1_norm`)** | $\mathcal{L}_{\mathrm{CSD}} = \operatorname{SmoothL1}_{1}\!\Big(\dfrac{\Delta^S}{s_{\mathrm{CSD}}},\ \dfrac{\Delta^T}{s_{\mathrm{CSD}}}\Big)$ | Formula final yang terpilih di validasi. **Bertanda** dan **menjaga magnitudo** shift | `csd_loss` |
| `smoothl1` (ablasi) | $\operatorname{SmoothL1}_{1}(\Delta^S, \Delta^T)$ tanpa skala | Formulasi rev2. Tanpa skala, gradiennya sangat kecil ($\approx 216\times$ lebih kecil dari versi ternormalisasi) | `abl_csd_raw_smoothl1` |
| `magnitude_weighted_direction` | $m_i = \lVert\Delta^T_i\rVert_2$, $\ \omega_i = \min\Big(\dfrac{m_i}{\max(\operatorname{median}(m),\,10^{-6})},\ 1\Big)$ | Bobot per sampel: sampel dengan shift teacher kecil (arahnya tidak bermakna) diberi bobot lebih kecil | `csd_loss` |
| | $\mathcal{L}_{\mathrm{dir}} = \dfrac{\sum_i \omega_i\big(1 - \cos(\Delta^S_i, \Delta^T_i)\big)}{\max(\sum_i\omega_i,\ 10^{-6})}$ | Loss **arah** shift | `csd_loss` |
| | $\mathcal{L}_{\mathrm{CSD}} = 0.5\,\mathcal{L}_{\mathrm{dir}} + 0.5\,\operatorname{SmoothL1}_1\!\big(\Delta^S/s_{\mathrm{CSD}},\ \Delta^T/s_{\mathrm{CSD}}\big)$ | Kombinasi arah + magnitudo (kandidat grid, tidak terpilih) | `csd_loss` |
| `kl_softmax` (kontrol negatif) | $\mathcal{L} = \dfrac{1}{B}\sum_i \operatorname{KL}\Big(\operatorname{softmax}\big(\tfrac{\Delta^T_i}{\tau_{\mathrm{csd}}}\big)\ \Big\Vert\ \operatorname{softmax}\big(\tfrac{\Delta^S_i}{\tau_{\mathrm{csd}}}\big)\Big)$, $\tau_{\mathrm{csd}} = 0.5$ | Formulasi v1 (rencana awal). Softmax **membuang informasi magnitudo** (invarian terhadap pergeseran konstan) → hasil mekanisme terburuk | `abl_csd_kl_softmax` |
| $\operatorname{KL}(P\Vert Q)$ | $\sum_k P_k\ln\dfrac{P_k}{Q_k}$ | Divergensi Kullback–Leibler | `F.kl_div` |
| CSD tanpa gradien aux (src) | $\Delta^S = p^S_{\mathrm{dual}} - \tfrac{1}{2}\big(\operatorname{sg}(p^S_m) + \operatorname{sg}(p^S_d)\big)$ | Ablasi kode lama: CSD hanya bisa diturunkan lewat head dual + backbone, bukan dengan "menggeser" head aux | src `csd_loss_no_aux_gradient` |
| Gate4a — sinyal CSD | $\overline{\lVert\Delta^T\rVert_1} = \tfrac{1}{N}\sum_i\lVert\Delta^T_i\rVert_1 \ge 10^{-3}$ | Cek kewarasan numerik: shift tidak nol. **Bukan** bukti adanya komplementaritas | `delta_stats` |
| `frac_gt_0.02` | $\tfrac{1}{N}\sum_i\mathbf{1}\big[\lVert\Delta^T_i\rVert_1 > 0.02\big]$ | Proporsi mata dengan shift teacher yang tidak sepele | `delta_stats` |
| Norma gradien per suku | $\lVert\nabla_{\theta_{bb}}\mathcal{L}_X\rVert_2 = \sqrt{\sum_{\theta\in\theta_{bb}}\big(\partial \mathcal{L}_X/\partial\theta\big)^2}$ | Diukur pada **backbone bersama** — satu-satunya parameter yang dijangkau semua suku loss | `grad_norms` |
| Rasio gradien CSD/task | $r = \dfrac{\lVert\nabla_{\theta_{bb}}(\beta\,\mathcal{L}_{\mathrm{CSD}})\rVert_2}{\lVert\nabla_{\theta_{bb}}\mathcal{L}_{\mathrm{task}}\rVert_2}$ | Seberapa besar CSD memengaruhi pembelajaran. Gate4b: $r \in [0.01, 10]$; terukur $0.5335$ | `csd_gradient_check` |

---

## 8. Metrik mekanisme (RQ1)

Menjawab: *apakah pola shift teacher benar-benar ditransfer?* — terlepas dari apakah QWK naik.
Dihitung pada test DRTiD untuk tiap model dual-view.

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| ShiftL1 ↓ | $\mathrm{ShiftL1} = \dfrac{1}{N}\sum_i\big\lVert\Delta^S_i - \Delta^T_i\big\rVert_1$ | Rata-rata jarak L1 antara shift student dan teacher. **Makin kecil makin mirip**. CSD $0.3509$ (terbaik) | `shift_fidelity` |
| ShiftMAE ↓ | $\mathrm{ShiftMAE} = \dfrac{\mathrm{ShiftL1}}{K-1}$ | Galat absolut rata-rata **per threshold** (ShiftL1 dibagi 4) | `shift_fidelity` |
| CosAgree ↑ | $\mathrm{CosAgree} = \dfrac{1}{N}\sum_i\cos\big(\Delta^S_i, \Delta^T_i\big)$ | Kesamaan **arah** shift. $+1$ = searah, $0$ = tegak lurus, $-1$ = berlawanan. CSD $+0.4361$ | `shift_fidelity` |
| $\mathrm{NLL}_i(p)$ | $-\sum_{k}\big[y_{ik}\ln p_{ik} + (1-y_{ik})\ln(1-p_{ik})\big]$, $p$ di-clamp ke $[10^{-6}, 1-10^{-6}]$ | *Negative log-likelihood* ordinal per sampel: seberapa "salah" skor kumulatif terhadap label | `_nll` |
| $\mathcal{B}_i$ — fusion benefit | $\mathcal{B}_i = \mathrm{NLL}_i(p_{\mathrm{agg}}) - \mathrm{NLL}_i(p_{\mathrm{dual}})$ | Manfaat dual-view pada sampel $i$. $\mathcal{B}_i > 0$: fusi membuat prediksi **lebih benar** daripada rata-rata single-view | `shift_fidelity` |
| BenefitCorr ↑ (Pearson) | $\rho = \dfrac{\sum_i(\mathcal{B}^T_i - \bar{\mathcal{B}}^T)(\mathcal{B}^S_i - \bar{\mathcal{B}}^S)}{\sqrt{\sum_i(\mathcal{B}^T_i - \bar{\mathcal{B}}^T)^2}\sqrt{\sum_i(\mathcal{B}^S_i - \bar{\mathcal{B}}^S)^2}}$ | Metrik mekanisme **terkuat**: apakah student mendapat manfaat dual-view pada **sampel yang sama** dengan teacher. CSD $+0.3075$ (≈40% di atas runner-up). NaN bila $\operatorname{sd} < 10^{-8}$ | `shift_fidelity` |
| BenefitCorrSpearman | $\rho_s = \operatorname{Pearson}\big(\operatorname{rank}(\mathcal{B}^T), \operatorname{rank}(\mathcal{B}^S)\big)$ | Versi berbasis peringkat, tahan outlier | `sps.spearmanr` |
| `CF_` prefiks | metrik yang sama dengan $\Delta^{cf}$ | Menilai model di ruang *same-head* (relevan untuk ablasi counterfactual) | `shift_fidelity(cf=True)` |
| $G$ — dual-view gain (rencana) | $G = \mathrm{QWK}_{\mathrm{dual}} - \max(\mathrm{QWK}_{\mathrm{macula}}, \mathrm{QWK}_{\mathrm{disc}})$ | Berapa banyak dual-view mengungguli single-view terbaik | `overview.md` |
| $G_{\mathrm{aux}}$ | $\mathrm{QWK}(\hat y_{\mathrm{dual}}) - \max\big(\mathrm{QWK}(\hat y_m), \mathrm{QWK}(\hat y_d)\big)$ dari head **model yang sama** | Gain terhadap head auxiliary sendiri. Gate3 teacher (val): $0.8133 - 0.7664 = +0.0469 > 0$ | `dual_view_gain` |
| $G_{\mathrm{independent}}$ | $\mathrm{QWK}_{\mathrm{dual}}(s) - \max\big(\mathrm{QWK}_{\texttt{macula\_only}}(s), \mathrm{QWK}_{\texttt{disc\_only}}(s)\big)$ | Gain terhadap student single-view yang dilatih **terpisah**, dicocokkan **per seed** | NB-E cell 56 |
| Premis dual-view | macula-only $0.5175$ < disc-only $0.5502$ < dual $0.6042$ | Dual-view lebih baik dari salah satu view → ada shift yang layak didistilasi | README |

> Uji inferensial atas ketiga metrik ini (CSD vs tiap pembanding), dekomposisi mekanisme–prediksi,
> dan analisis per kuartil shift teacher ada di [§21](#21-analisis-suplementer-v2-dekomposisi-dan-inferensi-mekanisme).

---

## 9. Metrik prediktif, ordinal, dan kalibrasi

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $O$ — confusion matrix | $O_{ab} = \#\{i : y_i = a,\ \hat y_i = b\}$, ukuran $K\times K = 5\times5$ | Baris = grade asli, kolom = grade prediksi. Selalu 5×5 (`labels=0..4`) walau ada grade yang tak pernah diprediksi | `confusion_matrix` |
| Confusion ternormalisasi | $\tilde O_{ab} = O_{ab}/\max(\sum_{b'}O_{ab'},\ 1)$ | Ke mana grade yang salah "pergi" — grade 1→0 berbeda klinis dengan 1→2 | `evaluate` |
| $W$ — bobot kuadratik | $W_{ab} = \dfrac{(a-b)^2}{(K-1)^2}$ | Penalti kesalahan bertumbuh **kuadratik** dengan jarak grade | `fast_qwk` |
| $E$ — matriks ekspektasi | $E_{ab} = \dfrac{h^{\mathrm{true}}_a\,h^{\mathrm{pred}}_b}{N}$, $h$ = histogram grade | Confusion yang diharapkan bila prediksi acak (independen dari label) | `fast_qwk` |
| **QWK** $\kappa_w$ (metrik primer) ↑ | $\kappa_w = 1 - \dfrac{\sum_{a,b}W_{ab}O_{ab}}{\sum_{a,b}W_{ab}E_{ab}}$ (0 bila penyebut 0) | *Quadratic Weighted Kappa*. $1$ = sempurna, $0$ = setara kebetulan, $<0$ = lebih buruk dari kebetulan. Primer karena grade 3→0 jauh lebih fatal dari 3→2 | `fast_qwk` |
| Accuracy ↑ | $\dfrac{1}{N}\sum_i\mathbf{1}[\hat y_i = y_i]$ | Proporsi tepat. Tidak membedakan besar kesalahan (sama dengan `ExactAccuracy`) | `all_metrics` |
| $TP_g, FP_g, FN_g, TN_g$ | $TP_g = O_{gg}$; $FP_g = \sum_a O_{ag} - TP_g$; $FN_g = \sum_b O_{gb} - TP_g$; $TN_g = N - TP_g - FP_g - FN_g$ | Hitungan one-vs-rest per grade | `all_metrics` |
| Precision$_g$ ↑ | $\dfrac{TP_g}{TP_g + FP_g}$ (0 bila penyebut 0) | Dari prediksi "grade $g$", berapa yang benar | `precision_recall_fscore_support` |
| Recall$_g$ / sensitivity ↑ | $\dfrac{TP_g}{TP_g + FN_g}$ | Dari mata ber-grade $g$, berapa yang terdeteksi. Recall grade 1 = $0.068$ (student), $0.000$ (teacher) — limitasi klinis utama | idem |
| Specificity$_g$ ↑ | $\dfrac{TN_g}{TN_g + FP_g}$ | Kemampuan tidak salah melabeli mata lain sebagai grade $g$ | `all_metrics` |
| F1$_g$ ↑ | $\dfrac{2\,\mathrm{Prec}_g\,\mathrm{Rec}_g}{\mathrm{Prec}_g + \mathrm{Rec}_g}$ | Rata-rata harmonik precision dan recall | `f1_score` |
| Support$_g$ | $\sum_b O_{gb}$ | Banyak sampel asli ber-grade $g$ | `all_metrics` |
| Macro-F1 ↑ | $\dfrac{1}{K}\sum_g \mathrm{F1}_g$ | Semua grade berbobot sama → sensitif terhadap grade minoritas (run final $0.3362$) | `all_metrics` |
| Macro-Precision / Macro-Recall | $\dfrac{1}{K}\sum_g \mathrm{Prec}_g$, $\ \dfrac{1}{K}\sum_g \mathrm{Rec}_g$ | Rata-rata tak berbobot | `all_metrics` |
| Balanced Accuracy ↑ | $\dfrac{1}{K}\sum_g \mathrm{Rec}_g$ | Akurasi yang menyeimbangkan kelas (= Macro-Recall bila semua grade ada) | `balanced_accuracy_score` |
| Weighted-F1/Prec/Recall | $\sum_g \dfrac{\mathrm{Support}_g}{N}\,m_g$ | Rata-rata berbobot frekuensi kelas | `all_metrics` |
| MAE ↓ | $\dfrac{1}{N}\sum_i\lvert y_i - \hat y_i\rvert$ | Rata-rata selisih grade (dalam satuan grade) | `all_metrics` |
| Severe Error Rate (SER) ↓ | $\dfrac{1}{N}\sum_i\mathbf{1}\big[\lvert y_i - \hat y_i\rvert \ge 2\big]$ | Proporsi kesalahan **≥ 2 grade** — paling berbahaya klinis. Run final $0.2582$ (≈ 1 dari 4 mata) | `all_metrics` |
| Adjacent Error Rate | $\dfrac{1}{N}\sum_i\mathbf{1}\big[\lvert y_i - \hat y_i\rvert = 1\big]$ | Proporsi kesalahan tepat satu grade | `all_metrics` |
| Adjacent Accuracy ↑ | $\dfrac{1}{N}\sum_i\mathbf{1}\big[\lvert y_i - \hat y_i\rvert \le 1\big]$ | Proporsi prediksi dalam ±1 grade (intuitif bagi klinisi). Deskriptif saja | `all_metrics` |
| Identitas | $\mathrm{Acc} + \mathrm{AdjErr} + \mathrm{SER} = 1$ | Tiga kategori kesalahan saling lepas dan lengkap | turunan |
| Ordinal-Threshold Brier ↓ | $\dfrac{1}{N(K-1)}\sum_i\sum_k (p_{ik} - y_{ik})^2$ | Brier score yang **dipool atas 4 threshold** — bukan Brier multikelas konvensional | `calibration` |
| Ordinal-Threshold ECE ↓ | $\sum_{j=1}^{10}\dfrac{n_j}{N(K-1)}\big\lvert\bar p_j - \bar y_j\big\rvert$ | *Expected Calibration Error*, 10 bin lebar sama di $[0,1]$ (bin pertama inklusif 0), dipool atas threshold | `calibration` |
| $n_j,\ \bar p_j,\ \bar y_j$ | jumlah, rata-rata skor, rata-rata target di bin $j$ | Komponen ECE | `calibration` |
| Threshold$_k$ MAEProb | $\dfrac{1}{N}\sum_i\lvert p_{ik} - y_{ik}\rvert$ | Galat absolut rata-rata per threshold $k$ | `calibration` |
| Peringatan kolaps | $\lvert\{\hat y_i\}\rvert \le 2$ atau grade $g$ ada di data tapi $\#\{\hat y = g\} = 0$ | Mendeteksi model yang hanya memprediksi sedikit grade | `collapse_warnings` |
| Viabilitas validasi (Gate6b) | QWK & Macro-F1 finite **dan** $\lvert\{\hat y_i\}\rvert > 2$ | Syarat run inti dianggap sah sebelum test dibuka | NB-E cell 45 |

---

## 10. Optimisasi dan training

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| AdamW | $m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t$; $\ v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2$; $\ \theta_t = \theta_{t-1} - \eta_t\Big(\dfrac{\hat m_t}{\sqrt{\hat v_t} + \epsilon} + \lambda_{wd}\,\theta_{t-1}\Big)$ | Optimizer semua tahap. $\beta_1, \beta_2, \epsilon$ = default PyTorch ($0.9, 0.999, 10^{-8}$) | `torch.optim.AdamW` |
| $\hat m_t,\ \hat v_t$ | $\hat m_t = m_t/(1-\beta_1^t)$, $\ \hat v_t = v_t/(1-\beta_2^t)$ | Koreksi bias momen Adam | idem |
| $\lambda_{wd}$ | $10^{-4}$ | *Decoupled weight decay* | semua trainer |
| $\eta_0$ — learning rate | student $10^{-3}$; teacher warm-up $3\times10^{-4}$, fine-tune $10^{-5}$; APTOS R50 $10^{-4}$, light $10^{-3}$; QAT $3\times10^{-5}$ | Laju belajar awal tiap tahap | `*_CFG` |
| Cosine annealing | $\eta_t = \eta_{\min} + \tfrac{1}{2}(\eta_0 - \eta_{\min})\Big(1 + \cos\dfrac{\pi\,t}{T_{\max}}\Big)$, $\ \eta_{\min} = 0.02\,\eta_0$ | LR menurun halus mengikuti kosinus dari $\eta_0$ ke $2\%$-nya | `CosineAnnealingLR` |
| Akumulasi gradien | $g = \sum_{a=1}^{A}\nabla\Big(\dfrac{\mathcal{L}^{(a)}}{A}\Big)$, $\ A$ = `ACCUM_STEPS` | Mensimulasikan batch besar: loss dibagi $A$, gradien dijumlah, update tiap $A$ langkah | trainer |
| `batch_plan` | per-step $= 8$ bila $H > 256$, selain itu $16$; $\ A = \max(1, \lfloor 16/\text{per-step}\rfloor)$ | Batch efektif **selalu 16** $= 8\times2$ (384 px) atau $16\times1$ (224 px) | `batch_plan` |
| Early stopping | membaik bila $\mathrm{QWK}^{\mathrm{val}}_e > \mathrm{best} + \delta_{\min}$; berhenti bila tidak membaik selama $P$ epoch | Bobot terbaik disimpan & dipulihkan. Budget epoch hanyalah **batas atas** | `EarlyStopping` |
| $\delta_{\min}$ · `min_delta` | $10^{-4}$ QWK | Perbaikan yang dihitung "nyata" (jauh di bawah noise 200 mata validasi) | `EARLY_STOP_MIN_DELTA` |
| $P$ — patience | student 8; teacher 8; APTOS R50 5, light 6; QAT 4 | Epoch tanpa perbaikan sebelum berhenti | `*_CFG` |
| Nilai awal best | $\mathrm{best} = -\infty$ | Karena QWK sah bisa mencapai $-1$ | `EarlyStopping` |
| Budget epoch | student 40; teacher 5 (warm-up) + 20 (fine-tune); APTOS R50 20, light 30; QAT 10 | Batas atas epoch | `*_CFG` |
| Teacher 2 tahap | tahap 1: $\nabla_{\theta_{bb}} = 0$ (bobot backbone beku); tahap 2: semua dilatih | Warm-up head dulu, lalu fine-tune; statistik BN tetap beradaptasi di tahap 1 | `train_teacher` |
| Determinisme | `set_seed(s)` sebelum konstruksi model; cuDNN deterministic | Inisialisasi acak benar-benar terkontrol oleh seed | `set_seed` |

---

## 11. Hyperparameter, threshold, dan aturan seleksi

Semua keputusan diambil di **validasi**, lalu **dibekukan** sebelum keputusan berikutnya.

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| Stage A — grid resep | $(H, \text{sampling}) \in \{224, 384\}\times\{\text{standard}, \text{balanced}\}$, 3 seed, tanpa distilasi | Memilih resolusi & sampling **sebelum** teacher ada | NB-E cell 32 |
| Aturan Stage A | adopsi resep $r$ jika $\overline{\mathrm{QWK}}^{\mathrm{val}}_r > \overline{\mathrm{QWK}}^{\mathrm{val}}_{224/\mathrm{std}} + 0.01$; tie-break Macro-F1 ↑ → Recall G1 ↑ → SER ↓ → resep lebih murah | Resep mahal harus "membayar" biayanya. Terpilih 384/standard ($0.6491$ vs $0.5549$) | `STAGE_A_MIN_GAIN` |
| Skor kandidat grid | $\overline{\mathrm{QWK}}^{\mathrm{val}}(h) = \dfrac{1}{3}\sum_{s\in\{42,123,2026\}}\mathrm{QWK}^{\mathrm{val}}(h, s)$ | Rata-rata atas 3 seed tuning; kandidat **tidak sah** jika tidak lengkap 3/3 seed | `run_grid` |
| SD antar-seed | $\operatorname{sd} = \sqrt{\dfrac{1}{S-1}\sum_s(x_s - \bar x)^2}$ (ddof = 1) | Simpangan baku sampel, dilaporkan sebagai "± sd" | `run_grid` |
| Urutan grid | QWK ↓ → Macro-F1 ↓ → SER ↑ → MAE ↑ (diurutkan, terbaik di atas) | Tie-break leksikografis | `run_grid` |
| Grid logit-KD | $(\alpha, \tau) \in \{(0.25,2), (0.5,2), (0.5,4), (1.0,2)\}$ | 4 titik pra-registrasi → terpilih $(0.5, 2.0)$ | `GRID_LOGITKD` |
| Grid feature-KD | $\gamma \in \{0.1, 0.5, 1.0, 2.0\}$ (dengan $\alpha,\tau$ beku) | → terpilih $\gamma = 2.0$ | `GRID_FEATKD` |
| Grid CSD | $(\text{varian}, \beta) \in \{(\text{norm},0.1), (\text{norm},0.2), (\text{norm},0.5), (\text{magdir},0.2)\}$ | → terpilih `smoothl1_norm`, $\beta = 0.1$ | `GRID_CSD` |
| Grid threshold | $t \in \{0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65\}$ | **Satu** $t$ global untuk keempat threshold (1 derajat kebebasan, bukan 4) | `THRESHOLD_GRID` |
| $t^{\ast}$ per kondisi | $t^{\ast}_M = \operatorname{median}_s\Big[\arg\max_t \mathrm{QWK}^{\mathrm{val}}(M, s, t)\Big]$ (tie-break Macro-F1, SER) | Median antar-seed → stabil; varian RQ2 **mewarisi** $t^{\ast}$ dari $M^{\ast}$ | `calibrate_threshold`, `thr_for` |
| $\varepsilon_{\mathrm{tie}}$ | $0.005$ QWK | Selisih di bawah ini dianggap seri → rantai tie-break | `SELECTION_TIE_EPS` |
| Seleksi tahap 1 (metode) | $M^{\ast} = \arg\max_{M}\ \dfrac{1}{5}\sum_{s}\mathrm{QWK}^{\mathrm{val}}(M, s)$; seri → Macro-F1 ↑ → SER ↓ → MAE ↓ → metode lebih sederhana | Membandingkan **metode**, bukan seed tunggal (menghindari *winner's curse*). Terpilih `dual_csd` ($0.6490$ vs featKD $0.6477$) | `select_method` |
| Seleksi tahap 2 (checkpoint) | $s^{\ast} = \arg\max_{s}\ \mathrm{QWK}^{\mathrm{val}}(M^{\ast}, s)$ | Memilih file yang di-deploy (FP32 terbaik: seed 3407) | `select_checkpoint` |
| Seed representatif varian | urutkan QWK ↑ → Macro-F1 ↑ → SER ↓ → MAE ↓ | Aturan sama untuk setiap varian RQ2 | `representative_seed` |
| Retensi validasi | $R_{\mathrm{val}} = 100\cdot\dfrac{\mathrm{QWK}^{\mathrm{val}}_{\mathrm{INT8}}}{\mathrm{QWK}^{\mathrm{val}}_{\mathrm{FP32}}}\ \%$ | Dasar aturan deployment | `choose_deployment` |
| **Aturan deployment** | layak jika $R_{\mathrm{val}} \ge 95\%$ **dan** $\neg\,(\mathrm{CI}_{\mathrm{low}}(\Delta\mathrm{SER}) > 0)$ **dan** bukti lengkap; pilih latency median terendah; jika tidak ada → `best_fp32` | *Fail-closed*: bukti hilang = ditolak. 95% = kriteria **engineering**, bukan margin klinis. Hasil: QAT $99.04\%$ ✓, PTQ $93.37\%$ ✗, FT-PTQ $93.64\%$ ✗ | `DEPLOY_RULE` |
| $\Delta\mathrm{SER}$ | $\mathrm{SER}_{\mathrm{INT8}} - \mathrm{SER}_{\mathrm{FP32}}$ (bootstrap cluster + seed, validasi) | "Kredibel lebih buruk" bila seluruh CI **di atas 0** (metrik lower-is-better) | `paired_delta_val` |
| Arah "kredibel lebih buruk" | lower-is-better: $\mathrm{CI}_{\mathrm{low}} > 0$; higher-is-better: $\mathrm{CI}_{\mathrm{high}} < 0$ | Dua jenis metrik butuh uji arah yang berlawanan | `LOWER_IS_BETTER` |
| Rentang LR QAT | $\eta \in \{10^{-5}, 3\times10^{-5}, 10^{-4}\}$ dinilai pada model **INT8 terkonversi** | Yang dinilai adalah artefak yang benar-benar dikirim. Terpilih $3\times10^{-5}$ | `QAT_CFG` |

---

## 12. Statistik inferensial

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $B$ — replikasi bootstrap | $B = 10{,}000$ | Banyak resampling untuk CI | `BOOTSTRAP_B` |
| $P$ — permutasi | $P = 10{,}000$ | Banyak permutasi untuk p-value | `PERMUTATION_P` |
| $\alpha_{\mathrm{CI}}$ | $0.05$ → CI $95\%$ | Taraf signifikansi / tingkat kepercayaan | `ALPHA_CI` |
| Pasangan seed | $\{(s, s)\}$, wajib $\mathcal{S}_A = \mathcal{S}_B$ | Seed 42 dibandingkan dengan seed 42, dst. Seed tak cocok → error (tidak dipasangkan diam-diam) | `seed_pairs` |
| Selisih teramati | $\hat\Delta_{\mathcal{M}} = \dfrac{1}{S}\sum_{s}\Big[\mathcal{M}(y, \hat y^{A}_{s}) - \mathcal{M}(y, \hat y^{B}_{s})\Big]$ | **Estimasi titik** = selisih berpasangan pada data asli (bukan rerata bootstrap) | `paired_bootstrap` |
| Resampling cluster | $\mathcal{C}^{\ast}_b$ = $\lvert\mathcal{C}\rvert$ cluster diambil **dengan pengembalian**; $\mathcal{I}^{\ast}_b$ = semua sampel dari cluster terpilih | Unit resampling = mata (DRTiD) atau pasien (DeepDRiD) — dua mata satu pasien tidak independen | `paired_bootstrap` |
| Resampling seed | $j_1,\dots,j_S \sim \mathcal{U}\{1..S\}$ dengan pengembalian | Variasi antar-seed ikut masuk ke interval | idem |
| **Bootstrap hierarkis berpasangan** | $\Delta^{\ast}_b = \dfrac{1}{S}\sum_{r=1}^{S}\Big[\mathcal{M}\big(y_{\mathcal{I}^{\ast}_b}, \hat y^{A}_{s_{j_r}, \mathcal{I}^{\ast}_b}\big) - \mathcal{M}\big(y_{\mathcal{I}^{\ast}_b}, \hat y^{B}_{s_{j_r}, \mathcal{I}^{\ast}_b}\big)\Big]$ | Satu replikasi: resample cluster **dan** pasangan seed, rata-rata selisih berpasangan | `paired_bootstrap` |
| CI persentil 95% | $\big[Q_{2.5}(\Delta^{\ast}),\ Q_{97.5}(\Delta^{\ast})\big]$ | Selang kepercayaan. **CI yang memuat 0 bukan klaim**, apa pun estimasi titiknya | `paired_bootstrap` |
| `excludes_zero` / "kredibel" | $Q_{2.5} > 0 \ \lor\ Q_{97.5} < 0$ | Efek dianggap kredibel hanya bila seluruh CI di satu sisi nol | idem |
| `bootstrap_mean`, bias | $\bar\Delta^{\ast} = \tfrac{1}{B}\sum_b\Delta^{\ast}_b$; $\ \mathrm{bias} = \bar\Delta^{\ast} - \hat\Delta$ | Dilaporkan berdampingan dengan estimasi titik | idem |
| **Uji permutasi berpasangan per cluster** | untuk tiap permutasi: setiap cluster $c$ ditukar label metodenya dengan peluang $\tfrac12$; $\ \Delta^{\pi} = \dfrac{1}{S}\sum_s\big[\mathcal{M}(y, \hat y^{A\leftrightarrow B}_s) - \mathcal{M}(y, \hat y^{B\leftrightarrow A}_s)\big]$ | Hipotesis nol: label metode **dapat dipertukarkan** (tidak ada beda) | `permutation_test` |
| p-value dua sisi | $p = \dfrac{1 + \sum_{\pi=1}^{P}\mathbf{1}\big[\lvert\Delta^{\pi}\rvert \ge \lvert\hat\Delta\rvert - 10^{-12}\big]}{P + 1}$ | Koreksi $+1$ → $p$ tidak pernah tepat 0 | `permutation_test` |
| **Koreksi Holm–Bonferroni** | urutkan $p_{(1)} \le \dots \le p_{(m)}$; $\ \tilde p_{(r)} = \max_{j\le r}\ \min\big(1,\ (m - j + 1)\,p_{(j)}\big)$; signifikan bila $\tilde p < 0.05$ | Mengontrol *family-wise error rate*. Diterapkan **di dalam** tiap famili (RQ1: $m=3$; RQ2: $m=3$; kontrol RQ2: $m=3$) | `holm` |
| Contoh Holm | $[0.001, 0.04, 0.6] \rightarrow [0.003, 0.08, 0.6]$ | Uji kebenaran implementasi | FINAL_PROTOCOL §13 |
| Famili statistik | RQ1 & RQ2 = *primary*; RQ2_control = *supplementary* | Kontrol tidak "menghukum" headline lewat multiplisitas | `FAMILY_ROLE` |
| Bootstrap pasien (satu model) | $\mathcal{M}^{\ast}_b = \mathcal{M}(y_{\mathcal{I}^{\ast}_b}, \hat y_{\mathcal{I}^{\ast}_b})$, CI $= [Q_{2.5}, Q_{97.5}]$ | CI eksternal Set-C per model, resampling **pasien** | `patient_bootstrap` |
| Bootstrap pasien berpasangan | sama dengan bootstrap hierarkis, tetapi cluster = pasien dan seed = irisan seed kedua model | Perbandingan eksternal; satu-satunya yang kredibel: QAT vs PTQ $-0.0384\ [-0.0826, -0.0006]$ | `paired_patient_bootstrap` |
| Mean ± sd | $\bar x \pm \operatorname{sd}$ atas 5 seed | Mis. Set-C student $0.6688 \pm 0.0415$ | tabel hasil |
| Disagreement CI vs permutasi | CI memuat 0 tetapi $p_{\mathrm{Holm}} < 0.05$ (atau sebaliknya) | Dicatat sebagai klaim **lemah**: laporkan keduanya, jangan klaim (contoh: PTQ vs FP32) | `table_ci_permutation_disagreement.csv` |
| Antar-metode vs antar-seed | selisih metode $0.0024$–$0.0143$ < sebaran seed $0.0101$–$0.0290$ | Peringkat dalam satu tabel bukan bukti mandiri | README |

---

## 13. Kuantisasi INT8 (RQ2)

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| Kuantisasi afin | $q = \operatorname{clamp}\Big(\operatorname{round}\big(\tfrac{x}{S_q}\big) + Z,\ q_{\min},\ q_{\max}\Big)$ | Memetakan float ke integer 8-bit | `torch.ao.quantization` |
| Dekuantisasi | $\hat x = S_q\,(q - Z)$ | Mengembalikan ke float (dengan galat pembulatan) | idem |
| $S_q$ — scale | bilangan real positif | Lebar satu "anak tangga" kuantisasi | observer |
| $Z$ — zero-point | integer | Integer yang merepresentasikan $0.0$ | observer |
| $[q_{\min}, q_{\max}]$ | aktivasi `quint8`: $[0, 255]$; bobot `qint8`: $[-128, 127]$ | Rentang INT8 | qconfig default |
| Galat kuantisasi | $\lvert x - \hat x\rvert \le S_q/2$ (dalam rentang) | Noise yang ditanggung model INT8 | teori |
| Observer & qconfig | `get_default_qconfig("x86")` (PTQ), `get_default_qat_qconfig("x86")` (QAT) | Mengestimasi $S_q, Z$ dari statistik aktivasi/bobot; engine `x86` → `fbgemm` → `onednn` | `QUANT_ENGINE` |
| Fusi Conv-BN | $W' = \dfrac{\gamma}{\sqrt{\sigma^2 + \epsilon}}W$, $\ b' = \dfrac{\gamma\,(b - \mu)}{\sqrt{\sigma^2 + \epsilon}} + \beta$ | BN "dilebur" ke konvolusi (Conv-BN-ReLU → satu operator) sebelum kuantisasi | `fuse_modules` |
| **PTQ** (statis) | fuse → prepare (observer) → kalibrasi tanpa gradien → convert | *Post-Training Quantization*: tidak ada training ulang | `run_ptq` |
| Set kalibrasi | seluruh $800$ mata train ($1600$ gambar), `shuffle=False`, di-hash SHA-256 | Deterministik → PTQ dapat direproduksi persis | `calibration_manifest` |
| **Fake quantization** (QAT) | $\tilde x = S_q\Big(\operatorname{clamp}\big(\operatorname{round}(x/S_q) + Z,\ q_{\min}, q_{\max}\big) - Z\Big)$ | Simulasi INT8 di forward pass selama training, nilai tetap float | `prepare_qat` |
| Straight-Through Estimator | $\dfrac{\partial\tilde x}{\partial x} \approx \mathbf{1}\big[q_{\min} \le \operatorname{round}(x/S_q) + Z \le q_{\max}\big]$ | $\operatorname{round}$ tidak terdiferensialkan; gradien "diteruskan" apa adanya di dalam rentang | PyTorch FakeQuantize |
| **QAT** | fuse (QAT) → `prepare_qat` → fine-tune ber-fake-quant → convert | *Quantization-Aware Training*: model belajar beradaptasi dengan noise kuantisasi | `run_qat` |
| FP32-FT control | graf QAT yang sama, fake-quant & observer **dimatikan** (aktif $27 \rightarrow 0$) | Memisahkan efek "fine-tuning tambahan" dari efek "adaptasi kuantisasi" | `run_fp32_ft_control` |
| FT-PTQ | fine-tune FP32 biasa → PTQ | Menjawab: adaptasi ke noise kuantisasi vs fine-tune dulu lalu kuantisasi | `run_fp32_ft_plain` |
| Desain berpasangan per seed | $\mathrm{FP32}_s \rightarrow \{\mathrm{PTQ}_s, \mathrm{QAT}_s, \mathrm{FP32FT}_s, \mathrm{FT\text{-}PTQ}_s\}$ | Setiap varian diturunkan dari base yang sama → perbandingan berpasangan | NB-E cell 50 |
| Cakupan kuantisasi | hanya **backbone**; fusi (LayerNorm, `cat`) & head CORAL (`cumsum`, `softplus`) tetap FP32 | Artefak *mixed precision*; tidak ada kernel INT8 eager untuk operator tersebut | `QUANT_SCOPE` |
| Coverage | $\dfrac{\#\text{modul terkuantisasi}}{\#\text{Conv/Linear eligible di backbone}}$ | Cek integritas (bukan metrik hasil); penyebut dibatasi pada scope backbone | `eligible_backbone_ops` |
| Kesamaan scope (Gate7b) | $\operatorname{set}(\text{path}_{\mathrm{PTQ}}) = \operatorname{set}(\text{path}_{\mathrm{QAT}}) = \operatorname{set}(\text{path}_{\mathrm{FT\text{-}PTQ}})$ per seed | Kesamaan **nama** modul, bukan sekadar jumlah — agar PTQ vs QAT membandingkan operator yang sama | `quantized_module_paths` |
| Kompresi INT8 | $\approx 1.36\times$ ($1.2935 \rightarrow 0.9507$ MB) | Kecil karena hanya backbone (~sepertiga parameter student) yang di-INT8-kan; cerita utama INT8 adalah **latency** | `table_efficiency.csv` |

---

## 14. Efisiensi dan retensi

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| Ukuran artefak (MB) | $\mathrm{Size} = \dfrac{\text{bytes(state\_dict)}}{1024^2}$ | Selalu dari `state_dict` yang diserialisasi ulang — FP32 dan INT8 diukur dengan cara sama | `state_dict_size_mb` |
| Rasio kompresi | $\mathrm{CR} = \dfrac{\mathrm{Size}_{\mathrm{teacher}}}{\mathrm{Size}_{\mathrm{model}}}$ | Teacher→QAT INT8: $154.089/0.9507 = 162.1\times$; teacher→student FP32: $119.1\times$ | `CompressionRatio_vs_teacher` |
| Reduksi ukuran | $\Big(1 - \dfrac{\mathrm{Size}_{\mathrm{model}}}{\mathrm{Size}_{\mathrm{teacher}}}\Big)\times 100\%$ | Persentase ukuran yang dihemat | `SizeReduction_vs_teacher_pct` |
| Rasio parameter | $\dfrac{\lvert\theta_T\rvert}{\lvert\theta_S\rvert} = \dfrac{40{,}313{,}932}{328{,}588} = 122.7$ | Student punya parameter 122,7× lebih sedikit. Kuantisasi **tidak** mengubah jumlah parameter arsitektural | `ParamCount` |
| Protokol benchmark | batch $= 1$, warm-up $= 50$, runs $= 500$, threads $= 1$, repeats $= 5$, CPU | Distandarkan dan dicatat bersama setiap pengukuran | `BENCH` |
| Latency per-run | $\ell_r = (t_{\mathrm{end}} - t_{\mathrm{start}})\times 1000$ ms | Waktu satu inferensi satu mata (dua gambar) | `benchmark_latency` |
| **Latency median** | $\tilde\ell = \operatorname{median}_{b=1..5}\Big(\operatorname{median}_{r=1..500}\ \ell_{b,r}\Big)$ | *Median-of-medians* atas 5 blok independen — tahan noise CPU Colab bersama | `benchmark_latency` |
| Latency mean / sd / p95 / p99 | atas seluruh $5\times500 = 2500$ pengukuran | Gambaran sebaran dan ekor distribusi | idem |
| IQR antar-blok | $Q_{75}(\tilde\ell_b) - Q_{25}(\tilde\ell_b)$ | Stabilitas pengukuran antar-blok | `Latency_block_IQR_ms` |
| Throughput (pasangan/s) | $\dfrac{1000}{\tilde\ell}$ | Satu inferensi = satu mata = satu pasangan | `Throughput_pairs_per_s` |
| Throughput (gambar/s) | $\dfrac{2000}{\tilde\ell}$ | Dua gambar fundus per inferensi | `Throughput_images_per_s` |
| Speed-up | $\dfrac{\tilde\ell_{\mathrm{teacher}}}{\tilde\ell_{\mathrm{model}}}$ | Teacher→QAT INT8: $627.61/11.35 = 55.3\times$; teacher→student FP32: $19.3\times$; FP32→QAT: $2.86\times$ | `Speedup_vs_teacher` |
| Memori (RSS) | $\Delta\mathrm{RSS}_{\mathrm{load}} = \mathrm{RSS}_{\mathrm{loaded}} - \mathrm{RSS}_{\mathrm{base}}$; $\Delta\mathrm{RSS}_{\mathrm{inf}} = \mathrm{RSS}_{\mathrm{after}} - \mathrm{RSS}_{\mathrm{loaded}}$; peak dipolling tiap 5 ms | Memori proses (termasuk notebook), dalam MB ($/1024^2$) | `measure_memory` |
| **Retensi** (metrik higher-is-better) | $R_m = 100\cdot\dfrac{\overline{m}_{\mathrm{INT8}}}{\overline{m}_{\mathrm{FP32}}}\ \%$ untuk $m \in \{\mathrm{QWK}, \mathrm{MacroF1}, \mathrm{Acc}\}$ | Berapa persen kinerja dipertahankan. QAT $98.96\%$, PTQ $97.27\%$ (test) | `table_retention.csv` |
| **Delta** (metrik lower-is-better) | $\Delta m = \overline{m}_{\mathrm{INT8}} - \overline{m}_{\mathrm{FP32}}$ untuk $m \in \{\mathrm{MAE}, \mathrm{SER}\}$ | Untuk metrik galat dipakai **selisih**, bukan rasio | idem |
| Retensi teacher→student | $\dfrac{\mathrm{QWK}_S}{\mathrm{QWK}_T}$: internal $0.6018/0.7364 = 81.7\%$; Set-C $0.6688/0.7923 = 84.4\%$ | Seberapa banyak kemampuan grading teacher yang tersisa di student | README |

---

## 15. Ekspor, verifikasi, dan gate numerik

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| Paritas ONNX | $\max\big\lvert p^{\mathrm{ONNX}} - p^{\mathrm{PyTorch}}\big\rvert$; toleransi $10^{-4}$ | Ekspor dianggap setia bila selisih maksimum kecil. Terukur student $7.15\times10^{-7}$, teacher $1.7\times10^{-6}$ | `export_model` |
| Kesamaan grade ONNX | $\sum_k\mathbf{1}[p^{\mathrm{ONNX}}_k > 0.5] = \sum_k\mathbf{1}[p^{\mathrm{PT}}_k > 0.5]$ untuk semua sampel | Selain angka mirip, grade yang dihasilkan harus identik | `onnx_same_grades` |
| Paritas reload | $\max\lvert p^{\mathrm{reload}} - p^{\mathrm{ref}}\rvert < 10^{-5}$ | Artefak di disk (bukan objek di RAM) terbukti bekerja | `verify_deployment` |
| Rentang grade | $0 \le \hat y \le K-1$ | Sanity check keluaran | `verify_deployment` |
| Referensi QWK (Gate2b) | $\max\big\lvert\kappa^{\mathrm{fast}} - \kappa^{\mathrm{sklearn}}\big\rvert < 10^{-10}$ atas 105 kasus | Implementasi metrik primer diverifikasi; terukur $1.11\times10^{-16}$ (presisi mesin) | `test_qwk_matches_sklearn` |
| Monotonicity (Gate6c) | $\max\ \mathrm{OVR} \le 10^{-6}$ | Terukur $0.00$ | NB-E cell 45 |
| Audit hasil (Gate12b) | $\lvert v^{\mathrm{reported}} - v^{\mathrm{recomputed}}\rvert \le 10^{-6}$ | 265 angka headline dihitung ulang dari prediksi per-sampel → 265/265 cocok | `_audit` |
| Gate1 stratifikasi | $\max_g\lvert\hat\pi^{\mathrm{train}}_g - \hat\pi^{\mathrm{val}}_g\rvert = 0.0025$ | Deviasi proporsi kelas maksimum train↔val | FINAL_PROTOCOL |
| Ringkasan gate | $36/36$ lolos, 0 error | Run final dianggap selesai hanya bila semua gate blocking lolos | `table_gate_report.csv` |

---

## 16. Inferensi di browser (frontend)

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| Tensor input | $X \in \mathbb{R}^{1\times3\times384\times384}$ (NCHW, `float32`) | Format yang diharapkan model ONNX untuk input `macula` dan `disc` | FE `services/onnxModel.ts` |
| Indeks piksel NCHW | $X[c\cdot HW + u] = \dfrac{\mathrm{RGBA}[4u + c]/255 - \mu_c}{\sigma_c}$, $c\in\{0,1,2\}$ | Konversi data kanvas RGBA ke planar RGB ternormalisasi | FE `toTensor` |
| Konstanta dari metadata | $H$, $\mu$, $\sigma$, $t$ dibaca dari `metadata.json` | **Tidak di-hardcode**, agar preprocessing tidak bisa diam-diam berbeda dari training | FE `parseMetadata` |
| Validasi metadata | $32 \le H \le 2048$, $0 < t < 1$, $\mu, \sigma$ = 3 bilangan finite | Model ditolak bila metadata tidak masuk akal | FE `parseMetadata` |
| Output | $p = (p_0,\dots,p_3)$ = `p_cumulative` | Hanya skor kumulatif head dual-view | `InferenceWrapper` |
| Grade di browser | $\hat y = \#\{k : p_k > t\}$ | Sama persis dengan notebook — hitung threshold yang dilewati | FE `runLocalInference` |
| Skor per-grade | $\hat\pi_g$ seperti [§5](#5-head-ordinal-coral) | Ditampilkan sebagai skor relatif, bukan probabilitas | FE `runLocalInference` |
| Latency browser | $t_{\mathrm{end}} - t_{\mathrm{start}}$ dengan `performance.now()` | Waktu `session.run` saja (tanpa decode gambar) | FE `runLocalInference` |
| Verifikasi browser | QWK ONNX-di-browser Set-C $0.7307$ vs notebook $0.7298$ (seed sama); selisih $0.0009$ | Selisih kecil karena perbedaan resampling gambar → pipeline browser setia | README |
| Tanda angka | $\operatorname{signed}(v) = (\text{"−" jika } v<0 \text{ else "+"})\ \lvert v\rvert$ | Format ΔQWK dengan tanda eksplisit | FE `utils/stats.ts` |
| Format CI | EN `95% CI [a, b]`; ID `IK 95% [a; b]` | Bahasa Indonesia memakai ";" karena "," adalah pemisah desimal | FE `ciText` |

---

## 17. Hipotesis dan perbandingan yang dipra-registrasi

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Hasil run final |
|---|---|---|---|
| H1a | $\mathrm{QWK}(\mathrm{CSD}) > \mathrm{QWK}(\text{no-distill})$ | CSD lebih baik dari tanpa distilasi | Null: $-0.0024\ [-0.0336, +0.0285]$ |
| H1b | $\mathrm{QWK}(\mathrm{CSD}) \ge \mathrm{QWK}(\text{logit-KD})$ | CSD tidak kalah dari logit-KD | Null: $+0.0077\ [-0.0304, +0.0463]$ |
| H1c | $\mathrm{QWK}(\mathrm{CSD}) \ge \mathrm{QWK}(\text{feature-KD})$ | CSD tidak kalah dari feature-KD | Null: $-0.0143\ [-0.0445, +0.0153]$ |
| H1d | $\mathrm{ShiftL1}_{\mathrm{CSD}} <$, $\mathrm{CosAgree}_{\mathrm{CSD}} >$, $\mathrm{BenefitCorr}_{\mathrm{CSD}} >$ kondisi lain | CSD paling setia mentransfer pola shift | Didukung 3/3, direplikasi di 3 run |
| Disosiasi RQ1 | $\mathrm{QWK}(\mathrm{CSD}) \approx \mathrm{QWK}(\mathrm{KD})$ **dan** $\mathrm{ShiftFidelity}(\mathrm{CSD}) > \mathrm{ShiftFidelity}(\mathrm{KD})$ | Mekanisme tertransfer, akurasi tidak mengikuti — temuan inti | Terjadi |
| H2a | $R_{\mathrm{QWK}}(\mathrm{PTQ}) \ge 95\%$ | PTQ mempertahankan kinerja | Test $97.27\%$; validasi $93.37\%$ |
| H2b | $R_{\mathrm{QWK}}(\mathrm{QAT}) \ge R_{\mathrm{QWK}}(\mathrm{PTQ})$ | QAT minimal sebaik PTQ | Internal ya ($98.96\%$); Set-C sebaliknya (kredibel) |
| H2c | $\mathrm{Size}\downarrow$, $\tilde\ell\downarrow$ secara material | Kuantisasi menghemat biaya | $1.36\times$ lebih kecil, $2.86\times$ lebih cepat |
| Famili RQ1 | CSD vs {no-distill, logit-KD, feature-KD} | $m = 3$ untuk Holm | — |
| Famili RQ2 | PTQ vs FP32; QAT vs FP32; QAT vs PTQ | $m = 3$ (primer) | — |
| Famili RQ2_control | QAT vs FP32-FT; QAT vs FT-PTQ; FP32-FT vs FP32 | $m = 3$ (suplemen) | — |

---

## 18. Konstanta dan angka kunci

| Simbol / Nama | Nilai | Arti & Makna | Lokasi |
|---|---|---|---|
| `SEEDS_CORE` | $\{42, 123, 2026, 3407, 8888\}$ | Seed untuk kondisi inti & varian RQ2 | NB-E cell 6 |
| `SEEDS_TUNING` / `SEEDS_ABL` | $\{42, 123, 2026\}$ | Seed untuk grid dan ablasi | idem |
| `PRIMARY_SEED` | $42$ | Seed tetap untuk teacher, pre-training, dan saat satu seed harus disebut | idem |
| `SPLIT_SEED` | $42$ | Seed pembagian train/val | idem |
| $s_{\mathrm{CSD}}$ | enhanced $0.107276$ (CF $0.074165$); efficient $0.093024$ (CF $0.076986$) | Skala global CSD per run (berbeda karena teacher berbeda) | `csd_scale.json` |
| Hyperparameter terpilih | $\alpha = 0.5$, $\tau = 2.0$, $\gamma = 2.0$, $\beta = 0.1$, varian `smoothl1_norm` | Hasil grid validasi run final | `selected_hyperparameters.json` |
| $\beta_h$ (Huber) | $1.0$ | Titik transisi SmoothL1 | `csd_loss` |
| $\tau_{\mathrm{csd}}$ | $0.5$ | Temperatur varian ablasi `kl_softmax` | idem |
| Pita rasio gradien | $[0.01, 10]$; terukur $0.5335$ | Batas kewarasan engineering untuk pengaruh CSD | Gate4b |
| Teacher | $40{,}313{,}932$ param · $154.089$ MB · $627.61$ ms · test QWK $0.7364$ · Set-C $0.7923$ | Batas atas (upper bound) | README |
| Student FP32 ($M^{\ast}$) | $328{,}588$ param · $1.2935$ MB · $32.49$ ms · test QWK $0.6018$ · Set-C $0.6688$ | Model CSD terpilih | README |
| Deployed QAT INT8 | $0.9507$ MB · $11.35$ ms · test QWK $0.5956$ | Artefak yang dikirim (seed 42) | README |
| CrossFiT (benchmark DRTiD) | accuracy macula $80.47\%$, disc $77.87\%$, dual $84.21\%$ | Motivasi premis dual-view. **Accuracy ≠ QWK**: hanya arah yang dibandingkan | `overview.md` |
| Lingkungan | torch `2.11.0+cu128`, engine `x86` | Versi yang tercatat di metadata ekspor | `metadata.json` |

---

## 19. Evolusi rumus: rencana → kode lama → run final

Supaya tidak salah kutip: tiga sumber di repo memakai rumus yang **berbeda**. Yang berlaku untuk
paper adalah kolom **run final**.

| Komponen | Rencana (`research/documentation/overview.md`) | Kode lama (`experiments/src/`) | **Run final (NB-E)** |
|---|---|---|---|
| Loss CSD | $\operatorname{KL}\big(\operatorname{softmax}(\Delta^T/\tau)\,\Vert\,\operatorname{softmax}(\Delta^S/\tau)\big)$ | $\operatorname{SmoothL1}(\Delta^S, \Delta^T)$ tanpa skala; varian `direction_magnitude` $= 0.5(1-\cos) + 0.5\,\operatorname{SmoothL1}$ | $\operatorname{SmoothL1}(\Delta^S/s, \Delta^T/s)$ dengan $s = \mathbb{E}_{\mathrm{train}}\lvert\Delta^T\rvert$ |
| Dimensi $\Delta$ | ditulis "5 dimensi, satu per grade" | $K-1 = 4$ (kumulatif) | $K-1 = 4$ (kumulatif) |
| Fusi | Concatenation → FC | $\operatorname{BN}([z_m; z_d])$ | InteractionFusion $[z_m; z_d; \lvert z_m - z_d\rvert; z_m\odot z_d]$ + LayerNorm + MLP |
| Bias CORAL | — | $\delta^{(0)} = -3$ ($\operatorname{softplus}(-3) \approx 0.049$), $b_0^{(0)} = 0$ | Inisialisasi dari marginal empiris $\operatorname{logit}\hat P(Y>k)$ |
| `pos_weight` | — | $N^{\mathrm{neg}}_k / N^{\mathrm{pos}}_k$ | $\sqrt{N^{\mathrm{neg}}_k / N^{\mathrm{pos}}_k}$ |
| Backbone student | depthwise-separable | kanal $(16, 24, 24, 40, 40, 56)$, $D_S = 56$ | kanal $(32, \dots, 224)$, $D_S = 224$ |
| Resolusi | — | $224$ | $384$ (dipilih Stage A) |
| Bobot loss | $\alpha \in \{0.3, 0.5\}$, $\beta \in \{0.3, 0.5, 0.7\}$ | config `dual_csd`: $\alpha = 0.5$, $\beta = 0.5$, $\tau = 2$ | $\alpha = 0.5$, $\tau = 2$, $\beta = 0.1$ (grid validasi) |
| Threshold grade | — | $t = 0.5$ tetap | $t^{\ast}$ per kondisi dari validasi |
| Kuantisasi | PTQ saja (QAT = future work) | — | PTQ, QAT, FT-PTQ, FP32-FT, cakupan identik |
| Statistik | — | — | Bootstrap hierarkis berpasangan + permutasi + Holm per famili |
| Gain dual-view | $G = \mathrm{QWK}_{\mathrm{dual}} - \max(\cdot)$ | — | $G_{\mathrm{aux}}$ dan $G_{\mathrm{independent}}$ (per seed) |

---

## 20. Simbol tipografis di dokumen dan tabel hasil

| Simbol | Arti | Contoh pemakaian |
|---|---|---|
| ↑ | Makin tinggi makin baik | CosAgree ↑, BenefitCorr ↑, QWK ↑ |
| ↓ | Makin rendah makin baik | ShiftL1 ↓, MAE ↓, SER ↓ |
| $\Delta$ (di tabel hasil) | Selisih dua kondisi, mis. $\Delta\mathrm{QWK} = \mathrm{QWK}_A - \mathrm{QWK}_B$ | "CSD vs logit-KD: ΔQWK +0.0077" — **berbeda** dengan $\Delta$ shift CSD di [§7](#7-complementarity-shift-distillation-csd) |
| $[a, b]$ | Selang kepercayaan 95% | $[-0.0336, +0.0285]$ |
| $\pm$ | Rata-rata ± simpangan baku antar-seed | $0.6688 \pm 0.0415$ |
| $\times$ | Faktor kali (rasio) | $162.1\times$ lebih kecil, $55.3\times$ lebih cepat |
| $\approx$ | Kurang lebih sama | $\mathrm{QWK}(\mathrm{CSD}) \approx \mathrm{QWK}(\mathrm{KD})$ |
| $\ge 2$ grade | Kesalahan parah | definisi SER |
| $M^{\ast}$, $t^{\ast}$, $s^{\ast}$ | Nilai terpilih (optimal di validasi) | metode, threshold, seed terpilih |
| `p_gt{k}` | Kolom skor $p_k = P(Y>k)$ di file prediksi per-sampel | `predictions/*.csv` |
| `_mean`, `_std` | Rerata dan sd antar-seed di tabel agregat | `table_predictive_performance.csv` |
| `CF_` | Metrik versi counterfactual (same-head) | `CF_ShiftL1` |
| FP32 / INT8 | Presisi float 32-bit / integer 8-bit | `best_fp32`, `qat_int8` |
| ✓ / ✗ | Ada / tidak ada (tabel gap); lolos / gagal (gate) | tabel research gap |

---

## 21. Analisis suplementer v2: dekomposisi dan inferensi mekanisme

Sumber: `experiments/notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb` (**NB-Sup**),
keluaran di `experiments/results/supplementary/`. Analisis ini *inference-only* atas checkpoint beku
run final dan berlabel **eksploratori pasca-hoc**. Definisi ShiftL1, CosAgree, dan BenefitCorr
disalin verbatim dari §8.

| Simbol / Nama | Rumus / Definisi | Arti & Makna | Lokasi |
|---|---|---|---|
| $\bar p$ — agregasi dasar | $\bar p = \tfrac12\,(p_{\mathrm{mac}} + p_{\mathrm{disc}})$ | Rata-rata dua prediksi individual-view (sama dengan $p_{\mathrm{agg}}$ di §7) | NB-Sup P3 |
| **Identitas dekomposisi** | $p^S_{\mathrm{dual}} - p^T_{\mathrm{dual}} = (\bar p^S - \bar p^T) + (\Delta^S - \Delta^T)$ | Eksak karena $p_{\mathrm{dual}} = \bar p + \Delta$. Selisih output akhir = selisih agregasi dasar + selisih shift. **CSD hanya menargetkan suku kedua.** Residual numerik terukur $0$ | `table_mechanism_decomposition.csv` |
| Batas segitiga | $\lVert p^S_{\mathrm{dual}} - p^T_{\mathrm{dual}}\rVert_1 \le \lVert\bar p^S - \bar p^T\rVert_1 + \mathrm{ShiftL1}$ (per mata) | ShiftL1 kecil saja **tidak cukup** untuk output akhir yang dekat dengan teacher | idem |
| Selisih agregasi dasar | $\tfrac1N\sum_i\lVert\bar p^S_i - \bar p^T_i\rVert_1$ | CSD $0.4361$ vs Feature-KD $0.4217$ vs NoDistill $0.4269$ (DRTiD) | idem |
| Asosiasi dengan QWK | Spearman atas 20 model student | $\rho(\text{agregasi dasar}, \mathrm{QWK}) = -0.52$; $\rho(\mathrm{ShiftL1}, \mathrm{QWK}) = -0.35$. Deskriptif — 20 model berbagi data dan teacher | `table_mechanism_performance_association.csv` |
| Kontras mekanisme | $\hat\delta_{\mathcal{M}} = \overline{\mathcal{M}}_{\mathrm{CSD}} - \overline{\mathcal{M}}_{\mathrm{base}}$, rerata 5 seed | 3 pembanding × 3 metrik = **9 kontras**. Efek selalu ditulis CSD − pembanding | `table_mechanism_internal_stats.csv` |
| Bootstrap hierarkis (mekanisme) | tiap replikasi: resample unit **dan** indeks seed $j_1..j_5$; penarikan yang sama untuk CSD, pembanding, dan teacher; $\mathcal{M}$ dihitung ulang dari sampel hasil resampling (termasuk Pearson BenefitCorr) | Berbeda dari §12 karena metrik mekanisme (korelasi) tidak dapat dirata-ratakan per sampel. $B = 10{,}000$, replikasi tidak valid $0$ | NB-Sup P1 |
| Vektor multiplisitas | $w_i$ = berapa kali unit $i$ terambil; mean dan korelasi dihitung sebagai momen berbobot $w$ | Setara eksak dengan resampling eksplisit (selisih $\le 1.7\times10^{-16}$, diverifikasi tiap run) | NB-Sup |
| Unit resampling | DRTiD: *examined-eye record* ($N = 550$); Set-C: pasien (100 pasien, 200 mata) | DRTiD tidak memiliki ID pasien → internal **bukan** berklaster pasien | idem |
| Bootstrap record saja | seed tetap, hanya unit yang diresampling | Ketidakpastian akibat data uji saja (model dianggap tetap). Hasil: 9/9 CI tidak memuat nol | `table_mechanism_sensitivity.csv` |
| Permutasi bersyarat | swap CSD↔pembanding di dalam unit, sama untuk semua seed; $P = 10{,}000$; Holm atas 9 kontras | Pelengkap; asumsi output kedua kondisi dapat dipertukarkan dengan model tetap. $p_{\mathrm{Holm}} \le 0.0034$ | idem |
| *Leave-one-seed-out* | $\hat\delta^{(-s)}$ atas 4 seed tersisa | Apakah satu seed mendominasi. 9/9 kontras tetap searah | idem |
| Arah per seed | $\mathbf{1}[\mathcal{M}_{\mathrm{CSD},s}$ lebih baik dari $\mathcal{M}_{\mathrm{base},s}]$ | $34/45$ pasangan seed-kontras menguntungkan CSD | `table_mechanism_seed_consistency.csv` |
| Kuartil shift teacher | kuartil dari $\lVert\Delta^T_i\rVert_1$ milik teacher | Q4 (terbesar): 4/6 kontras ShiftL1/CosAgree konklusif. Tidak ada ambang baru untuk model | `table_teacher_shift_bins.csv` |
| ShiftL1 relatif | $\mathrm{ShiftL1}_{\mathrm{bin}} \,/\, \overline{\lVert\Delta^T\rVert_1}_{\mathrm{bin}}$ | $>1$ = galat shift student melebihi sinyal teacher (Q1: $2.24$–$2.38$) | idem |
| Kalibrasi skor ambang | Brier dan ECE gabungan atas 4 ambang kumulatif (fungsi `calibration()` asli) | Diagnostik, **bukan** probabilitas klinis. CSD ECE $0.056$; teacher $0.038$ | `table_ordinal_calibration_summary.csv` |
| `RNG_SEED` | $20261029$ | Seed acak analisis; hash penarikan bootstrap dicatat di `logs/run_manifest.json` | NB-Sup |

| Hasil kunci (DRTiD, B = 10.000) | ΔShiftL1 ↓ | ΔCosAgree ↑ | ΔBenefitCorr ↑ |
|---|---|---|---|
| CSD − NoDistill | $-0.0249\ [-0.0477, -0.0043]^{\ast}$ | $+0.0852\ [-0.0134, +0.1870]$ | $+0.0882\ [-0.0342, +0.2329]$ |
| CSD − Logit-KD | $-0.0331\ [-0.0567, -0.0103]^{\ast}$ | $+0.1503\ [+0.0263, +0.3011]^{\ast}$ | $+0.1280\ [-0.0038, +0.2643]$ |
| CSD − Feature-KD | $-0.0209\ [-0.0408, -0.0012]^{\ast}$ | $+0.0546\ [-0.0225, +0.1407]$ | $+0.1132\ [-0.0390, +0.2662]$ |

$^{\ast}$ CI 95% tidak memuat nol. Hanya kontras bertanda $^{\ast}$ yang boleh disebut konklusif;
BenefitCorr **tidak** konklusif terhadap pembanding mana pun.

---

*Disusun dari kode dan keluaran di repositori ini. Kalau rumus di sini berbeda dengan kode di
notebook enhanced, yang dipegang adalah kodenya, dan dokumen ini perlu diperbarui.*
