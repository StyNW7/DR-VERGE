import { Info, Check, Cpu, Layers, Binary, Timer, Boxes, ScanEye, X, Equal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InferenceResult } from "@/services/inferenceApi";
import {
  getGrade,
  gradeText,
  ordinalThresholdLabels,
  GRADE_CONSULT_NOTE_L,
} from "@/data/drGrades";
import { DISCLAIMER_SCORES } from "@/data/researchMetrics";
import { OrdinalScale } from "@/components/common/Diagrams";
import { Callout, ScoreBar, Badge } from "@/components/common/Primitives";
import { clamp01, formatMs, formatScore, formatTimestamp } from "@/utils/formatting";
import { useI18n } from "@/i18n/context";
import { gradeTone } from "@/lib/gradeTone";

/** The grade name in the reader's language, falling back to the API's own name. */
function useGradeName(result: InferenceResult): string {
  const { lang } = useI18n();
  const grade = getGrade(result.grade);
  return grade ? gradeText(grade, lang).name : result.gradeName;
}

/* -------------------------------------------------------------------------- */
/* Output hero                                                                 */
/* -------------------------------------------------------------------------- */

export function OutputHero({ result }: { result: InferenceResult }) {
  const { t, lang } = useI18n();
  const grade = getGrade(result.grade);
  const gradeName = useGradeName(result);
  const maxGrade = 4;

  return (
    <div className="print-block card-premium overflow-hidden">
      <div className="grid gap-px bg-border md:grid-cols-5">
        {/* The grade itself */}
        <div
          className={cn(
            "grain inverse relative flex flex-col justify-between p-8 md:col-span-2 sm:p-10",
          )}
        >
          {/* Colourful palette: a severity-coloured band names the grade at a glance. */}
          <span
            className={cn(
              "absolute inset-x-0 top-0 hidden h-1.5 colorful:block",
              gradeTone(result.grade).dot,
            )}
            aria-hidden="true"
          />
          <div>
            <span className="mono text-11 uppercase tracking-[0.16em] opacity-60">
              {t("Predicted DR Grade", "Prediksi *Grade* DR")}
            </span>
            {/* "0 / 4" rather than "00": the position on the scale is the
                point, and a lone double zero reads as a code, not a grade. */}
            <div className="display mt-5 flex items-baseline text-[clamp(4.5rem,18vw,8rem)] leading-[0.82]">
              {result.grade}
              <span className="ml-3 text-[0.3em] font-semibold tracking-normal opacity-60">/ {maxGrade}</span>
            </div>
          </div>
          <div className="mt-7">
            <div className="text-xl font-bold tracking-tight sm:text-2xl">{gradeName}</div>
            <div className="mono mt-2 text-11 uppercase tracking-[0.14em] opacity-60">
              {t(`Grade ${result.grade} of ${maxGrade}`, `Grade ${result.grade} dari ${maxGrade}`)}
            </div>
          </div>
        </div>

        {/* Ordinal position */}
        <div className="flex flex-col justify-center gap-8 bg-card p-8 md:col-span-3 sm:p-10">
          <div>
            <span className="eyebrow">{t("Ordinal Severity", "Keparahan Ordinal")}</span>
            <p className="mt-3 text-14 leading-relaxed text-muted-foreground">
              {t(
                "DR grades are ordered. The position on this scale carries meaning — an error of one grade is not the same as an error of three.",
                "*Grade* DR bersifat berurutan. Posisi pada skala ini bermakna — kesalahan satu tingkat tidak sama dengan kesalahan tiga tingkat.",
              )}
            </p>
          </div>

          <OrdinalScale active={result.grade} />

          {grade && (
            <div className="border-t border-border pt-6">
              <p className="text-14 leading-relaxed text-muted-foreground">
                {gradeText(grade, lang).detail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ordinal threshold scores                                                    */
/* -------------------------------------------------------------------------- */

export function OrdinalThresholdScores({ result }: { result: InferenceResult }) {
  const { t, tr, lang } = useI18n();
  const title = t("Ordinal Threshold Scores", "Skor Ambang Ordinal");

  if (result.ordinalScores.length === 0) {
    return (
      <SectionCard title={title} icon={Layers}>
        <EmptyNote>
          {t(
            "The inference service did not return cumulative threshold scores for this request.",
            "Layanan inferensi tidak mengembalikan skor ambang kumulatif untuk permintaan ini.",
          )}
        </EmptyNote>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={title}
      icon={Layers}
      description={t(
        "DR-VERGE models DR grading through four cumulative ordinal decision thresholds. The predicted grade is the number of thresholds the model passes.",
        "DR-VERGE memodelkan *grading* DR melalui empat ambang keputusan ordinal kumulatif. *Grade* yang diprediksi adalah jumlah ambang yang dilampaui model.",
      )}
    >
      <div className="flex flex-col gap-5">
        {result.ordinalScores.map((score, i) => {
          const meta = ordinalThresholdLabels[i];
          const value = clamp01(score);
          // A threshold "passed" at the conventional 0.5 operating point.
          const passed = score > 0.5;

          return (
            <div key={i} className="print-block">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="mono whitespace-nowrap text-sm font-semibold">
                    {meta?.key ?? `P(Y > ${i})`}
                  </span>
                  <span className="text-12 text-muted-foreground">
                    {meta ? tr(meta.meaning) : null}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {passed && (
                    <span className="brand-fill mono rounded-full px-2 py-0.5 text-10 uppercase tracking-[0.14em]">
                      {t("passed", "terlampaui")}
                    </span>
                  )}
                  <span className="mono text-sm font-semibold tabular-nums">
                    {formatScore(score, 4, lang)}
                  </span>
                </div>
              </div>
              <ScoreBar value={value} emphasis={passed} />
            </div>
          );
        })}
      </div>

      <ThresholdCount scores={result.ordinalScores} grade={result.grade} />

      <Callout tone="note" className="mt-auto">
        {tr(DISCLAIMER_SCORES)}
      </Callout>
    </SectionCard>
  );
}

/**
 * The counting rule made visible: one tile per threshold, ticked when it is
 * passed, and the total — which *is* the grade.
 */
function ThresholdCount({ scores, grade }: { scores: number[]; grade: number }) {
  const { t } = useI18n();
  const passed = scores.filter((s) => s > 0.5).length;

  return (
    <div className="my-7 rounded-xl border border-border bg-surface/70 p-4 colorful:border-brand-line/70 colorful:bg-brand-soft/50">
      <div className="mb-3 text-12 font-medium text-muted-foreground">
        {t("How the grade is counted", "Cara *grade* dihitung")}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {scores.map((s, i) => {
          const ok = s > 0.5;
          return (
            <span
              key={i}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border",
                ok ? "brand-fill border-transparent" : "border-dashed border-border-strong bg-card text-subtle",
              )}
              title={`P(Y > ${i})`}
            >
              {ok ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
          );
        })}
        <Equal className="mx-1 h-4 w-4 text-subtle" aria-hidden="true" />
        <span
          className={cn(
            "inline-flex h-9 items-center rounded-lg bg-foreground px-3 text-sm font-bold text-background",
            gradeTone(grade).fill,
          )}
        >
          Grade {grade}
        </span>
      </div>
      {/* Only claimed when it holds — a service with another operating point
          would otherwise be described wrongly. */}
      {passed === grade && (
        <p className="mt-3 text-12 leading-relaxed text-muted-foreground">
          {t(
            `${passed} of ${scores.length} thresholds passed at 0.5, so the predicted grade is ${grade}.`,
            `${passed} dari ${scores.length} ambang terlampaui pada 0,5, sehingga *grade* prediksinya ${grade}.`,
          )}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Relative grade scores                                                       */
/* -------------------------------------------------------------------------- */

export function RelativeGradeScores({ result }: { result: InferenceResult }) {
  const { t, lang } = useI18n();
  if (result.gradeScores.length === 0) return null;

  const max = Math.max(...result.gradeScores);

  return (
    <SectionCard
      title={t("Relative Grade Scores", "Skor Relatif per *Grade*")}
      icon={Boxes}
      // NOT "probability distribution" — the API has not declared calibration.
      description={t(
        "Relative score assigned to each of the five ordinal grades. These are model outputs, not calibrated probabilities. The predicted grade comes from the threshold count, so it is not necessarily the grade with the largest score here.",
        "Skor relatif untuk masing-masing dari lima *grade* ordinal. Skor ini adalah keluaran model, bukan probabilitas terkalibrasi. *Grade* yang diprediksi berasal dari jumlah ambang yang terlampaui, sehingga belum tentu sama dengan *grade* yang skornya paling besar di sini.",
      )}
    >
      <div className="flex flex-col gap-4">
        {result.gradeScores.map((score, g) => {
          const info = getGrade(g);
          const isPredicted = g === result.grade;
          return (
            <div key={g} className="print-block">
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={cn("hidden h-2.5 w-2.5 self-center rounded-full colorful:block", gradeTone(g).dot)}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "mono whitespace-nowrap text-sm",
                      isPredicted ? "font-bold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    Grade {g}
                  </span>
                  <span className="text-12 text-muted-foreground">
                    {info ? gradeText(info, lang).name : ""}
                  </span>
                  {isPredicted && (
                    <span className="brand-fill mono rounded-full px-2 py-0.5 text-10 uppercase tracking-[0.14em]">
                      {t("predicted", "prediksi")}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "mono text-sm tabular-nums",
                    isPredicted ? "font-bold" : "text-muted-foreground",
                  )}
                >
                  {formatScore(score, 4, lang)}
                </span>
              </div>
              {/* Scaled to the largest score so the shape is readable even when
                  every value is small. */}
              <ScoreBar value={max > 0 ? score / max : 0} emphasis={isPredicted} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Dual-view input summary                                                     */
/* -------------------------------------------------------------------------- */

export function DualViewSummary({
  maculaName,
  discName,
}: {
  maculaName: string;
  discName: string;
}) {
  const { t } = useI18n();
  const rows = [
    { label: t("Macula View", "Citra Makula"), value: maculaName },
    { label: t("Optic Disc View", "Citra Diskus Optik"), value: discName },
    { label: t("Dual-View Fusion", "Fusi *Dual-View*"), value: t("Completed", "Selesai") },
  ];

  return (
    <SectionCard title={t("Dual-View Input Summary", "Ringkasan Masukan *Dual-View*")} icon={ScanEye}>
      <ul className="flex flex-col gap-px overflow-hidden rounded-xl border border-border bg-border">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center justify-between gap-4 bg-card px-4 py-3.5">
            <span className="flex items-center gap-3 text-13 font-medium">
              <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground colorful:text-brand" aria-hidden="true" />
              {r.label}
            </span>
            <span className="truncate text-12 text-muted-foreground">{r.value}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-14 leading-relaxed text-muted-foreground">
        {t(
          "Both views are jointly processed by DR-VERGE. The final grade is produced from their fused representation, not from either view alone.",
          "Kedua citra diproses bersama oleh DR-VERGE. *Grade* akhir dihasilkan dari representasi gabungan keduanya, bukan dari salah satu citra saja.",
        )}
      </p>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Model information                                                           */
/* -------------------------------------------------------------------------- */

export function ModelInformation({ result }: { result: InferenceResult }) {
  const { t, lang } = useI18n();
  const rows = [
    { label: t("Model", "Model"), value: result.model.name, icon: Cpu },
    {
      label: t("Architecture", "Arsitektur"),
      value: t("Lightweight Dual-View Student", "*Lightweight Dual-View Student*"),
      icon: Layers,
    },
    {
      label: t("Task", "Tugas"),
      value: t("5-Class Ordinal DR Grading", "*Grading* DR Ordinal 5 Kelas"),
      icon: Boxes,
    },
    { label: t("Input", "Masukan"), value: t("Macula + Optic Disc", "Makula + Diskus Optik"), icon: ScanEye },
    { label: t("Variant", "Varian"), value: result.model.variant ?? "—", icon: Binary },
    { label: t("Quantization", "Kuantisasi"), value: result.model.quantization ?? "—", icon: Binary },
    {
      label: t("Inference Runtime", "Waktu Inferensi"),
      value: result.latencyMs !== null ? formatMs(result.latencyMs, 2, lang) : "—",
      icon: Timer,
    },
    { label: t("Model Version", "Versi Model"), value: result.model.version ?? "—", icon: Info },
  ];

  return (
    <SectionCard title={t("Model Information", "Informasi Model")} icon={Cpu}>
      <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
        {rows.map((r, i) => (
          <div key={i} className="bg-card px-4 py-3.5">
            <dt className="mono text-11 uppercase tracking-[0.14em] text-subtle colorful:text-brand">{r.label}</dt>
            <dd className="mt-1 truncate text-13 font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mono mt-5 flex flex-wrap gap-x-6 gap-y-1 text-11 uppercase tracking-[0.12em] text-subtle">
        <span>
          {t("Round trip", "Waktu total")} {formatMs(result.clientElapsedMs, 0, lang)}
        </span>
        <span>{formatTimestamp(new Date(result.receivedAt), lang)}</span>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Interpretation                                                              */
/* -------------------------------------------------------------------------- */

export function ResultInterpretation({ result }: { result: InferenceResult }) {
  const { t, tr, lang } = useI18n();
  const grade = getGrade(result.grade);
  if (!grade) return null;
  const copy = gradeText(grade, lang);

  return (
    <SectionCard title={t("Result Interpretation", "Interpretasi Hasil")} icon={Info}>
      <div className="flex flex-col gap-4">
        <div>
          <Badge tone="solid" className={gradeTone(grade.grade).fill}>
            {copy.name}
          </Badge>
          <p className="mt-4 text-14 leading-relaxed text-foreground">{copy.description}</p>
          <p className="mt-3 text-14 leading-relaxed text-muted-foreground">{copy.detail}</p>
        </div>

        {/* No treatment advice, no urgency instruction — only this. */}
        <Callout tone="medical" title={t("Clinical interpretation", "Interpretasi klinis")}>
          {tr(GRADE_CONSULT_NOTE_L)}{" "}
          {t(
            "This output is a research artifact produced by a prototype model and is not a diagnosis, a screening result, or a basis for any medical decision.",
            "Keluaran ini adalah artefak penelitian yang dihasilkan oleh model prototipe dan bukan diagnosis, bukan hasil skrining, serta bukan dasar untuk keputusan medis apa pun.",
          )}
        </Callout>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared shell                                                                */
/* -------------------------------------------------------------------------- */

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="print-block card-premium flex flex-col p-6 sm:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface colorful:border-brand-line colorful:bg-brand-soft">
            <Icon className="h-4 w-4 text-foreground/70 colorful:text-brand" aria-hidden="true" />
          </span>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
        </div>
        {/* Full width under the heading: beside the icon it was squeezed into
            a narrow column on phones. */}
        {description && (
          <p className="mt-3 max-w-prose text-14 leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-13 text-muted-foreground">
      {children}
    </p>
  );
}
