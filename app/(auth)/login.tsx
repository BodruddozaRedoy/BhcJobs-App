import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Controller } from "react-hook-form";
import { Text, View, useWindowDimensions } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { Brand } from "@/constants/colors";
import { useLogin } from "@/hooks/feature/auth/use-login";

/** Above this width the card stops growing and stays centred (tablets, landscape). */
const MAX_CARD_WIDTH = 420;

export default function LoginScreen() {
  const { form, isSubmitting, formError, onSubmit } = useLogin();
  const { width } = useWindowDimensions();

  // Card takes the full width minus gutters on phones, and caps out on tablets
  // rather than stretching into an unreadably wide form.
  const cardWidth = Math.min(width - 32, MAX_CARD_WIDTH);

  return (
    <AppScreen
      gradient
      scroll
      center
      keyboardAvoiding
      // Standalone screen: no tab bar below, so both edges need insetting.
      edges={["top", "bottom"]}
      // Dark glyphs, because the gradient is light at every stop.
      statusBarStyle="dark"
      contentClassName="py-10"
    >
      <View
        style={{ width: cardWidth }}
        className="rounded-2xl bg-white px-6 py-8 shadow-lg shadow-slate-300/60 dark:bg-element-dark"
      >
        {/* Header: badge + title, centred */}
        <View className="mb-8 flex-row items-center justify-center">
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="person" size={18} color={Brand.DEFAULT} />
          </View>
          <Text className="text-xl font-bold text-brand dark:text-brand-dark">
            Job Seeker Login
          </Text>
        </View>

        <Controller
          control={form.control}
          name="phone"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Mobile Number"
              icon="call"
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={11}
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              containerClassName="mb-5"
            />
          )}
        />

        <Controller
          control={form.control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Password"
              icon="lock-closed"
              placeholder="Enter your password"
              secure
              autoComplete="current-password"
              textContentType="password"
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              // Submitting from the keyboard is faster than reaching for the button.
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              containerClassName="mb-3"
            />
          )}
        />

        {/*
          Present in the reference design, but the task's API spec has no
          password-reset endpoint — so it is rendered without a destination
          rather than linking to a screen that cannot do anything yet.
        */}
        <Text className="mb-5 self-end text-sm font-semibold text-brand dark:text-brand-dark">
          Forgot Your Password?
        </Text>

        {/* Failures that belong to the request as a whole rather than one field. */}
        {formError ? (
          <View accessibilityLiveRegion="polite" className="mb-4 rounded-lg bg-red-50 px-3 py-2.5">
            <Text className="text-sm text-red-600">{formError}</Text>
          </View>
        ) : null}

        <Button label="SIGN IN" onPress={onSubmit} loading={isSubmitting} />

        <Divider label="OR" className="my-6" />

        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-content dark:text-content-dark">New to BhcJobs.com? </Text>
          <Link
            href="/(auth)/register"
            className="text-sm font-semibold text-brand dark:text-brand-dark"
          >
            Create an account
          </Link>
        </View>
      </View>
    </AppScreen>
  );
}
