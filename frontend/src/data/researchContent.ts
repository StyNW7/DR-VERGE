/**
 * Long-form research copy, in English and Indonesian.
 *
 * Each `l(en, id)` pair carries the same meaning in both languages; edit them
 * together. In the Indonesian text, English technical terms are kept and marked
 * `*like this*` so they render in italics, as in the paper.
 *
 * The abstract is marked `isPlaceholder` because the paper is still a draft. The
 * site renders that flag visibly rather than passing draft prose off as the
 * published abstract.
 */

import { l } from "@/i18n/context";

export const paperMeta = {
  title: "DR-VERGE",
  subtitle: l(
    "Dual-View Diabetic Retinopathy Grading through Complementarity-Shift Distillation and Lightweight INT8 Deployment",
    "*Complementarity-Shift Distillation* dan Kuantisasi untuk *Grading* Retinopati Diabetik pada Fundus *Dual-View*",
  ),
  eyebrow: l("Research Paper", "Makalah Penelitian"),
  competition: "GEMASTIK XIX",
  field: "Karya Tulis Ilmiah TIK",
  task: l("Diabetic Retinopathy Grading", "*Grading* Retinopati Diabetik"),
  views: [
    l("Macula-Centered", "Berpusat Makula"),
    l("Optic-Disc-Centered", "Berpusat Diskus Optik"),
  ],
  classes: l("5 Ordinal Grades", "5 Tingkat Ordinal"),
  datasets: ["DRTiD", "APTOS 2019", "DeepDRiD"],
} as const;

export const abstract = {
  // Still a draft: the paper itself is not final. The flag keeps the "Draft"
  // marker on screen until the published abstract replaces this text.
  isPlaceholder: true,
  note: l(
    "English rendering of the draft paper's abstract (Intisari). The wording may still change before the paper is final.",
    "Diambil dari Intisari pada *draft* makalah. Redaksinya masih dapat berubah sebelum makalah final.",
  ),
  paragraphs: [
    l(
      "Diabetic retinopathy (DR) is a complication of diabetes that can lead to vision impairment, which makes early screening and severity grading important. Single-field approaches cover a limited area of the retina, while dual-view modelling of macula-centred and optic-disc-centred images can enrich the predictive signal — at a higher computational cost.",
      "Retinopati diabetik (DR) merupakan komplikasi diabetes yang dapat menyebabkan gangguan penglihatan sehingga membutuhkan skrining dan penilaian tingkat keparahan sejak dini. Pendekatan *single-field* memiliki cakupan retina terbatas, sedangkan pemodelan *dual-view* yang memanfaatkan citra berpusat makula dan diskus optik berpotensi memperkaya informasi prediktif dengan biaya komputasi yang lebih tinggi.",
    ),
    l(
      "This study develops and evaluates DR-VERGE (View-Evidence Relational Grading Engine), a five-grade dual-view DR grading framework that combines CORAL ordinal modelling, lightweight knowledge distillation, Complementarity-Shift Distillation (CSD) and INT8 quantization. CSD trains the student to imitate how the teacher's ordinal output changes when the prediction moves from the average of the individual views to the joint dual-view prediction.",
      "Penelitian ini bertujuan mengembangkan dan mengevaluasi DR-VERGE (*View-Evidence Relational Grading Engine*), kerangka *grading* DR lima tingkat berbasis *dual-view* yang menggabungkan pemodelan ordinal CORAL, *lightweight knowledge distillation*, *Complementarity-Shift Distillation* (CSD), dan kuantisasi INT8. CSD melatih *student* meniru perubahan keluaran ordinal *teacher* ketika prediksi beralih dari rata-rata masing-masing *individual-view* ke prediksi *joint dual-view*.",
    ),
    l(
      "The main experiments use DRTiD at 384 × 384 with standard sampling; DeepDRiD Set-C is reserved for external evaluation. The ResNet-50 teacher reaches QWK 0.7364 and the 328,588-parameter CSD student reaches 0.6018. Descriptively, CSD aligns best with the teacher's prediction shift (ShiftL1 0.3509, CosAgree 0.4361, BenefitCorr 0.3075), yet its QWK differences against no distillation, logit KD and feature KD are not statistically significant.",
      "Eksperimen utama menggunakan DRTiD dengan konfigurasi 384 × 384 *standard sampling*, sedangkan DeepDRiD Set-C digunakan untuk evaluasi eksternal. Model *teacher* ResNet-50 mencapai QWK 0,7364, sementara *student* CSD dengan 328.588 parameter memperoleh QWK 0,6018. Secara deskriptif, CSD menunjukkan keselarasan terbaik terhadap *prediction shift* milik *teacher*, dengan ShiftL1 0,3509, CosAgree 0,4361, dan BenefitCorr 0,3075. Namun, perbedaan QWK CSD terhadap NoDistill, Logit-KD, maupun Feature-KD tidak signifikan secara statistik.",
    ),
    l(
      "For deployment, QAT INT8 retains 98.96% of the FP32 student's QWK on the internal test set with a 0.9507 MB artifact and 11.347 ms CPU latency — about 162.1× smaller and 55.3× faster than the teacher. On Set-C the FP32 student retains 84.4% of the teacher's QWK, and among student variants PTQ gives the highest estimate. Better shift alignment is therefore not always accompanied by higher QWK. The efficiency results support further development of DR-VERGE for resource-constrained CPU settings, including health facilities in Indonesia's 3T regions, after on-device testing and prospective validation.",
      "Pada optimasi *deployment*, QAT INT8 mempertahankan 98,96% QWK *student* FP32 pada data uji internal, dengan ukuran artefak 0,9507 MB dan latensi CPU 11,347 ms — sekitar 162,1× lebih kecil dan 55,3× lebih cepat dibandingkan *teacher*. Pada DeepDRiD Set-C, *student* FP32 mempertahankan 84,4% QWK *teacher*, dan di antara varian *student*, PTQ menghasilkan estimasi QWK tertinggi. Dengan demikian, keselarasan *prediction shift* yang lebih baik tidak selalu disertai QWK yang lebih tinggi. Hasil efisiensi ini mendukung pengembangan lebih lanjut DR-VERGE pada lingkungan CPU dengan sumber daya terbatas, termasuk fasilitas layanan kesehatan di wilayah 3T, setelah pengujian pada perangkat target dan validasi prospektif.",
    ),
  ],
} as const;

export const researchQuestions = [
  {
    id: "RQ1",
    label: "RQ1",
    topic: l("Knowledge Transfer", "Transfer Pengetahuan"),
    question: l(
      "To what extent can Complementarity-Shift Distillation transfer the teacher's dual-view ordinal decision-shift structure to a lightweight student compared with no distillation, logit KD, and feature KD?",
      "Sejauh mana *Complementarity-Shift Distillation* dapat mentransfer struktur pergeseran keputusan ordinal *dual-view* milik *teacher* ke *lightweight student*, dibandingkan dengan tanpa distilasi, *logit* KD, dan *feature* KD?",
    ),
    judgedOn: [
      l(
        "Quadratic Weighted Kappa as the primary grading metric",
        "*Quadratic Weighted Kappa* sebagai metrik utama *grading*",
      ),
      l(
        "Shift fidelity: ShiftL1, cosine agreement, benefit correlation",
        "*Shift fidelity*: ShiftL1, *cosine agreement*, *benefit correlation*",
      ),
    ],
  },
  {
    id: "RQ2",
    label: "RQ2",
    topic: l("Efficiency", "Efisiensi"),
    question: l(
      "To what extent can INT8 post-training quantization and quantization-aware training improve computational efficiency while preserving the grading performance of the selected lightweight dual-view model?",
      "Sejauh mana *post-training quantization* dan *quantization-aware training* INT8 dapat meningkatkan efisiensi komputasi sambil mempertahankan performa *grading* model *dual-view* ringan yang terpilih?",
    ),
    judgedOn: [
      l(
        "Model size and single-thread CPU inference latency",
        "Ukuran model dan latensi inferensi CPU *single-thread*",
      ),
      l(
        "Retention of ordinal grading performance relative to FP32",
        "Retensi performa *grading* ordinal relatif terhadap FP32",
      ),
    ],
  },
] as const;

export const researchGap = {
  existing: [
    {
      title: l("Single-view retinal grading", "*Grading* retina *single-view*"),
      body: l(
        "Most automated DR grading operates on one fundus field per eye.",
        "Sebagian besar *grading* DR otomatis bekerja pada satu *field* fundus per mata.",
      ),
    },
    {
      title: l("Multi-view fusion", "Fusi *multi-view*"),
      body: l(
        "Prior work fuses multiple retinal fields to improve prediction.",
        "Penelitian terdahulu memfusikan beberapa *field* retina untuk meningkatkan prediksi.",
      ),
    },
    {
      title: l("Knowledge distillation", "*Knowledge distillation*"),
      body: l(
        "Established methods transfer final logits or intermediate feature representations.",
        "Metode yang sudah mapan mentransfer *logit* akhir atau representasi fitur antara.",
      ),
    },
    {
      title: l("Medical model compression", "Kompresi model medis"),
      body: l(
        "Quantization and pruning are widely applied to medical image classifiers.",
        "Kuantisasi dan *pruning* banyak diterapkan pada pengklasifikasi citra medis.",
      ),
    },
  ],
  question: l(
    "Can the change in ordinal decision produced by combining two anatomical views itself be distilled?",
    "Dapatkah perubahan keputusan ordinal yang muncul ketika dua *view* anatomis digabungkan didistilasi secara langsung?",
  ),
  // Careful novelty wording. Never "the first ever".
  novelty: l(
    "Based on the literature reviewed in this study, we did not identify prior work explicitly distilling this dual-view cumulative ordinal decision-shift signal into a lightweight student.",
    "Berdasarkan literatur yang dikaji dalam penelitian ini, kami tidak menemukan penelitian terdahulu yang secara eksplisit mendistilasi sinyal pergeseran keputusan ordinal kumulatif *dual-view* ini ke dalam *lightweight student*.",
  ),
} as const;

export const csdExplanation = {
  intro: l(
    "Traditional knowledge distillation primarily transfers final predictions or feature representations. DR-VERGE investigates whether the change in ordinal decision produced by combining two views can itself be transferred from a teacher model to a lightweight student.",
    "*Knowledge distillation* konvensional terutama mentransfer prediksi akhir atau representasi fitur. DR-VERGE meneliti apakah perubahan keputusan ordinal yang muncul ketika dua *view* digabungkan dapat ditransfer secara langsung dari model *teacher* ke *lightweight student*.",
  ),
  // Never claim the method "understands" anatomy.
  claim: l(
    "CSD explicitly transfers the teacher's dual-view ordinal decision-shift pattern.",
    "CSD secara eksplisit mentransfer pola pergeseran keputusan ordinal *dual-view* milik *teacher*.",
  ),
  deltaMeaning: l(
    "Delta operationally represents the cumulative ordinal decision shift between the interactive dual-view prediction and an aggregated single-view baseline.",
    "Secara operasional, Δ merepresentasikan pergeseran keputusan ordinal kumulatif antara prediksi *dual-view* yang interaktif dan *baseline* agregasi *single-view*.",
  ),
  steps: [
    {
      label: l("Individual-view evidence", "Bukti *individual-view*"),
      body: l(
        "The model predicts from the macula view and the optic-disc view separately.",
        "Model memprediksi dari *view* makula dan *view* diskus optik secara terpisah.",
      ),
    },
    {
      label: l("Dual-view evidence", "Bukti *dual-view*"),
      body: l(
        "The model predicts from both views fused together.",
        "Model memprediksi dari kedua *view* yang difusikan bersama.",
      ),
    },
    {
      label: l("Decision shift", "Pergeseran keputusan"),
      body: l(
        "The difference between the two is the complementarity shift.",
        "Selisih keduanya adalah *complementarity shift*.",
      ),
    },
    {
      label: l("Teacher to student transfer", "Transfer dari *teacher* ke *student*"),
      body: l(
        "CSD trains the student to reproduce the teacher's shift.",
        "CSD melatih *student* untuk mereproduksi pergeseran milik *teacher*.",
      ),
    },
  ],
  formulas: [
    {
      lhs: "p_agg",
      superscript: "T",
      rhs: "( p_macula + p_disc ) / 2",
      note: l("Aggregated single-view baseline", "*Baseline* agregasi *single-view*"),
    },
    {
      lhs: "Δ",
      superscript: "T",
      rhs: "p_dual − p_agg",
      note: l("Teacher's complementarity shift", "*Complementarity shift* milik *teacher*"),
    },
    {
      lhs: "Δ",
      superscript: "S",
      rhs: "p_dual − p_agg",
      note: l("Student's complementarity shift", "*Complementarity shift* milik *student*"),
    },
    {
      lhs: "L_CSD",
      superscript: "",
      rhs: "SmoothL1( Δ_S / s , Δ_T / s )",
      note: l(
        "The distillation objective, with a fixed global scale s",
        "Fungsi objektif distilasi, dengan skala global tetap s",
      ),
    },
  ],
} as const;

export const methodStages = [
  {
    title: l("Macula + Optic Disc", "Makula + Diskus Optik"),
    body: l("Two complementary fundus fields per eye.", "Dua *field* fundus yang saling melengkapi per mata."),
  },
  {
    title: l("Shared Encoder", "*Shared Encoder*"),
    body: l("One backbone processes both views.", "Satu *backbone* memproses kedua *view*."),
  },
  {
    title: l("Interaction Fusion", "*Interaction Fusion*"),
    body: l(
      "Concatenation, absolute difference, and element-wise product, then a normalised MLP.",
      "Konkatenasi, selisih absolut, dan perkalian *element-wise*, lalu MLP yang dinormalisasi.",
    ),
  },
  {
    title: l("CORAL Ordinal Head", "*Head* Ordinal CORAL"),
    body: l(
      "Four monotone cumulative thresholds; the grade is the count of thresholds passed.",
      "Empat ambang kumulatif yang monoton; *grade* adalah jumlah ambang yang terlampaui.",
    ),
  },
  {
    title: l("Knowledge Transfer", "Transfer Pengetahuan"),
    body: l(
      "Logit KD, feature KD, and Complementarity-Shift Distillation.",
      "*Logit* KD, *feature* KD, dan *Complementarity-Shift Distillation*.",
    ),
  },
  {
    title: l("Lightweight Student", "*Lightweight Student*"),
    body: l(
      "A roughly 328K-parameter dual-view network.",
      "Jaringan *dual-view* dengan sekitar 328 ribu parameter.",
    ),
  },
  {
    title: l("PTQ / QAT", "PTQ / QAT"),
    body: l(
      "INT8 quantization under a matched operator scope.",
      "Kuantisasi INT8 dengan cakupan operator yang setara.",
    ),
  },
  {
    title: l("Deployment", "*Deployment*"),
    body: l("A CPU-ready INT8 artifact.", "Artefak INT8 yang siap dijalankan di CPU."),
  },
] as const;

export const sdgContent = {
  number: "03",
  title: l("Good Health and Well-Being", "Kehidupan Sehat dan Sejahtera"),
  un: l(
    "Ensure healthy lives and promote well-being for all at all ages.",
    "Menjamin kehidupan yang sehat dan meningkatkan kesejahteraan seluruh penduduk semua usia.",
  ),
  intro: l(
    "Diabetic retinopathy is a leading cause of preventable vision loss, and early detection is the intervention that matters most. DR-VERGE is positioned as research toward making that detection more accessible.",
    "Retinopati diabetik merupakan salah satu penyebab utama kehilangan penglihatan yang sebenarnya dapat dicegah, dan deteksi dini adalah intervensi yang paling menentukan. DR-VERGE diposisikan sebagai penelitian untuk membuat deteksi tersebut lebih mudah diakses.",
  ),
  // "Potential contribution", never "proven impact".
  points: [
    {
      title: l("Early screening research", "Penelitian skrining dini"),
      body: l(
        "Ordinal grading research aimed at the stages where intervention is most effective.",
        "Penelitian *grading* ordinal yang menyasar tahap ketika intervensi paling efektif.",
      ),
    },
    {
      title: l("Accessibility of AI-assisted analysis", "Aksesibilitas analisis berbantuan AI"),
      body: l(
        "A ~328K-parameter model that grades an eye on a CPU in about eleven milliseconds does not require specialised hardware.",
        "Model dengan ~328 ribu parameter yang menilai satu mata di CPU dalam sekitar sebelas milidetik tidak memerlukan perangkat keras khusus.",
      ),
    },
    {
      title: l("Resource-constrained environments", "Lingkungan dengan sumber daya terbatas"),
      body: l(
        "Lower computational requirements are a precondition for research deployment where GPUs are unavailable.",
        "Kebutuhan komputasi yang lebih rendah merupakan prasyarat bagi *deployment* penelitian di tempat yang tidak memiliki GPU.",
      ),
    },
    {
      title: l("Reducing technological barriers", "Mengurangi hambatan teknologi"),
      body: l(
        "Efficiency research lowers the infrastructure needed to study AI-assisted screening.",
        "Penelitian efisiensi menurunkan kebutuhan infrastruktur untuk mengkaji skrining berbantuan AI.",
      ),
    },
  ],
  caution: l(
    "DR-VERGE is a research prototype and is not a replacement for ophthalmologists or professional medical diagnosis. This work describes a potential contribution toward SDG 3, not a demonstrated improvement in health outcomes.",
    "DR-VERGE adalah prototipe penelitian dan bukan pengganti dokter spesialis mata maupun diagnosis medis profesional. Penelitian ini menggambarkan potensi kontribusi terhadap SDG 3, bukan peningkatan luaran kesehatan yang telah terbukti.",
  ),
} as const;

export const challenges = [
  {
    number: "01",
    title: l("Limited View", "Cakupan Terbatas"),
    body: l(
      "A single fundus field may not capture all relevant retinal information. Lesions outside the imaged region are simply not available to the model.",
      "Satu *field* fundus mungkin tidak menangkap seluruh informasi retina yang relevan. Lesi di luar area yang terpotret sama sekali tidak tersedia bagi model.",
    ),
  },
  {
    number: "02",
    title: l("Heavy Models", "Model yang Berat"),
    body: l(
      "Powerful deep-learning models may be computationally expensive for resource-constrained environments where screening is most needed.",
      "Model *deep learning* yang andal dapat memerlukan biaya komputasi yang tinggi bagi lingkungan dengan sumber daya terbatas, padahal di sanalah skrining paling dibutuhkan.",
    ),
  },
  {
    number: "03",
    title: l("Ordinal Severity", "Keparahan Ordinal"),
    body: l(
      "DR grades are ordered 0 → 1 → 2 → 3 → 4. Confusing Grade 0 with Grade 4 is a far worse error than confusing Grade 2 with Grade 3, and the metric must reflect that.",
      "*Grade* DR berurutan 0 → 1 → 2 → 3 → 4. Tertukarnya *Grade* 0 dengan *Grade* 4 adalah kesalahan yang jauh lebih fatal daripada tertukarnya *Grade* 2 dengan *Grade* 3, dan metrik yang digunakan harus mencerminkan hal itu.",
    ),
  },
] as const;

export const viewComparison = {
  macula: {
    label: l("Macula-Centered View", "*View* Berpusat Makula"),
    number: "01",
    body: l(
      "Centred on the macula, the region of the retina responsible for detailed central vision. This is the field most single-view DR grading systems use.",
      "Berpusat pada makula, yaitu area retina yang berperan dalam penglihatan sentral yang detail. *Field* inilah yang digunakan oleh sebagian besar sistem *grading* DR *single-view*.",
    ),
    captures: [
      l("Central retinal region", "Area retina sentral"),
      l("Macular changes", "Perubahan pada makula"),
      l("Central lesion burden", "Beban lesi sentral"),
    ],
  },
  disc: {
    label: l("Optic-Disc-Centered View", "*View* Berpusat Diskus Optik"),
    number: "02",
    body: l(
      "Centred on the optic disc, capturing complementary anatomical information around the optic nerve head and the surrounding retina.",
      "Berpusat pada diskus optik, menangkap informasi anatomis pelengkap di sekitar kepala saraf optik dan retina di sekelilingnya.",
    ),
    captures: [
      l("Optic nerve head region", "Area kepala saraf optik"),
      l("Peripapillary retina", "Retina peripapiler"),
      l("Complementary retinal territory", "Area retina pelengkap"),
    ],
  },
  thesis: l(
    "DR-VERGE learns what changes when both views are considered together.",
    "DR-VERGE mempelajari apa yang berubah ketika kedua *view* dipertimbangkan bersama.",
  ),
} as const;
