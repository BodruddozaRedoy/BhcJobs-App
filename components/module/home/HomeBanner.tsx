import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { BannerWave, WAVE_HEIGHT } from "@/components/module/home/BannerWave";
import { Gradients } from "@/constants/colors";
import { usePalette, useTheme } from "@/context/ThemeProvider";

/**
 * Gradient kept visible between the search field and the wave's crest. Without it
 * the field sits right on the curve and the banner reads as cramped.
 */
const SEARCH_CLEARANCE = 48;

export interface HomeBannerProps {
  /** Fired by the submit button and the keyboard's search key. Trimmed, never empty. */
  onSearch?: (query: string) => void;
}

/**
 * Home hero: headline, pitch, and the primary job search, over the animated wave
 * that separates the banner from the page.
 */
export function HomeBanner({ onSearch }: HomeBannerProps) {
  const [query, setQuery] = useState("");
  const { isDark } = useTheme();
  const palette = usePalette();

  const submit = () => {
    const trimmed = query.trim();
    // A blank search would navigate away and show everything, which reads as the
    // button being broken.
    if (trimmed) onSearch?.(trimmed);
  };

  return (
    <View className="overflow-hidden">
      <LinearGradient
        colors={isDark ? Gradients.homeBanner.dark : Gradients.homeBanner.light}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingBottom: WAVE_HEIGHT + SEARCH_CLEARANCE }}
      >
        <View className="px-6 pt-14">
          <Text className="text-center text-2xl font-extrabold text-white">
            #1 Platform for Saudi Jobs
          </Text>

          <Text className="text-md mt-4 text-center leading-6 text-blue-100">
            Apply for jobs in Saudi Arabia with verified employers. We connect Bangladeshi workforce
            with high-demand Saudi Jobs.
          </Text>

          <View className="mt-8 h-14 flex-row items-center rounded-full bg-white pl-5 pr-2 dark:bg-selected-dark">
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={submit}
              placeholder="Search Job"
              placeholderTextColor={palette.textSecondary}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search jobs"
              className="flex-1 text-base text-content dark:text-content-dark"
            />

            <Pressable
              onPress={submit}
              accessibilityRole="button"
              accessibilityLabel="Search"
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full bg-brand active:bg-brand-dark"
            >
              <Ionicons name="search" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <BannerWave />
    </View>
  );
}
