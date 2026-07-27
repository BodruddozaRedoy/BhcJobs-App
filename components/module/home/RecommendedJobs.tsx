import { useState } from "react";
import { View } from "react-native";

import { JobCard } from "@/components/module/home/JobCard";
import { JobListSkeleton } from "@/components/module/home/Skeletons";
import { EmptyView } from "@/components/ui/EmptyView";
import { ErrorView } from "@/components/ui/ErrorView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import type { AsyncList } from "@/hooks/use-async-list";
import type { Job } from "@/types/job.types";

/** Cards shown before the arrow is tapped, matching the industry grid. */
const COLLAPSED_COUNT = 8;

export interface RecommendedJobsProps {
  /**
   * Owned by the screen rather than fetched here, so pull-to-refresh can drive all
   * three sections at once and know when they have all finished.
   */
  list: AsyncList<Job>;
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
export function RecommendedJobs({ list, onView, onApply }: RecommendedJobsProps) {
  const { state, retry } = list;
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="px-4 pb-10">
      <SectionHeading>Recommended Jobs</SectionHeading>

      {state.status === "loading" ? <JobListSkeleton /> : null}

      {state.status === "empty" ? (
        <EmptyView
          icon="document-text-outline"
          message="No jobs yet"
          hint="Pull down to refresh, or check back shortly for new postings."
        />
      ) : null}

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
