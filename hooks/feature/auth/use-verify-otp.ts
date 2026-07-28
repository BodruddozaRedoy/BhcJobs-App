import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { applyFieldErrors } from "@/lib/forms/apply-field-errors";
import { otpSchema, type OtpFormValues } from "@/lib/validation/auth.schema";
import { verifyPhone } from "@/services/api/feature/auth.api";
import { isApiError } from "@/services/api/types";

/**
 * Fields the backend may attach errors to. `phone` is included even though no input
 * renders it — "Account not found" belongs on the code field, so it is remapped
 * below rather than dropped.
 */
const FORM_FIELDS = ["otp"] as const;

/**
 * Owns the OTP screen: validation, the request, and where the user lands afterwards.
 *
 * `phone` comes from the route rather than from form state — the user cannot edit it
 * here, and re-deriving it would mean trusting the screen to pass it twice.
 */
export function useVerifyOtp(phone: string) {
  const toast = useToast();
  const { signIn } = useAuth();

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    // `onSubmit`, not `onBlur`: the field blurs the moment the keyboard closes, and
    // flagging a half-typed code as invalid before the user has finished is noise.
    mode: "onSubmit",
    defaultValues: { otp: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: OtpFormValues) => verifyPhone({ phone, otp: values.otp }),
    // Awaited before `isPending` clears, so the button stays busy until the session
    // is stored rather than clearing the moment the response arrives.
    onSuccess: async (session) => {
      if (session) {
        // The backend signed the user in as part of verification, so there is no
        // reason to make them type their password immediately afterwards.
        await signIn(session);
        toast.success("Phone verified. You are signed in.");
        router.replace("/(tabs)");
        return;
      }

      toast.success("Phone verified. Please sign in.");
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      if (!isApiError(error)) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      const applied = applyFieldErrors(form, error.fieldErrors, FORM_FIELDS);

      // A rejected code arrives as a plain message ("Account not found! Please
      // register first..", or a wrong-OTP message) with no field bag. Putting it on
      // the input is more useful than a toast that disappears while the user is
      // still looking at the boxes.
      if (!applied) {
        form.setError("otp", { type: "server", message: error.message });
      }
    },
  });

  return {
    form,
    isSubmitting: isPending,
    onSubmit: form.handleSubmit((values: OtpFormValues) => mutate(values)),
  };
}
