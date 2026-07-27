import { router } from "expo-router";

import { HomeBanner } from "@/components/module/home/HomeBanner";
import { AppScreen } from "@/components/layout/AppScreen";

export default function HomeScreen() {
  return (
    // `edges={[]}`: AppHeader already consumed the top inset for every tab screen.
    // `padded={false}` because the banner is full-bleed; sections added below it
    // bring their own gutters.
    <AppScreen scroll padded={false} edges={[]}>
      <HomeBanner
        onSearch={(query) => router.push({ pathname: "/(tabs)/search", params: { q: query } })}
      />
    </AppScreen>
  );
}
