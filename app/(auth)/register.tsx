import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Controller } from "react-hook-form";
import { Text, View, useWindowDimensions } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/Button";
import { DateField } from "@/components/ui/DateField";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Brand } from "@/constants/colors";
import { useRegister } from "@/hooks/feature/auth/use-register";
import { GENDERS } from "@/lib/validation/auth.schema";

/** Above this width the card stops growing and stays centred (tablets, landscape). */
const MAX_CARD_WIDTH = 420;

const GENDER_OPTIONS = GENDERS.map((value) => ({
  value,
  // "male" → "Male", without hardcoding a parallel list that could drift.
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export default function RegisterScreen() {
  const { form, isSubmitting, onSubmit } = useRegister();
  const { width } = useWindowDimensions();

  const cardWidth = Math.min(width - 32, MAX_CARD_WIDTH);

  return (
    <AppScreen
      gradient
      scroll
      center
      keyboardAvoiding
      // AppHeader owns the top inset; no tab bar below, so the bottom is ours.
      edges={["bottom"]}
      contentClassName="py-10"
    >
      <View
        style={{ width: cardWidth }}
        className="rounded-2xl bg-white px-6 py-8 shadow-lg shadow-slate-300/60 dark:bg-element-dark"
      >
        <View className="mb-8 flex-row items-center justify-center">
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="person-add" size={18} color={Brand.DEFAULT} />
          </View>
          <Text className="text-xl font-bold text-brand dark:text-brand-dark">
            Create Your Account
          </Text>
        </View>

        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Full Name"
              required
              icon="person"
              placeholder="Your full name"
              autoCapitalize="words"
              autoComplete="name"
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
          name="phone"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Mobile Number"
              required
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
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Email"
              required
              icon="mail"
              placeholder="you@example.com"
              keyboardType="email-address"
              // Autocapitalising an email address is the single most common cause of
              // a "valid" address the server cannot match.
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
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
          name="passport_number"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Passport Number"
              required
              icon="document-text"
              placeholder="AB1234567"
              // Upper-cases as the user types, so the field visibly matches the
              // format in the hint rather than being silently fixed on submit.
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={9}
              editable={!isSubmitting}
              value={value}
              onChangeText={(text) => onChange(text.toUpperCase())}
              onBlur={onBlur}
              error={error?.message}
              containerClassName="mb-5"
            />
          )}
        />

        <Controller
          control={form.control}
          name="dob"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <DateField
              label="Date of Birth"
              required
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isSubmitting}
              error={error?.message}
              containerClassName="mb-5"
            />
          )}
        />

        <Controller
          control={form.control}
          name="gender"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Select
              label="Gender"
              required
              icon="people"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isSubmitting}
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
              required
              icon="lock-closed"
              placeholder="At least 6 characters"
              secure
              autoComplete="new-password"
              textContentType="newPassword"
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
          name="confirm_password"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <Input
              label="Confirm Password"
              required
              icon="lock-closed"
              placeholder="Re-enter your password"
              secure
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              containerClassName="mb-6"
            />
          )}
        />

        <Button label="CREATE ACCOUNT" onPress={onSubmit} loading={isSubmitting} />

        <Divider label="OR" className="my-6" />

        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-content dark:text-content-dark">
            Already have an account?{" "}
          </Text>
          {/* asChild + Text: className on Link itself is dropped by NativeWind. */}
          <Link href="/(auth)/login" asChild>
            <Text className="text-sm font-semibold text-brand dark:text-brand-dark">Sign in</Text>
          </Link>
        </View>
      </View>
    </AppScreen>
  );
}
