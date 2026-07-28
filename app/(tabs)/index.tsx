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
  const industries = useIndustries();
  const jobs = useJobs();
  const companies = useCompanies();

  const palette = usePalette();

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
    <AppScreen
      scroll
      padded={false}
      edges={[]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Brand.DEFAULT]}
          progressBackgroundColor={palette.backgroundElement}
          tintColor={Brand.DEFAULT}
        />
      }
    >
      <HomeBanner
        onSearch={(query) => router.push({ pathname: "/(tabs)/search", params: { q: query } })}
      />

      <PopularIndustries
        list={industries}
        onSelect={(industry) =>
          router.push({ pathname: "/(tabs)/jobs", params: { industry: industry.id } })
        }
      />

      <RecommendedJobs list={jobs} />

      <PopularCompanies
        list={companies}
        onSelect={(company) =>
          router.push({ pathname: "/(tabs)/jobs", params: { company: company.id } })
        }
      />
    </AppScreen>
  );
}
