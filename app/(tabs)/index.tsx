import { router } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";
import { HomeBanner } from "@/components/module/home/HomeBanner";
import { PopularCompanies } from "@/components/module/home/PopularCompanies";
import { PopularIndustries } from "@/components/module/home/PopularIndustries";
import { RecommendedJobs } from "@/components/module/home/RecommendedJobs";
import { Brand } from "@/constants/colors";
import { usePalette } from "@/context/ThemeProvider";
import { useCompanies } from "@/hooks/feature/home/use-companies";
import { useIndustries } from "@/hooks/feature/home/use-industries";
import { useJobs } from "@/hooks/feature/home/use-jobs";

export default function HomeScreen() {
  // The three lists are fetched here rather than inside each section, so one pull
  // can refresh all of them and the spinner can stay up until the slowest finishes.
  // The sections stay presentational and just render whichever state they are given.
  const industries = useIndustries();
  const jobs = useJobs();
  const companies = useCompanies();

  const palette = usePalette();

  // Tracked separately from the lists' own `loading` status: on first mount all
  // three *are* loading, and deriving the flag from them would spin the refresh
  // control on top of the skeletons before the user has pulled anything.
  const [refreshing, setRefreshing] = useState(false);

  const { refresh: refreshIndustries } = industries;
  const { refresh: refreshJobs } = jobs;
  const { refresh: refreshCompanies } = companies;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // In parallel — three sequential round trips would hold the spinner for the
      // sum of them. `refresh` never rejects; it folds failures into list state.
      await Promise.all([refreshIndustries(), refreshJobs(), refreshCompanies()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshIndustries, refreshJobs, refreshCompanies]);

  return (
    // `edges={[]}`: AppHeader already consumed the top inset for every tab screen.
    // `padded={false}` because the banner is full-bleed; sections added below it
    // bring their own gutters.
    <AppScreen
      scroll
      padded={false}
      edges={[]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          // Android draws a filled disc, iOS a bare spinner — hence the two props.
          // `progressBackgroundColor` keeps the disc on the page surface rather
          // than a hardcoded white one that glares in dark mode.
          colors={[Brand.DEFAULT]}
          progressBackgroundColor={palette.backgroundElement}
          tintColor={Brand.DEFAULT}
        />
      }
    >
      <HomeBanner
        onSearch={(query) => router.push({ pathname: "/(tabs)/search", params: { q: query } })}
      />

      {/* Tapping an industry filters the jobs list; that screen does not read the
          param yet, so the handler is wired but inert for now. */}
      <PopularIndustries
        list={industries}
        onSelect={(industry) =>
          router.push({ pathname: "/(tabs)/jobs", params: { industry: industry.id } })
        }
      />

      {/*
        No `onView` / `onApply` yet: neither a job detail screen nor an apply flow
        exists. Left unpassed rather than stubbed, so `JobCard` renders both buttons
        disabled instead of offering an action that silently does nothing.
      */}
      <RecommendedJobs list={jobs} />

      {/* Same as the industry handler: the jobs screen does not read the filter param
          yet, so this navigates but does not narrow the list. */}
      <PopularCompanies
        list={companies}
        onSelect={(company) =>
          router.push({ pathname: "/(tabs)/jobs", params: { company: company.id } })
        }
      />
    </AppScreen>
  );
}
