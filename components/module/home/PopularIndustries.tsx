import { useState } from "react";
import { Text, View } from "react-native";

import { IndustryCard } from "@/components/module/home/IndustryCard";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { useIndustries } from "@/hooks/feature/home/use-industries";
import type { Industry } from "@/types/industry.types";

/** Cards shown before "Show more" is tapped. Four rows of two. */
const COLLAPSED_COUNT = 8;

export interface PopularIndustriesProps {
  onSelect?: (industry: Industry) => void;
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
        <IndustryGrid industries={state.items} expanded={expanded} onSelect={onSelect} />
      ) : null}

      {state.status === "ready" && state.items.length > COLLAPSED_COUNT ? (
        <ShowMoreButton
          noun="industries"
          expanded={expanded}
          onPress={() => setExpanded((open) => !open)}
        />
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
