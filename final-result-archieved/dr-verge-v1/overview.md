## DR-VERGE - Overview Idea

# DR-VERGE — Overview Final untuk KTI GemasTIK XIX

Nama baru: **DR-VERGE**

*"Vergence"* adalah istilah optometri asli — sudut konvergensi ketika dua mata (atau dua sudut pandang) menyatu untuk membentuk satu persepsi kedalaman. Metafora ini pas secara harfiah: dua foto (macula-centered & optic disc-centered) "converge" jadi satu diagnosis. Backronym-nya juga sekalian merangkum metode intinya:

**V**iew-**E**vidence **R**elational **G**rading **E**ngine

Tidak ada "MVAN" lagi, dan namanya tidak terdengar seperti turunan langsung dari Pink-MVAN.

---

## BAGIAN 1 — LATAR BELAKANG DAN MASALAH

Diabetic Retinopathy (DR) adalah penyebab kebutaan yang bisa dicegah, dengan ~19 juta penderita diabetes di Indonesia dan rasio dokter mata yang sangat rendah — screening massal jadi kebutuhan mendesak. Standar klinis yang sudah mapan adalah **two-field fundus photography**: foto macula-centered dan optic disc-centered per mata, yang sifatnya *complementary* secara anatomis (CrossFiT, 2022, membuktikan ini secara eksplisit: akurasi macula-only 80,47%, disc-only 77,87%, dual-view 84,21% — dual-view unggul karena informasinya saling melengkapi, bukan cuma redundan).

Masalahnya sama seperti di mammografi (kasus Pink-MVAN): model two-field yang akurat itu berat, sementara model ringan yang ada hanya melihat satu foto — dan begitu model dikompresi (kuantisasi), belum ada yang menguji apakah *keunggulan spesifik dari menggabungkan dua pandangan* itu ikut hilang atau tetap bertahan.

---

## BAGIAN 2 — RESEARCH GAP

| Paper | Two-field anatomis | KD | Lightweight | Distilasi eksplisit atas *complementarity gain* | Quantization |
| --- | --- | --- | --- | --- | --- |
| DeepDRiD (dataset) | ✓ | ✗ | ✗ | ✗ | ✗ |
| CrossFiT (2022) | ✓ | ✗ | ✗ | ✗ | ✗ |
| MVGFDR (2026) | ✓ (shared/unique disentangle) | ✗ | ✗ | ✗ | ✗ |
| OrthKD / MobileNet KD DR (2026) | ✗ single-view | ✓ | ✓ | ✗ | ✗ |
| Consistent Complementary Multi-View Learning | ✓ (redundant vs complementary) | ✗ | ✗ | sebagian (konsep, bukan distilasi) | ✗ |
| Dual-View Thyroid Ultrasound KD | ✓ (domain lain) | ✓ | ✓ | ✗ | ✗ |
| Survei Quantization (Gholami dkk.) | — | — | — | — | ✓ (general, bukan multi-view medis) |
| Pink-MVAN (2025, mammografi) | ✓ | ✓ | ✓ | ✗ (KD generik pada logit tunggal) | ✓ PTQ |
| **DR-VERGE (Proposed)** | **✓** | **✓** | **✓** | **✓** | **✓ PTQ** |

**Rumusan gap (versi final, hasil diskusi tim):**

*"Riset terdahulu telah membuktikan manfaat diagnostik dari pasangan foto macula-centered dan optic-disc-centered, serta telah mengembangkan mekanisme fusi (cross-attention, shared-specific disentanglement). Riset lain telah menerapkan dual-view knowledge distillation pada domain medical imaging lain (mis. thyroid ultrasound). Namun, dalam literatur yang ditelaah, belum ditemukan metode yang secara eksplisit mendistilasi POLA PERUBAHAN PROBABILITAS KELAS yang terjadi ketika prediksi single-view diagregasi menjadi prediksi dual-view — yaitu sinyal yang merepresentasikan 'apa yang didapat model dari menggabungkan dua pandangan' — ke lightweight dual-view student, dan membandingkannya secara terkontrol dengan training tanpa distilasi maupun standard logit KD."*

Ini gap yang **spesifik dan defensible** — bukan klaim "pertama menggabungkan A+B+C+D" yang gampang dipatahkan, tapi klaim di level mekanisme distilasi mana yang belum pernah dicoba.

---

## BAGIAN 3 — RESEARCH QUESTIONS (versi simplified)

**RQ1 (inti, wajib terjawab):***"Apakah distilasi pola perubahan probabilitas antara prediksi dual-view teacher dan agregasi prediksi single-view teacher (Complementarity-Shift Distillation) meningkatkan kinerja ordinal lightweight dual-view student dibandingkan (a) training tanpa distilasi dan (b) standard logit knowledge distillation, pada grading DR lima kelas?"*

**RQ2 (sekunder, dikerjakan jika Fase 1 selesai on-time):***"Bagaimana kuantisasi PTQ INT8 memengaruhi kinerja ordinal, besaran dual-view gain, ukuran model, dan latensi inferensi pada student terbaik dibandingkan versi FP32-nya?"*

QAT **sengaja tidak dijadikan RQ inti** — diposisikan eksplisit sebagai *future work* di bagian keterbatasan. Ini keputusan yang jujur dan realistis, bukan kelemahan: lebih baik dua RQ yang terjawab tuntas daripada tiga RQ yang setengah jadi.

---

## BAGIAN 4 — PROPOSED METHOD: DR-VERGE

### Arsitektur Dua Tahap (disederhanakan dari 3 tahap sebelumnya)

```
TAHAP 1 — TEACHER TRAINING
────────────────────────────────────────────
Input: [Foto macula] + [Foto optic disc]
Backbone: ResNet-50, shared weights
Fusion: Concatenation → FC
Head: ordinal head (CORAL), + 2 auxiliary head ringan
       untuk prediksi macula-only dan disc-only
       (dipakai HANYA untuk menghitung sinyal
       distilasi, tidak untuk inferensi akhir teacher)
Output: p_dual^T, p_macula^T, p_disc^T

TAHAP 2 — STUDENT TRAINING (CSD + KD)
────────────────────────────────────────────
Input: [Foto macula] + [Foto optic disc]
Backbone: depthwise-separable conv ringan, shared weights
Head: ordinal (CORAL) + 2 auxiliary head serupa teacher
Loss: L_ordinal + α·L_logit_KD + β·L_CSD

TAHAP 3 — QUANTIZATION (PTQ, in-scope)
────────────────────────────────────────────
Convert student FP32 → INT8 (dynamic/static PTQ,
tanpa retraining) → evaluasi degradasi
```

### Inti Novelty: Complementarity-Shift Distillation (CSD)

Ini penyederhanaan yang **lebih kuat**, bukan cuma lebih mudah, dari CVCD versi lama. Alih-alih tiga loss terpisah (relation + view + gain) yang rawan saling tarik-menarik secara optimisasi, CSD menyatukan sinyal itu dalam satu representasi: **vektor pergeseran distribusi probabilitas**.

```
Agregasi single-view teacher:
p_agg^T = (p_macula^T + p_disc^T) / 2

Vektor shift teacher (5 dimensi, satu per grade):
Δ^T = p_dual^T − p_agg^T

Vektor shift student (dihitung dengan cara sama):
Δ^S = p_dual^S − p_agg^S

L_CSD = KL( softmax(Δ^T / τ) ‖ softmax(Δ^S / τ) )
```

**Kenapa ini defensible secara matematis dan tidak overclaim:**
Δ menangkap *arah dan besar* perubahan keyakinan model di tiap kelas grade ketika ia berhenti melihat satu foto dan mulai melihat dua foto sekaligus. Kalau teacher, misalnya, menaikkan keyakinan pada Grade 2 secara khusus saat melihat dua view (karena ada lesi yang cuma kelihatan gabungan konteks kedua foto), Δ^T akan menangkap pola itu — dan CSD memaksa student meniru *pola pergeseran* itu, bukan cuma logit akhirnya. Ini secara implisit mewarisi dua hal yang dulu coba ditangkap CVCD terpisah (relasi antar-view dan besaran gain), tanpa perlu attention matrix relation eksplisit yang berat dihitung dan rawan collapse pada dataset sekecil DeepDRiD (2.000 gambar).

Loss gabungan akhir student:

```
L_student = L_ordinal(CORAL) + α · L_logit_KD(p_dual^T, p_dual^S) + β · L_CSD
```

α dan β di-tuning via grid kecil (mis. α∈{0.3,0.5}, β∈{0.3,0.5,0.7}), bukan angka sembarangan — ini penting supaya klaim di paper terlihat empiris, bukan asal comot dari Pink-MVAN (α=0,1, T=10).

---

## BAGIAN 5 — DATASET

**DRTiD (Primer, revisi 6 Agustus 2026):** 1.550 pasien-mata, 3.100 gambar dual-view (macula + optic disc), label grade 0–4. Dataset ini adalah dataset yang sama dipakai oleh CrossFiT (2022) — sumber angka 80,47% / 77,87% / 84,21% yang menjadi motivasi awal riset ini (lihat Bagian 1). Memakai DRTiD sebagai data training berarti angka macula-only/disc-only/dual-view milik DR-VERGE dapat dibandingkan langsung dengan benchmark tersebut, bukan sekadar dikutip sebagai rujukan. Split resmi dari dataset (`a. DR_grade_Training.csv` = 1.000 baris, `b. DR_grade_Testing.csv` = 550 baris, kelima grade hadir di kedua split) dipakai apa adanya — train/val internal untuk tuning dipisah sendiri dari 1.000 baris training resmi, secara patient-wise, tanpa menyentuh 550 baris testing sampai evaluasi akhir.

**APTOS 2019 (Pre-training backbone):** 3.662 gambar single-view, tersedia langsung di Kaggle. Dipakai supaya backbone punya representasi retinal yang kuat sebelum fine-tuning ke skema dual-view — penting karena DRTiD sendiri terlalu kecil untuk melatih backbone dari nol.

**DeepDRiD** — dipertimbangkan sebagai kandidat *external validation*, tetapi belum dipakai di rencana inti: struktur CSV publiknya tidak memberi label eksplisit field mana (`_l1`/`_l2` per mata) yang macula-centered vs optic-disc-centered, dan satu-satunya subset yang berlabel "evaluation" ternyata tidak memiliki ground truth (label kosong, dipakai untuk submission online challenge). Akan dipertimbangkan kembali hanya jika pemetaan field-nya bisa dikonfirmasi dari paper/dokumentasi asli DeepDRiD dan waktu tersisa cukup — bukan dependency untuk RQ1/RQ2.

---

## BAGIAN 6 — RANCANGAN EKSPERIMEN

| Kondisi | Tujuan |
| --- | --- |
| Macula-only student, FP32 | Single-view baseline |
| Disc-only student, FP32 | Single-view baseline |
| Dual-view student tanpa distilasi, FP32 | Dual-view murni tanpa transfer |
| Dual-view + standard logit KD, FP32 | Baseline KD standar (pembanding utama RQ1) |
| **Dual-view + CSD, FP32** | **DR-VERGE Fase 1 (jawaban RQ1)** |
| Teacher dual-view, FP32 | Upper bound |
| Student CSD terbaik → PTQ INT8 | **DR-VERGE Fase 2 (jawaban RQ2, jika waktu cukup)** |

Matriks ini jauh lebih ramping dari versi CVCD lama (11 kondisi → 7 kondisi) — realistis dikerjakan dalam 10 hari tanpa mengorbankan kekuatan pembuktian RQ1.

---

## BAGIAN 7 — METRIK EVALUASI

**Diagnostic:**

- QWK (primary — standar untuk ordinal grading)
- MAE ordinal
- Severe error rate: P(|y − ŷ| ≥ 2)
- Macro-F1
- Per-grade sensitivity (khusus Grade 1–2, klinis paling kritis dideteksi dini)

**Complementarity preservation:**

- Dual-view gain: G = QWK_dual − max(QWK_macula, QWK_disc), dibandingkan antar semua kondisi
- (Jika Fase 2 tercapai) G sebelum vs sesudah PTQ

**Efficiency:**

- Model size (MB), parameter count
- CPU latency (opsional GPU jika sempat)

Set metrik ini persis mengikuti saran teman satu tim — sudah tepat karena seimbang antara rigor klinis (ordinal-aware) dan efisiensi (yang jadi selling point utama, sama seperti Pink-MVAN).

---

## BAGIAN 8 — KONTRIBUSI (tidak overclaim)

**Kontribusi 1 — Algoritmik:** Complementarity-Shift Distillation, mekanisme distilasi yang mentransfer *pola pergeseran probabilitas* akibat penggabungan dua view — berbeda dari logit KD standar (yang hanya meniru output akhir) dan dari relational KD generik (yang meniru struktur fitur, bukan struktur *keputusan klinis*).

**Kontribusi 2 — Empiris:** Pengujian terkontrol (dengan baseline no-distill dan standard-KD dalam protokol sama) apakah CSD benar-benar unggul untuk DR grading ordinal lima kelas — bukan klaim "lebih baik dari segalanya", tapi klaim spesifik dan terukur dibanding dua baseline yang jelas.

**Kontribusi 3 (jika RQ2 tercapai) — Praktis:** Karakterisasi awal bagaimana PTQ INT8 memengaruhi preservasi dual-view gain pada model DR grading ringan — membuka jalur untuk penelitian QAT lanjutan (future work).

Perhatikan: **tidak ada klaim generalizability ke domain lain** (mammografi, X-ray dada, dst.) seperti versi CVCD lama — itu klaim yang tidak diuji dan gampang ditantang juri. Kontribusi dibatasi ke apa yang benar-benar dibuktikan dalam eksperimen.

---

## BAGIAN 9 — FEASIBILITY 10 HARI

```
Hari 1–2:  Setup data DeepDRiD + APTOS, pre-train backbone
Hari 3–4:  Train teacher dual-view (ResNet-50 + CORAL + 2 aux head)
Hari 5:    Baseline single-view + dual-view tanpa distilasi
Hari 6:    Baseline standard logit KD
Hari 7:    Implementasi & training CSD (loss tunggal, jauh lebih ringan
           dari CVCD 3-komponen)
Hari 8:    Tuning α, β; finalisasi student terbaik; evaluasi lengkap RQ1
Hari 8.5:  [JIKA WAKTU CUKUP] PTQ conversion + evaluasi RQ2
Hari 9:    Buffer / perbaikan hasil / ablasi tambahan
Hari 10:   Penulisan artikel
```

Dibanding rencana CVCD sebelumnya, versi ini punya **buffer eksplisit di Hari 9** — bukan langsung mepet ke deadline seperti sebelumnya. Ini poin penting karena risiko terbesar rencana lama adalah nol slack time.

---

## SATU KALIMAT UNTUK JURI

*"DR-VERGE membuktikan bahwa 'apa yang didapat' sebuah model ketika dua sudut pandang klinis digabungkan — bukan sekadar output akhirnya — dapat didistilasi secara eksplisit ke model ringan melalui Complementarity-Shift Distillation, sehingga keunggulan diagnostik two-field fundus photography tetap terjaga pada model yang siap dijalankan di fasilitas kesehatan berdaya komputasi rendah."*