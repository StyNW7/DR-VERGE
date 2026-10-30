<div align="center">

<img src="frontend/public/Images/logo.png" alt="GEMASTIK XIX 2026" width="130" />

# DR-VERGE

### View-Evidence Relational Grading Engine

**_Complementarity-Shift Distillation_ dan Kuantisasi INT8 untuk _Grading_ Retinopati Diabetik pada Fundus _Dual-View_**

**🇮🇩 Bahasa Indonesia** · [🇬🇧 English](README.en.md)

<br />

[![GEMASTIK XIX 2026](https://img.shields.io/badge/GEMASTIK_XIX-2026-0B4F9C?style=for-the-badge)](https://gemastik.kemdiktisaintek.go.id/landing/tentang)
[![Kategori](https://img.shields.io/badge/Karya_Tulis_Ilmiah-TIK-F39C12?style=for-the-badge)](#)
[![SDG 3](https://img.shields.io/badge/SDG_3-Good_Health_%26_Well--being-4C9F38?style=for-the-badge)](https://sdgs.un.org/goals/goal3)
[![Demo](https://img.shields.io/badge/Demo-dr--verge.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dr-verge.vercel.app)

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.11-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![ONNX Runtime Web](https://img.shields.io/badge/ONNX_Runtime-Web-005CED?style=flat-square&logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![Google Colab](https://img.shields.io/badge/Google_Colab-A100-F9AB00?style=flat-square&logo=googlecolab&logoColor=white)](https://colab.research.google.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![Integrity gates](https://img.shields.io/badge/integrity_gates-36%2F36_passed-2EA44F?style=flat-square)](experiments/results/tables/table_gate_report.csv)
[![Results audit](https://img.shields.io/badge/results_audit-265%2F265_matched-2EA44F?style=flat-square)](experiments/results/tables/table_results_audit.csv)
[![Supplementary gates](https://img.shields.io/badge/supplementary_v2-56%2F56_gates-2EA44F?style=flat-square)](experiments/results/supplementary/logs/gate_report.csv)
[![Model size](https://img.shields.io/badge/model_INT8-0.95_MB-8A2BE2?style=flat-square)](experiments/results/tables/table_efficiency.csv)
[![CPU latency](https://img.shields.io/badge/latensi_CPU-11.35_ms-8A2BE2?style=flat-square)](experiments/results/tables/table_efficiency.csv)
[![Status](https://img.shields.io/badge/status-prototipe_riset-lightgrey?style=flat-square)](#-keterbatasan-dan-penafian)
[![Not a medical device](https://img.shields.io/badge/bukan-alat_medis-C0392B?style=flat-square)](#-keterbatasan-dan-penafian)

<br />

<a href="https://dr-verge.vercel.app"><img src="docs/screenshots/id/hero-light-dark.webp" alt="Prototipe web DR-VERGE dalam mode terang dan gelap" width="100%" /></a>

<sub>Prototipe web DR-VERGE — <b>mode terang</b> (kiri) dan <b>mode gelap</b> (kanan). Model berjalan langsung di browser. <a href="#-prototipe-web-dr-verge">Lihat selengkapnya ↓</a></sub>

</div>

> [!IMPORTANT]
> **Prototipe riset, bukan alat medis.** Seluruh angka di repositori ini adalah artefak penelitian yang dihasilkan di bawah protokol evaluasi yang dikunci sejak awal. Tidak ada keluaran yang tervalidasi untuk penggunaan klinis, dan tidak ada hasil yang boleh menggantikan pemeriksaan oleh dokter spesialis mata.

---

## 📑 Daftar Isi

- [Ringkasan](#-ringkasan)
- [Latar Belakang](#-latar-belakang)
- [Gagasan Utama: _Complementarity-Shift Distillation_](#-gagasan-utama-complementarity-shift-distillation)
- [Pertanyaan Penelitian](#-pertanyaan-penelitian)
- [Arsitektur dan Alur Penelitian](#-arsitektur-dan-alur-penelitian)
- [Data dan Protokol Eksperimen](#-data-dan-protokol-eksperimen)
- [Hasil Utama](#-hasil-utama)
- [Analisis Suplementer v2: Bukti Inferensial Mekanisme](#-analisis-suplementer-v2-bukti-inferensial-mekanisme)
- [Keterbatasan dan Penafian](#-keterbatasan-dan-penafian)
- [Kontribusi](#-kontribusi)
- [Struktur Repositori](#-struktur-repositori)
- [Reproduksi Eksperimen](#-reproduksi-eksperimen)
- [Prototipe Web DR-VERGE](#-prototipe-web-dr-verge)
- [Tim](#-tim)
- [Sitasi](#-sitasi)

---

## ✨ Ringkasan

DR-VERGE adalah kerangka _grading_ retinopati diabetik (DR) lima tingkat berbasis **dua citra fundus dari mata yang sama** — satu berpusat pada **makula**, satu berpusat pada **diskus optik**. Kerangka ini menggabungkan pemodelan ordinal **CORAL**, _lightweight knowledge distillation_, metode distilasi baru bernama **_Complementarity-Shift Distillation_ (CSD)**, serta **kuantisasi INT8** agar model dapat berjalan cepat di CPU.

<div align="center">

| 🎯 QWK _teacher_ | 🪶 QWK _student_ CSD | 📦 Ukuran model INT8 | ⚡ Latensi CPU | 🗜️ Lebih kecil dari _teacher_ | 🚀 Lebih cepat dari _teacher_ |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **0,7364** | **0,6018** | **0,9507 MB** | **11,35 ms** | **162,1×** | **55,3×** |

</div>

- **Premis _dual-view_ terbukti** — _student_ yang membaca dua _view_ (QWK 0,6042) mengungguli _student_ yang hanya membaca makula (0,5175) atau diskus optik (0,5502).
- **RQ1 — mekanisme ditransfer, akurasi tidak ikut naik.** CSD paling selaras dengan _prediction shift_ milik _teacher_ pada ketiga metrik (ShiftL1 0,3509 · CosAgree 0,4361 · BenefitCorr 0,3075), tetapi perbedaan QWK terhadap NoDistill, Logit-KD, dan Feature-KD **tidak konklusif** (seluruh CI 95% memuat nol).
- **Bukti inferensial mekanisme (analisis suplementer v2, eksploratori).** ShiftL1 CSD **lebih rendah daripada ketiga pembanding dengan CI 95% yang tidak memuat nol**, CosAgree lebih tinggi daripada Logit-KD, dan **tidak ada satu pun kontras yang menguntungkan pembanding**. Pada DeepDRiD Set-C, CSD tetap **peringkat pertama pada ketiga metrik**.
- **Disosiasi kini punya penjelasan matematis.** Identitas eksak _selisih output = selisih agregasi dasar + selisih shift_ menunjukkan CSD hanya menyelaraskan suku kedua — itulah sebabnya fidelitas mekanisme tidak otomatis menjadi QWK.
- **RQ2 — kompresi yang bertahan.** QAT INT8 mempertahankan **98,96%** QWK _student_ FP32 dengan artefak **< 1 MB** dan latensi **11,35 ms** pada satu _thread_ CPU.
- **Generalisasi eksternal.** Pada DeepDRiD Set-C, _student_ FP32 mempertahankan **84,4%** QWK _teacher_.
- **Dapat diaudit.** Run utama: **36/36 _integrity gates_** dan **265/265 angka utama** cocok saat dihitung ulang. Analisis suplementer: **56/56 _gates_**, **156/156** cek reproduksi, dan SHA-256 seluruh _checkpoint_ identik sebelum dan sesudah analisis.

---

## 🩺 Latar Belakang

<img align="right" src="frontend/public/Images/SDG3.png" alt="SDG 3" width="110" />

Sekitar **589 juta** orang dewasa hidup dengan diabetes pada 2024 dan jumlahnya diproyeksikan mencapai **853 juta** pada 2050. Prevalensi DR pada penyandang diabetes mencapai **22,27%**, dengan jumlah penderita diperkirakan naik dari **103,12 juta** (2020) menjadi **160,50 juta** (2045). Di Indonesia, tenaga dan sarana kesehatan mata masih terkonsentrasi di kota besar, sementara kondisi geografis kepulauan dan wilayah **3T** (tertinggal, terdepan, terluar) mempersulit akses skrining.

Satu citra fundus (_single-field_) memiliki cakupan retina terbatas dan dapat melewatkan lesi di luar area yang terpotret. Pendekatan **_two-field_** — citra berpusat makula dan diskus optik dari mata yang sama — memperluas cakupan informasi, tetapi model _dual-view_ yang akurat cenderung berat. DR-VERGE menjawab pertanyaan yang belum banyak diteliti:

> **Ketika model _dual-view_ dikompresi, apakah keuntungan spesifik dari menggabungkan dua _view_ ikut bertahan — atau justru menjadi hal pertama yang hilang?**

Penelitian ini mendukung **SDG 3** (kehidupan sehat dan kesejahteraan), selaras dengan **Asta Cita keempat RPJMN 2025–2029**, dan menjawab tema GEMASTIK XIX 2026: inovasi TIK yang _"Berdampak, Inklusif, dan Berkelanjutan menuju Masyarakat Cerdas"_.

<div align="center">
<img src="research/paper-figures/dataset/figures/fig_twofield_pair_drtid_annotated.png" alt="Pasangan citra fundus two-field DRTiD" width="820" />
<br />
<sub><b>Gambar 1.</b> Satu mata yang sama dari DRTiD: (a) citra berpusat makula dan (b) citra berpusat diskus optik. Kedua <i>field</i> hanya tumpang-tindih sebagian, sehingga masing-masing menangkap area retina yang tidak terlihat pada yang lain.</sub>
</div>

---

## 💡 Gagasan Utama: _Complementarity-Shift Distillation_

Model _teacher_ menghasilkan tiga prediksi ordinal: dari _view_ makula, dari _view_ diskus optik, dan dari gabungan keduanya (_joint dual-view_). Dengan CORAL, setiap prediksi berbentuk empat probabilitas kumulatif:

$$
\mathbf{p} = \big[\,P(y>0),\; P(y>1),\; P(y>2),\; P(y>3)\,\big]
$$

**_Prediction shift_** adalah perubahan bertanda ketika model berpindah dari rata-rata dua prediksi _individual-view_ menuju prediksi _joint dual-view_:

$$
\bar{\mathbf{p}} = \frac{\mathbf{p}_{\text{mac}} + \mathbf{p}_{\text{disc}}}{2}, \qquad \Delta = \mathbf{p}_{\text{dual}} - \bar{\mathbf{p}}
$$

Δ **bukan** prediksinya — Δ adalah _apa yang "dibeli" oleh view kedua_: arah dan besar perubahan keputusan _teacher_. CSD melatih _student_ agar meniru perubahan tersebut, bukan sekadar meniru keluaran akhirnya:

$$
\mathcal{L}_{\text{CSD}} = \frac{1}{N}\sum_{i=1}^{N} \text{SmoothL1}\!\left(\frac{\Delta_i^{S}}{s},\, \frac{\Delta_i^{T}}{s}\right), \qquad s = \mathbb{E}_{\text{train}}\big[\,|\Delta^{T}|\,\big] = 0{,}1073
$$

Skala global _s_ dihitung **sekali** dari _teacher_ yang dibekukan pada seluruh data latih agar skala _loss_ stabil. Fungsi _loss_ total _student_:

$$
\mathcal{L} = \mathcal{L}_{\text{CORAL}} + \lambda\,\mathcal{L}_{\text{aux}} + \alpha\,\mathcal{L}_{\text{logitKD}} + \beta\,\mathcal{L}_{\text{CSD}}, \qquad \lambda = 0{,}5,\;\; \alpha = 0{,}5,\;\; \tau = 2,\;\; \beta = 0{,}1
$$

> [!NOTE]
> Δ diperlakukan sebagai **_operational prediction-shift proxy_** — ukuran perilaku prediksi model — dan **tidak** mengukur komplementaritas anatomis atau biologis retina secara langsung.

---

## ❓ Pertanyaan Penelitian

| | Pertanyaan | Jawaban singkat |
|:---:|---|---|
| **RQ1** | Sejauh mana CSD dapat mentransfer _prediction shift_ dari _teacher_ ke _lightweight student_ dibandingkan NoDistill, Logit-KD, dan Feature-KD? | **Mekanisme ditransfer, akurasi setara** — CSD terbaik pada ketiga metrik _shift fidelity_; ShiftL1 lebih rendah dari ketiga pembanding dengan CI 95% tidak memuat nol (eksploratori); QWK tidak berbeda secara konklusif |
| **RQ2** | Sejauh mana PTQ dan QAT INT8 memengaruhi retensi QWK, ukuran artefak, dan latensi inferensi CPU pada model ringan terpilih? | **QAT mempertahankan 98,96% QWK**, artefak 0,9507 MB, 11,35 ms — 162,1× lebih kecil dan 55,3× lebih cepat dari _teacher_ |

---

## 🏗️ Arsitektur dan Alur Penelitian

<div align="center">
<img src="frontend/public/research/figures/fig_01_architecture.png" alt="Arsitektur DR-VERGE" width="860" />
<br />
<sub><b>Gambar 2.</b> Arsitektur DR-VERGE: <i>teacher</i> ResNet-50 <i>dual-view</i>, <i>lightweight student</i> dengan InteractionFusion, CSD, dan optimasi <i>deployment</i> PTQ/QAT INT8.</sub>
</div>

<br />

| Komponen | _Teacher_ | _Student_ |
|---|---|---|
| _Backbone_ | ResNet-50 (_shared weights_ antar-_view_) | _Custom depthwise-separable CNN_ (_shared weights_) |
| Prapelatihan | APTOS 2019 | APTOS 2019 |
| Fusi | InteractionFusion atas $[\,z_m,\; z_d,\; \lvert z_m - z_d\rvert,\; z_m \odot z_d\,]$ | Sama |
| _Head_ | 3 CORAL _heads_ (makula · diskus · _dual_) | Sama |
| Parameter | 40.313.932 | **328.588** |

**Grade DR bersifat ordinal, dan kodenya memperlakukannya demikian.** CORAL menghasilkan probabilitas kumulatif yang monoton, dan _grade_ akhir adalah **jumlah _threshold_ yang terlampaui** — bukan _argmax_. Salah membaca _grade_ 3 sebagai _grade_ 0 jauh lebih berbahaya daripada sebagai _grade_ 2, sehingga **Quadratic Weighted Kappa (QWK)** dipakai sebagai metrik utama.

Alur penelitian terdiri atas enam tahap utama ditambah satu tahap analisis suplementer. **Seluruh keputusan diambil hanya dari data validasi**; data uji internal dan data eksternal baru dibuka setelah semuanya dikunci. Tahap 7 hanya **membaca** model yang sudah dibekukan.

```mermaid
flowchart LR
    A["1 · Persiapan data<br/>DRTiD 800 / 200 / 550<br/>cek integritas APTOS"] --> B["2 · Stage A<br/>pilih resep input<br/>384 px · standard"]
    B --> C["3 · Prapelatihan APTOS<br/>+ Teacher ResNet-50<br/>dual-view"]
    C --> D["4 · Student + distilasi<br/>NoDistill · Logit-KD<br/>Feature-KD · CSD (RQ1)"]
    D --> E["5 · Kuantisasi INT8<br/>PTQ · QAT · FT-PTQ<br/>pilih deployment (RQ2)"]
    E --> F["6 · Evaluasi & verifikasi<br/>uji internal DRTiD<br/>DeepDRiD Set-C · ekspor ONNX"]
    F -.-> G["7 · Analisis suplementer v2<br/>inference-only · eksploratori<br/>bukti inferensial mekanisme"]

    classDef sel fill:#E3F2FD,stroke:#1565C0,color:#0D47A1;
    classDef ev fill:#FFF3E0,stroke:#EF6C00,color:#E65100;
    classDef sup fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20;
    class A,B,C,D,E sel;
    class F ev;
    class G sup;
```

---

## 🗂️ Data dan Protokol Eksperimen

| Dataset | Peran | Ukuran |
|---|---|---|
| **DRTiD** | Utama — pelatihan, validasi, dan uji internal | 1.550 _examined-eye records_ · 3.100 citra _dual-view_ · _grade_ 0–4 |
| **APTOS 2019** | Prapelatihan _backbone_ | 3.662 citra _single-view_ (2.930 latih · 366 validasi) |
| **DeepDRiD** | Evaluasi konfirmatori eksternal | Set-C: 100 pasien · 200 mata · 400 citra |

| Partisi DRTiD | Mata | _Grade_ 0 | _Grade_ 1 | _Grade_ 2 | _Grade_ 3 | _Grade_ 4 |
|---|---:|---:|---:|---:|---:|---:|
| Latih | 800 | 386 | 72 | 208 | 104 | 30 |
| Validasi | 200 | 96 | 18 | 52 | 26 | 8 |
| Uji internal | 550 | 265 | 50 | 146 | 69 | 20 |

**Protokol yang dikunci sebelum eksekusi:**

- **Pembagian data** — partisi resmi DRTiD dipakai apa adanya; 1.000 _record_ latih dibagi terstratifikasi menjadi 800/200 (_seed_ 42). DRTiD **tidak memiliki pengenal pasien**, sehingga unit sampel internal adalah _examined-eye record_.
- **Stage A** — empat resep (224/384 × _standard_/_balanced sampling_) dibandingkan tanpa distilasi pada tiga _seed_. Terpilih **384 × 384, _standard sampling_** (QWK validasi 0,6491 vs 0,5549).
- **Augmentasi** — rotasi ±15° (p = 0,7) dengan transformasi geometris yang sama pada kedua _field_; kecerahan/kontras ±0,15 (p = 0,5) secara independen per _field_.
- **_Seed_** — _tuning_ {42, 123, 2026}; perbandingan utama lima _core seeds_ {42, 123, 2026, 3407, 8888}.
- **_Threshold_ keputusan** — satu _threshold_ global per kondisi dari rentang 0,35–0,65 (langkah 0,05), dipilih pada validasi.
- **Pemilihan metode** — rerata QWK validasi lima _seed_; selisih < 0,005 dianggap seri, dengan urutan penentu Macro-F1 → _severe error rate_ → MAE → kompleksitas.
- **Statistik** — 10.000 replikasi _hierarchical paired cluster bootstrap_ (klaster = mata pada DRTiD, pasien pada DeepDRiD) + 10.000 iterasi _paired permutation_, dengan koreksi Holm per keluarga hipotesis. **Selisih yang interval kepercayaan 95%-nya memuat nol tidak diklaim.**
- **Kuantisasi** — _eager static quantization_ (engine x86) pada _backbone_; InteractionFusion dan CORAL _heads_ tetap FP32 (_mixed precision_). Kalibrasi PTQ deterministik pada 800 _record_ latih; QAT _learning rate_ 3 × 10⁻⁵.
- **Kriteria _deployment_** — retensi QWK validasi ≥ 95% dan _severe error_ tidak memburuk secara kredibel; di antara kandidat yang lolos dipilih latensi median terendah. Ambang 95% adalah kriteria rekayasa, **bukan** margin non-inferioritas klinis.
- **Latensi** — _batch size_ 1, satu _thread_ CPU, 50 inferensi pemanasan, lima blok × 500 inferensi, median.

Eksperimen final dijalankan di Google Colab dengan **NVIDIA A100-SXM4-80GB**, CPU host Intel Xeon @ 2,20 GHz, **PyTorch 2.11.0+cu128**.

---

## 📊 Hasil Utama

Seluruh angka berasal dari satu run final (`enhanced_v1_20260811`) yang tersimpan utuh di [`experiments/results/`](experiments/results/). Setiap gambar disertai berkas `*_data.csv` berisi angka penyusunnya.

### 1. Premis _dual-view_ terpenuhi

```mermaid
xychart-beta
    title "QWK uji internal DRTiD (rerata 5 seed; teacher 1 seed)"
    x-axis ["Makula", "Diskus", "NoDistill", "Logit-KD", "Feature-KD", "CSD", "Teacher"]
    y-axis "QWK" 0.4 --> 0.8
    bar [0.5175, 0.5502, 0.6042, 0.5942, 0.6161, 0.6018, 0.7364]
```

Pada validasi, prediksi _joint dual-view_ _teacher_ mengungguli _auxiliary head_ _single-view_ terbaiknya sebesar **+0,0469 QWK**, dan _teacher_ menunjukkan _prediction shift_ yang terukur — sinyal yang menjadi target CSD.

<div align="center">
<img src="experiments/results/figures/fig_06_dual_view_gain.png" alt="Dual-view gain" width="760" />
</div>

### 2. RQ1 — Performa prediktif (550 mata uji internal DRTiD)

| Model / Kondisi | QWK ↑ | Macro-F1 ↑ | MAE ↓ | SER ↓ |
|---|---:|---:|---:|---:|
| ResNet-50 _teacher_ (_dual-view_, 1 _seed_) | 0,7364 | 0,3887 | 0,5909 | 0,1764 |
| _Student_, hanya makula | 0,5175 ± 0,0193 | 0,3330 ± 0,0239 | 0,8524 ± 0,0240 | 0,2742 ± 0,0084 |
| _Student_, hanya diskus optik | 0,5502 ± 0,0067 | 0,3422 ± 0,0139 | 0,8047 ± 0,0108 | 0,2549 ± 0,0122 |
| _Dual-view_, tanpa distilasi | 0,6042 ± 0,0166 | 0,3355 ± 0,0119 | 0,8105 ± 0,0316 | 0,2505 ± 0,0127 |
| Logit-KD | 0,5942 ± 0,0290 | **0,3589 ± 0,0278** | 0,7775 ± 0,0646 | 0,2487 ± 0,0187 |
| Logit-KD + Feature-KD | **0,6161 ± 0,0101** | 0,3435 ± 0,0113 | **0,7702 ± 0,0278** | **0,2396 ± 0,0107** |
| **Logit-KD + CSD (DR-VERGE)** | 0,6018 ± 0,0149 | 0,3362 ± 0,0152 | 0,7902 ± 0,0250 | 0,2582 ± 0,0081 |

<sub>_Student_: rerata ± simpangan baku lima _core seeds_. SER = _severe error rate_, P(|y − ŷ| ≥ 2). Nilai tebal = terbaik di antara _student_.</sub>

Dibandingkan _teacher_, CSD mempertahankan **81,7%** QWK dengan **122,7× lebih sedikit parameter**. Perbandingan berpasangan terhadap ketiga pembanding:

| Perbandingan | ΔQWK | CI 95% | p (permutasi) | p (Holm) | Kesimpulan |
|---|---:|---|---:|---:|---|
| CSD vs tanpa distilasi | −0,0024 | [−0,0336; +0,0285] | 0,8003 | 0,8003 | tidak konklusif |
| CSD vs Logit-KD | +0,0077 | [−0,0304; +0,0463] | 0,3640 | 0,7279 | tidak konklusif |
| CSD vs Feature-KD | −0,0143 | [−0,0445; +0,0153] | 0,1650 | 0,4950 | tidak konklusif |

<div align="center">
<img src="experiments/results/figures/fig_12_forest.png" alt="Forest plot perbandingan berpasangan" width="760" />
</div>

### 3. RQ1 — Fidelitas transfer mekanisme

CSD menghasilkan **ShiftL1 terendah serta CosAgree dan BenefitCorr tertinggi** — pola monoton yang konsisten, dan formulasi utama juga mengungguli ketiga varian ablasi.

| Kondisi / Formulasi | QWK | ShiftL1 ↓ | CosAgree ↑ | BenefitCorr ↑ |
|---|---:|---:|---:|---:|
| _Dual-view_, tanpa distilasi | 0,6042 | 0,3759 | 0,3509 | 0,2193 |
| Logit-KD | 0,5942 | 0,3840 | 0,2858 | 0,1795 |
| Logit-KD + Feature-KD | 0,6161 | 0,3718 | 0,3815 | 0,1943 |
| **Logit-KD + CSD (DR-VERGE)** | 0,6018 | **0,3509** | **0,4361** | **0,3075** |
| Ablasi: tanpa penskalaan (_raw-Huber_, 3 _seed_) | 0,6178 | 0,3746 | 0,4017 | 0,2036 |
| Ablasi: KL-_softmax_, kontrol negatif (3 _seed_) | 0,6099 | 0,3885 | 0,3274 | 0,1082 |
| Ablasi: _counterfactual_ kepala sama (3 _seed_) | 0,6128 | 0,3576 | 0,4327 | 0,2544 |

<div align="center">
<img src="experiments/results/figures/fig_07_csd_mechanism.png" alt="Mekanisme CSD" width="860" />
</div>

> [!TIP]
> **Kedua sisi adalah temuan.** Mekanisme berhasil ditransfer, tetapi akurasi tidak ikut meningkat secara konklusif. Fidelitas terhadap _prediction shift_ dan performa prediktif ternyata **tidak bergerak sejalan**, sehingga keduanya perlu dievaluasi sebagai dua aspek yang berbeda. Analisis suplementer v2 [di bawah](#-analisis-suplementer-v2-bukti-inferensial-mekanisme) menguji keunggulan mekanisme ini secara inferensial dan menjelaskan disosiasinya secara matematis.

### 4. RQ2 — Efisiensi dan kuantisasi

| Model | Parameter | Ukuran (MB) | Latensi CPU (ms) | Retensi QWK | ΔQWK vs FP32 [CI 95%] |
|---|---:|---:|---:|---:|---|
| ResNet-50 _teacher_ | 40.313.932 | 154,089 | 627,610 | — | — |
| _Student_ FP32 (M\*, CSD) | 328.588 | 1,2935 | 32,490 | 100,00% | — |
| _Student_ PTQ INT8 | 328.588 | **0,9507** | **11,238** | 97,27% | −0,0164 [−0,0360; +0,0023] |
| **_Student_ QAT INT8 (_deployment_)** | 328.588 | **0,9507** | 11,347 | **98,96%** | **−0,0063** [−0,0293; +0,0175] |

QAT INT8 adalah satu-satunya kandidat yang lolos kriteria retensi validasi 95% (99,04% vs PTQ 93,37%), sehingga dipilih dan dikunci sebagai artefak _deployment_ **sebelum** data uji dibuka. Interval kepercayaan kedua varian memuat nol; namun uji permutasi terkoreksi Holm menunjukkan perbedaan PTQ vs FP32 (p = 0,0243), sedangkan QAT tidak (p Holm = 0,4854). Ketika kedua prosedur tidak sepakat, **keduanya dilaporkan dan tidak ada yang diklaim**.

<table>
<tr>
<td width="50%"><img src="experiments/results/figures/fig_11_pareto.png" alt="Pareto QWK vs latensi" /></td>
<td width="50%"><img src="experiments/results/figures/fig_10_efficiency.png" alt="Efisiensi" /></td>
</tr>
<tr>
<td align="center"><sub><i>Trade-off</i> QWK vs latensi CPU</sub></td>
<td align="center"><sub>Ukuran artefak dan latensi</sub></td>
</tr>
</table>

### 5. Generalisasi eksternal — DeepDRiD Set-C

Model **dibekukan** — tanpa _fine-tuning_, tanpa penyetelan _threshold_. Interval _bootstrap_ dikelompokkan per **pasien**.

| Model | QWK Set-C |
|---|---:|
| ResNet-50 _teacher_ (1 _seed_) | 0,7923 [0,7152; 0,8550] |
| _Student_ PTQ INT8 | **0,6729 ± 0,0365** |
| _Student_ FP32 (M\*) | 0,6688 ± 0,0415 |
| _Fine-tune_ FP32 (kontrol) | 0,6567 ± 0,0364 |
| _Student_ FT-PTQ INT8 | 0,6513 ± 0,0315 |
| _Student_ QAT INT8 (_deployment_) | 0,6344 ± 0,0326 |

_Student_ FP32 mempertahankan **84,4%** QWK _teacher_ pada domain eksternal. Pada Set-C urutannya berbalik: QAT lebih rendah daripada PTQ (ΔQWK −0,0384, CI 95% [−0,0826; −0,0006]). Varian yang optimal pada validasi internal **belum tentu** terbaik di domain eksternal — pilihan pra-registrasi tetap dipertahankan, karena mengubahnya setelah melihat data eksternal akan menghilangkan makna set konfirmatori.

<div align="center">
<img src="experiments/results/figures/fig_14_internal_vs_external.png" alt="Internal vs eksternal" width="760" />
</div>

<details>
<summary><b>🖼️ Galeri lengkap 14 gambar hasil</b></summary>

<br />

| | |
|:---:|:---:|
| <img src="experiments/results/figures/fig_01_dataset.png" width="400" /><br/><sub>01 · Dataset</sub> | <img src="experiments/results/figures/fig_02_performance.png" width="400" /><br/><sub>02 · Performa</sub> |
| <img src="experiments/results/figures/fig_03_ordinal_safety.png" width="400" /><br/><sub>03 · Keamanan ordinal</sub> | <img src="experiments/results/figures/fig_04_per_grade_recall.png" width="400" /><br/><sub>04 · _Recall_ per _grade_</sub> |
| <img src="experiments/results/figures/fig_05_confusion.png" width="400" /><br/><sub>05 · Matriks konfusi</sub> | <img src="experiments/results/figures/fig_06_dual_view_gain.png" width="400" /><br/><sub>06 · _Dual-view gain_</sub> |
| <img src="experiments/results/figures/fig_07_csd_mechanism.png" width="400" /><br/><sub>07 · Mekanisme CSD</sub> | <img src="experiments/results/figures/fig_08_csd_gradient.png" width="400" /><br/><sub>08 · Gradien CSD</sub> |
| <img src="experiments/results/figures/fig_09_retention.png" width="400" /><br/><sub>09 · Retensi kuantisasi</sub> | <img src="experiments/results/figures/fig_10_efficiency.png" width="400" /><br/><sub>10 · Efisiensi</sub> |
| <img src="experiments/results/figures/fig_11_pareto.png" width="400" /><br/><sub>11 · Pareto</sub> | <img src="experiments/results/figures/fig_12_forest.png" width="400" /><br/><sub>12 · _Forest plot_</sub> |
| <img src="experiments/results/figures/fig_13_external_setc.png" width="400" /><br/><sub>13 · Eksternal Set-C</sub> | <img src="experiments/results/figures/fig_14_internal_vs_external.png" width="400" /><br/><sub>14 · Internal vs eksternal</sub> |

</details>

---

## 🔬 Analisis Suplementer v2: Bukti Inferensial Mekanisme

Hasil RQ1 di atas menunjukkan CSD **terbaik secara deskriptif** pada ketiga metrik mekanisme. Analisis suplementer v2 menjawab pertanyaan lanjutannya: apakah keunggulan itu **didukung secara statistik**, apakah **bertahan di data eksternal**, dan **mengapa** tidak berubah menjadi QWK yang lebih tinggi.

> [!IMPORTANT]
> **_Inference-only_ dan eksploratori.** Analisis ini hanya membaca 21 _checkpoint_ beku dari run utama — tanpa pelatihan, penyetelan, perubahan ambang, maupun pemilihan ulang model. Sebelum statistik baru dihitung, hasil asli direproduksi lebih dulu: **156/156** cek cocok (QWK _teacher_ 0,736401 identik; selisih maksimum 1,2 × 10⁻⁴). SHA-256 21 _checkpoint_ dan 59 berkas sumber identik sebelum dan sesudah analisis; **56/56 _gates_ lulus**. Karena dirancang setelah hasil utama diketahui, seluruh hasil di bagian ini berlabel **eksploratori pasca-hoc**. Tabel I–III, hasil RQ2, dan keputusan _deployment_ **tidak berubah**.

### 1. CSD paling selaras dengan _shift_ teacher — kini secara inferensial

Selisih CSD − pembanding pada 550 mata uji DRTiD, lima _seed_ berpasangan, CI 95% _hierarchical paired bootstrap_ (B = 10.000) yang meresampling _examined-eye records_ **dan** _seed_ secara bersamaan:

| Pembanding | ΔShiftL1 ↓ | ΔCosAgree ↑ | ΔBenefitCorr ↑ |
|---|---|---|---|
| NoDistill | **−0,0249\*** [−0,0477; −0,0043] | +0,0852 [−0,0134; +0,1870] | +0,0882 [−0,0342; +0,2329] |
| Logit-KD | **−0,0331\*** [−0,0567; −0,0103] | **+0,1503\*** [+0,0263; +0,3011] | +0,1280 [−0,0038; +0,2643] |
| Feature-KD | **−0,0209\*** [−0,0408; −0,0012] | +0,0546 [−0,0225; +0,1407] | +0,1132 [−0,0390; +0,2662] |
| _Seed_ searah CSD | 5/5 · 4/5 · 4/5 | 3/5 · 4/5 · 4/5 | 3/5 · 4/5 · 3/5 |

<sub>\* CI 95% tidak memuat nol dan menguntungkan CSD. Baris _seed_ berurutan NoDistill · Logit-KD · Feature-KD. Sumber: [`table_mechanism_internal_stats.csv`](experiments/results/supplementary/tables/table_mechanism_internal_stats.csv).</sub>

| Lapisan bukti | Hasil | Makna |
|---|---|---|
| _Hierarchical bootstrap_ (utama) | **4/9** kontras konklusif, semuanya menguntungkan CSD · **0/9** menguntungkan pembanding | Bukti inferensial utama |
| Arah per _seed_ | **34/45** pasangan _seed_-kontras searah CSD | Bukan efek dari satu _seed_ |
| _Leave-one-seed-out_ | **9/9** kontras tetap searah | Estimasi titik stabil |
| Bootstrap record saja (model tetap) | **9/9** CI tidak memuat nol | Untuk model terlatih yang sama, selisihnya nyata |
| Permutasi bersyarat + Holm (9 kontras) | **9/9** p<sub>Holm</sub> ≤ 0,0034 | Konsisten dengan baris di atas |
| BenefitCorr dengan Spearman | Konklusif vs Logit-KD: +0,1637 [+0,0411; +0,3170] | Mendukung arah BenefitCorr |

**ShiftL1 — metrik yang paling langsung mengukur target CSD — konklusif terhadap ketiga pembanding.** BenefitCorr searah pada ketiganya (+0,09 hingga +0,13), tetapi CI-nya masih memuat nol. Karena analisis dengan model tetap konklusif 9/9 sedangkan analisis hierarkis 4/9, ketidakpastian yang tersisa hampir seluruhnya berasal dari **jumlah _seed_ pelatihan** (lima model per kondisi), bukan dari ukuran data uji.

<div align="center">
<img src="experiments/results/supplementary/figures/fig_internal_external_mechanism.png" alt="Selisih fidelitas CSD terhadap tiga pembanding, internal dan eksternal" width="860" />
<br />
<sub>Selisih fidelitas CSD − pembanding pada DRTiD internal (lingkaran) dan DeepDRiD Set-C (persegi). Penanda terisi = CI 95% tidak memuat nol.</sub>
</div>

### 2. Pola mekanisme bertahan di DeepDRiD Set-C

Model FP32, ambang, dan urutan _field_ yang sama; _bootstrap_ **berklaster pasien** (100 pasien · 200 mata).

| Metrik | NoDistill | Logit-KD | Feature-KD | **CSD** | Peringkat CSD (internal → Set-C) |
|---|---:|---:|---:|---:|:---:|
| ShiftL1 ↓ | 0,3128 | 0,3079 | 0,3044 | **0,2975** | 1 → **1** |
| CosAgree ↑ | 0,2548 | 0,2223 | 0,3312 | **0,3831** | 1 → **1** |
| BenefitCorr ↑ | 0,1161 | 0,1251 | 0,1466 | **0,2357** | 1 → **1** |

CosAgree CSD konklusif lebih tinggi daripada NoDistill (+0,1283 [+0,0250; +0,2505]) dan Logit-KD (+0,1608 [+0,0358; +0,3036]), keduanya searah di 5/5 _seed_. ShiftL1 eksternal belum konklusif karena sinyal yang dapat ditiru melemah: di Set-C, rerata |Δ<sub>T</sub>| _teacher_ turun dari 0,4097 menjadi 0,2659, dan keunggulan _dual-view_ _teacher_ atas _auxiliary head_ terbaiknya turun dari +0,0500 menjadi +0,0073.

### 3. Mengapa fidelitas mekanisme tidak otomatis menaikkan QWK

Untuk setiap mata berlaku identitas eksak (residual numerik 0):

$$
\underbrace{p^{S}_{\text{dual}} - p^{T}_{\text{dual}}}_{\text{selisih output akhir}} \;=\; \underbrace{\big(\bar p^{S} - \bar p^{T}\big)}_{\text{selisih agregasi dasar}} \;+\; \underbrace{\big(\Delta^{S} - \Delta^{T}\big)}_{\text{selisih shift — target CSD}}, \qquad \bar p = \tfrac{1}{2}\,(p_{\text{mac}} + p_{\text{disc}})
$$

| Kondisi (DRTiD internal) | Selisih _shift_ ↓ | Selisih agregasi dasar ↓ | Selisih output _joint_ ↓ | _Grade_ sama dengan _teacher_ | QWK |
|---|---:|---:|---:|---:|---:|
| NoDistill | 0,376 | 0,427 | **0,545** | 61,4% | 0,604 |
| Logit-KD | 0,384 | 0,448 | 0,587 | 64,8% | 0,594 |
| Feature-KD | 0,372 | **0,422** | 0,569 | **66,1%** | **0,616** |
| **CSD** | **0,351** | 0,436 | 0,558 | 65,5% | 0,602 |

CSD paling unggul pada suku yang ditargetkannya (_shift_), tetapi selisih agregasi dasarnya — seberapa mirip prediksi tiap _view_ student dengan milik teacher — tidak menjadi target CSD dan justru sedikit lebih besar daripada Feature-KD. Di 20 model _student_, QWK lebih berkaitan dengan selisih agregasi dasar (ρ = −0,52) daripada dengan ShiftL1 (ρ = −0,35). **Disosiasi "mekanisme ≠ prediksi" kini memiliki penjelasan matematis, bukan sekadar observasi.**

### 4. Kapan CSD paling bermanfaat

| Kuartil \|Δ<sub>T</sub>\| (DRTiD) | n mata | Rerata \|Δ<sub>T</sub>\| | ShiftL1 relatif\* | Kontras konklusif menguntungkan CSD |
|---|---:|---:|---|:---:|
| Q1 (terkecil) | 138 | 0,103 | 2,24–2,38 | 1 dari 6 |
| Q2 | 137 | 0,274 | 0,93–0,97 | 0 dari 6 |
| Q3 | 137 | 0,461 | 0,73–0,81 | 0 dari 6 |
| Q4 (terbesar) | 138 | 0,801 | 0,73–0,83 | **4 dari 6** |

<sub>\* Kesalahan _shift_ student dibagi besar _shift_ teacher (rentang empat kondisi). Nilai > 1 berarti kesalahannya lebih besar daripada sinyalnya.</sub>

- Pada **kuartil _shift_ teacher terbesar**, ShiftL1 CSD lebih rendah daripada NoDistill (−0,0557 [−0,1042; −0,0093]) dan Logit-KD (−0,0842 [−0,1360; −0,0416]). Pola yang sama muncul di Set-C (vs NoDistill −0,0620 [−0,1113; −0,0083]).
- Pada kuartil terkecil, kesalahan _shift_ semua student 2,2–2,4× lebih besar daripada _shift_ teacher itu sendiri — sinyalnya didominasi _noise_.
- Pada 325 mata yang **diprediksi benar oleh teacher**, CSD konklusif mengungguli Logit-KD pada **ketiga** metrik, termasuk BenefitCorr (+0,1170 [+0,0122; +0,2199]).

### 5. Grade 1, sensitivitas, dan kalibrasi

- **Grade 1 (NPDR ringan) sulit bagi semua model, termasuk _teacher_.** _Recall_ Grade 1: _teacher_ 0,000, CSD 0,068, Feature-KD 0,080. Kesalahannya **sistematis ke arah lebih ringan**: 72% mata Grade 1 diprediksi Grade 0 oleh _teacher_ dan 65,2% oleh CSD.
- **Stabil terhadap pilihan metrik.** CSD tetap peringkat pertama BenefitCorr dengan Pearson (0,3075) maupun Spearman (0,4532) di DRTiD, dan di Set-C (0,2357 / 0,2964).
- **Kalibrasi skor ambang ordinal** CSD (ECE 0,056) berada dalam kisaran _student_ lain (0,050–0,060); _teacher_ paling terkalibrasi (0,038). Ini diagnostik skor ambang, **bukan** probabilitas klinis.

<table>
<tr>
<td width="50%"><img src="experiments/results/supplementary/figures/fig_mechanism_decomposition.png" alt="Dekomposisi mekanisme dan prediksi" /></td>
<td width="50%"><img src="experiments/results/supplementary/figures/fig_confusion_core_models.png" alt="Matriks konfusi model inti" /></td>
</tr>
<tr>
<td align="center"><sub>Dekomposisi: selisih <i>shift</i> vs selisih agregasi dasar vs selisih output <i>joint</i></sub></td>
<td align="center"><sub>Matriks konfusi ternormalisasi baris — <i>teacher</i> dan empat kondisi inti</sub></td>
</tr>
</table>

| Klaim | Status bukti |
|---|---|
| CSD terbaik secara deskriptif pada 3 metrik mekanisme | Terverifikasi ulang (156/156) |
| ShiftL1 CSD lebih rendah dari ketiga pembanding | **Inferensial**, eksploratori |
| CosAgree CSD lebih tinggi dari Logit-KD | **Inferensial**, eksploratori |
| BenefitCorr CSD lebih tinggi | Searah, **belum konklusif** |
| Pola mekanisme bertahan di Set-C | Deskriptif 3/3 + inferensial 2/9, eksploratori |
| Fidelitas ≠ akurasi | **Identitas matematis** + data |
| CSD meningkatkan QWK | **Tidak didukung** — tetap seperti hasil utama |

Seluruh tabel, gambar, log reproduksi, dan _claim ledger_: [`experiments/results/supplementary/`](experiments/results/supplementary/).

---

## ⚠️ Keterbatasan dan Penafian

- **RQ1 tidak konklusif secara prediktif** — keunggulan CSD ada pada fidelitas mekanisme, bukan QWK; seluruh CI ΔQWK memuat nol.
- **Analisis suplementer bersifat eksploratori pasca-hoc** dan didasarkan pada **lima model per kondisi**. Resampling data tidak menambah jumlah model, sehingga BenefitCorr belum konklusif walaupun arahnya konsisten. Sembilan CI utama belum dikoreksi multiplisitas, dan analisis kuartil/subgrup menambah perbandingan.
- **Δ adalah proksi operasional** pergeseran prediksi, bukan ukuran komplementaritas anatomis; Δ juga dipengaruhi perbedaan _head_ dan kalibrasi.
- **QWK absolut masih moderat** (_student_ 0,5942–0,6161) dan Macro-F1 rendah (0,3362 untuk CSD).
- **_Severe error rate_ 0,2582** — kira-kira satu dari empat mata meleset ≥ 2 _grade_.
- **_Recall grade_ 1 sangat rendah pada seluruh model, termasuk _teacher_** (CSD 0,068; _teacher_ 0,000) dan kesalahannya condong ke Grade 0, sehingga model tidak layak dipakai sebagai alat diagnosis mandiri.
- **Tanpa pengenal pasien di DRTiD** — pembagian dan _bootstrap_ internal berbasis _examined-eye record_; hanya Set-C yang berklaster pasien, dan dengan 100 pasien presisinya terbatas.
- **Evaluasi masih komputasional** — belum ada validasi prospektif, pengujian berbagai kamera fundus, pengujian pada perangkat CPU target, maupun uji klinis.
- **Tidak ada klaim generalitas** ke domain pencitraan lain.

DR-VERGE adalah prototipe riset dan **tidak ditujukan untuk diagnosis klinis mandiri**.

---

## 🧩 Kontribusi

1. **Algoritmik** — merumuskan CSD, yang memakai _signed joint-vs-individual cumulative ordinal prediction shift_ sebagai target distilasi; berbeda dari Logit-KD (keluaran akhir) maupun distilasi fitur/relasional.
2. **Pengukuran** — tiga metrik _shift fidelity_ (ShiftL1, CosAgree, BenefitCorr) plus kontrol _counterfactual_, sehingga transfer mekanisme diuji langsung, terpisah dari akurasi.
3. **Empiris** — uji terkontrol CSD vs NoDistill, Logit-KD, dan Feature-KD di bawah satu protokol pra-registrasi, dilaporkan apa adanya sebagai disosiasi; diperkuat analisis suplementer _inference-only_ yang memberi bukti inferensial (eksploratori) pada ShiftL1, menguji ulang pola mekanisme di data eksternal, dan menjelaskan disosiasi melalui identitas dekomposisi eksak.
4. **Praktis** — karakterisasi dampak INT8 pada _grader_ DR _dual-view_ ringan, menghasilkan model 0,95 MB / 11,35 ms yang berjalan di browser.

Dengan demikian DR-VERGE memisahkan secara tegas empat aspek: **mekanisme yang ditransfer** (beserta bukti statistiknya), **ketahanan lintas domain**, **mengapa mekanisme tidak otomatis menjadi akurasi**, dan **efisiensi _deployment_**.

---

## 📁 Struktur Repositori

```text
DR-VERGE/
├── README.md                 dokumentasi utama (Bahasa Indonesia)
├── README.en.md              dokumentasi utama (English)
│
├── experiments/              eksperimen — kode dan bukti
│   ├── notebooks/            full_pipeline_notebook_enhanced.ipynb        ← notebook final (run utama)
│   │                         DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb ← analisis suplementer
│   ├── results/              keluaran run final: tabel, gambar, prediksi per sampel, konfigurasi
│   │   └── supplementary/    keluaran analisis suplementer v2 (inference-only, 56/56 gates)
│   ├── src/                  komponen modular: model, loss, dataset, prapelatihan
│   ├── configs/              konfigurasi YAML per kondisi pelatihan
│   ├── scripts/              make_splits.py + verification/
│   └── requirements.txt
│
├── research/                 argumen ilmiah, turunan matematis, catatan deployment, gambar paper
├── references/               literatur dan daftar pustaka
├── dataset/                  tata letak dan sumber dataset (data tidak di-commit)
├── frontend/                 prototipe web (React · Vite · TypeScript · ONNX Runtime Web)
└── docs/screenshots/         tangkapan layar prototipe web (id/ · en/)
```

Setiap direktori memiliki `README.md` (Indonesia) dan `README.en.md` (English) — atau `README.md` tunggal untuk direktori yang sudah stabil — yang menjelaskan isi dan fungsinya.

**Urutan membaca yang disarankan:**

1. Dokumen ini — gambaran utuh penelitian.
2. [`experiments/README.md`](experiments/README.md) — bagaimana eksperimen disusun dan dijalankan.
3. [`experiments/results/README.md`](experiments/results/README.md) — peta seluruh keluaran run final.
4. [`experiments/results/supplementary/README.md`](experiments/results/supplementary/README.md) — bukti inferensial mekanisme dan dekomposisinya.
5. [`research/math.md`](research/math.md) — turunan matematis lengkap.
6. [`frontend/`](frontend/) — prototipe web yang menjalankan model di browser.

---

## 🔁 Reproduksi Eksperimen

Seluruh eksperimen ada dalam **satu notebook mandiri**: [`experiments/notebooks/full_pipeline_notebook_enhanced.ipynb`](experiments/notebooks/full_pipeline_notebook_enhanced.ipynb). Notebook ini dirancang untuk **Google Colab** dan membaca data dari Google Drive.

**1. Siapkan dataset di Google Drive**

```text
MyDrive/DR-VERGE/
└── dataset/
    ├── DRTiD/                ← "Original Images/" + "Ground Truths/DR_grade/"
    ├── APTOS/
    └── DeepDRiD-master/      ← regular_fundus_images/
```

Lokasi DRTiD dan DeepDRiD dicari otomatis, sehingga notebook **tidak bergantung** pada tata letak repositori ini. Lihat [`dataset/README.md`](dataset/README.md) untuk sumber dan detail setiap dataset.

**2. Atur konfigurasi pada sel _Configuration_**

```python
DRIVE_BASE = "/content/drive/MyDrive/DR-VERGE"
RUN_TAG    = "enhanced_v1_YYYYMMDD"   # gunakan tag baru untuk setiap run baru
QUICK      = False                    # True = gladi singkat (1 seed, sedikit epoch)
RESUME     = True                     # lanjutkan run yang terputus pada RUN_TAG yang sama
USE_AMP    = False
```

**3. Jalankan seluruh sel (_Run All_)**

Disarankan gladi singkat dulu dengan `QUICK = True` pada `RUN_TAG` sementara. Run penuh membutuhkan **±12,5 jam pada A100**. Jika Colab terputus, buka kembali dengan `RUN_TAG` yang sama dan _Run All_ lagi — pekerjaan yang sudah selesai tidak dilatih ulang.

Run yang berhasil menulis `artifacts_<RUN_TAG>/FINAL_RUN_COMPLETE.txt` **hanya jika semua _blocking gate_ lulus**. Untuk lingkungan lokal:

```bash
pip install -r experiments/requirements.txt
```

Versi paket persis dari run final tercatat di [`experiments/results/configs/requirements_exact.txt`](experiments/results/configs/requirements_exact.txt).

### Integritas pipeline

Pipeline memverifikasi dirinya sendiri melalui **36 _integrity gates_** — skema data, keterpisahan partisi, kebenaran metrik, monotonisitas _head_ ordinal, kelengkapan _grid_ dan _seed_, kesetaraan cakupan kuantisasi PTQ/QAT/FT-PTQ, fidelitas ekspor ONNX, hingga prosedur statistik. Run yang gagal pada _blocking gate_ akan berhenti alih-alih melaporkan angka. _Gate_ terakhir menghitung ulang setiap angka utama dari berkas prediksi per sampel: **265/265 cocok**.

### Analisis suplementer (_inference-only_)

[`experiments/notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb`](experiments/notebooks/DRVERGE_Enhanced_Supplementary_Analysis_v2.ipynb) membaca artefak run utama (`artifacts_enhanced_v1_20260811/`) secara **read-only** dan menulis hanya ke folder keluaran baru. Notebook ini tidak memiliki fungsi _training_, mematikan autograd secara global, dan berhenti bila salah satu hal berikut gagal: _strict load_ 21 _checkpoint_, kecocokan hash _split_, atau reproduksi QWK dan metrik mekanisme asli. Fase P0–P6 (_preflight_ → inferensi internal → Set-C → dekomposisi → per-_grade_ → sensitivitas → ringkasan _deployment_) diamankan oleh **56 _gates_**, termasuk uji metode identik (efek = 0), pembalikan kontras, pengacakan urutan baris, reproduksibilitas RNG, dan klaster pasien yang tidak terpecah. Pada A100, run final selesai dalam ± 3 menit karena memakai ulang _cache_ inferensi yang hash-nya tervalidasi. Keluarannya: [`experiments/results/supplementary/`](experiments/results/supplementary/).

---

## 🌐 Prototipe Web DR-VERGE

<div align="center">

[![Buka Prototipe](https://img.shields.io/badge/Buka_Prototipe-dr--verge.vercel.app-1565C0?style=for-the-badge&logo=googlechrome&logoColor=white)](https://dr-verge.vercel.app)
[![Kode Frontend](https://img.shields.io/badge/Kode-frontend%2F-24292F?style=for-the-badge&logo=github&logoColor=white)](frontend/)

</div>

Prototipe web DR-VERGE menjembatani penelitian dan pengguna: siapa pun dapat **mencoba model secara langsung**, memahami gagasan CSD tanpa membaca makalah, lalu memeriksa bukti eksperimennya. Situs ini terdiri atas tiga halaman — **Beranda**, **Demo Model**, dan **Penelitian** — dalam dua bahasa, dua mode tampilan, dan dua palet warna.

> [!NOTE]
> **Model berjalan sungguhan di browser Anda.** Model ONNX diunduh satu kali lalu dijalankan di perangkat melalui `onnxruntime-web` (WebAssembly) — tanpa server, tanpa API, dan **citra tidak pernah diunggah ke mana pun**. Konstanta _preprocessing_ dibaca dari `metadata.json` hasil ekspor, dan _grade_ dihitung sebagai jumlah _threshold_ CORAL yang terlampaui — persis seperti di notebook.

### 🌗 Mode terang dan gelap

<table>
<tr>
<td width="50%"><img src="docs/screenshots/id/hero-light.webp" alt="Beranda — mode terang" /></td>
<td width="50%"><img src="docs/screenshots/id/hero-dark.webp" alt="Beranda — mode gelap" /></td>
</tr>
<tr>
<td align="center"><sub><b>Mode terang</b> — Beranda dengan palet <i>Colorful</i></sub></td>
<td align="center"><sub><b>Mode gelap</b> — Beranda dengan palet <i>Colorful</i></sub></td>
</tr>
</table>

Perpindahan mode memakai animasi _circular reveal_ yang tumbuh dari tombol pengalih (View Transitions API), dengan transisi warna halus sebagai cadangan pada browser yang belum mendukungnya. Pilihan pengguna diingat untuk kunjungan berikutnya.

### 🎨 Dua palet warna: _Colorful_ dan Monokrom

<table>
<tr>
<td width="50%"><img src="docs/screenshots/id/hero-mono-light.webp" alt="Palet monokrom — terang" /></td>
<td width="50%"><img src="docs/screenshots/id/hero-mono-dark.webp" alt="Palet monokrom — gelap" /></td>
</tr>
<tr>
<td align="center"><sub>Palet <b>Monokrom</b> — mode terang</sub></td>
<td align="center"><sub>Palet <b>Monokrom</b> — mode gelap</sub></td>
</tr>
</table>

Palet **_Colorful_** memakai gradien biru sebagai warna utama dengan aksen merah dan kuning untuk tingkat keparahan; palet **Monokrom** menampilkan desain hitam-putih yang tenang. Kedua palet bekerja di mode terang maupun gelap, dengan kontras teks dan latar yang dijaga agar tetap mudah dibaca.

### 🔬 Demo Model — tiga langkah

```mermaid
flowchart LR
    A["1 · Pilih mata<br/>12 sampel DeepDRiD<br/>atau unggah citra sendiri"] --> B["2 · Jalankan analisis<br/>model ONNX berjalan<br/>di perangkat Anda"]
    B --> C["3 · Baca hasilnya<br/>grade ordinal · skor ambang<br/>· perbandingan referensi"]

    classDef step fill:#E3F2FD,stroke:#1565C0,color:#0D47A1;
    class A,B,C step;
```

<table>
<tr>
<td width="50%"><img src="docs/screenshots/id/demo-upload-light.webp" alt="Langkah 1 — memilih pasangan dual-view" /></td>
<td width="50%"><img src="docs/screenshots/id/demo-result-light.webp" alt="Langkah 3 — hasil analisis" /></td>
</tr>
<tr>
<td align="center"><sub><b>Langkah 1</b> — pilih satu dari 12 sampel atau unggah citra makula + diskus optik</sub></td>
<td align="center"><sub><b>Langkah 3</b> — <i>grade</i> prediksi pada skala keparahan ordinal</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/id/demo-detail-light.webp" alt="Detail hasil — skor ambang dan referensi" /></td>
<td width="50%"><img src="docs/screenshots/id/demo-result-dark.webp" alt="Hasil analisis — mode gelap" /></td>
</tr>
<tr>
<td align="center"><sub>Detail hasil — empat skor ambang <i>P(y &gt; k)</i>, skor relatif per <i>grade</i>, dan perbandingan dengan <i>grade</i> referensi</sub></td>
<td align="center"><sub>Hasil yang sama dalam mode gelap</sub></td>
</tr>
</table>

Pada contoh di atas, sampel **p24-R** diprediksi **_Grade_ 3 (NPDR Berat)** dan cocok dengan _grade_ referensinya — 3 dari 4 ambang ordinal terlampaui pada _threshold_ 0,5. Hasil dapat dicetak atau disimpan sebagai ringkasan.

### 🏠 Beranda — cerita penelitian dari masalah hingga dampak

<table>
<tr>
<td width="50%"><img src="docs/screenshots/id/home-problem-light.webp" alt="Permasalahan" /></td>
<td width="50%"><img src="docs/screenshots/id/home-two-views-dark.webp" alt="Mengapa dua view" /></td>
</tr>
<tr>
<td align="center"><sub><b>Permasalahan</b> — cakupan terbatas, model berat, keparahan ordinal</sub></td>
<td align="center"><sub><b>Mengapa dua <i>view</i></b> — makula dan diskus optik saling melengkapi</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/id/home-csd-light.webp" alt="Metode CSD" /></td>
<td width="50%"><img src="docs/screenshots/id/home-pipeline-dark.webp" alt="Tahapan penelitian" /></td>
</tr>
<tr>
<td align="center"><sub><b>Metode</b> — bagaimana sinyal CSD terbentuk, langkah demi langkah</sub></td>
<td align="center"><sub><b>Tahapan penelitian</b> — 10 tahap dalam urutan yang terkunci</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/id/home-findings-light.webp" alt="Temuan penelitian" /></td>
<td width="50%"><img src="docs/screenshots/id/home-rq1-dark.webp" alt="RQ1" /></td>
</tr>
<tr>
<td align="center"><sub><b>Temuan</b> — angka utama dari run final</sub></td>
<td align="center"><sub><b>RQ1</b> — tiga metrik <i>shift fidelity</i>, CSD terbaik di ketiganya</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/id/home-rq2-light.webp" alt="RQ2" /></td>
<td width="50%"><img src="docs/screenshots/id/home-sdg-light.webp" alt="SDG 3" /></td>
</tr>
<tr>
<td align="center"><sub><b>RQ2</b> — ukuran model dan latensi CPU <i>teacher</i> vs <i>student</i></sub></td>
<td align="center"><sub><b>SDG 3</b> — kontribusi pada kehidupan sehat dan sejahtera</sub></td>
</tr>
</table>

### 📚 Halaman Penelitian — makalah dalam bentuk interaktif

<table>
<tr>
<td width="33%"><img src="docs/screenshots/id/research-top-dark.webp" alt="Halaman penelitian" /></td>
<td width="33%"><img src="docs/screenshots/id/research-method-dark.webp" alt="Metode" /></td>
<td width="33%"><img src="docs/screenshots/id/research-rq1-light.webp" alt="Hasil RQ1" /></td>
</tr>
<tr>
<td align="center"><sub>Ringkasan run: 36/36 <i>gates</i>, 265 nilai teraudit</sub></td>
<td align="center"><sub>Diagram arsitektur <i>dual-view</i></sub></td>
<td align="center"><sub>Hasil RQ1 — mekanisme berhasil, keunggulan prediktif belum terbukti</sub></td>
</tr>
</table>

Halaman ini menyajikan abstrak, pertanyaan penelitian, celah riset, metode, hasil RQ1 dan RQ2, **bukti inferensial mekanisme dari analisis suplementer v2** (tabel sembilan kontras, generalisasi Set-C, identitas dekomposisi, dan kapan CSD paling bermanfaat), validasi eksternal, galeri gambar, keterbatasan, serta dampak SDG 3 — seluruh angkanya berasal dari run final dan analisis suplementer yang sama dengan README ini.

### 📱 Responsif di perangkat seluler

<table>
<tr>
<td align="center"><img src="docs/screenshots/id/mobile-light.webp" alt="Tampilan seluler — terang" width="260" /></td>
<td align="center"><img src="docs/screenshots/id/mobile-dark.webp" alt="Tampilan seluler — gelap" width="260" /></td>
</tr>
<tr>
<td align="center"><sub>Seluler — mode terang</sub></td>
<td align="center"><sub>Seluler — mode gelap</sub></td>
</tr>
</table>

### ✨ Fitur utama

| Fitur | Penjelasan |
|---|---|
| 🧠 **Inferensi di perangkat** | Model _student_ CSD (FP32, _seed_ 3407; `model.onnx` ±190 KB + bobot ±1,3 MB) dijalankan oleh ONNX Runtime Web. Tidak ada citra yang dikirim ke server. |
| 🖼️ **12 pasangan sampel siap pakai** | 12 mata (24 citra) dari DeepDRiD, CC BY-SA 4.0. Nama folder tidak membocorkan _grade_, sehingga hasil dapat dinilai secara jujur. |
| 📤 **Unggah citra sendiri** | Pasangan citra makula + diskus optik (JPG/PNG, maksimal 12 MB per citra). |
| 📊 **Hasil ordinal yang transparan** | _Grade_ prediksi, posisi pada skala keparahan, empat skor ambang _P(y > k)_, skor relatif per _grade_, dan perbandingan dengan _grade_ referensi untuk sampel. |
| 🌐 **Dua bahasa** | Bahasa Indonesia dan English; istilah teknis yang lazim tetap dalam bahasa Inggris dan dicetak miring. |
| 🌗 **Terang / gelap** | Animasi _circular reveal_ saat berganti mode; pilihan diingat. |
| 🎨 **_Colorful_ / Monokrom** | Gradien biru dengan aksen merah-kuning, atau desain hitam-putih. |
| ♿ **Mode aksesibilitas** | Teks lebih besar dan kontras lebih tegas — ramah untuk pengguna lanjut usia. |
| 📱 **Responsif** | Tata letak menyesuaikan dari ponsel hingga desktop. |
| ⚖️ **Jujur tentang batasannya** | Label "prototipe penelitian" di setiap hasil, dan penjelasan bahwa demo menjalankan varian FP32 (_seed_ 3407), sedangkan artefak _deployment_ di makalah adalah QAT INT8 (_seed_ 42) dari metode yang sama. |

**Kesetiaan terhadap notebook.** Menjalankan model ONNX yang dibundel pada seluruh 200 mata DeepDRiD Set-C menghasilkan **QWK 0,7307**, dibandingkan **0,7298** di notebook untuk _seed_ yang sama. Selisih 0,0009 itu berasal dari perbedaan _resampling_ citra, sehingga _pipeline_ di browser terbukti setia pada penelitian.

### 🧰 Teknologi

| Lapisan | Teknologi |
|---|---|
| Kerangka UI | React 18 · TypeScript 5.8 · Vite 6 · React Router 7 |
| Tampilan | Tailwind CSS 3.4 · Radix UI · Framer Motion · Lucide Icons |
| Grafik | Recharts |
| Inferensi | ONNX Runtime Web (WebAssembly) |
| _Hosting_ | Vercel |

### ▶️ Menjalankan secara lokal

```bash
cd frontend
npm install
npm run dev            # server pengembangan di http://localhost:5173
npm run build          # build produksi
npm run verify:model   # memeriksa berkas model ONNX dan satu forward pass
```

Detail arsitektur frontend, konfigurasi `.env`, dan panduan _deployment_: [`frontend/README.md`](frontend/README.md). Seluruh tangkapan layar ada di [`docs/screenshots/`](docs/screenshots/).

---

## 👥 Tim

<div align="center">

| <img src="frontend/public/Images/Stanley.jpg" width="110" /> | <img src="frontend/public/Images/Seline.jpeg" width="110" /> | <img src="frontend/public/Images/Hamra.jpeg" width="110" /> | <img src="frontend/public/Images/Nikita.jpg" width="110" /> |
|:---:|:---:|:---:|:---:|
| **Stanley Nathanael Wijaya** | **Seline Loewel** | **Ahmad Hamra** | **Nikita Ananda Putri Masaling** |
| Ketua Tim · Pengembangan AI & Model | Penulisan Paper Riset | Riset & Dokumentasi Video | Dosen Pembimbing |
| Computer Science | Business Engineering | Computer Science | School of Computer Science |
| [GitHub](https://github.com/StyNW7) · [LinkedIn](https://www.linkedin.com/in/stanley-nathanael-wijaya/) | [GitHub](https://github.com/selineloewel8-prog) · [LinkedIn](https://www.linkedin.com/in/seline-loewel/) | [GitHub](https://github.com/Ahamra1120) · [LinkedIn](https://www.linkedin.com/in/ahmad-hamra/) | [LinkedIn](https://www.linkedin.com/in/nikita-masaling/) |

**Universitas Bina Nusantara (BINUS University)** · GEMASTIK XIX 2026 · Karya Tulis Ilmiah TIK

</div>

---

## 📝 Sitasi

Jika repositori ini bermanfaat untuk penelitian Anda, silakan sitasi:

```bibtex
@article{wijaya2026drverge,
  title   = {DR-VERGE: Complementarity-Shift Distillation dan Kuantisasi untuk
             Grading Retinopati Diabetik pada Fundus Dual-View},
  author  = {Wijaya, Stanley Nathanael and Loewel, Seline and Hamra, Ahmad and
             Masaling, Nikita Ananda Putri},
  journal = {Buletin Pagelaran Mahasiswa Nasional Bidang Teknologi Informasi dan Komunikasi},
  volume  = {1},
  year    = {2026},
  note    = {GEMASTIK XIX 2026, Karya Tulis Ilmiah TIK}
}
```

---

## 📄 Lisensi dan Penggunaan Data

Kode dan dokumentasi ini disusun untuk penelitian dan kompetisi akademik. Dataset **tidak didistribusikan ulang** melalui repositori ini; setiap dataset tetap berada di bawah lisensi pemiliknya dan harus diperoleh langsung dari penyedianya (lihat [`dataset/README.md`](dataset/README.md)).

<div align="center">
<sub>Dibuat dengan ❤️ oleh Tim DR-VERGE · BINUS University · 2026</sub>
</div>
