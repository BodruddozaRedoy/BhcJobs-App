import { router } from "expo-router";

import { AppScreen } from "@/components/layout/AppScreen";
import { HomeBanner } from "@/components/module/home/HomeBanner";
import { PopularCompanies } from "@/components/module/home/PopularCompanies";
import { PopularIndustries } from "@/components/module/home/PopularIndustries";
import { RecommendedJobs } from "@/components/module/home/RecommendedJobs";

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

      {/*
        No `onView` / `onApply` yet: neither a job detail screen nor an apply flow
        exists. Left unpassed rather than stubbed, so `JobCard` renders both buttons
        disabled instead of offering an action that silently does nothing.
      */}
      <RecommendedJobs />

      {/* Same as the industry handler: the jobs screen does not read the filter param
          yet, so this navigates but does not narrow the list. */}
      <PopularCompanies
        onSelect={(company) =>
          router.push({ pathname: "/(tabs)/jobs", params: { company: company.id } })
        }
      />
    </AppScreen>
  );
}
