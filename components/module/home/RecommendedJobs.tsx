import { useState } from "react";
import { View } from "react-native";

import { JobCard } from "@/components/module/home/JobCard";
import { EmptyView } from "@/components/ui/EmptyView";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loader } from "@/components/ui/Loader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { useJobs } from "@/hooks/feature/home/use-jobs";
import type { Job } from "@/types/job.types";

/** Cards shown before the arrow is tapped, matching the industry grid. */
const COLLAPSED_COUNT = 8;

export interface RecommendedJobsProps {
  onView?: (job: Job) => void;
  onApply?: (job: Job) => void;
}

/**
 * "Recommended Jobs" — one card per posting, collapsed to eight.
 *
 * A mapped `View` rather than a `FlatList`, for the same reason as the industry
 * grid: this sits inside the home screen's vertical `ScrollView`, where a nested
 * vertical `FlatList` warns and loses virtualisation anyway, and the endpoint
 * returns the whole list unpaginated (fourteen rows on the dev API).
 */
export function RecommendedJobs({ onView, onApply }: RecommendedJobsProps) {
  const { state, retry } = useJobs();
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="px-4 pb-10">
      <SectionHeading>Recommended Jobs</SectionHeading>

      {state.status === "loading" ? <Loader message="Loading jobs…" /> : null}

      {state.status === "empty" ? <EmptyView message="No jobs to show yet." /> : null}

      {state.status === "error" ? (
        <ErrorView message={state.message} canRetry={state.canRetry} onRetry={retry} />
      ) : null}

      {state.status === "ready" ? (
        <View className="gap-4">
          {(expanded ? state.items : state.items.slice(0, COLLAPSED_COUNT)).map((job) => (
            <JobCard key={job.id} job={job} onView={onView} onApply={onApply} />
          ))}
        </View>
      ) : null}

      {state.status === "ready" && state.items.length > COLLAPSED_COUNT ? (
        <ShowMoreButton
          noun="jobs"
          expanded={expanded}
          onPress={() => setExpanded((open) => !open)}
        />
      ) : null}
    </View>
  );
}
