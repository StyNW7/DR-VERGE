import { useState } from "react";
import { Linkedin, Github, UserRound } from "lucide-react";
import { Section } from "@/components/layout/PageContainer";
import { SectionHeader, Reveal, Divider } from "@/components/common/Primitives";
import { team, advisors, initialsOf, type TeamMember } from "@/data/team";
import { siteConfig } from "@/config/siteConfig";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

function Avatar({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false);
  const { ts } = useI18n();
  const showImage = member.image && !failed;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface">
      {showImage ? (
        <img
          src={member.image as string}
          alt={ts(`Portrait of ${member.name}`, `Foto ${member.name}`)}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          // Grayscale by default, colour on hover: keeps the page monochrome
          // while still letting a real photo be seen properly.
          className="h-full w-full object-cover grayscale transition-all duration-500 ease-editorial group-hover:grayscale-0 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {member.placeholder ? (
            <UserRound className="h-8 w-8 text-subtle" aria-hidden="true" />
          ) : (
            <span className="mono text-2xl font-semibold text-muted-foreground">
              {initialsOf(member.name)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const hasLinks = Boolean(member.linkedin || member.github);
  const { t, ts, tr } = useI18n();

  return (
    <div
      className={cn(
        "group flex h-full flex-col card-premium p-5 transition-colors duration-300",
        member.placeholder ? "border-dashed" : "hover:border-foreground/40",
      )}
    >
      <Avatar member={member} />

      <div className="mt-5 flex flex-1 flex-col">
        <h3
          className={cn(
            "text-base font-bold leading-tight tracking-tight",
            member.placeholder && "text-muted-foreground",
          )}
        >
          {member.name}
        </h3>
        <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
          {tr(member.role)}
        </p>
        <p className="mt-1 text-[11px] text-subtle">{member.institution}</p>

        <div className="mt-auto pt-5">
          {member.placeholder ? (
            // Never invent a person. An unfilled slot says so.
            <span className="mono text-[9px] uppercase tracking-[0.14em] text-subtle">
              {t("Awaiting team details", "Menunggu data anggota tim")}
            </span>
          ) : hasLinks ? (
            <div className="flex items-center gap-2">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ts(`${member.name} on LinkedIn`, `${member.name} di LinkedIn`)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ts(`${member.name} on GitHub`, `${member.name} di GitHub`)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Github className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const { t, pick } = useI18n();
  return (
    <Section id="team">
      <SectionHeader
        eyebrow={t("The Team", "Tim Peneliti")}
        index="09"
        title={pick(
          <>
            Built for <em>{siteConfig.competition}</em>
          </>,
          <>
            Dibangun untuk <em>{siteConfig.competition}</em>
          </>,
        )}
        description={t(
          `Research, engineering, and evaluation for ${siteConfig.projectName} at ${siteConfig.institution}.`,
          `Riset, rekayasa, dan evaluasi ${siteConfig.projectName} di ${siteConfig.institution}.`,
        )}
        size="lg"
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.07}>
            <MemberCard member={m} />
          </Reveal>
        ))}
      </div>

      {advisors.length > 0 && (
        <>
          <Divider label={t("Faculty Advisor", "Dosen Pembimbing")} className="mt-16" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {advisors.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.07}>
                <MemberCard member={a} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
