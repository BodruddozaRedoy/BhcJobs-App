import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * Copies a backend validation bag onto the matching form fields.
 *
 * The API returns `{ error: { phone: ["The phone has already been taken."] } }`,
 * which is more specific than anything the client can know — uniqueness, for
 * instance. Putting those messages on the fields they belong to is why a taken
 * phone number appears under the phone input rather than as a generic banner.
 *
 * Only keys listed in `fields` are applied. An unrecognised key would otherwise
 * register an error on a field that does not exist, which react-hook-form counts as
 * invalid but no input renders — leaving the form permanently unsubmittable with
 * nothing on screen to explain why.
 *
 * @returns whether at least one message landed, so the caller can decide if a
 *          general toast is still needed.
 */
export function applyFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldErrors: Record<string, string[]> | undefined,
  fields: readonly Path<T>[],
): boolean {
  if (!fieldErrors) return false;

  let applied = false;

  for (const field of fields) {
    const messages = fieldErrors[field];
    if (messages?.length) {
      // First message only: the API can return several per field, and stacking
      // them under one input pushes the rest of the form around.
      form.setError(field, { type: "server", message: messages[0] });
      applied = true;
    }
  }

  return applied;
}
