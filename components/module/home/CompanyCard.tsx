import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { companyImageUrl } from "@/lib/media";
import type { Company } from "@/types/company.types";

/** Outer diameter of the logo ring. */
const RING_SIZE = 56;

/** The logo inside the ring, inset so a square mark does not touch the border. */
const LOGO_SIZE = 34;

export interface CompanyCardProps {
  company: Company;
  onPress?: (company: Company) => void;
}

/**
 * One company in the "Popular Companies" grid.
 *
 * Same fixed height as `IndustryCard`, so the two grids read as one system and rows
 * stay level when a name wraps to two lines.
 *
 * The logo sits in a circular ring rather than being cropped to a circle: these are
 * wordmarks of wildly different aspect ratios, and `cover`-cropping "JABCO" or "BHC"
 * into a circle would cut the letters off.
 *
 * Memoised for the same reason as `IndustryCard`: expanding the grid rebuilds every
 * element, and the cards already on screen should not re-render to show the ones
 * below them.
 */
export const CompanyCard = memo(function CompanyCard({ company, onPress }: CompanyCardProps) {
  const logo = companyImageUrl(company.image);

  return (
    <Pressable
      onPress={() => onPress?.(company)}
      // Without an `onPress` this is not interactive, and announcing it as a button
      // would promise a screen reader something that does not happen.
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${company.name}, ${company.jobs_count} available jobs`}
      className="h-36 items-center justify-center rounded-2xl border border-slate-100 bg-white px-3 shadow-md shadow-slate-300/50 dark:border-gray-700 dark:bg-element-dark dark:shadow-black/60"
    >
      <View
        style={{ width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2 }}
        className="items-center justify-center border border-slate-200 bg-white dark:border-gray-600"
      >
        {logo ? (
          <Image
            source={logo}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            contentFit="contain"
            // Decorative: the card's own label already names the company.
            accessibilityElementsHidden
            // Cross-fade rather than a pop-in, which reads as jank across a grid of
            // images that resolve at slightly different times.
            transition={200}
          />
        ) : (
          // Initial rather than an empty ring, so a company with no logo still has a
          // mark to recognise.
          <Text className="text-lg font-bold text-brand dark:text-brand-dark">
            {company.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <Text
        // Two lines, then ellipsis — "Shade Corporation Limited" needs the second
        // line, and nothing needs a third.
        numberOfLines={2}
        className="mt-3 text-center text-sm font-bold text-content dark:text-content-dark"
      >
        {company.name}
      </Text>

      <Text className="mt-1 text-center text-xs text-muted dark:text-muted-dark">
        {company.jobs_count} Available Jobs
      </Text>
    </Pressable>
  );
});
