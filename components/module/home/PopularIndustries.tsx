import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { IndustryCard } from "@/components/module/home/IndustryCard";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useIndustries } from "@/hooks/feature/home/use-industries";
import type { Industry } from "@/types/industry.types";

/** Cards shown before "Show more" is tapped. Four rows of two. */
const COLLAPSED_COUNT = 8;

export interface PopularIndustriesProps {
  onSelect?: (industry: Industry) => void;
}

/** Pill heading, matching the other home sections. */
function SectionHeading({ children }: { children: string }) {
  return (
    <View className="mb-6 self-center rounded-full bg-blue-50 px-6 py-2.5 dark:bg-element-dark">
      <Text className="text-base font-bold text-content dark:text-content-dark">{children}</Text>
    </View>
  );
}

/**
 * "Popular Industries" — a two-column grid, collapsed to eight cards.
 *
 * Laid out with a wrapping `View`, not a `FlatList`. The home screen is already one
 * vertical `ScrollView`, and a vertical `FlatList` inside it both warns and silently
 * loses virtualisation — given unbounded height it renders every row anyway. With a
 * list this size (ten rows on the dev API, and the endpoint takes no pagination)
 * there is nothing to virtualise, so the list machinery would be cost without
 * benefit.
 *
 * Cards are `w-[48%]` inside `justify-between`, which spaces the columns without a
 * gap value that would have to be subtracted from the widths by hand.
 */
export function PopularIndustries({ onSelect }: PopularIndustriesProps) {
  const { state, retry } = useIndustries();
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="px-4 py-10">
      <SectionHeading>Popular Industries</SectionHeading>

      {state.status === "loading" ? <Loader message="Loading industries…" /> : null}

      {state.status === "empty" ? (
        <Text className="py-8 text-center text-sm text-muted dark:text-muted-dark">
          No industries to show yet.
        </Text>
      ) : null}

      {state.status === "error" ? (
        <View className="items-center py-8">
          <Text className="text-center text-sm text-muted dark:text-muted-dark">
            {state.message}
          </Text>
          {/* Only offered when retrying could plausibly succeed — a button that is
              guaranteed to fail again is worse than none. */}
          {state.canRetry ? (
            <Button
              label="Try again"
              variant="secondary"
              size="sm"
              onPress={retry}
              className="mt-4"
            />
          ) : null}
        </View>
      ) : null}

      {state.status === "ready" ? (
        <IndustryGrid industries={state.industries} expanded={expanded} onSelect={onSelect} />
      ) : null}

      {state.status === "ready" && state.industries.length > COLLAPSED_COUNT ? (
        <ShowMoreButton expanded={expanded} onPress={() => setExpanded((open) => !open)} />
      ) : null}
    </View>
  );
}

function IndustryGrid({
  industries,
  expanded,
  onSelect,
}: {
  industries: Industry[];
  expanded: boolean;
  onSelect?: (industry: Industry) => void;
}) {
  const visible = expanded ? industries : industries.slice(0, COLLAPSED_COUNT);

  return (
    <View className="flex-row flex-wrap justify-between gap-y-4">
      {visible.map((industry) => (
        <View key={industry.id} className="w-[48%]">
          <IndustryCard industry={industry} onPress={onSelect} />
        </View>
      ))}
    </View>
  );
}

/** Round arrow button that toggles the grid between eight cards and all of them. */
function ShowMoreButton({ expanded, onPress }: { expanded: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={expanded ? "Show fewer industries" : "Show more industries"}
      // Conveys the collapsed/expanded state, which the rotating chevron only
      // conveys visually.
      accessibilityState={{ expanded }}
      hitSlop={8}
      className="mt-6 h-11 w-11 items-center justify-center self-center rounded-full bg-brand active:bg-brand-dark"
    >
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color="#ffffff" />
    </Pressable>
  );
}
