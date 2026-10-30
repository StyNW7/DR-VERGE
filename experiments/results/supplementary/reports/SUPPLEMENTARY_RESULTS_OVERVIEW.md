# SUPPLEMENTARY RESULTS OVERVIEW — DR-VERGE Enhanced (v2)

**Mode:** final (B = 10000, permutations = 10000) · **Device:** cuda (NVIDIA A100-SXM4-80GB) ·
**Phase status:** `{"P0": "PASSED", "P1": "PASSED", "P2": "PASSED", "P3": "PASSED", "P4": "PASSED", "P5": "PASSED", "P6": "PASSED", "FINAL": "PASSED"}` · **Gates:** 56/56 passed;
spec coverage 25/25.

## Verdict

| Pertanyaan                                     | Jawaban                                                                                                                                                                   | Status                     |
|:-----------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------------------------|
| P1 ShiftL1: CSD vs 3 pembanding (internal)     | 3/3 CI menguntungkan CSD                                                                                                                                                  | inferensial (eksploratori) |
| P1 CosAgree: CSD vs 3 pembanding (internal)    | 1/3 CI menguntungkan CSD                                                                                                                                                  | inferensial (eksploratori) |
| P1 BenefitCorr: CSD vs 3 pembanding (internal) | 0/3 CI menguntungkan CSD                                                                                                                                                  | deskriptif saja            |
| P2 pola bertahan di Set-C?                     | peringkat 1 pada 3/3 metrik; 2/9 CI menguntungkan CSD                                                                                                                     | eksploratori pasca-hoc     |
| P3 mengapa fidelitas ≠ QWK?                    | identitas eksak; suku agregasi dasar tidak ditargetkan CSD                                                                                                                | aljabar + deskriptif       |
| P4 grade tersulit                              | Grade 1 (recall CSD 0,068, teacher 0,000; mayoritas salah ke Grade 0)                                                                                                     | deskriptif                 |
| P5 Pearson vs Spearman                         | DRTiD internal test: CSD peringkat 1 (Pearson) / 1 (Spearman); urutan baseline berubah; DeepDRiD Set-C: CSD peringkat 1 (Pearson) / 1 (Spearman); urutan baseline berubah | sensitivitas               |
| QWK CSD > pembanding?                          | tidak (hasil asli, tidak berubah)                                                                                                                                         | tidak didukung             |

## P1 — internal (550 examined-eye records, 5 matched seeds)

| Pembanding      | ΔShiftL1                    | ΔCosAgree                   | ΔBenefitCorr               |
|:----------------|:----------------------------|:----------------------------|:---------------------------|
| NoDistill       | −0,0249* [−0,0477; −0,0043] | +0,0852 [−0,0134; +0,1870]  | +0,0882 [−0,0342; +0,2329] |
| Logit-KD        | −0,0331* [−0,0567; −0,0103] | +0,1503* [+0,0263; +0,3011] | +0,1280 [−0,0038; +0,2643] |
| Feature-KD      | −0,0209* [−0,0408; −0,0012] | +0,0546 [−0,0225; +0,1407]  | +0,1132 [−0,0390; +0,2662] |
| Seed searah CSD | 5/5 · 4/5 · 4/5             | 3/5 · 4/5 · 4/5             | 3/5 · 4/5 · 3/5            |

Analisis suplementer pada Tabel VI menguji apakah keunggulan deskriptif tersebut bertahan terhadap variasi sampel uji dan seed pelatihan. ShiftL1 CSD lebih rendah daripada NoDistill (−0,0249 [−0,0477; −0,0043]), Logit-KD (−0,0331 [−0,0567; −0,0103]), dan Feature-KD (−0,0209 [−0,0408; −0,0012]), dengan ketiga CI 95% tidak memuat nol. CosAgree CSD juga lebih tinggi daripada Logit-KD (+0,1503 [+0,0263; +0,3011]). Lima kontras lainnya (BenefitCorr, CosAgree) memiliki CI yang memuat nol sehingga belum konklusif; seluruhnya tetap searah dengan keunggulan CSD. Tidak ada kontras yang menunjukkan keunggulan pembanding. Selisih per seed menguntungkan CSD pada 34 dari 45 pasangan seed-kontras, dan arahnya tidak berubah ketika salah satu seed dikeluarkan. Bootstrap tingkat record dengan model tetap menghasilkan CI yang tidak memuat nol pada sembilan dari sembilan kontras, dan uji permutasi bersyarat terkoreksi Holm menghasilkan p < 0,05 pada sembilan dari sembilan kontras; ketidaksesuaian dengan CI hierarkis menunjukkan bahwa ketidakpastian yang tersisa terutama berasal dari variasi antar-seed pelatihan. Karena bersifat eksploratori dan hanya menggunakan lima model per kondisi, hasil ini diperlakukan sebagai bukti pendukung, bukan konfirmasi.

## P2 — external (Set-C)

Analisis eksploratori pasca-hoc juga mengevaluasi fidelitas transfer pada Set-C menggunakan model FP32, ambang keputusan, dan urutan field yang sama, dengan bootstrap berpasangan berklaster pasien. CSD tetap memperoleh ShiftL1 terendah serta CosAgree dan BenefitCorr tertinggi di antara empat kondisi utama (0,2975; 0,3831; 0,2357). CosAgree CSD lebih tinggi daripada NoDistill (+0,1283 [+0,0250; +0,2505]) dan Logit-KD (+0,1608 [+0,0358; +0,3036]). Tujuh kontras lainnya memiliki CI yang memuat nol. Rerata |Δ_T| teacher berubah dari 0,4097 menjadi 0,2659, dan selisih QWK joint dual-view teacher terhadap auxiliary head terbaiknya berubah dari +0,0500 (data uji internal) menjadi +0,0073, sehingga besarnya sinyal yang ditransfer juga berubah pada domain eksternal. Analisis ini terpisah dari perbandingan QWK eksternal yang telah dilaporkan dan tidak mengubah pemilihan model maupun artefak deployment.

## P3/P4 — diagnostics

Untuk setiap record berlaku p_dual^S − p_dual^T = (p̄^S − p̄^T) + (Δ^S − Δ^T), dengan p̄ = (p_m + p_d)/2 sebagai agregasi prediksi individual-view (galat numerik maksimum < 1e−12). CSD hanya menyelaraskan suku kedua. Pada data uji internal, CSD memiliki selisih shift 0,3509, tetapi selisih agregasi dasarnya (0,4361) lebih besar daripada NoDistill (0,4269) dan Feature-KD (0,4217). Kesesuaian grade akhir CSD dengan teacher adalah 65,5% dibandingkan 66,1% pada Feature-KD. Di antara 20 model student, QWK berasosiasi dengan selisih agregasi dasar (ρ = −0,52) dan dengan ShiftL1 (ρ = −0,35); asosiasi ini deskriptif karena model tidak independen. Dengan demikian, fidelitas mekanisme yang lebih tinggi tidak secara matematis menjamin QWK yang lebih tinggi. Pada 325 mata yang diprediksi benar oleh teacher, tiga dari sembilan kontras konklusif menguntungkan CSD. Pada 225 mata yang diprediksi salah oleh teacher, nol dari sembilan kontras konklusif menguntungkan CSD. Kelemahan pada Grade 1 terjadi pada seluruh model: recall Grade 1 teacher 0,000 dan CSD 0,068; pada CSD, 65,2% mata Grade 1 diprediksi Grade 0 dan 14,8% diprediksi Grade 2. Berdasarkan kuartil besarnya shift teacher (|Δ_T|), keunggulan CSD terkonsentrasi pada kuartil tertinggi: empat dari enam kontras ShiftL1/CosAgree konklusif menguntungkan CSD, dibandingkan satu pada kuartil terendah. Pada kuartil terendah, selisih shift seluruh student melebihi besarnya shift teacher itu sendiri (ShiftL1 relatif 2,24–2,38), dan CosAgree CSD naik dari 0,2664 menjadi 0,5640. Transfer shift paling jelas terjadi ketika teacher memang menghasilkan shift yang besar (eksploratori).

## Reproduction

Teacher QWK 0.736401; 156 checks, max |diff| 1.21e-04; cache provenance:
{('external', 'imported_v1'): 21, ('internal', 'imported_v1'): 21}.

## Files

`reports/` (P1–P5 reports, RUN_LOG, audit), `tables/`, `figures/`, `paper_ready/`, `logs/gate_report.csv`.
