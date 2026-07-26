import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormValues } from "@/lib/validation/auth.schema";
import { login } from "@/services/api/auth.api";
import { isApiError } from "@/services/api/types";
import { startSession } from "@/services/session";

/** Form fields the backend is allowed to attach errors to. */
const FORM_FIELDS = ["phone", "password"] as const;

/**
 * Owns everything behind the sign-in form: validation, the request, and where the
 * user lands afterwards. The screen stays presentational.
 *
 * Two kinds of failure are handled differently:
 *   - per-field (`{ error: { phone: [...] } }`) is pushed onto the matching input,
 *     so the message appears next to the thing that is wrong
 *   - anything else (bad credentials, offline, 500) becomes `formError`, shown
 *     once above the button
 */
export function useLogin() {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // Validate as the user leaves each field rather than on every keystroke:
    // errors that appear while still typing read as nagging.
    mode: "onBlur",
    defaultValues: { phone: "", password: "" },
  });

  const submit = useCallback(
    async (values: LoginFormValues) => {
      // Clear the previous attempt's banner, otherwise a stale "no internet"
      // lingers over a fresh submission.
      setFormError(null);

      try {
        const session = await login(values);
        await startSession(session.token);

        // `replace`, not `push` — the back gesture must not return to the login
        // screen once authenticated.
        router.replace("/(tabs)");
      } catch (error) {
        if (!isApiError(error)) {
          setFormError("Something went wrong. Please try again.");
          return;
        }

        const fieldErrors = error.fieldErrors;
        let attachedToField = false;

        if (fieldErrors) {
          for (const field of FORM_FIELDS) {
            const messages = fieldErrors[field];
            if (messages?.length) {
              form.setError(field, { type: "server", message: messages[0] });
              attachedToField = true;
            }
          }
        }

        // Only fall back to the banner when nothing landed on a field, so the
        // user is not told the same thing twice.
        if (!attachedToField) setFormError(error.message);
      }
    },
    [form],
  );

  return {
    form,
    /** True while the request is in flight — drives the button spinner. */
    isSubmitting: form.formState.isSubmitting,
    formError,
    onSubmit: form.handleSubmit(submit),
  };
}
