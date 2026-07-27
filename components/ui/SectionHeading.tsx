import { Text, View } from "react-native";

export interface SectionHeadingProps {
  children: string;
  className?: string;
}

/**
 * Pill heading above a home section.
 *
 * `self-center` rather than a centred parent, so a section can lay its content out
 * however it likes without the heading dictating alignment.
 */
export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <View
      className={`mb-6 self-center rounded-full bg-blue-50 px-6 py-2.5 dark:bg-element-dark ${className}`}
    >
      {/* `accessibilityRole="header"` lets a screen reader jump between sections
          instead of reading the page straight through. */}
      <Text
        accessibilityRole="header"
        className="text-base font-bold text-content dark:text-content-dark"
      >
        {children}
      </Text>
    </View>
  );
}
