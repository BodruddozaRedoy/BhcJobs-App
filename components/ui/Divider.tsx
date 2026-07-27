import { Text, View } from "react-native";

export interface DividerProps {
  /** Optional caption shown centred over the rule, e.g. "OR". */
  label?: string;
  className?: string;
}

/** Horizontal rule, optionally captioned. */
export function Divider({ label, className = "" }: DividerProps) {
  if (!label) {
    return <View className={`h-px bg-slate-200 dark:bg-gray-700 ${className}`} />;
  }

  return (
    <View className={`flex-row items-center ${className}`}>
      <View className="h-px flex-1 bg-slate-200 dark:bg-gray-700" />
      <Text className="mx-4 text-sm font-medium text-muted dark:text-muted-dark">{label}</Text>
      <View className="h-px flex-1 bg-slate-200 dark:bg-gray-700" />
    </View>
  );
}
