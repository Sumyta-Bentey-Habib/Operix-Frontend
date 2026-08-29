"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import {
  CalendarDay,
  DateRange,
  MONTH_NAMES,
  WEEKDAY_NAMES,
  formatCalendarRangeDisplay,
  getCalendarDays,
  isDateInRange,
  isSameDate,
  parseYmd,
  PRESET_DATE_RANGES,
} from "@/utils/calendar";
import styles from "./Calendar.module.css";

export interface CalendarProps {
  mode?: "single" | "range";
  selectedDate?: string; // YYYY-MM-DD
  selectedRange?: DateRange;
  onSelectDate?: (date: string) => void;
  onSelectRange?: (range: DateRange) => void;
  showPresets?: boolean;
  showFooter?: boolean;
  onApply?: (value: { date?: string; range?: DateRange }) => void;
  onClear?: () => void;
  minDate?: string;
  maxDate?: string;
  initialMonth?: number;
  initialYear?: number;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  mode = "range",
  selectedDate,
  selectedRange,
  onSelectDate,
  onSelectRange,
  showPresets = mode === "range",
  showFooter = true,
  onApply,
  onClear,
  minDate,
  maxDate,
  initialMonth,
  initialYear,
  className,
}) => {
  // Determine starting view month & year based on initial selection or current date
  const initialDateParsed = useMemo(() => {
    if (mode === "single" && selectedDate) {
      return parseYmd(selectedDate);
    }
    if (mode === "range" && selectedRange?.startDate) {
      return parseYmd(selectedRange.startDate);
    }
    return null;
  }, [mode, selectedDate, selectedRange]);

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState<number>(
    initialYear ?? initialDateParsed?.year ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState<number>(
    initialMonth ?? initialDateParsed?.month ?? today.getMonth(),
  );

  // Range selection intermediate state
  const [internalDate, setInternalDate] = useState<string | undefined>(selectedDate);
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(selectedRange);
  const [rangeStartSelection, setRangeStartSelection] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Calendar days grid calculation
  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  }, [viewMonth]);

  const handleNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  }, [viewMonth]);

  const handleGoToToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }, [today]);

  const handleDayClick = (day: CalendarDay) => {
    if (mode === "single") {
      setInternalDate(day.date);
      onSelectDate?.(day.date);
      return;
    }

    // Range mode
    if (!rangeStartSelection) {
      // First click: start new range
      setRangeStartSelection(day.date);
      setInternalRange({ startDate: day.date, endDate: day.date });
      setActivePresetId(null);
    } else {
      // Second click: finish range
      let start = rangeStartSelection;
      let end = day.date;
      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }
      const newRange = { startDate: start, endDate: end };
      setRangeStartSelection(null);
      setInternalRange(newRange);
      setActivePresetId(null);
      onSelectRange?.(newRange);
    }
  };

  const handlePresetClick = (preset: (typeof PRESET_DATE_RANGES)[number]) => {
    const range = preset.getRange();
    setInternalRange(range);
    setRangeStartSelection(null);
    setActivePresetId(preset.id);

    // Jump view to the end of range
    const parsed = parseYmd(range.endDate);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }

    onSelectRange?.(range);
  };

  const handleClear = () => {
    setInternalDate(undefined);
    setInternalRange(undefined);
    setRangeStartSelection(null);
    setActivePresetId(null);
    onClear?.();
  };

  const handleApply = () => {
    onApply?.({
      date: internalDate,
      range: internalRange,
    });
  };

  // Evaluate range boundaries for UI tracks
  const effectiveRangeStart = rangeStartSelection || internalRange?.startDate;
  const effectiveRangeEnd = rangeStartSelection
    ? hoveredDate || rangeStartSelection
    : internalRange?.endDate;

  const currentDisplayMonthYear = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const wrapperClass = className
    ? `${styles.calendarWrapper} ${className}`
    : styles.calendarWrapper;

  return (
    <div className={wrapperClass} data-testid="dynamic-calendar">
      {/* Presets Sidebar */}
      {showPresets && (
        <div className={styles.presetsPanel}>
          <p className={styles.presetTitle}>Presets</p>
          {PRESET_DATE_RANGES.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                data-testid={`preset-${preset.id}`}
                className={`${styles.presetButton} ${isActive ? styles.presetButtonActive : ""}`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Calendar Body */}
      <div className={styles.calendarBody}>
        {/* Navigation & Month Header */}
        <div className={styles.calendarHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.headerMonthYear}>{currentDisplayMonthYear}</h2>
            <button
              type="button"
              className={styles.todayBadgeBtn}
              onClick={handleGoToToday}
              aria-label="Jump to current month"
              title="Jump to current month"
              data-testid="jump-today-btn"
            >
              Today
            </button>
          </div>

          <div className={styles.navButtons}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        </div>

        {/* Weekday Names Header */}
        <div className={styles.weekdaysGrid} role="row">
          {WEEKDAY_NAMES.map((wd) => (
            <div key={wd} className={styles.weekdayLabel} role="columnheader">
              {wd}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className={styles.daysGrid} role="grid">
          {calendarDays.map((day) => {
            const isSingleSelected = mode === "single" && isSameDate(day.date, internalDate);
            const isRangeStart =
              mode === "range" &&
              effectiveRangeStart &&
              isSameDate(day.date, effectiveRangeStart);
            const isRangeEnd =
              mode === "range" &&
              effectiveRangeEnd &&
              isSameDate(day.date, effectiveRangeEnd);
            const isSelected = isSingleSelected || isRangeStart || isRangeEnd;
            const inRange =
              mode === "range" &&
              effectiveRangeStart &&
              effectiveRangeEnd &&
              isDateInRange(day.date, effectiveRangeStart, effectiveRangeEnd);

            const isStartOrEnd = isRangeStart || isRangeEnd;
            const isDisabled = (minDate && day.date < minDate) || (maxDate && day.date > maxDate);

            return (
              <div
                key={day.date}
                className={styles.dayCellWrapper}
                onMouseEnter={() => {
                  if (rangeStartSelection && !isDisabled) {
                    setHoveredDate(day.date);
                  }
                }}
              >
                {/* Range track background */}
                {inRange && !isStartOrEnd && (
                  <div className={`${styles.rangeTrack} ${styles.rangeTrackMiddle}`} />
                )}
                {isRangeStart && inRange && effectiveRangeStart !== effectiveRangeEnd && (
                  <div className={`${styles.rangeTrack} ${styles.rangeTrackStart}`} />
                )}
                {isRangeEnd && inRange && effectiveRangeStart !== effectiveRangeEnd && (
                  <div className={`${styles.rangeTrack} ${styles.rangeTrackEnd}`} />
                )}

                {/* Day button */}
                <button
                  type="button"
                  disabled={Boolean(isDisabled)}
                  className={`${styles.dayCell} ${!day.isCurrentMonth ? styles.dayOtherMonth : ""} ${
                    day.isToday ? styles.dayToday : ""
                  } ${isSelected ? styles.daySelected : ""} ${isDisabled ? styles.dayDisabled : ""}`}
                  onClick={() => !isDisabled && handleDayClick(day)}
                  aria-label={`${day.date}${day.isToday ? " (Today)" : ""}`}
                  aria-pressed={Boolean(isSelected)}
                >
                  {day.day}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer with Summary and Actions */}
        {showFooter && (
          <div className={styles.calendarFooter}>
            <div className={styles.selectedRangeSummary}>
              {mode === "single"
                ? internalDate
                  ? formatCalendarRangeDisplay(internalDate, internalDate)
                  : "No date chosen"
                : internalRange?.startDate
                  ? formatCalendarRangeDisplay(
                      internalRange.startDate,
                      internalRange.endDate || internalRange.startDate,
                    )
                  : "Select a range"}
            </div>

            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClear}
              >
                Clear
              </button>
              {onApply && (
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={handleApply}
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
