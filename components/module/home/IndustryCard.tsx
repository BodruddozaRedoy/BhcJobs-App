import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { industryImageUrl } from "@/lib/media";
import type { Industry } from "@/types/industry.types";

const ICON_SIZE = 34;

export interface IndustryCardProps {
  industry: Industry;
  onPress?: (industry: Industry) => void;
}

/**
 * One industry in the "Popular Industries" grid.
 *
 * A fixed height rather than one driven by content, so the two columns stay level
 * when one name wraps to two lines and its neighbour does not.
 *
 * Memoised for the "show more" toggle: expanding re-runs the grid's `.map()` and so
 * builds a fresh element for every card, but the eight already on screen have
 * unchanged props and skip re-rendering. `industry` comes straight from the fetched
 * array and `onPress` is passed through unwrapped, so the shallow compare holds —
 * building either inline at the call site would defeat this.
 */
export const IndustryCard = memo(function IndustryCard({ industry, onPress }: IndustryCardProps) {
  const source = industryImageUrl(industry.image);

  return (
    <Pressable
      onPress={() => onPress?.(industry)}
      // Without an `onPress` this is not interactive, and announcing it as a button
      // would promise a screen reader something that does not happen.
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${industry.name}, ${industry.jobs_count} available jobs`}
      className="h-36 items-center justify-center rounded-2xl border border-slate-100 bg-white px-3 shadow-md shadow-slate-300/50 dark:border-gray-700 dark:bg-element-dark dark:shadow-black/60"
    >
      {source ? (
        <Image
          source={source}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          contentFit="contain"
          accessibilityElementsHidden
          transition={200}
        />
      ) : (
        <View style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      )}

      <Text
        numberOfLines={2}
        className="mt-3 text-center text-sm font-bold text-content dark:text-content-dark"
      >
        {industry.name}
      </Text>

      <Text className="mt-1 text-center text-xs text-muted dark:text-muted-dark">
        {industry.jobs_count} Available Jobs
      </Text>
    </Pressable>
  );
});
