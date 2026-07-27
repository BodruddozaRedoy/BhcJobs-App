import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Brand } from "@/constants/colors";
import { approxBdt, approxBdtRange } from "@/lib/currency";
import { isoDateToLong, money, thousands } from "@/lib/format";
import { companyImageUrl } from "@/lib/media";
import type { Job } from "@/types/job.types";

const LOGO_SIZE = 44;

export interface JobCardProps {
  job: Job;
  onView?: (job: Job) => void;
  onApply?: (job: Job) => void;
  /** Omit to render the star as a static mark rather than a control. */
  onToggleSave?: (job: Job) => void;
  saved?: boolean;
}

/**
 * Salary as one line, e.g. `"Salary: SAR 1,500 – 1,800 (BDT 49,500 – 59,400 approx.)"`.
 *
 * `max_salary` is null on roughly half the dev rows, and equal to the minimum on
 * some others — both cases render as a single figure rather than as `"1,200 – 1,200"`
 * or a dangling dash.
 *
 * Returns `null` when there is no figure at all, so the caller drops the line
 * instead of printing `"Salary: SAR"`.
 */
const salaryLine = (job: Job): string | null => {
  const { min_salary: min, max_salary: max, currency } = job;
  if (min === null) return null;

  const unit = currency ?? "SAR";

  // Both sides of a range carry the unit once, on the left — "SAR 1,700 – 2,000",
  // not "SAR 1,700 – SAR 2,000".
  if (max !== null && max > min) {
    return `Salary: ${money(unit, min)} – ${thousands(max)} (${approxBdtRange(min, max)})`;
  }

  return `Salary: ${money(unit, min)} (${approxBdt(min)})`;
};

/**
 * The food line, which the API models two different ways: a cash `allowance` with an
 * amount, or food `provided` in kind with no amount. Anything else means the employer
 * said nothing, and the line is omitted rather than shown as unknown.
 */
const foodLine = (job: Job): string | null => {
  if (job.food_option === "allowance" && job.food_amount !== null) {
    const unit = job.currency ?? "SAR";
    return `Food Allowance: ${money(unit, job.food_amount)} (${approxBdt(job.food_amount)})`;
  }

  if (job.food_option === "provided") return "Food: Provided";

  return null;
};

/** Small uppercase chip, for the job type and location. */
function Tag({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-gray-700">
      <Ionicons name={icon} size={13} color={Brand.DEFAULT} />
      <Text className="ml-1.5 text-[11px] font-bold uppercase text-content dark:text-content-dark">
        {label}
      </Text>
    </View>
  );
}

/** One posting in the "Recommended Jobs" list. */
export function JobCard({ job, onView, onApply, onToggleSave, saved = false }: JobCardProps) {
  const logo = companyImageUrl(job.company?.image);
  const salary = salaryLine(job);
  const food = foodLine(job);
  const deadline = isoDateToLong(job.expiry);
  const location = job.country?.name;

  return (
    <View className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-gray-700 dark:bg-element-dark">
      {/* Title centred, star pinned right — so the title stays optically centred in
          the card rather than being pushed off by the star's width. */}
      <View className="flex-row items-start">
        <Text
          numberOfLines={2}
          className="flex-1 px-6 text-center text-lg font-bold text-content dark:text-content-dark"
        >
          {job.job_title}
        </Text>

        <Pressable
          onPress={onToggleSave ? () => onToggleSave(job) : undefined}
          disabled={!onToggleSave}
          // Without a handler this is decoration; announcing it as a button would
          // promise a screen reader something that does not happen.
          accessibilityRole={onToggleSave ? "button" : undefined}
          accessibilityLabel={onToggleSave ? (saved ? "Remove from saved" : "Save job") : undefined}
          accessibilityState={{ selected: saved }}
          hitSlop={10}
          className="absolute right-0 top-0"
        >
          <Ionicons name={saved ? "star" : "star-outline"} size={22} color={Brand.DEFAULT} />
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center">
        {logo ? (
          <Image
            source={logo}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }}
            contentFit="contain"
            transition={200}
            // The company name sits right beside it; reading both is redundant.
            accessibilityElementsHidden
            className="border border-slate-200 bg-white dark:border-gray-700"
          />
        ) : (
          // Placeholder initial, so a company with no logo does not shift the name
          // left and break alignment down the list.
          <View
            style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }}
            className="items-center justify-center bg-blue-50 dark:bg-selected-dark"
          >
            <Text className="text-base font-bold text-brand dark:text-brand-dark">
              {job.company_name?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </View>
        )}

        <Text
          numberOfLines={1}
          className="ml-3 flex-1 text-base font-bold text-content dark:text-content-dark"
        >
          {job.company_name ?? job.company?.name ?? "—"}
        </Text>
      </View>

      {salary || food ? (
        <View className="mt-4 rounded-xl bg-blue-50 p-3 dark:bg-selected-dark">
          {salary ? (
            <Text className="text-xs text-content dark:text-content-dark">{salary}</Text>
          ) : null}
          {food ? (
            <Text className="mt-1 text-xs text-content dark:text-content-dark">{food}</Text>
          ) : null}
        </View>
      ) : null}

      {job.type || location ? (
        <View className="mt-4 flex-row flex-wrap gap-2">
          {job.type ? <Tag icon="briefcase" label={job.type} /> : null}
          {location ? <Tag icon="location" label={location} /> : null}
        </View>
      ) : null}

      {deadline ? (
        <View className="mt-4 flex-row items-center">
          <Ionicons name="time-outline" size={15} color="#ef4444" />
          <Text className="ml-1.5 text-sm font-semibold text-content dark:text-content-dark">
            Application Deadline: {deadline}
          </Text>
        </View>
      ) : null}

      <View className="mt-4 flex-row gap-3">
        <Button
          label="View"
          variant="ghost"
          size="md"
          onPress={onView ? () => onView(job) : undefined}
          disabled={!onView}
          className="flex-1 border border-slate-200 dark:border-gray-600"
        />
        <Button
          label="Apply Now"
          size="md"
          onPress={onApply ? () => onApply(job) : undefined}
          disabled={!onApply}
          className="flex-1"
        />
      </View>
    </View>
  );
}
