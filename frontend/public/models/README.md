# Model Files

Model ONNX yang dijalankan langsung di browser pengunjung.

```
public/models/best_student_fp32/
├── model.onnx        ~190 KB   graf jaringan saja
├── model.onnx.data   ~1,3 MB   BOBOT  ← wajib, sering terlewat
└── metadata.json     ~1 KB     preprocessing + ambang keputusan
```

---

## ⚠ `model.onnx.data` wajib ada

`torch.onnx.export` menulis **dua** berkas: graf di `model.onnx` dan bobotnya di
`model.onnx.data`. Berkas `model.onnx` hanya ~190 KB, sehingga **terlihat lengkap padahal
tidak** — di dalamnya ada 56 tensor yang menunjuk ke berkas sidecar.

Tanpa `model.onnx.data`, model tidak bisa dimuat sama sekali.

Salin dari Google Drive, dari folder yang sama dengan `model.onnx`:

```
artifacts_enhanced_v1_20260811/models/best_student_fp32/model.onnx.data
```

Lalu verifikasi:

```bash
npm run verify:model
```

Skrip itu memeriksa ketiga berkas ada, metadata lengkap, graf dapat dimuat **beserta bobot
eksternalnya**, dan satu forward pass menghasilkan 4 skor yang finite serta monoton
non-naik sesuai jaminan CORAL.

---

## `metadata.json` adalah sumber kebenaran

Frontend **membaca** empat nilai ini saat runtime, tidak menuliskannya di kode:

| Kunci | Nilai | Dipakai untuk |
|---|---|---|
| `input_size` | `[384, 384]` | Ukuran resize |
| `normalization_mean` | statistik DRTiD | Normalisasi |
| `normalization_std` | statistik DRTiD | Normalisasi |
| `decision_threshold` | `0.5` | Ambang ordinal (t\*) |

Jadi mengganti model cukup dengan menukar isi folder — tidak ada nilai yang bisa
diam-diam tidak sinkron antara notebook dan frontend.

---

## Catatan tentang `teacher_fp32/`

Folder ini **tidak dipakai demo** dan bobotnya berukuran **~154 MB** — terlalu besar untuk
repo dan tidak ada gunanya di browser. Jangan salin `model.onnx.data` milik teacher.

Aman untuk dihapus bila tidak diperlukan; dibiarkan pun tidak mengganggu, karena tidak ada
kode yang memuatnya.

---

## Kenapa FP32, bukan INT8 seperti di paper

Model deployment yang dilaporkan paper adalah `qat_int8` (seed 42). **Model INT8 tidak dapat
diekspor ke ONNX sama sekali** — `torch.export` tidak mendukung modul eager-mode quantized
(`Conv2dPackedParamsBase ... does not have a field '__obj_flatten__'`), sehingga tidak ada
jalan menjalankannya di browser.

Demo memakai `best_student_fp32` (seed 3407), metode yang sama (`dual_csd`), artefak dan
seed yang berbeda. Halaman demo menyatakan ini secara eksplisit kepada pengunjung.

Ekspor FP32-nya sudah diverifikasi gate: `max|diff|` terhadap PyTorch = **7,15e−07**, dan
grade prediksinya **identik**.

---

Selengkapnya: [`research/knowledge/deployment-guide.md`](../../../research/knowledge/deployment-guide.md)
