import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The project's own text sizes (`text-13`, `text-display-md`, …). Without
// this, tailwind-merge reads `text-13` as a colour and silently drops it when
// it meets `text-muted-foreground` in the same `cn()` call.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["10", "11", "12", "13", "14", "15", "display-sm", "display-md", "display-lg", "display-xl"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
