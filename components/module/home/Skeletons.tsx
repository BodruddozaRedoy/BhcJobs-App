import { View } from "react-native";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Placeholders for the three home sections, while their endpoints answer.
 *
 * Each one mirrors the card it stands in for — same `h-36`, same rounded border,
 * blocks roughly where the real text and images land. That is the whole point of a
 * skeleton over a spinner: it reserves the space the content will occupy, so the
 * page does not lurch when the data arrives.
 *
 * Counts are chosen to fill about the same height as the collapsed section rather
 * than to match its item count exactly — two rows is enough to read as "a grid is
 * coming", and more would just be a taller thing to throw away.
 */

/** Cards in the two-column grid placeholders. Two rows. */
const GRID_ROWS = 4;

/** Job cards are tall; two is already most of a screen. */
const JOB_ROWS = 2;

/** Shared frame for the square grid cards, matching `IndustryCard`/`CompanyCard`. */
function GridCardFrame({ children }: { children: React.ReactNode }) {
  return (
    <View className="w-[48%]">
      <View className="h-36 items-center justify-center rounded-2xl border border-slate-100 bg-white px-3 dark:border-gray-700 dark:bg-element-dark">
        {children}
      </View>
    </View>
  );
}

function GridSkeleton({ round }: { round: boolean }) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {Array.from({ length: GRID_ROWS }, (_, index) => (
        <GridCardFrame key={index}>
          {/* The mark: a circle for companies (which sit in a ring), a square for
              industries (which are bare icons). */}
          <Skeleton className={round ? "h-14 w-14 rounded-full" : "h-9 w-9 rounded-md"} />
          {/* Name, then the "N Available Jobs" line. */}
          <Skeleton className="mt-3 h-3.5 w-20 rounded" />
          <Skeleton className="mt-2 h-3 w-14 rounded" />
        </GridCardFrame>
      ))}
    </View>
  );
}

export function IndustryGridSkeleton() {
  return <GridSkeleton round={false} />;
}

export function CompanyGridSkeleton() {
  return <GridSkeleton round />;
}

export function JobListSkeleton() {
  return (
    <View className="gap-4">
      {Array.from({ length: JOB_ROWS }, (_, index) => (
        <View
          key={index}
          className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-gray-700 dark:bg-element-dark"
        >
          {/* Title, centred over two lines like the real card. */}
          <Skeleton className="h-5 w-3/4 self-center rounded" />

          {/* Logo + company name. */}
          <View className="mt-4 flex-row items-center">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="ml-3 h-4 flex-1 rounded" />
          </View>

          {/* The salary/food panel. */}
          <Skeleton className="mt-4 h-16 w-full rounded-xl" />

          {/* Two tag chips. */}
          <View className="mt-4 flex-row gap-2">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </View>

          {/* The View / Apply row. */}
          <View className="mt-4 flex-row gap-3">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
          </View>
        </View>
      ))}
    </View>
  );
}
