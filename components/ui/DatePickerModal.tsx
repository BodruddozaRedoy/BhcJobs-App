import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

/** Row height; the wheel snaps to multiples of this. */
const ITEM_HEIGHT = 40;
/** Rows visible at once. Must be odd so one row sits exactly in the centre. */
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
/** Blank rows above and below, so the first and last item can reach the centre. */
const PAD_ROWS = (VISIBLE_ROWS - 1) / 2;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Youngest and oldest ages the year column offers. Mirrors the schema's bounds. */
const MIN_AGE_YEARS = 16;
const MAX_AGE_YEARS = 100;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Days in a given month, accounting for leap years. Day 0 of the next month. */
const daysInMonth = (year: number, month1: number) =>
  new Date(Date.UTC(year, month1, 0)).getUTCDate();

const pad2 = (value: number) => String(value).padStart(2, "0");

const offsetToIndex = (y: number, length: number) =>
  clamp(Math.round(y / ITEM_HEIGHT), 0, length - 1);

/**
 * How far a flick coasts.
 *
 * `"normal"` lets the wheel travel in proportion to swipe speed, the way a web
 * date picker does. `"fast"` brakes hard and lands within a row or two — swap this
 * one value if the wheel feels too loose.
 */
const DECELERATION_RATE = "normal";

/**
 * Above this |velocity| (points/ms) a drag is treated as a flick, so the commit is
 * left to `onMomentumScrollEnd` instead of firing at drag-end while the wheel is
 * still travelling.
 */
const FLICK_VELOCITY = 0.05;

interface WheelProps {
  items: string[];
  index: number;
  onIndexChange: (index: number) => void;
  /** Screen-reader name for the column. */
  label: string;
}

/**
 * One scrollable column.
 *
 * Snapping uses `snapToInterval` so the wheel keeps the platform's native scroll
 * physics. Note there must be no `Pressable` above this in the tree: a press
 * responder competes with the scroll responder for the pan gesture, which makes
 * dragging fail intermittently.
 */
function Wheel({ items, index, onIndexChange, label }: WheelProps) {
  const ref = useRef<ScrollView>(null);
  /** Last index this wheel scrolled itself to, used to tell self-inflicted changes
   *  from external ones (e.g. the day column clamped when the month changes). */
  const settledAt = useRef(index);
  const didInitialScroll = useRef(false);
  /** Drives the highlight during the drag, before the value is committed. */
  const [activeIndex, setActiveIndex] = useState(index);

  // Jump to the incoming index only when it did not come from this wheel's own
  // scrolling — otherwise every settle would fight the user's next drag.
  useEffect(() => {
    setActiveIndex(index);
    if (settledAt.current !== index) {
      settledAt.current = index;
      ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    }
  }, [index]);

  // Highlight follows the finger, so the wheel visibly responds mid-drag instead of
  // only updating once it stops.
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = offsetToIndex(event.nativeEvent.contentOffset.y, items.length);
      setActiveIndex((current) => (current === next ? current : next));
    },
    [items.length],
  );

  const handleSettle = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = offsetToIndex(event.nativeEvent.contentOffset.y, items.length);
      // Recorded before the change is reported upwards, so the sync effect above
      // recognises the new index as this wheel's own and does not scroll against it.
      settledAt.current = next;
      setActiveIndex(next);
      if (next !== index) onIndexChange(next);
    },
    [index, items.length, onIndexChange],
  );

  /**
   * Drag-end only commits for a slow drag, which produces no momentum and would
   * otherwise leave the wheel resting between two rows. A flick is handed to
   * `onMomentumScrollEnd`; committing here as well would fire a value from the
   * wheel's mid-flight position and could clamp the day while it is still moving.
   */
  const handleDragEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocity = event.nativeEvent.velocity?.y ?? 0;
      if (Math.abs(velocity) > FLICK_VELOCITY) return;
      handleSettle(event);
    },
    [handleSettle],
  );

  return (
    <ScrollView
      ref={ref}
      // Height and flex set inline rather than via className: this element is
      // measured before styles are interop'd, and an unsized ScrollView cannot be
      // scrolled at all.
      style={{ height: WHEEL_HEIGHT, flex: 1 }}
      showsVerticalScrollIndicator={false}
      // `snapToInterval` alone still lets momentum carry across many rows and then
      // settle on a boundary — which is the velocity-proportional feel wanted here.
      // (`disableIntervalMomentum` would cap every flick at a single row.)
      snapToInterval={ITEM_HEIGHT}
      decelerationRate={DECELERATION_RATE}
      // Required on Android for a ScrollView rendered inside another scrollable.
      nestedScrollEnabled
      scrollEventThrottle={16}
      onScroll={handleScroll}
      // Position without animating on first paint, once the content has a size.
      onContentSizeChange={() => {
        if (didInitialScroll.current) return;
        didInitialScroll.current = true;
        ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
      }}
      onMomentumScrollEnd={handleSettle}
      onScrollEndDrag={handleDragEnd}
      contentContainerStyle={{ paddingVertical: PAD_ROWS * ITEM_HEIGHT }}
      accessibilityLabel={label}
    >
      {items.map((item, itemIndex) => (
        <View key={item} style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
          <Text
            className={
              itemIndex === activeIndex
                ? "text-base font-bold text-brand dark:text-brand-dark"
                : "text-base text-muted dark:text-muted-dark"
            }
          >
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

export interface DatePickerModalProps {
  visible: boolean;
  /** Current value as `YYYY-MM-DD`, or empty for no selection yet. */
  value?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  title?: string;
}

/**
 * Three-column date wheel in a modal, confirmed with OK or discarded with Cancel.
 *
 * The year column is bounded to ages 16–100 rather than offering every year, so an
 * age the form would reject cannot be picked in the first place.
 */
export function DatePickerModal({
  visible,
  value,
  onConfirm,
  onCancel,
  title = "Select Date of Birth",
}: DatePickerModalProps) {
  const thisYear = new Date().getFullYear();

  // Oldest first, so scrolling down moves towards the present.
  const years = useMemo(() => {
    const oldest = thisYear - MAX_AGE_YEARS;
    const newest = thisYear - MIN_AGE_YEARS;
    return Array.from({ length: newest - oldest + 1 }, (_, i) => String(oldest + i));
  }, [thisYear]);

  /** Parses the incoming value, falling back to a sensible mid-range default. */
  const initial = useMemo(() => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    }
    // 25 years old — a more likely starting point for a job seeker than either bound.
    return { year: thisYear - 25, month: 1, day: 1 };
  }, [value, thisYear]);

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  // Re-seed each time the modal opens, so cancelling and reopening shows the
  // committed value rather than the abandoned edit.
  useEffect(() => {
    if (!visible) return;
    setYear(initial.year);
    setMonth(initial.month);
    setDay(initial.day);
  }, [visible, initial]);

  const dayCount = daysInMonth(year, month);

  // 31 January → February must drop the day to 28 or 29, or the confirmed value
  // would be a date that does not exist.
  useEffect(() => {
    if (day > dayCount) setDay(dayCount);
  }, [day, dayCount]);

  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => String(i + 1)),
    [dayCount],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center px-6">
        {/*
          Backdrop is a sibling behind the card, not a wrapper around it. Wrapping the
          card in a Pressable puts a press responder above the wheels, and it competes
          with them for the pan gesture — which makes dragging fail until the touch
          happens to be claimed by the ScrollView instead.
        */}
        <Pressable
          onPress={onCancel}
          accessibilityLabel="Dismiss"
          className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
        />

        <View className="w-full max-w-sm rounded-2xl bg-white px-4 py-6 dark:bg-element-dark">
          <Text className="mb-4 text-center text-lg font-bold text-content dark:text-content-dark">
            {title}
          </Text>

          <View className="relative flex-row">
            {/* Centre band marking the active row. Non-interactive so it never
                intercepts a drag. */}
            <View
              pointerEvents="none"
              style={{ top: PAD_ROWS * ITEM_HEIGHT, height: ITEM_HEIGHT }}
              className="absolute left-0 right-0 border-y border-slate-200 dark:border-gray-700"
            />

            <Wheel
              label="Day"
              items={days}
              index={clamp(day - 1, 0, days.length - 1)}
              onIndexChange={(i) => setDay(i + 1)}
            />
            <Wheel
              label="Month"
              items={MONTHS}
              index={clamp(month - 1, 0, MONTHS.length - 1)}
              onIndexChange={(i) => setMonth(i + 1)}
            />
            <Wheel
              label="Year"
              items={years}
              index={clamp(years.indexOf(String(year)), 0, years.length - 1)}
              onIndexChange={(i) => setYear(Number(years[i]))}
            />
          </View>

          <View className="mt-6 flex-row justify-center gap-3">
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              className="h-11 min-w-[100px] items-center justify-center rounded-xl bg-element active:bg-selected dark:bg-selected-dark"
            >
              <Text className="text-base font-semibold text-content dark:text-content-dark">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(`${year}-${pad2(month)}-${pad2(day)}`)}
              accessibilityRole="button"
              className="h-11 min-w-[100px] items-center justify-center rounded-xl bg-brand active:bg-brand-dark"
            >
              <Text className="text-base font-semibold text-white">OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
