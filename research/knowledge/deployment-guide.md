# Panduan Deploy Model DR-VERGE ke Web Demo

Langkah praktis menghubungkan model hasil notebook dengan frontend React.
Pelengkap [`model-files-for-deployment.md`](model-files-for-deployment.md), yang menjelaskan
*format berkas*; dokumen ini menjelaskan *cara men-deploy-nya*.

---

## 1. Di Mana Modelnya Sekarang?

**Tidak ada di repo ini.** Semua model tersimpan di Google Drive, hasil run enhanced:

```
/content/drive/MyDrive/DR-VERGE/artifacts_enhanced_v1_20260811/models/
├── teacher_fp32/              checkpoint.pt · model.pt2 · model.onnx ✅ · metadata.json
├── best_student_fp32/         checkpoint.pt · model.pt2 · model.onnx ✅ · metadata.json
├── best_student_ptq_int8/     checkpoint.pt · metadata.json            (ONNX gagal)
├── best_student_ft_ptq_int8/  checkpoint.pt · metadata.json            (ONNX gagal)
├── best_student_qat_int8/     checkpoint.pt · metadata.json            (ONNX gagal)
└── selected_deployment/       checkpoint.pt · metadata.json     ← model resmi paper
```

`selected_deployment/` berisi **`qat_int8` seed 42** — model yang dipilih aturan deployment
pra-registrasi (retensi validasi 99,0%, latensi CPU 11,35 ms).

> ⚠ **Perhatikan: `selected_deployment/` hanya berisi 2 berkas, tanpa ONNX.** Ekspor ONNX untuk
> semua model INT8 **gagal** karena keterbatasan PyTorch
> (`Conv2dPackedParamsBase ... does not have a field '__obj_flatten__'`). Ini bukan kesalahan
> pipeline — `torch.export` memang belum mendukung modul eager-mode quantized.

---

## 2. Pakai Model yang Mana?

Ini keputusan terpenting, dan jawabannya bergantung pada arsitektur yang Anda pilih.

| Model | Ukuran | ONNX? | Latensi CPU | Bisa di browser? |
|---|---|---|---|---|
| `best_student_qat_int8` (resmi paper) | 0,95 MB | ❌ | 11,35 ms | ❌ |
| **`best_student_fp32`** | 1,29 MB | **✅ paritas 7,2e−07** | 32,6 ms | **✅** |
| `teacher_fp32` | 154 MB | ✅ | 627,6 ms | ❌ terlalu besar |

**Rekomendasi: pakai `best_student_fp32` (ONNX).** Alasannya:

1. **Satu-satunya student yang punya ONNX yang berfungsi.** Sudah diverifikasi gate:
   `max|diff| = 7,15e−07` terhadap PyTorch, dan **grade prediksinya identik**.
2. Selisih latensi (32,6 ms vs 11,35 ms) **tidak relevan untuk demo web** — keduanya jauh di bawah
   ambang persepsi manusia.
3. Menghindari masalah rekonstruksi INT8 (lihat §3).

> ⚠ **Wajib diungkapkan di UI.** Paper men-deploy `qat_int8` seed 42; demo memakai
> `best_student_fp32` seed 3407. **Dua model berbeda, seed berbeda.** Beri label jelas di
> halaman demo, misalnya:
> *"Demo menjalankan varian FP32 (seed 3407). Model yang dilaporkan di paper adalah QAT INT8
> (seed 42); keduanya berbagi metode yang sama (dual_csd) tetapi bukan artefak yang sama."*
>
> Ini sejalan dengan aturan keselamatan di `prompts/dr-verge-fe.md` — jangan sampai demo
> menyiratkan angka paper padahal menjalankan model lain.

---

## 3. Kenapa Model INT8 Sulit Di-deploy

Kalau Anda tetap ingin memakai model resmi paper, inilah yang harus Anda tahu.

`checkpoint.pt` INT8 **tidak bisa dimuat sendirian.** Alurnya (notebook cell 65):

```python
def qat_skeleton():
    return convert(build_qat_prepared(BEST_CKPT).to("cpu").eval(), inplace=False)

m = qat_skeleton()                      # rangka INT8 dengan qparams placeholder
m.load_state_dict(load_weights(ck))     # baru bobot INT8 asli dimasukkan
```

Artinya untuk menyajikan model INT8 Anda butuh **empat** hal, bukan satu:

1. `selected_deployment/checkpoint.pt` — bobot INT8
2. **Kode kelas arsitektur** (`Student`, `QuantizableBackbone`, dst.) dari `experiments/pipeline/src/`
3. **`BEST_CKPT`** — checkpoint FP32 `dual_csd/seed3407.pt`, hanya untuk membangun rangkanya
4. PyTorch dengan **quant engine x86/fbgemm** — INT8 ini **CPU-only** dan arsitektur-spesifik

Poin 3 sering terlewat: berkasnya harus ada meski bobotnya langsung ditimpa.

---

## 4. Tiga Pilihan Arsitektur

### 🥇 Opsi A — ONNX di Browser (REKOMENDASI)

Model diunduh ke browser pengguna, inferensi jalan di perangkat mereka. **Tanpa server sama sekali.**

```
Browser pengguna
├── React app (Vercel/Netlify — statis, gratis)
├── onnxruntime-web (WASM)
└── model.onnx (1,3 MB) ← ikut di repo, di public/models/
```

| Kelebihan | Kekurangan |
|---|---|
| ✅ Tanpa backend, tanpa API key, tanpa biaya | ❌ Model terunduh publik (bisa disalin orang) |
| ✅ Tanpa cold start — penting saat dinilai juri | ❌ Perlu uji kompatibilitas WASM |
| ✅ Jalan offline setelah load pertama | ❌ Hanya FP32, bukan model resmi paper |
| ✅ Data pasien tidak pernah keluar dari perangkat — **argumen privasi yang kuat** | |
| ✅ Model 1,3 MB muat nyaman di git | |

**Untuk GEMASTIK ini pilihan terbaik.** Tanpa server berarti tidak ada yang bisa mati saat
presentasi, dan argumen privasi ("citra retina tidak pernah dikirim ke mana pun") justru menguatkan
narasi *edge deployment* yang jadi inti penelitian Anda.

### 🥈 Opsi B — ONNX di Backend Python

```
Browser → HTTP POST (2 gambar) → FastAPI + onnxruntime → JSON {grade, scores}
```

Pilih ini bila Anda ingin model tidak terekspos publik, atau ingin mencatat log penggunaan.

### 🥉 Opsi C — PyTorch INT8 di Backend

Satu-satunya cara menjalankan **model resmi paper**. Paling berat: butuh PyTorch (~800 MB image),
kode arsitektur, checkpoint FP32 pendamping, dan CPU x86.

Pilih ini hanya bila juri secara spesifik menuntut demo menjalankan artefak yang persis dilaporkan.

---

## 5. Langkah Opsi A (Browser) — Paling Detail

### Langkah 1 — Unduh model dari Drive

```
artifacts_enhanced_v1_20260811/models/best_student_fp32/model.onnx
artifacts_enhanced_v1_20260811/models/best_student_fp32/metadata.json
```

Taruh di repo:

```
frontend/public/models/
├── model.onnx          (~1,3 MB)
└── metadata.json
```

`.gitignore` mengabaikan `*.pt`, tetapi **tidak** `*.onnx` — jadi berkas ini akan ter-commit,
dan memang itu yang diinginkan.

### Langkah 2 — Pasang runtime

```bash
cd frontend
npm install onnxruntime-web
```

### Langkah 3 — Replikasi preprocessing **dengan tepat**

Ini bagian paling rawan. Kalau meleset sedikit saja, prediksinya salah tanpa error apa pun.
Nilai diambil dari `PREPROCESSING` di notebook:

```js
const IMG_SIZE = 384;                       // run enhanced pakai 384, BUKAN 224
const MEAN = [0.372487, 0.217266, 0.119367];   // statistik DRTiD, bukan ImageNet
const STD  = [0.281526, 0.179457, 0.109162];
const THRESHOLD = 0.5;                      // t* dual_csd hasil kalibrasi validasi

function preprocess(imgEl) {
  const c = document.createElement("canvas");
  c.width = c.height = IMG_SIZE;
  // PENTING: digepengkan ke persegi, aspect ratio TIDAK dipertahankan.
  // Ini menyamai A.Resize(384, 384) di albumentations.
  c.getContext("2d").drawImage(imgEl, 0, 0, IMG_SIZE, IMG_SIZE);
  const { data } = c.getContext("2d").getImageData(0, 0, IMG_SIZE, IMG_SIZE);

  const out = new Float32Array(3 * IMG_SIZE * IMG_SIZE);   // format CHW
  const px = IMG_SIZE * IMG_SIZE;
  for (let i = 0; i < px; i++) {
    for (let ch = 0; ch < 3; ch++) {
      out[ch * px + i] = (data[i * 4 + ch] / 255 - MEAN[ch]) / STD[ch];
    }
  }
  return new ort.Tensor("float32", out, [1, 3, IMG_SIZE, IMG_SIZE]);
}
```

**Empat kesalahan yang paling sering terjadi:**

| Kesalahan | Akibat |
|---|---|
| Pakai mean/std ImageNet | Prediksi bergeser diam-diam |
| Pertahankan aspect ratio | Tidak cocok dengan pelatihan |
| Pakai format HWC, bukan CHW | Output ngawur |
| Pakai 224 | Run enhanced dilatih di **384** |

### Langkah 4 — Inferensi dan konversi ke grade

Head CORAL mengeluarkan **4 probabilitas kumulatif** `P(Y > k)`, bukan softmax 5 kelas.
Grade = **jumlah ambang yang terlampaui**, **bukan argmax**:

```js
const session = await ort.InferenceSession.create("/models/model.onnx");

const out = await session.run({
  macula: preprocess(maculaImg),
  disc:   preprocess(discImg),          // urutan lapang PENTING (view-order sensitive)
});

const cum = Array.from(out.p_cumulative.data);        // 4 nilai
const grade = cum.filter(p => p > THRESHOLD).length;  // 0..4

// skor per-grade dari selisih kumulatif (menyamai predict_dr() di notebook)
const ext = [1.0, ...cum, 0.0];
let scores = ext.slice(0, -1).map((v, i) => Math.max(v - ext[i + 1], 0));
const sum = scores.reduce((a, b) => a + b, 0);
scores = scores.map(s => s / Math.max(sum, 1e-9));

const GRADE_NAMES = ["No DR", "Mild NPDR", "Moderate NPDR", "Severe NPDR", "Proliferative DR"];
```

> ⚠ **Jangan pakai `argmax`.** Head ini ordinal — argmax akan menghasilkan grade yang salah dan
> merusak sifat monotonik yang justru diverifikasi `Gate6c_OrdinalMonotonicity`.

> ⚠ **Urutan lapang menentukan hasil.** `Gate2a_CORAL` mencatat *"fusion is view-order sensitive"*.
> Masukan `macula` harus benar-benar citra berpusat makula. Sampel di
> `frontend/public/samples/` sudah diverifikasi per-sampel (lihat README-nya).

### Langkah 5 — Penamaan keluaran

Ikuti aturan keselamatan yang sudah ada di frontend:

```js
{
  grade, grade_name,
  ordinal_threshold_scores: cum,   // BUKAN "confidence", BUKAN "probability"
  model_version: "best_student_fp32_seed3407_FP32",
  disclaimer: "Prototipe riset. Bukan alat medis dan bukan diagnosis klinis."
}
```

Notebook sengaja menyebutnya `uncalibrated_score` dengan komentar: *"weighted-BCE training distorts
these sigmoids"*. Menyebutnya "confidence" akan menyesatkan.

### Langkah 6 — Verifikasi kebenaran

Jalankan 15 sampel di `frontend/public/samples/`, bandingkan dengan `ground_truth_grade` di
`meta.json`:

| Grade | Ekspektasi wajar |
|---|---|
| 0 | ✅ umumnya benar (recall 0,803) |
| 1 | ❌ **hampir pasti salah** (recall 0,068) |
| 2–3 | ⚠ sering meleset ke tetangga |
| 4 | ✅ cukup sering benar (recall 0,580) |

**Kalau grade 0 dan 4 pun salah, preprocessing Anda bermasalah** — kembali ke Langkah 3.

---

## 6. Kalau Pilih Backend: Deploy di Mana?

| Platform | Biaya | Cocok untuk | Catatan |
|---|---|---|---|
| **Hugging Face Spaces** | Gratis (2 vCPU, 16 GB) | **Opsi B & C** | Terbaik untuk ML. Docker penuh, PyTorch didukung, tidak tidur |
| Render | Gratis terbatas | Opsi B | **Tidur setelah 15 menit** — cold start ~50 dtk, berisiko saat presentasi |
| Railway / Fly.io | Trial | Opsi B | Perlu kartu kredit |
| Vercel Functions | Gratis | ❌ | Batas ukuran serverless ketat; PyTorch tidak muat |

**Rekomendasi backend: Hugging Face Spaces.** Gratis, tidak tidur, mendukung Docker, dan memang
dirancang untuk demo model. Untuk Opsi C (PyTorch INT8) ini praktis satu-satunya pilihan gratis.

Kerangka minimal (Opsi B):

```python
from fastapi import FastAPI, UploadFile
import onnxruntime as ort, numpy as np
from PIL import Image

app = FastAPI()
sess = ort.InferenceSession("model.onnx", providers=["CPUExecutionProvider"])
MEAN = np.array([0.372487, 0.217266, 0.119367], np.float32)
STD  = np.array([0.281526, 0.179457, 0.109162], np.float32)

def prep(f):
    im = Image.open(f.file).convert("RGB").resize((384, 384), Image.BILINEAR)
    a = (np.asarray(im, np.float32) / 255 - MEAN) / STD
    return a.transpose(2, 0, 1)[None]

@app.post("/predict")
async def predict(macula: UploadFile, disc: UploadFile):
    cum = sess.run(None, {"macula": prep(macula), "disc": prep(disc)})[0][0]
    grade = int((cum > 0.5).sum())
    return {"grade": grade,
            "ordinal_threshold_scores": cum.tolist(),
            "model_version": "best_student_fp32_seed3407_FP32",
            "disclaimer": "Prototipe riset. Bukan alat medis."}
```

Jangan lupa CORS agar frontend bisa memanggilnya.

---

## 7. Ringkasan Keputusan

```
Butuh menjalankan artefak PERSIS seperti di paper (qat_int8)?
├── YA  → Opsi C: PyTorch INT8 + Hugging Face Spaces
│         (butuh checkpoint.pt + kode arsitektur + BEST_CKPT + CPU x86)
└── TIDAK → Model tidak boleh terunduh publik?
           ├── YA  → Opsi B: ONNX + FastAPI di Hugging Face Spaces
           └── TIDAK → 🥇 Opsi A: ONNX di browser + Vercel   ← REKOMENDASI
```

**Untuk GEMASTIK: Opsi A.** Tanpa server yang bisa mati, tanpa cold start, tanpa biaya, dan
argumen privasi memperkuat narasi *edge deployment* penelitian Anda. Cukup ungkapkan dengan jelas
bahwa demo menjalankan varian FP32, bukan artefak INT8 yang dilaporkan.

---

## 8. Checklist Sebelum Demo

- [ ] `model.onnx` ada di `frontend/public/models/` dan ter-commit
- [ ] Preprocessing memakai **384**, mean/std **DRTiD**, format **CHW**, **tanpa** menjaga aspect ratio
- [ ] Grade dihitung dengan **hitung ambang > 0,5**, bukan `argmax`
- [ ] Masukan `macula` benar-benar citra berpusat makula (bukan disc)
- [ ] 15 sampel diuji; grade 0 dan 4 benar
- [ ] Keluaran disebut *Ordinal Threshold Score*, bukan "confidence"
- [ ] Disclaimer medis tampil di layar hasil
- [ ] Label bahwa demo memakai FP32 seed 3407, bukan QAT INT8 seed 42
- [ ] `ATTRIBUTION.txt` sampel DeepDRiD ikut terdistribusi (CC BY-SA 4.0)

---

## Terkait

- Format berkas model → [`model-files-for-deployment.md`](model-files-for-deployment.md)
- Sampel uji → [`../../frontend/public/samples/README.md`](../../frontend/public/samples/README.md)
- Hasil run → [`../../experiments/results/enhanched-notebook/RESULTS_OVERVIEW.md`](../../experiments/results/enhanched-notebook/RESULTS_OVERVIEW.md)
- Aturan keselamatan demo → `project/prompts/dr-verge-fe.md`
