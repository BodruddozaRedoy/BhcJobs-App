import { Image } from "expo-image";
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
 */
export function IndustryCard({ industry, onPress }: IndustryCardProps) {
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
          // Decorative: the card's own label already names the industry.
          accessibilityElementsHidden
          // Cross-fade rather than a pop-in, which reads as jank across a grid of
          // images that resolve at slightly different times.
          transition={200}
        />
      ) : (
        // Keeps the text at the same height when an industry has no image, instead
        // of letting that one card's content ride up.
        <View style={{ width: ICON_SIZE, height: ICON_SIZE }} />
      )}

      <Text
        // Two lines, then ellipsis — long names like "Facilities Management" need
        // the second line, and nothing needs a third.
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
}
