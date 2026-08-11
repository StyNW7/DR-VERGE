# Penilaian umum

Dokumen teknis v2 ini **sudah jauh lebih kuat dan lebih jujur** dibanding versi sebelumnya. Hampir semua bug desain besar sudah dikenali: baseline single-view, auxiliary supervision, monotonicity CORAL, imbalance, multi-seed, checkpoint terbaik, pretraining APTOS, PTQ, dan schema evaluasi. Dokumen sendiri juga secara eksplisit menyatakan bahwa kode belum pernah dieksekusi end-to-end pada data asli, sehingga tanda hijau berarti “desain telah direvisi”, bukan jaminan bebas bug. 

Namun, setelah saya audit kembali metode, persamaan, dan kode referensinya, masih ada beberapa **red flag fundamental** yang belum sepenuhnya tertangkap. Yang paling penting bukan bug sintaks, melainkan apakah sinyal yang disebut *complementarity shift* benar-benar merepresentasikan complementarity dua view.

Kesimpulan saya:

[
\boxed{\text{Dokumen sudah layak menjadi fondasi implementasi}}
]

tetapi belum aman menjadi:

[
\boxed{\text{spesifikasi final yang dianggap metodologis sudah tervalidasi}}
]

Sebelum eksperimen utama, ada sekitar **enam blocker konseptual**, beberapa issue kode konkret, dan sejumlah batasan yang harus dinyatakan secara eksplisit kepada juri.

---

# A. Critical methodological flags

## 🔴 Flag 1 — (\Delta) saat ini mencampur complementarity dengan perbedaan classifier head

DR-VERGE mendefinisikan:

[
p_{\text{agg}}
==============

\frac{p_m+p_d}{2}
]

[
\Delta
======

p_{\text{dual}}-p_{\text{agg}}
]

Teacher dan student mempunyai tiga head terpisah:

* `main_head`
* `macula_head`
* `disc_head`

Main head menggunakan fitur concatenated berdimensi (2d), sedangkan auxiliary heads menggunakan fitur berdimensi (d), dan ketiganya memiliki weight serta bias sendiri. 

Artinya:

[
p_{\text{dual}}-p_{\text{agg}}
]

tidak hanya mengukur manfaat dua view. Ia juga mengandung:

* Perbedaan parameter main head dan auxiliary heads.
* Perbedaan input dimension.
* Perbedaan bias threshold.
* Perbedaan calibration antar-head.
* Efek `fusion_bn`.
* Baru setelah itu, mungkin efek complementarity.

Dengan kata lain:

[
\Delta
======

\text{complementarity}
+
\text{head discrepancy}
+
\text{calibration discrepancy}
]

Ini adalah **red flag paling fundamental**.

### Mengapa berbahaya?

CSD dapat terlihat berhasil hanya karena student mempelajari pola perbedaan antartiga classifier head teacher, bukan karena student memahami bagaimana kedua gambar saling melengkapi.

### Perbaikan paling kuat

Gunakan **counterfactual predictions melalui head yang sama**.

Contoh:

[
p_{\text{dual}}
===============

h([z_m,z_d])
]

[
p_{m\text{-only}}
=================

h([z_m,\mathbf{0}])
]

[
p_{d\text{-only}}
=================

h([\mathbf{0},z_d])
]

Semua prediksi memakai classifier (h) yang sama. Kemudian:

[
p_{\text{agg}}
==============

\frac{
p_{m\text{-only}}+
p_{d\text{-only}}
}{2}
]

Dengan ini, (\Delta) lebih bersih karena tidak lagi membandingkan tiga classifier berbeda.

Alternatif lain adalah membuat projection dan classifier parameters yang dibagi bersama antarmode. Jika tetap memakai tiga head terpisah, klaim harus diturunkan menjadi:

> CSD mendistilasi perbedaan keputusan antara dual-view head dan auxiliary single-view heads.

Jangan langsung menyebutnya “pure complementarity gain”.

---

## 🔴 Flag 2 — Fusion saat ini belum benar-benar memodelkan interaksi antar-view

Teacher menggunakan:

[
z_f=[z_m;z_d]
]

lalu BatchNorm dan sebuah CORAL linear head. Student juga menggunakan pola yang sama. 

Jika main head hanya linear:

[
g(z_f)
======

w_m^\top z_m+w_d^\top z_d
]

maka tidak ada explicit interaction seperti:

[
z_m\odot z_d
]

atau:

[
z_m^\top A z_d
]

Secara teknis, model menggabungkan bukti dua view secara aditif, bukan mempelajari hubungan lintas-view yang kaya.

### Implikasinya

Narasi:

> “Model memahami interaksi dua view.”

mungkin terlalu kuat. Arsitektur yang ada lebih tepat disebut:

> “Model mengagregasikan informasi kedua view secara learned late fusion.”

### Perbaikan ringan

Tambahkan satu MLP kecil:

[
h_f
===

\operatorname{ReLU}
\left(
W_f[z_m;z_d]+b_f
\right)
]

lalu CORAL head di atas (h_f).

Lebih kuat lagi:

[
h_f
===

\operatorname{MLP}
\left(
[z_m;z_d;|z_m-z_d|;z_m\odot z_d]
\right)
]

Ini tetap jauh lebih ringan daripada transformer, tetapi memungkinkan explicit complementarity interaction.

### Ablation yang diperlukan

* Concatenation + linear CORAL.
* Concatenation + MLP.
* Concatenation + product/difference features.

Jika versi linear sudah cukup, pakai versi paling sederhana. Tetapi klaim harus mengikuti kapasitas sebenarnya.

---

## 🔴 Flag 3 — Student dapat “menipu” CSD melalui auxiliary heads

Pada student:

[
\Delta^S
========

## p_{\text{dual}}^S

\frac{
p_m^S+p_d^S
}{2}
]

Ketiga output tersebut sama-sama trainable. Student dapat mengurangi:

[
\mathcal L_{\text{CSD}}
=======================

\operatorname{SmoothL1}
(\Delta^S,\Delta^T)
]

dengan mengubah:

* Main head.
* Macula head.
* Disc head.

Tidak ada jaminan bahwa penurunan loss terjadi karena dual-view head menjadi lebih baik. Model dapat menggeser auxiliary outputs untuk menghasilkan (\Delta^S) yang tepat.

Auxiliary CORAL loss memang membatasi degenerasi tersebut, tetapi belum menghilangkannya.

### Contoh

Student bisa mempertahankan prediksi dual-view yang sama, lalu sedikit mengubah (p_m^S) dan (p_d^S) agar:

[
\Delta^S\approx\Delta^T
]

CSD turun, tetapi kemampuan fusion tidak berubah.

### Validasi wajib

Pantau secara terpisah:

* Perubahan QWK dual head.
* Perubahan QWK auxiliary heads.
* (|\Delta^S-\Delta^T|).
* Perubahan main output setelah menambahkan CSD.
* Gradient norm CSD ke main head versus auxiliary heads.

### Opsi perbaikan

Salah satu opsi:

```python
p_agg_s = (
    p_macula_s.detach() +
    p_disc_s.detach()
) / 2
```

Sehingga CSD hanya mengubah dual head dan backbone, bukan menggunakan auxiliary head sebagai jalan pintas.

Namun, detach juga mempunyai konsekuensi karena backbone masih shared dan auxiliary output akan dipengaruhi secara tidak langsung. Alternatif yang lebih bersih adalah menggunakan counterfactual same-head formulation pada Flag 1.

---

## 🔴 Flag 4 — Weighted CORAL mengganggu interpretasi output sebagai probabilitas

Dokumen memakai `pos_weight` per threshold:

[
w_k^+
=====

\frac{N_k^-}{N_k^+}
]

lalu menggunakan weighted BCE untuk semua model. 

Ini masuk akal untuk mengatasi imbalance. Namun, weighted BCE mengubah optimum model. Output sigmoid tidak lagi otomatis dapat diinterpretasikan sebagai calibrated posterior probability.

Padahal CSD dibingkai sebagai:

> Pergeseran keyakinan atau probabilitas model.

Jika output sudah dipengaruhi class weighting, istilah “probability shift” menjadi lebih lemah.

### Pilihan aman

Gunakan istilah:

> **ordinal threshold score shift**

atau:

> **weighted cumulative confidence shift**

bukan probability posterior yang terkalibrasi.

### Validasi yang disarankan

Bandingkan:

1. Tanpa `pos_weight`.
2. Dengan `pos_weight`.
3. Weighted sampler tanpa weighted loss.
4. `pos_weight` + post-hoc calibration.

Setidaknya cek:

* ECE.
* Brier score.
* Reliability diagram per threshold.

Jangan langsung menggabungkan `WeightedRandomSampler` dan `pos_weight`. Itu dapat melakukan koreksi ganda dan membuat minority classes terlalu dominan.

---

## 🔴 Flag 5 — Direction loss bermasalah saat teacher shift mendekati nol

Varian kedua:

[
\mathcal L_{\text{direction}}
=============================

1-\cos(\Delta^S,\Delta^T)
]

Jika (\Delta^T) hampir nol, arah vektor tidak bermakna. Dengan `eps`, kode tetap menghasilkan angka, tetapi secara konseptual direction loss pada vektor hampir nol seharusnya tidak diberi bobot besar.

Dokumen sendiri menyadari bahwa sebagian shift mungkin sangat kecil. 

### Perbaikan

Gunakan mask atau magnitude weighting:

[
w_i
===

\min
\left(
1,
\frac{|\Delta_i^T|_2}{\epsilon}
\right)
]

[
\mathcal L_{\text{direction}}
=============================

\frac{
\sum_i
w_i
\left[
1-\cos(\Delta_i^S,\Delta_i^T)
\right]
}{
\sum_iw_i+\varepsilon
}
]

Atau hanya gunakan direction term ketika:

[
|\Delta_i^T|_2>\eta
]

Contoh (\eta) jangan ditetapkan arbitrer sebelum melihat distribusi validation set.

---

## 🔴 Flag 6 — Skala CSD berpotensi terlalu kecil dibanding task loss

SmoothL1 bekerja pada delta yang mungkin hanya berkisar 0,01–0,05. Dokumentasi sendiri menyebut shift dapat kecil. Maka:

[
\mathcal L_{\text{CSD}}
]

dapat berorde jauh lebih kecil daripada:

[
\mathcal L_{\text{ordinal}}
]

Walaupun (\beta=0.5), kontribusi gradient CSD mungkin hampir nol.

Sebaliknya, direction loss dapat berorde mendekati 1 dan menjadi terlalu dominan.

### Jangan hanya membandingkan nilai loss

Pantau:

[
\left|
\nabla_\theta
\mathcal L_{\text{ordinal}}
\right|
]

[
\left|
\nabla_\theta
\mathcal L_{\text{KD}}
\right|
]

[
\left|
\nabla_\theta
\mathcal L_{\text{CSD}}
\right|
]

Minimal logging:

* Mean setiap loss per epoch.
* Ratio (L_{\text{CSD}}/L_{\text{task}}).
* Gradient norm tiap komponen pada fusion/head.

Jika gradient CSD terlalu kecil, pertimbangkan:

* Normalisasi delta.
* Adaptive loss weighting.
* (\beta) lebih besar.
* Huber beta yang lebih kecil.
* Per-sample teacher-magnitude weighting.

---

# B. Flags pada definisi complementarity dan evaluasi

## 🟠 Flag 7 — Mean probability bukan satu-satunya agregasi counterfactual

Dokumen menggunakan:

[
p_{\text{agg}}
==============

\frac{p_m+p_d}{2}
]

Ini mengasumsikan kedua field memiliki bobot sama.

Padahal macula-centered dan disc-centered image mungkin memiliki:

* Kualitas berbeda.
* Tingkat informasi berbeda.
* Calibration berbeda.
* Nilai diagnostik berbeda untuk grade tertentu.

### Posisi yang aman

Jelaskan bahwa mean merupakan:

> Non-interactive equal-weight aggregation baseline.

Bukan representasi sempurna dari “prediksi single-view”.

### Ablation kecil

Bandingkan:

1. Mean cumulative probability.
2. Mean logits, baru sigmoid:
   [
   p_{\text{agg}}=\sigma\left(\frac{l_m+l_d}{2}\right)
   ]
3. Learned scalar weighting:
   [
   p_{\text{agg}}=
   \lambda p_m+(1-\lambda)p_d
   ]

Jangan memilih varian berdasarkan Set C.

---

## 🟠 Flag 8 — Dual-view gain internal berbeda dari gain terhadap independent single-view model

Dokumen mendefinisikan:

[
G
=

## QWK_{\text{dual}}

\max(QWK_m,QWK_d)
]

Tetapi (QWK_m) dan (QWK_d) pada sebuah dual-view model berasal dari auxiliary heads yang:

* Berbagi backbone.
* Dilatih bersamaan dengan dual-view head.
* Backbonenya menerima gradient dari kedua cabang dan main task.

Jadi ini bukan perbandingan dengan model yang benar-benar hanya pernah dilatih menggunakan satu view.

### Laporkan dua jenis gain

#### Internal gain

[
G_{\text{internal}}
===================

## QWK_{\text{dual-head}}

\max(
QWK_{\text{aux-m}},
QWK_{\text{aux-d}}
)
]

#### External gain

[
G_{\text{external}}
===================

## QWK_{\text{dual-model}}

\max(
QWK_{\text{independent-macula}},
QWK_{\text{independent-disc}}
)
]

Keduanya menjawab pertanyaan berbeda. Jangan mencampurkannya.

---

## 🟠 Flag 9 — Threshold 0,02 pada Gate 3 masih arbitrer

Dokumen menyarankan persentase sampel dengan:

[
|\Delta^T|>0.02
]

sebagai shift nontrivial. 

Angka ini belum mempunyai dasar statistik atau klinis.

### Lebih baik

Gunakan distribusi empiris:

* Median norm.
* Kuartil.
* Persentil ke-75.
* Nilai dibandingkan noise across augmentations.
* Confidence interval shift pada repeated inference.

Definisikan nontrivial berdasarkan:

[
|\Delta| >
Q_{75}
]

atau relative to prediction variability, bukan angka tetap sejak awal.

---

## 🟠 Flag 10 — QWK tidak cukup untuk membuktikan complementarity preservation

CSD dapat memperbaiki QWK, tetapi itu belum membuktikan bahwa pola benefit dua view benar-benar ditransfer.

Tambahkan metrik langsung.

### Shift fidelity

[
\operatorname{ShiftMAE}
=======================

\frac1N
\sum_i
|\Delta_i^S-\Delta_i^T|_1
]

### Direction agreement

[
\operatorname{CosAgree}
=======================

\frac1N
\sum_i
\cos(\Delta_i^S,\Delta_i^T)
]

### Sample-level fusion benefit

[
B_i
===

## \ell(p_{\text{agg},i},y_i)

\ell(p_{\text{dual},i},y_i)
]

Kemudian:

[
\rho(B^T,B^S)
]

Jika CSD benar-benar mentransfer complementarity, student seharusnya mendapat manfaat dari dua view pada kasus yang kurang lebih sama dengan teacher.

---

# C. Statistical and experimental validity flags

## 🟠 Flag 11 — Tiga seed masih belum cukup untuk klaim statistik kuat

Dokumen sudah jauh lebih baik karena tiga kondisi inti dijalankan dengan seed 42, 123, dan 2026. 

Namun:

[
n=3
]

masih terlalu kecil untuk mengasumsikan distribusi normal atau mengklaim statistical significance hanya dari mean ± standard deviation.

### Tambahkan paired bootstrap

Karena prediksi berasal dari pasien yang sama, gunakan paired bootstrap atas prediction files.

Yang lebih tepat adalah **clustered bootstrap per patient**, bukan per-image/per-eye, karena dua mata dari pasien yang sama tidak independen.

Laporkan:

* 95% confidence interval QWK difference.
* 95% confidence interval MAE difference.
* 95% confidence interval severe error difference.

Contoh:

[
\Delta QWK
==========

## QWK_{\text{CSD}}

QWK_{\text{KD}}
]

Jangan hanya mengatakan “lebih tinggi” jika interval mencakup nol.

---

## 🟠 Flag 12 — Teacher hanya satu seed

Student memakai tiga seed, tetapi semuanya belajar dari teacher checkpoint yang sama.

Ini tidak salah, tetapi hasilnya berarti:

> Variansi student conditional terhadap satu teacher tetap.

Bukan:

> Variansi keseluruhan teacher–student pipeline.

### Batasan yang harus ditulis

> Teacher initialization variance was not evaluated due to computational limitations.

Tidak perlu melatih tiga teacher jika waktu tidak cukup, tetapi jangan mengklaim full-pipeline robustness.

---

## 🟠 Flag 13 — Grid search pada satu Set B dapat menyebabkan validation overfitting

Kalian akan memilih:

* CSD variant.
* (\alpha).
* (\beta).
* Mungkin aggregation method.
* Mungkin student backbone.
* Mungkin augmentasi.

Semakin banyak keputusan memakai Set B, semakin besar kemungkinan overfit ke validation set. Dokumen sudah mengingatkan risiko ini. 

### Batas operasional

Tetapkan sebelum run:

* Maksimum jumlah konfigurasi.
* Search space final.
* Primary selection metric.
* Tie-breaker metric.
* Tidak menambah kombinasi setelah melihat hasil.

Contoh:

1. Pilih CSD variant berdasarkan QWK.
2. Jika selisih <0,005, pilih severe error lebih rendah.
3. Jika masih sama, pilih metode paling sederhana.

---

## 🟠 Flag 14 — Custom split perlu stratification yang lebih baik

`train_test_split` bekerja pada daftar patient ID tanpa stratification. Dua mata pasien dapat mempunyai grade berbeda, sehingga stratifikasi tidak sesederhana satu label pasien.

Risikonya:

* Grade 3/4 hampir hilang dari Set B atau Set C.
* QWK sangat sensitif terhadap distribusi split.
* Per-grade sensitivity tidak stabil.

### Solusi

Buat patient-level stratification target, misalnya:

[
g_{\text{patient}}
==================

\max(g_{\text{left}},g_{\text{right}})
]

atau histogram grade per pasien.

Kemudian gunakan stratified group split. Setelah split:

* Tampilkan distribusi grade.
* Tampilkan jumlah pasien.
* Tampilkan jumlah mata.
* Pastikan setiap grade muncul di semua split.

DeepDRiD memang memiliki 2.000 regular fundus images dari 500 pasien dan menyediakan grading serta image-quality labels. ([ScienceDirect][1])

---

## 🟠 Flag 15 — Image quality dapat menjadi confounder

DeepDRiD bukan hanya memiliki grade DR, tetapi juga anotasi kualitas gambar. ([ScienceDirect][1])

Jika macula view sering berkualitas lebih buruk daripada disc view atau sebaliknya, (\Delta) dapat merepresentasikan:

> Kompensasi terhadap kualitas gambar.

Bukan hanya lesion complementarity.

### Research lanjutan

Analisis:

* QWK per quality stratum.
* Magnitude (\Delta) versus image quality.
* CSD performance pada high-quality versus low-quality pairs.
* Proporsi ungradable/low-quality image.

Ini justru dapat menjadi analisis tambahan yang menarik, tetapi jangan menyebut seluruh shift sebagai anatomical complementarity sebelum confound ini diperiksa.

---

# D. Mathematical formulation flags

## 🟠 Flag 16 — CORAL implementation harus diverifikasi terhadap referensi resmi

CORAL memang menggunakan cumulative binary thresholds dan dirancang untuk rank-consistent outputs. Paper asli memberi theoretical guarantee melalui parameter sharing dan konsistensi rank. ([ScienceDirect][2])

Ordered-bias implementation di dokumen secara intuitif menjamin:

[
P(Y>0)\ge P(Y>1)\ge P(Y>2)\ge P(Y>3)
]

Namun kalian harus memastikan bahwa implementation ini benar-benar sesuai dengan formulasi yang ingin diklaim sebagai CORAL, bukan modifikasi sendiri yang belum diberi nama.

### Catatan

`softplus(0) ≈ 0.693`, sehingga inisialisasi bias langsung menjadi kira-kira:

[
[0,-0.693,-1.386,-2.079]
]

Itu bukan spacing nol atau kecil.

Pertimbangkan initialization:

```python
self.bias_steps = nn.Parameter(
    torch.full((K - 2,), -3.0)
)
```

sehingga `softplus(-3)` kecil dan threshold awal tidak terlalu berjauhan.

### Baseline opsional

CORN menghilangkan weight-sharing constraint CORAL dan dapat lebih ekspresif, tetapi menambah scope. Literatur menjelaskan bahwa CORN dikembangkan karena shared-weight CORAL dapat membatasi kapasitas. ([arXiv][3])

Tidak wajib diimplementasikan, tetapi tulis sebagai keterbatasan.

---

## 🟠 Flag 17 — Temperature KD belum dikompensasi dengan (\tau^2)

Standard KD sering mengalikan soft-target loss dengan:

[
\tau^2
]

untuk menjaga skala gradient saat temperature berubah.

Kode saat ini:

```python
p_t = sigmoid(logit_t / tau)
p_s = sigmoid(logit_s / tau)
BCE(p_s, p_t)
```

tanpa faktor (\tau^2).

Ini bukan otomatis salah, tetapi berarti (\alpha) dan (\tau) saling mengubah effective gradient scale.

### Validasi

Bandingkan:

[
L_{\text{KD}}
]

versus:

[
\tau^2L_{\text{KD}}
]

atau tetapkan (\tau) dan jangan mengklaim tuning temperature secara independen dari (\alpha).

Literatur KD juga menunjukkan temperature bukan parameter sepele dan dapat memengaruhi difficulty distillation. ([AAAI Open Journal Systems][4])

---

## 🟠 Flag 18 — Cumulative thresholds saling berkorelasi

Empat dimensi:

[
P(Y>0),P(Y>1),P(Y>2),P(Y>3)
]

bukan empat variabel independen.

SmoothL1 memberi bobot sama pada semua threshold, padahal:

* Threshold awal dapat sangat imbalanced.
* Threshold tertentu lebih relevan secara klinis.
* Shift pada satu threshold dapat memengaruhi interpretasi seluruh grade.

### Opsi penelitian

Gunakan weighted CSD:

[
L_{\text{CSD}}
==============

\sum_k
\omega_k
\operatorname{SmoothL1}
(\Delta_k^S,\Delta_k^T)
]

Bobot dapat berdasarkan:

* Inverse threshold frequency.
* Teacher reliability per threshold.
* Clinical importance.
* Validation performance.

Namun jangan memperkenalkan terlalu banyak bobot tanpa ablation.

---

# E. Concrete code issues that remain

## 🔴 Code issue 1 — CPU latency evaluator masih dapat mengukur GPU latency

Dalam evaluator:

```python
device = get_device()
model = Model(...).to(device)
```

Kemudian latency:

```python
fn = lambda: model(
    sample["macula"][:1].to(device),
    sample["disc"][:1].to(device)
)
```

Jika CUDA tersedia, `device` adalah GPU.

Tetapi kolom hasil diberi nama:

```text
CPU_Latency_median_ms
```

Ini adalah bug konkret.

### Fix

Buat copy/model khusus CPU:

```python
model_cpu = copy.deepcopy(model).to("cpu").eval()

macula_cpu = sample["macula"][:1].cpu()
disc_cpu = sample["disc"][:1].cpu()

fn = lambda: model_cpu(
    macula_cpu,
    disc_cpu,
)
```

Untuk CUDA timing, gunakan `torch.cuda.Event` dan synchronization, jangan `time.perf_counter()` tanpa synchronize.

---

## 🔴 Code issue 2 — INT8 evaluator masih placeholder

Dokumen menyatakan semua kondisi termasuk INT8 masuk evaluator, tetapi kode masih berisi:

```python
# INT8 -- dievaluasi terpisah ...
# ... ditambahkan sesuai kebutuhan ...
```



Artinya evaluator final **belum lengkap**.

Harus ada:

* Loader quantized model.
* Correct device CPU.
* Correct forward wrapper.
* INT8 metrics.
* TorchScript size.
* INT8 latency.
* Verification quantized module types.

---

## 🔴 Code issue 3 — PyTorch quantization API yang dipakai sedang menuju migrasi

Dokumen memakai:

* `torch.ao.quantization.prepare`
* `convert`
* `prepare_fx`
* `convert_fx`

Dokumentasi PyTorch terbaru menyatakan pengembangan quantization sedang dipusatkan ke `torchao`; eager dan FX flows lama diminta bermigrasi ke torchao/PT2E, meskipun API lama masih tersedia saat ini. ([PyTorch Documentation][5])

### Implikasi

Kode dapat berjalan pada satu versi PyTorch tetapi gagal pada versi lain.

### Wajib

Pin exact environment:

```text
torch==2.x.y
torchvision==0.x.y
```

Jangan memakai:

```text
torch>=2.2.0
```

untuk eksperimen final.

Simpan:

```bash
pip freeze > environment-lock.txt
```

Dan jalankan PTQ smoke test pada hari pertama, bukan menunggu hari 8,5.

---

## 🔴 Code issue 4 — Fusion Conv–BN–ReLU6 perlu diuji langsung

PyTorch menyediakan `fuse_modules`, tetapi kombinasi module yang benar-benar didukung bergantung pada backend dan module types. Dokumentasi resmi mencantumkan fusion sebagai tahap persiapan quantization, tetapi tidak menjamin seluruh custom combination bekerja. ([PyTorch Documentation][6])

`ReLU6` sering lebih problematik daripada `ReLU` dalam eager quantization.

### Saran

* Uji `fuse_model()` pada smoke test.
* Print module sebelum dan sesudah fuse.
* Siapkan opsi mengganti `ReLU6` menjadi `ReLU`.
* Lebih baik gunakan FX/PT2E path sebagai primary jika eager terlalu rapuh.

---

## 🟠 Code issue 5 — Model-size comparison belum apples-to-apples

FP32 size dihitung dari checkpoint `.pt`, sedangkan INT8 disarankan memakai TorchScript.

Checkpoint dapat berisi:

* Metadata.
* Epoch.
* Seed.
* Dictionary overhead.

Bandingkan artefak deployment yang sama:

* FP32 TorchScript.
* INT8 TorchScript.

Jangan membandingkan FP32 training checkpoint dengan INT8 deployment artifact.

---

## 🟠 Code issue 6 — Quantized parameter count tidak bermakna seperti FP32

Packed INT8 weights mungkin tidak muncul sebagai ordinary `nn.Parameter`. Karena itu:

```python
sum(p.numel() for p in model.parameters())
```

dapat memberi angka yang tidak comparable.

Untuk INT8 fokus pada:

* Serialized size.
* Latency.
* Peak memory.
* Quantized op coverage.

Parameter count cukup dilaporkan dari arsitektur FP32 student.

---

## 🟠 Code issue 7 — Output directories belum selalu dibuat

Sebelum:

```python
torch.save(...)
```

pastikan:

```python
os.makedirs(
    os.path.dirname(ckpt_path),
    exist_ok=True,
)
```

Hal yang sama untuk:

* Results CSV.
* TensorBoard logs.
* TorchScript.
* Split CSV.
* Checkpoints per seed.

---

## 🟠 Code issue 8 — `pos_weight` perlu guard terhadap threshold kosong

Jika suatu threshold tidak memiliki positive examples:

```python
w = neg / max(pos, 1)
```

menghindari division by zero, tetapi menghasilkan bobot sangat besar dan loss yang tidak bermakna.

Lebih aman:

```python
if pos == 0 or neg == 0:
    raise ValueError(...)
```

atau log warning dan revisi split.

Ini terkait langsung dengan Gate 1.

---

## 🟠 Code issue 9 — Smoke test belum menguji bagian paling berisiko

Smoke test saat ini menguji model/loss/backward, tetapi belum menguji:

* `pos_weight`.
* Pretrained checkpoint loading.
* Save-load checkpoint.
* Three-seed path generation.
* Model fusion.
* `prepare/convert`.
* Quantized inference.
* Final CSV writer.
* CPU latency function.
* TorchScript export.

Tambahkan dua level:

### `smoke_test_fp32.py`

Model, loss, backward, save-load, evaluator.

### `smoke_test_ptq.py`

Fuse, calibration 1–2 batch, convert, forward, TorchScript save, latency.

---

## 🟠 Code issue 10 — Reproducibility DataLoader belum lengkap

`set_seed()` belum otomatis menjamin worker-level augmentation identik ketika `num_workers>0`.

Tambahkan:

```python
def seed_worker(worker_id):
    worker_seed = torch.initial_seed() % 2**32
    np.random.seed(worker_seed)
    random.seed(worker_seed)
```

dan generator:

```python
g = torch.Generator()
g.manual_seed(seed)

DataLoader(
    ...,
    worker_init_fn=seed_worker,
    generator=g,
)
```

---

# F. Research validation checklist before full runs

## Wajib selesai sebelum training teacher

1. Verifikasi struktur asli metadata DeepDRiD.
2. Verifikasi official versus custom split.
3. Verifikasi pairing macula–disc secara manual.
4. Verifikasi patient overlap nol.
5. Catat distribusi grade dan quality.
6. Putuskan keamanan horizontal flip.
7. Jalankan duplicate-image/hash check.
8. Pin exact package versions.
9. Jalankan FP32 dan PTQ smoke test.

Dokumen memang sudah mengumpulkan delapan flag internal pada Lampiran C, termasuk split, metadata, flip, imbalance, student capacity, dan PTQ. 

## Wajib selesai sebelum student CSD

1. Teacher dual-view unggul terhadap auxiliary heads.
2. Auxiliary heads jauh di atas majority baseline.
3. Main versus auxiliary calibration diperiksa.
4. Distribusi (\Delta^T) divisualisasikan.
5. Shift tidak didominasi satu threshold.
6. Shift tidak hanya muncul pada gambar berkualitas buruk.
7. Gradient scale CSD diverifikasi.
8. Counterfactual same-head formulation diuji minimal sebagai ablation.

## Wajib selesai sebelum klaim “CSD works”

1. CSD dibanding no-distill.
2. CSD dibanding standard KD.
3. CSD dibanding additional-supervision control.
4. Internal dan external dual-view gain dipisahkan.
5. Shift fidelity dilaporkan.
6. Severe error tidak memburuk.
7. Hasil tiga seed dilengkapi clustered bootstrap.
8. Tidak memilih hasil berdasarkan Set C.

---

# G. Baseline tambahan yang paling bernilai

Tidak perlu menambah banyak baseline. Tiga ini paling penting:

## 1. Additional-loss control

Student dengan loss random/auxiliary tambahan tetapi tanpa CSD, untuk memastikan improvement bukan sekadar karena total supervision lebih banyak.

Sebenarnya `dual_logitkd` sudah membantu, tetapi belum mengontrol relational signal.

## 2. Same-head counterfactual CSD

Ini menguji apakah hasil CSD bertahan setelah head-discrepancy dihilangkan.

## 3. Feature KD baseline

Misalnya:

[
L_{\text{feature}}
==================

|P_T(z_f^T)-P_S(z_f^S)|_2^2
]

Jika CSD mengungguli feature KD, klaim bahwa decision-shift knowledge lebih efektif menjadi jauh lebih kuat.

---

# H. Judge notes dan batasan yang harus ditulis

Bagian ini penting agar kalian tidak overclaim saat presentasi.

## 1. Bukan alat diagnosis mandiri

> DR-VERGE dikembangkan sebagai decision-support model untuk screening dan grading awal, bukan pengganti ophthalmologist dan bukan sistem diagnosis final.

## 2. Tidak ada validasi klinis prospektif

> Model hanya dievaluasi secara retrospektif pada dataset publik dan belum diuji dalam workflow klinis nyata.

## 3. Satu dataset utama

> Seluruh evaluasi utama menggunakan DeepDRiD; external generalization terhadap kamera, populasi, rumah sakit, dan negara lain belum dibuktikan.

## 4. CSD adalah proxy

> Cumulative threshold shift merupakan proxy praktis untuk learned dual-view benefit, bukan bukti kausal atau bukti langsung bahwa model melihat lesi tertentu pada view tertentu.

## 5. Head discrepancy

Jika tetap memakai tiga head terpisah:

> Shift dapat mencakup perbedaan karakteristik antar-classifier head, tidak hanya complementarity anatomis.

## 6. Tidak ada lesion-level annotation

> Metode belum membuktikan bahwa peningkatan berasal dari lesion localization yang benar.

## 7. Tidak ada uncertainty/calibration study lengkap

> Output sigmoid tidak otomatis calibrated, terutama karena penggunaan weighted loss.

## 8. Teacher variance belum diukur

> Student experiments menggunakan satu fixed teacher checkpoint.

## 9. Dua view tetap harus diambil

> Model ringan mengurangi beban inferensi, tetapi tidak mengurangi kebutuhan perangkat fundus camera dan proses akuisisi dua foto.

## 10. “Resource-limited deployment” belum diuji nyata

> Klaim deployment hanya didukung oleh ukuran model dan benchmark latency pada CPU tertentu, bukan uji lapangan di Puskesmas atau perangkat klinis aktual.

## 11. PTQ hardware-specific

> Hasil latency dan dukungan INT8 bergantung pada backend, CPU instruction set, thread count, serta format deployment.

## 12. Model image quality sensitive

> Kualitas dan field definition citra dapat memengaruhi prediction shift; studi robustness lebih lanjut diperlukan.

## 13. Tidak membandingkan seluruh SOTA

> Karena custom split dan batas komputasi, hasil tidak boleh diklaim sebagai state-of-the-art kecuali seluruh pembanding direproduksi pada split yang sama.

## 14. QWK bukan clinical utility

> QWK tinggi tidak otomatis berarti manfaat klinis tinggi; sensitivity pada referable DR dan severe error harus ikut dilaporkan.

## 15. Ethical limitation

> Dataset publik mungkin tidak mewakili keragaman demografi, jenis kamera, dan kondisi pelayanan kesehatan Indonesia.

---

# I. Kalimat aman untuk paper dan juri

## Hindari

> “CSD membuktikan bahwa model memahami complementarity anatomis.”

## Gunakan

> “CSD transfers the teacher’s cumulative ordinal decision-boundary shift between learned dual-view fusion and non-interactive single-view aggregation.”

## Hindari

> “Model siap digunakan di Puskesmas.”

## Gunakan

> “The reduced model size and CPU latency indicate potential suitability for resource-constrained deployment, pending device-specific and prospective clinical validation.”

## Hindari

> “DR-VERGE adalah SOTA.”

## Gunakan

> “Under the controlled DeepDRiD protocol, DR-VERGE was compared against no-distillation and standard logit-distillation baselines.”

## Hindari

> “(\Delta) adalah nilai complementarity asli.”

## Gunakan

> “(\Delta) is an operational proxy for the decision change associated with learned dual-view fusion.”

---

# J. Final priority list

## **P0 — Harus selesai sebelum eksperimen penuh**

1. Uji same-head counterfactual formulation.
2. Tentukan apakah fusion linear cukup atau perlu MLP kecil.
3. Perbaiki evaluator CPU latency.
4. Lengkapi evaluator INT8.
5. Pin exact PyTorch/TorchVision versions.
6. Buat PTQ smoke test pada hari pertama.
7. Verifikasi split, metadata, pairing, dan grade distribution.
8. Validasi `pos_weight` tidak membuat output terlalu tidak terkalibrasi.
9. Tambahkan directory creation dan checkpoint round-trip test.
10. Validasi gradient scale tiap loss.

## **P1 — Harus selesai sebelum klaim utama**

11. Pisahkan internal dan external dual-view gain.
12. Tambahkan shift-fidelity metrics.
13. Gunakan clustered bootstrap per patient.
14. Periksa image-quality confounding.
15. Uji SmoothL1 versus magnitude-weighted direction loss.
16. Tambahkan feature-KD atau counterfactual-CSD baseline.
17. Dokumentasikan fixed-teacher limitation.

## **P2 — Boleh menjadi future work**

18. Konversi cumulative thresholds ke distribusi lima kelas.
19. QAT.
20. External validation pada DRTiD/MFIDDR.
21. Ophthalmologist review dan lesion-level validation.
22. Calibration dan selective prediction lengkap.
23. Deployment pada ARM/mobile/Puskesmas.
24. Fairness analysis lintas demografi dan perangkat.

# Putusan akhir

Dokumen v2 sudah menjadi **master guide yang sangat baik secara organisasi dan experimental discipline**. Revisi terhadap baseline, auxiliary heads, monotonicity, imbalance, multi-seed, pretraining, dan PTQ merupakan peningkatan besar. Dokumen juga sudah memiliki go/no-go gates yang benar dan secara eksplisit membolehkan hasil negatif sebagai temuan valid. 

Namun, isu terpenting yang masih belum selesai adalah:

[
\boxed{
\Delta
\text{ belum murni mengukur complementarity karena membandingkan head yang berbeda}
}
]

Diikuti oleh:

[
\boxed{
\text{student dapat meminimalkan CSD melalui perubahan auxiliary heads}
}
]

dan:

[
\boxed{
\text{weighted sigmoid outputs belum tentu calibrated probabilities}
}
]

Ketiga isu tersebut harus divalidasi sebelum klaim algoritmik DR-VERGE dianggap kokoh.

Jadi penilaian final saya:

| Aspek                                           | Nilai saat ini |
| ----------------------------------------------- | -------------: |
| Struktur eksperimen                             |           9/10 |
| Reproducibility planning                        |         8,5/10 |
| Code completeness                               |           7/10 |
| Mathematical clarity                            |           8/10 |
| Validitas proxy CSD                             |         6,5/10 |
| Setelah P0 fixes                                |       8,5–9/10 |
| Kesiapan langsung full training                 |      **Belum** |
| Kesiapan untuk smoke test dan validation sprint |         **Ya** |

Dokumen ini sudah sangat dekat, tetapi sebelum menghabiskan komputasi untuk seluruh run, lakukan satu **validation sprint 6–12 jam** khusus untuk menguji definisi (\Delta), gradient CSD, same-head counterfactual, PTQ smoke test, dan evaluator final. Itu akan menghindarkan tim dari situasi kode berjalan sempurna tetapi klaim utama ternyata tidak benar-benar diukur.

[1]: https://www.sciencedirect.com/science/article/pii/S2666389922001040 "DeepDRiD: Diabetic Retinopathy—Grading and Image Quality Estimation Challenge - ScienceDirect"
[2]: https://www.sciencedirect.com/science/article/pii/S016786552030413X "Rank consistent ordinal regression for neural networks with application to age estimation - ScienceDirect"
[3]: https://arxiv.org/abs/2111.08851 "Deep Neural Networks for Rank-Consistent Ordinal Regression Based On Conditional Probabilities"
[4]: https://ojs.aaai.org/index.php/AAAI/article/view/25236? "Curriculum Temperature for Knowledge Distillation | Proceedings of the AAAI Conference on Artificial Intelligence"
[5]: https://docs.pytorch.org/docs/stable/quantization.html "Quantization — PyTorch 2.13 documentation"
[6]: https://docs.pytorch.org/docs/stable/quantization-support "Quantization API Reference — PyTorch 2.12 documentation"