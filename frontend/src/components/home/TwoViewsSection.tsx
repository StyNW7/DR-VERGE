import { Plus, ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal } from "@/components/common/Primitives";
import {
  FundusIllustration,
  DualFieldDiagram,
} from "@/components/common/FundusIllustration";
import { viewComparison } from "@/data/researchContent";
import { useI18n, type L } from "@/i18n/context";

/** Structural shape shared by both entries in `viewComparison`. `as const` in the
 *  data file makes each literal type its own, so the prop is described here. */
interface ViewInfo {
  label: L;
  number: string;
  body: L;
  captures: readonly L[];
}

function ViewCard({ view, variant }: { view: ViewInfo; variant: "macula" | "disc" }) {
  const { tr } = useI18n();
  return (
    <div className="group card-premium card-lift flex h-full flex-col p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="mono text-[11px] tracking-[0.16em] text-subtle">
            {view.number}
          </span>
          <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {tr(view.label)}
          </h3>
        </div>
      </div>

      <div className="mb-6 aspect-square w-full max-w-[260px] self-center text-foreground">
        <FundusIllustration variant={variant} showLabels />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{tr(view.body)}</p>

      <ul className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
        {view.captures.map((c) => (
          <li key={c.en} className="flex items-center gap-2.5 text-[13px] text-foreground">
            <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            {tr(c)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TwoViewsSection() {
  const { t, tr, pick } = useI18n();

  return (
    <Section id="two-views">
      <SectionHeader
        eyebrow={t("Why Two Views", "Mengapa Dua *View*")}
        index="02"
        title={pick(
          <>
            One eye, two <em>windows</em> onto the retina
          </>,
          <>
            Satu mata, dua <em>jendela</em> menuju retina
          </>,
        )}
        description={t(
          "Each capture is centred on a different anatomical landmark, so each contains retinal territory the other does not.",
          "Setiap citra berpusat pada penanda anatomis yang berbeda, sehingga masing-masing memuat area retina yang tidak dimiliki citra lainnya.",
        )}
        size="lg"
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2 md:gap-6">
        <Reveal>
          <ViewCard view={viewComparison.macula} variant="macula" />
        </Reveal>
        <Reveal delay={0.1}>
          <ViewCard view={viewComparison.disc} variant="disc" />
        </Reveal>
      </div>

      {/* Field overlap */}
      <Reveal delay={0.12}>
        <div className="mt-6 card-premium p-7 sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="mx-auto w-full max-w-md text-foreground">
              <DualFieldDiagram />
            </div>
            <div>
              <span className="eyebrow">{t("Complementarity", "Komplementaritas")}</span>
              <p className="mt-4 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {tr(viewComparison.thesis)}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {t(
                  "The two fields overlap, but not entirely. Where they overlap, the second view corroborates the first. Where they do not, it contributes retinal territory that a single-field model never sees. DR-VERGE studies the difference that second view makes to the prediction — and whether that difference can be taught to a smaller model.",
                  "Kedua *field* saling tumpang-tindih, tetapi tidak sepenuhnya. Pada area yang tumpang-tindih, *view* kedua menguatkan *view* pertama. Pada area yang tidak tumpang-tindih, *view* kedua menyumbang area retina yang tidak pernah dilihat oleh model *single-field*. DR-VERGE meneliti perbedaan yang dihasilkan *view* kedua terhadap prediksi — dan apakah perbedaan itu dapat diajarkan kepada model yang lebih kecil.",
                )}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Visual equation */}
      <Reveal delay={0.14}>
        <div className="mt-6 grain relative overflow-hidden rounded-2xl bg-foreground p-7 text-background sm:p-10">
          <span className="mono text-[10px] uppercase tracking-[0.18em] opacity-60">
            {t("The evidence path", "Alur bukti")}
          </span>
          <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <EquationTerm label={t("Macula View", "Citra Makula")} />
            <EquationOp icon={Plus} />
            <EquationTerm label={t("Optic Disc View", "Citra Diskus Optik")} />
            <EquationOp icon={ArrowRight} />
            <EquationTerm label={t("Dual-View Evidence", "Bukti *Dual-View*")} />
            <EquationOp icon={ArrowRight} />
            <EquationTerm label={t("Ordinal DR Grade", "*Grade* Ordinal DR")} emphasis />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function EquationTerm({ label, emphasis = false }: { label: React.ReactNode; emphasis?: boolean }) {
  return (
    <div
      className={
        "flex flex-1 items-center justify-center rounded-xl border px-4 py-4 text-center text-[13px] font-medium leading-tight sm:text-sm " +
        (emphasis
          ? "border-background bg-background text-foreground"
          : "border-background/25 text-background")
      }
    >
      {label}
    </div>
  );
}

function EquationOp({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="flex shrink-0 items-center justify-center py-1 sm:py-0">
      {/* Rotated on mobile because the equation stacks vertically there. */}
      <Icon className="h-4 w-4 rotate-90 opacity-50 sm:rotate-0" aria-hidden="true" />
    </div>
  );
}
