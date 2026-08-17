Flow **Hasil dan Pembahasan** yang paling rapi dan kuat menurut saya adalah:

1. **Mulai dari validasi model & premis dual-view**
   Tunjukkan dulu bahwa dua view memang berguna: macula-only vs disc-only vs dual-view. Ini membuktikan dasar DR-VERGE valid sebelum bicara CSD.

2. **Masuk ke RQ1 — performa prediktif**
   Bandingkan NoDistill, Logit-KD, Feature-KD, dan CSD berdasarkan QWK. Jelaskan bahwa **tidak ada keunggulan prediktif CSD yang konklusif**.

3. **Lanjut RQ1 — pembuktian mekanisme CSD**
   Tampilkan ShiftL1, CosAgree, BenefitCorr. Di sini tunjukkan bahwa **CSD terbaik pada 3/3 metrik mekanisme**.

4. **Tarik insight utama RQ1**
   Jelaskan:

   > **CSD berhasil mentransfer mekanisme dual-view, tetapi fidelity mekanisme tidak otomatis meningkatkan QWK.**

   Ini menjadi jawaban final RQ1.

5. **Masuk ke RQ2 — lightweight & compression**
   Tunjukkan teacher → student:
   parameter, ukuran model, latency, dan QWK retention.

6. **Bandingkan FP32 vs PTQ vs QAT**
   Jelaskan efek kuantisasi terhadap performa dan efisiensi. Fokus bahwa INT8 memberi speed-up dan compression besar tanpa degradasi QWK yang kredibel secara internal.

7. **Jelaskan final deployment**
   Terangkan kenapa **QAT INT8** dipilih berdasarkan rule validation-only dan tampilkan 11,35 ms, 0,95 MB, 99% validation retention.

8. **Tutup dengan external validation**
   Uji pada DeepDRiD Set-C untuk melihat robustness, lalu bahas trade-off internal–external.

Jadi flow sederhananya:

> **Dual-view works → CSD predictive test → CSD mechanism proof → Answer RQ1 → Student compression → PTQ/QAT → Deployment selection → External validation → Answer RQ2**

Kalau dibuat sebagai heading paper:

> **A. Dual-View Grading Performance**
> **B. RQ1: Predictive Performance of Distillation Methods**
> **C. RQ1: Complementarity-Shift Fidelity**
> **D. Mechanism–Performance Dissociation**
> **E. RQ2: Model Compression and Quantization**
> **F. Deployment Model Selection**
> **G. External Validation**
> **H. Overall Discussion**

Menurut saya ini flow paling natural karena pembaca diajak dari **“apakah dua view memang berguna?” → “apakah CSD bekerja?” → “apa sebenarnya yang CSD perbaiki?” → “bisakah model akhirnya dibuat efisien?”**.
