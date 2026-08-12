/**
 * Team and advisor data.
 *
 * Entries whose `placeholder` flag is true render as clearly-marked open slots
 * rather than as invented people. Fill in the real names and remove the flag —
 * no component change is needed. Nothing here is fabricated.
 */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
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
    role: "Team Leader · AI & Model Development",
    institution: "BINUS University",
    image: "/Images/stanley.png",
    linkedin: "https://www.linkedin.com/in/stanley-nathanael-wijaya/",
    github: "https://github.com/StyN-w",
  },
  {
    id: "member-2",
    name: "Seline Loewel",
    role: "Research & Experimentation",
    institution: "BINUS University",
    image: null,
    linkedin: null,
    github: null,
  },
  {
    id: "member-3",
    name: "Ahmad Hamra",
    role: "Research & Documentation",
    institution: "BINUS University",
    image: null,
    linkedin: null,
    github: null,
  },
];

export const advisors: TeamMember[] = [
  {
    id: "advisor-1",
    name: "Nikita Ananda Putri Masaling",
    role: "Research Advisor",
    institution: "BINUS University",
    image: null,
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
