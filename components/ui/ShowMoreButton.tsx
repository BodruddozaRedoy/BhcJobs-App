import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { Brand } from "@/constants/colors";

export interface ShowMoreButtonProps {
  expanded: boolean;
  onPress: () => void;
  /**
   * What is being expanded, plural and lowercase — "industries", "jobs". Only a
   * screen reader sees it; the button itself is the chevron alone.
   */
  noun: string;
  className?: string;
}

/**
 * Arrow button that expands a truncated list, and collapses it again.
 *
 * The chevron carries the whole meaning visually, so the state has to reach
 * assistive tech another way: `accessibilityState.expanded` plus a label that says
 * which direction the press goes.
 */
export function ShowMoreButton({ expanded, onPress, noun, className = "" }: ShowMoreButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={expanded ? `Show fewer ${noun}` : `Show more ${noun}`}
      accessibilityState={{ expanded }}
      hitSlop={8}
      className={`mt-6 items-center justify-center self-center rounded-2xl border border-brand px-7 py-3 active:bg-brand-dark ${className}`}
    >
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={22} color={Brand.DEFAULT} />
    </Pressable>
  );
}
