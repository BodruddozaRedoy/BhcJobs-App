import { useState } from "react";
import { View } from "react-native";

import { CompanyCard } from "@/components/module/home/CompanyCard";
import { EmptyView } from "@/components/ui/EmptyView";
import { ErrorView } from "@/components/ui/ErrorView";
import { Loader } from "@/components/ui/Loader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { useCompanies } from "@/hooks/feature/home/use-companies";
import type { Company } from "@/types/company.types";

/**
 * Cards shown before the arrow is tapped.
 *
 * Four, not eight as in the other sections — the reference design shows two rows and
 * then the arrow. There are fewer companies than industries, so a taller collapsed
 * block would leave nothing behind the button.
 */
const COLLAPSED_COUNT = 4;

export interface PopularCompaniesProps {
  onSelect?: (company: Company) => void;
}

/**
 * "Popular Companies" — a two-column grid, collapsed to four cards.
 *
 * A wrapping `View` rather than a `FlatList`, for the same reason as the other home
 * sections: this sits inside the screen's vertical `ScrollView`, where a nested
 * vertical `FlatList` warns and loses virtualisation anyway, and the endpoint returns
 * the whole list unpaginated (five rows on the dev API).
 */
export function PopularCompanies({ onSelect }: PopularCompaniesProps) {
  const { state, retry } = useCompanies();
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="px-4 pb-10">
      <SectionHeading>Popular Companies</SectionHeading>

      {state.status === "loading" ? <Loader message="Loading companies…" /> : null}

      {state.status === "empty" ? <EmptyView message="No companies to show yet." /> : null}

      {state.status === "error" ? (
        <ErrorView message={state.message} canRetry={state.canRetry} onRetry={retry} />
      ) : null}

      {state.status === "ready" ? (
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {(expanded ? state.items : state.items.slice(0, COLLAPSED_COUNT)).map((company) => (
            <View key={company.id} className="w-[48%]">
              <CompanyCard company={company} onPress={onSelect} />
            </View>
          ))}
        </View>
      ) : null}

      {state.status === "ready" && state.items.length > COLLAPSED_COUNT ? (
        <ShowMoreButton
          noun="companies"
          expanded={expanded}
          onPress={() => setExpanded((open) => !open)}
        />
      ) : null}
    </View>
  );
}
