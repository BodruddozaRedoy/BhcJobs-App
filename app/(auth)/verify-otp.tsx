import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Controller } from "react-hook-form";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { AppScreen } from "@/components/layout/AppScreen";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { Brand } from "@/constants/colors";
import { useVerifyOtp } from "@/hooks/feature/auth/use-verify-otp";
import { useCountdown } from "@/hooks/use-countdown";
import { mmss } from "@/lib/format";
import { OTP_LENGTH } from "@/lib/validation/auth.schema";

/** Above this width the card stops growing and stays centred (tablets, landscape). */
const MAX_CARD_WIDTH = 420;

/**
 * How long the code is assumed to stay valid.
 *
 * Five minutes, matching the design. The register response carries no expiry, so this
 * countdown is a display convention rather than the truth — the backend decides, and
 * an expired code fails on submit with its own message. Which is why the Submit
 * button stays live after the timer runs out instead of being disabled on a guess.
 */
const OTP_TTL_SECONDS = 5 * 60;

/**
 * Card frame shared by the form and the missing-number fallback, so both sit in the
 * same place on screen.
 */
function Card({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <View
      style={{ width }}
      className="rounded-2xl bg-white px-6 py-8 shadow-lg shadow-slate-300/60 dark:bg-element-dark dark:shadow-black/70"
    >
      {children}
    </View>
  );
}

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const { form, isSubmitting, onSubmit } = useVerifyOtp(phone ?? "");
  const { width } = useWindowDimensions();

  const remaining = useCountdown(OTP_TTL_SECONDS);
  const expired = remaining === 0;

  const cardWidth = Math.min(width - 32, MAX_CARD_WIDTH);

  /*
    Reachable by deep link, or by a reload that drops the param. `phone_verify`
    requires the number, so without it every code would fail on "The phone field is
    required" — an error the user cannot act on, under a field that is not the
    problem. Better to say so and send them back.
  */
  if (!phone) {
    return (
      <AppScreen gradient scroll center edges={["bottom"]} contentClassName="py-10">
        <Card width={cardWidth}>
          <Text className="text-center text-xl font-bold text-content dark:text-content-dark">
            Which number?
          </Text>
          <Text className="mt-4 text-center text-sm leading-6 text-content dark:text-content-dark">
            We could not tell which phone number to verify. Please sign up again to have a new code
            sent.
          </Text>
          <Button
            label="Back to sign up"
            onPress={() => router.replace("/(auth)/register")}
            className="mt-6"
          />
        </Card>
      </AppScreen>
    );
  }

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
      <Card width={cardWidth}>
        <Text className="text-center text-2xl font-bold text-content dark:text-content-dark">
          OTP Verification
        </Text>

        <View className="mt-5 items-center">
          <Ionicons name="shield-checkmark-outline" size={40} color={Brand.DEFAULT} />
        </View>

        <Text className="mt-5 text-center text-sm leading-6 text-content dark:text-content-dark">
          We&apos;ve sent a {OTP_LENGTH}-digit OTP to{" "}
          {/* The number is the one thing worth double-checking before typing a code,
              so it is the one thing tinted. */}
          <Text className="font-semibold text-orange-500">{phone}</Text>
          {"\n"}
          Kindly enter it below to continue.
        </Text>

        <Text className="mt-5 text-center text-sm font-semibold text-brand dark:text-brand-dark">
          {expired ? (
            "The OTP has expired"
          ) : (
            <>
              OTP will expire in <Text className="font-bold">{mmss(remaining)}</Text>
            </>
          )}
        </Text>

        <Controller
          control={form.control}
          name="otp"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <OtpInput
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              length={OTP_LENGTH}
              disabled={isSubmitting}
              error={error?.message}
              autoFocus
              // Submitting on the last digit saves a reach to the button, which is
              // what makes an autofilled code feel instant. The digits are dropped
              // rather than forwarded — `onSubmit` reads the value from form state,
              // and its own parameter is a form event.
              onComplete={() => onSubmit()}
              containerClassName="mt-6"
            />
          )}
        />

        <View className="mt-6 flex-row items-center justify-center">
          <Text className="text-sm font-semibold text-content dark:text-content-dark">
            Didn&apos;t get the code?{" "}
          </Text>
          {/*
            Inert on purpose. There is no resend endpoint on the backend — probed
            `resend_otp`, `otp_resend`, `send_otp`, `resend`, `phone_resend` and
            `otp_send` under `/api/job_seeker/`, all 404. Rendered disabled rather
            than omitted so the layout matches the design and the control is ready to
            wire, and `disabled` rather than silently doing nothing so it does not
            look tappable.
          */}
          <Pressable disabled accessibilityRole="button" accessibilityState={{ disabled: true }}>
            <Text className="text-sm text-muted dark:text-muted-dark">Send again</Text>
          </Pressable>
        </View>

        <Button label="Submit" onPress={onSubmit} loading={isSubmitting} className="mt-6" />
      </Card>
    </AppScreen>
  );
}
