/**
 * Team and advisor data.
 *
 * Entries whose `placeholder` flag is true render as clearly-marked open slots
 * rather than as invented people. Fill in the real names and remove the flag —
 * no component change is needed. Nothing here is fabricated.
 */

import { l, type L } from "@/i18n/context";

export interface TeamMember {
  id: string;
  name: string;
  role: L;
  institution: string;
  /** Path under /public, or null to render monogram initials instead. */
  image: string | null;
  linkedin: string | null;
  github: string | null;
  /** True while this slot is awaiting real data. */
  placeholder?: boolean;
}

export const team: TeamMember[] = [
  {
    id: "member-1",
    name: "Stanley Nathanael Wijaya",
    role: l("Team Leader · AI & Model Development", "Ketua Tim · Pengembangan AI & Model"),
    institution: "BINUS University",
    image: "/Images/Stanley.jpg",
    linkedin: "https://www.linkedin.com/in/stanley-nathanael-wijaya/",
    github: "https://github.com/StyNW7",
  },
  {
    id: "member-2",
    name: "Seline Loewel",
    role: l("Research & Experimentation", "Riset & Eksperimen"),
    institution: "BINUS University",
    image: "/Images/Seline.jpeg",
    linkedin: null,
    github: null,
  },
  {
    id: "member-3",
    name: "Ahmad Hamra",
    role: l("Research & Documentation", "Riset & Dokumentasi"),
    institution: "BINUS University",
    image: "/Images/Hamra.jpeg",
    linkedin: null,
    github: null,
  },
];

export const advisors: TeamMember[] = [
  {
    id: "advisor-1",
    name: "Nikita Ananda Putri Masaling",
    role: l("Research Advisor", "Dosen Pembimbing"),
    institution: "BINUS University",
    image: "/Images/Nikita.jpg",
    linkedin: null,
    github: null,
  },
];

/** Initials for the monogram fallback when no photo is set. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
