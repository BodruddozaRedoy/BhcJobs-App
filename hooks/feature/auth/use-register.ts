import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/context/ToastProvider";
import { applyFieldErrors } from "@/lib/forms/apply-field-errors";
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

        toast.success("Account created. Check your phone for the OTP.");

        // Registration is only half the flow — the OTP screen is not built yet, so
        // the user is sent to sign-in rather than left on a submitted form.
        router.replace("/(auth)/login");
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
