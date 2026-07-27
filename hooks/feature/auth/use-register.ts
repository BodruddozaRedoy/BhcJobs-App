import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/context/ToastProvider";
import { applyFieldErrors } from "@/lib/forms/apply-field-errors";
import { logger } from "@/lib/logger";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth.schema";
import { register } from "@/services/api/auth.api";
import { isApiError } from "@/services/api/types";

/**
 * Fields the backend may attach errors to. Listed explicitly so an unexpected key
 * cannot register an error on a field that has no input rendering it.
 */
const FORM_FIELDS = [
  "name",
  "phone",
  "email",
  "password",
  "confirm_password",
  "passport_number",
  "dob",
  "gender",
] as const;

/**
 * Owns the registration form: validation, the request, and error placement.
 *
 * Registration does *not* sign the user in. The API responds by sending an OTP to
 * the phone number, and the account stays inactive until that code is confirmed
 * through `PHONE_VERIFY` — so there is no token to store here and no session to
 * start.
 */
export function useRegister() {
  const toast = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
      passport_number: "",
      dob: "",
      // Left unset so "Select a gender" can fire; an eager default would let the
      // form submit a value the user never chose.
      gender: undefined,
      terms: false,
    },
  });

  const submit = useCallback(
    async (values: RegisterFormValues) => {
      try {
        // `terms` is a client-side gate the API knows nothing about, so it is
        // dropped rather than sent as an unrecognised key.
        const { terms, ...payload } = values;

        await register(payload);

        logger.success("[register] account created; navigating to OTP verification", {
          phone: values.phone,
        });

        // Navigation before the toast, deliberately. Both are in the same `try`, so
        // anything thrown while raising the toast would skip the navigation entirely
        // and land in the catch below — stranding the user on a submitted form with
        // an error message, for an account that was in fact created. The redirect is
        // the critical path; the toast is decoration.
        //
        // Registration is only half the flow: the account stays inactive until the
        // OTP is confirmed, so the user goes straight to that screen. `replace`, not
        // `push` — going "back" to a submitted form would only produce a
        // phone-already-taken error.
        //
        // The phone number travels as a param because `phone_verify` needs it and
        // the OTP screen has no other way to know it.
        router.replace({ pathname: "/(auth)/verify-otp", params: { phone: values.phone } });

        toast.success("Account created. Check your phone for the OTP.");
      } catch (error) {
        if (!isApiError(error)) {
          toast.error("Something went wrong. Please try again.");
          return;
        }

        // Server messages are more specific than the client can be here — "The
        // phone has already been taken" is knowledge only the backend has.
        const applied = applyFieldErrors(form, error.fieldErrors, FORM_FIELDS);

        // Toast only when nothing landed on a field, so the user is not told the
        // same thing in two places.
        if (!applied) toast.error(error.message);
      }
    },
    [form, toast],
  );

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(submit),
  };
}
