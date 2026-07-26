import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth.schema";
import { login } from "@/services/api/auth.api";
import { isApiError } from "@/services/api/types";

/** Form fields the backend is allowed to attach errors to. */
const FORM_FIELDS = ["phone", "password"] as const;

/**
 * Owns everything behind the sign-in form: validation, the request, and where the
 * user lands afterwards. The screen stays presentational.
 *
 * Failures are surfaced in one of two places, never both:
 *   - per-field (`{ error: { phone: [...] } }`) goes onto the matching input, where
 *     the message sits next to the thing that is actually wrong
 *   - anything else (bad credentials, offline, 500) becomes an error toast
 */
export function useLogin() {
  // Going through the context rather than `startSession` directly is what makes
  // the header switch from the guest button to the avatar; a bare `startSession`
  // would persist the token but leave React state — and so the UI — unaware.
  const { signIn } = useAuth();
  const toast = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // Validate as the user leaves each field rather than on every keystroke:
    // errors that appear while still typing read as nagging.
    mode: "onBlur",
    defaultValues: { phone: "", password: "" },
  });

  const submit = useCallback(
    async (values: LoginFormValues) => {
      try {
        const session = await login(values);
        await signIn(session);

        toast.success("Signed in successfully");

        // `replace`, not `push` — the back gesture must not return to the login
        // screen once authenticated. The toast outlives the navigation because it
        // is mounted at the root, above the navigator.
        router.replace("/(tabs)");
      } catch (error) {
        if (!isApiError(error)) {
          toast.error("Something went wrong. Please try again.");
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

        // Only toast when nothing landed on a field, so the user is not told the
        // same thing twice in two places.
        if (!attachedToField) toast.error(error.message);
      }
    },
    [form, signIn, toast],
  );

  return {
    form,
    /** True while the request is in flight — drives the button spinner. */
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(submit),
  };
}
