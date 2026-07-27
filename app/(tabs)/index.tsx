import { router } from "expo-router";

import { AppScreen } from "@/components/layout/AppScreen";
import { HomeBanner } from "@/components/module/home/HomeBanner";
import { PopularIndustries } from "@/components/module/home/PopularIndustries";

export default function HomeScreen() {
  return (
    // `edges={[]}`: AppHeader already consumed the top inset for every tab screen.
    // `padded={false}` because the banner is full-bleed; sections added below it
    // bring their own gutters.
    <AppScreen scroll padded={false} edges={[]}>
      <HomeBanner
        onSearch={(query) => router.push({ pathname: "/(tabs)/search", params: { q: query } })}
      />

      {/* Tapping an industry filters the jobs list; that screen does not read the
          param yet, so the handler is wired but inert for now. */}
      <PopularIndustries
        onSelect={(industry) =>
          router.push({ pathname: "/(tabs)/jobs", params: { industry: industry.id } })
        }
      />
    </AppScreen>
  );
}
