import { useState } from "react";
import { View } from "react-native";

import { IndustryCard } from "@/components/module/home/IndustryCard";
import { EmptyView } from "@/components/ui/EmptyView";
import { ErrorView } from "@/components/ui/ErrorView";
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

      {state.status === "empty" ? <EmptyView message="No industries to show yet." /> : null}

      {state.status === "error" ? (
        <ErrorView message={state.message} canRetry={state.canRetry} onRetry={retry} />
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
