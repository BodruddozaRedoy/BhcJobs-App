import { Text } from "react-native";

export interface FieldLabelProps {
  children: string;
  /** Appends a red asterisk. */
  required?: boolean;
  className?: string;
}

/**
 * Form field label, shared by `Input`, `Select` and `DateField` so the asterisk and
 * type treatment cannot drift between field types.
 *
 * The asterisk is inside the same `<Text>` rather than a sibling in a flex row, so
 * it stays glued to the last word when a long label wraps.
 */
export function FieldLabel({ children, required = false, className = "" }: FieldLabelProps) {
  return (
    <Text
      className={`mb-2 text-sm font-semibold text-content dark:text-content-dark ${className}`}
    >
      {children}
      {required ? (
        // Hidden from screen readers: "required" is already announced via the
        // field's own accessibilityState, and a literal "star" adds noise.
        <Text accessibilityElementsHidden className="text-red-500">
          {" *"}
        </Text>
      ) : null}
    </Text>
  );
}
