"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import {
  MONTH_NAMES,
  WEEKDAY_NAMES,
  buildDateTimeLocal,
  dateToYmd,
  formatCalendarDisplayDate,
  formatDateTimeDisplay,
  getCalendarDays,
  getRelativeDayLabel,
  isSameDate,
  parseDateTimeParts,
} from "@/utils/calendar";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";
import styles from "./DateTimePicker.module.css";

export interface DateTimePickerProps {
  id?: string;
  value?: string; // YYYY-MM-DDTHH:mm or ISO string
  onChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  minDate?: string;
  disabled?: boolean;
  className?: string;
  placement?: "top" | "bottom" | "auto";
  align?: "left" | "right" | "auto";
}

const QUICK_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  id,
  value = "",
  onChange,
  placeholder = TASK_CREATE_STRINGS.fields.dueAtPlaceholder,
  ariaLabel = TASK_CREATE_STRINGS.fields.dueAtAriaLabel,
  minDate,
  disabled = false,
  className = "",
  placement = "auto",
  align = "auto",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedPlacement, setResolvedPlacement] = useState<"top" | "bottom">(
    placement === "auto" ? "top" : placement,
  );
  const [resolvedAlign, setResolvedAlign] = useState<"left" | "right">(
    align === "auto" ? "right" : align,
  );

  const handleToggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        if (placement === "auto") {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            setResolvedPlacement(spaceBelow < 450 && spaceAbove > spaceBelow ? "top" : "bottom");
          }
        } else {
          setResolvedPlacement(placement);
        }

        if (align === "auto") {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const spaceRight = window.innerWidth - rect.left;
            setResolvedAlign(spaceRight < 590 ? "right" : "left");
          }
        } else {
          setResolvedAlign(align);
        }
      }
      return next;
    });
  };

  // Parse initial parts from incoming value
  const initialParts = useMemo(() => parseDateTimeParts(value || null), [value]);

  const [tempDate, setTempDate] = useState<string>(initialParts.date);
  const [tempHour, setTempHour] = useState<number>(initialParts.hour12);
  const [tempMinute, setTempMinute] = useState<number>(initialParts.minute);
  const [tempPeriod, setTempPeriod] = useState<"AM" | "PM">(initialParts.period);

  const [viewYear, setViewYear] = useState<number>(() => {
    const parts = initialParts.date.split("-");
    return parts[0] ? parseInt(parts[0], 10) : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const parts = initialParts.date.split("-");
    return parts[1] ? parseInt(parts[1], 10) - 1 : new Date().getMonth();
  });

  // Sync internal state when external value changes
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (value) {
      const parts = parseDateTimeParts(value);
      setTempDate(parts.date);
      setTempHour(parts.hour12);
      setTempMinute(parts.minute);
      setTempPeriod(parts.period);

      const y = parseInt(parts.date.slice(0, 4), 10);
      const m = parseInt(parts.date.slice(5, 7), 10) - 1;
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m);
      }
    }
  }

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDropdown]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  // Calendar days grid calculation
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

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
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setTempDate(dateToYmd(now));
  }, []);

  // Emit updated value
  const emitValue = useCallback(
    (d: string, h: number, m: number, p: "AM" | "PM") => {
      const localStr = buildDateTimeLocal(d, h, m, p);
      onChange?.(localStr);
    },
    [onChange],
  );

  const handleApply = () => {
    emitValue(tempDate, tempHour, tempMinute, tempPeriod);
    closeDropdown();
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange?.("");
    closeDropdown();
  };

  const handleSetNow = () => {
    const now = new Date();
    const d = dateToYmd(now);
    const h24 = now.getHours();
    const m = now.getMinutes();
    const p: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

    setTempDate(d);
    setTempHour(h12);
    setTempMinute(m);
    setTempPeriod(p);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    emitValue(d, h12, m, p);
  };

  // Preset Handlers
  const handlePresetSelect = (type: "todayEod" | "tomorrowMorning" | "tomorrowEod" | "nextWeek") => {
    const today = new Date();
    let targetDate = new Date();
    let hour = 5;
    const minute = 0;
    let period: "AM" | "PM" = "PM";

    switch (type) {
      case "todayEod":
        targetDate = new Date(today);
        hour = 5;
        period = "PM";
        break;
      case "tomorrowMorning":
        targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + 1);
        hour = 9;
        period = "AM";
        break;
      case "tomorrowEod":
        targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + 1);
        hour = 5;
        period = "PM";
        break;
      case "nextWeek":
        targetDate = new Date(today);
        // Days until next Monday
        const dayOfWeek = targetDate.getDay();
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        targetDate.setDate(targetDate.getDate() + daysUntilMonday);
        hour = 9;
        period = "AM";
        break;
    }

    const ymd = dateToYmd(targetDate);
    setTempDate(ymd);
    setTempHour(hour);
    setTempMinute(minute);
    setTempPeriod(period);
    setViewYear(targetDate.getFullYear());
    setViewMonth(targetDate.getMonth());
    emitValue(ymd, hour, minute, period);
  };

  const handleQuickTime = (hour: number, minute: number, period: "AM" | "PM") => {
    setTempHour(hour);
    setTempMinute(minute);
    setTempPeriod(period);
    emitValue(tempDate, hour, minute, period);
  };

  const currentDisplayMonthYear = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const relativeBadge = useMemo(() => {
    if (!value) return null;
    const parts = parseDateTimeParts(value);
    return getRelativeDayLabel(parts.date);
  }, [value]);

  const activeTimeFormatted = useMemo(() => {
    const hStr = String(tempHour).padStart(2, "0");
    const mStr = String(tempMinute).padStart(2, "0");
    return `${hStr}:${mStr} ${tempPeriod}`;
  }, [tempHour, tempMinute, tempPeriod]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      data-testid="operix-datetimepicker"
    >
      {/* Interactive Trigger Box */}
      <div
        className={`${styles.triggerWrapper} ${isOpen ? styles.triggerActive : ""} ${
          disabled ? styles.triggerDisabled : ""
        }`}
      >
        <button
          type="button"
          id={id}
          className={styles.triggerButton}
          onClick={handleToggleOpen}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={ariaLabel}
          disabled={disabled}
        >
          <span className={styles.iconWrapper}>
            <CalendarIcon size={16} />
          </span>

          {value ? (
            <span className={styles.displayValue}>{formatDateTimeDisplay(value)}</span>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}

          {relativeBadge && <span className={styles.relativeBadge}>{relativeBadge}</span>}
        </button>

        <div className={styles.triggerActions}>
          {value && !disabled && (
            <button
              type="button"
              className={styles.clearTriggerBtn}
              onClick={handleClear}
              title="Clear date"
              aria-label="Clear date"
            >
              ×
            </button>
          )}
          <button
            type="button"
            className={styles.chevronButton}
            onClick={handleToggleOpen}
            aria-label="Toggle calendar popover"
            tabIndex={-1}
            disabled={disabled}
          >
            <span className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotated : ""}`}>
              <ChevronDownIcon size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Popover */}
      {isOpen && (
        <>
          <div className={styles.mobileBackdrop} onClick={closeDropdown} role="presentation" />
          <div
            className={`${styles.popover} ${
              resolvedPlacement === "top" ? styles.popoverTop : styles.popoverBottom
            } ${resolvedAlign === "right" ? styles.popoverAlignRight : styles.popoverAlignLeft}`}
            role="dialog"
            aria-modal="true"
            aria-label={TASK_CREATE_STRINGS.dateTimePicker.dialogAriaLabel}
          >
            {/* Quick Schedule Presets Bar */}
            <div className={styles.presetBar}>
              <span className={styles.presetLabel}>
                {TASK_CREATE_STRINGS.dateTimePicker.presetsTitle}:
              </span>
              <button
                type="button"
                className={styles.presetChip}
                onClick={() => handlePresetSelect("todayEod")}
              >
                {TASK_CREATE_STRINGS.dateTimePicker.presets.todayEod}
              </button>
              <button
                type="button"
                className={styles.presetChip}
                onClick={() => handlePresetSelect("tomorrowMorning")}
              >
                {TASK_CREATE_STRINGS.dateTimePicker.presets.tomorrowMorning}
              </button>
              <button
                type="button"
                className={styles.presetChip}
                onClick={() => handlePresetSelect("tomorrowEod")}
              >
                {TASK_CREATE_STRINGS.dateTimePicker.presets.tomorrowEod}
              </button>
              <button
                type="button"
                className={styles.presetChip}
                onClick={() => handlePresetSelect("nextWeek")}
              >
                {TASK_CREATE_STRINGS.dateTimePicker.presets.nextWeek}
              </button>
            </div>

            {/* Main Grid: Left Calendar, Right Time Selector */}
            <div className={styles.mainGrid}>
              {/* Calendar Panel */}
              <div className={styles.calendarPanel}>
                <div className={styles.calendarHeader}>
                  <div className={styles.monthYearGroup}>
                    <h3 className={styles.monthYearTitle}>{currentDisplayMonthYear}</h3>
                    <button
                      type="button"
                      className={styles.todayBtn}
                      onClick={handleGoToToday}
                      aria-label="Jump to today"
                    >
                      {TASK_CREATE_STRINGS.dateTimePicker.actions.today}
                    </button>
                  </div>

                  <div className={styles.navControls}>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={handlePrevMonth}
                      aria-label={TASK_CREATE_STRINGS.dateTimePicker.actions.prevMonth}
                    >
                      <ChevronLeftIcon size={14} />
                    </button>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={handleNextMonth}
                      aria-label={TASK_CREATE_STRINGS.dateTimePicker.actions.nextMonth}
                    >
                      <ChevronRightIcon size={14} />
                    </button>
                  </div>
                </div>

                {/* Weekdays */}
                <div className={styles.weekdaysGrid} role="row">
                  {WEEKDAY_NAMES.map((wd) => (
                    <div key={wd} className={styles.weekdayLabel} role="columnheader">
                      {wd.slice(0, 2)}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className={styles.daysGrid} role="grid">
                  {calendarDays.map((day) => {
                    const isSelected = isSameDate(day.date, tempDate);
                    const isDisabled = minDate ? day.date < minDate : false;

                    return (
                      <button
                        key={day.date}
                        type="button"
                        disabled={isDisabled}
                        className={`${styles.dayBtn} ${
                          !day.isCurrentMonth ? styles.dayOtherMonth : ""
                        } ${day.isToday ? styles.dayToday : ""} ${
                          isSelected ? styles.daySelected : ""
                        } ${isDisabled ? styles.dayDisabled : ""}`}
                        onClick={() => {
                          setTempDate(day.date);
                          emitValue(day.date, tempHour, tempMinute, tempPeriod);
                        }}
                        aria-label={`${day.date}${day.isToday ? " (Today)" : ""}`}
                        aria-pressed={isSelected}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selector Panel */}
              <div className={styles.timePanel}>
                <div className={styles.timeHeader}>
                  <p className={styles.timeHeaderTitle}>
                    <ClockIcon size={14} />
                    <span>{TASK_CREATE_STRINGS.dateTimePicker.timeTitle}</span>
                  </p>
                  <span className={styles.activeTimeBadge}>{activeTimeFormatted}</span>
                </div>

                {/* Quick Times Grid */}
                <div className={styles.quickTimesGrid}>
                  <button
                    type="button"
                    className={`${styles.quickTimeBtn} ${
                      tempHour === 9 && tempMinute === 0 && tempPeriod === "AM"
                        ? styles.quickTimeBtnActive
                        : ""
                    }`}
                    onClick={() => handleQuickTime(9, 0, "AM")}
                  >
                    {TASK_CREATE_STRINGS.dateTimePicker.quickTimes.morning}
                  </button>
                  <button
                    type="button"
                    className={`${styles.quickTimeBtn} ${
                      tempHour === 12 && tempMinute === 0 && tempPeriod === "PM"
                        ? styles.quickTimeBtnActive
                        : ""
                    }`}
                    onClick={() => handleQuickTime(12, 0, "PM")}
                  >
                    {TASK_CREATE_STRINGS.dateTimePicker.quickTimes.noon}
                  </button>
                  <button
                    type="button"
                    className={`${styles.quickTimeBtn} ${
                      tempHour === 5 && tempMinute === 0 && tempPeriod === "PM"
                        ? styles.quickTimeBtnActive
                        : ""
                    }`}
                    onClick={() => handleQuickTime(5, 0, "PM")}
                  >
                    {TASK_CREATE_STRINGS.dateTimePicker.quickTimes.eod}
                  </button>
                  <button
                    type="button"
                    className={`${styles.quickTimeBtn} ${
                      tempHour === 11 && tempMinute === 59 && tempPeriod === "PM"
                        ? styles.quickTimeBtnActive
                        : ""
                    }`}
                    onClick={() => handleQuickTime(11, 59, "PM")}
                  >
                    {TASK_CREATE_STRINGS.dateTimePicker.quickTimes.night}
                  </button>
                </div>

                {/* Columns: Hour, Minute, Period */}
                <div className={styles.timeColumns}>
                  {/* Hour Column */}
                  <div className={styles.timeCol}>
                    <span className={styles.colHeader}>
                      {TASK_CREATE_STRINGS.dateTimePicker.hoursLabel}
                    </span>
                    <div className={styles.scrollList} role="group" aria-label="Select hour">
                      {HOURS_12.map((hour) => {
                        const isActive = tempHour === hour;
                        return (
                          <button
                            key={hour}
                            type="button"
                            className={`${styles.scrollItem} ${
                              isActive ? styles.scrollItemActive : ""
                            }`}
                            onClick={() => {
                              setTempHour(hour);
                              emitValue(tempDate, hour, tempMinute, tempPeriod);
                            }}
                            aria-pressed={isActive}
                          >
                            {String(hour).padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Minute Column */}
                  <div className={styles.timeCol}>
                    <span className={styles.colHeader}>
                      {TASK_CREATE_STRINGS.dateTimePicker.minutesLabel}
                    </span>
                    <div className={styles.scrollList} role="group" aria-label="Select minute">
                      {QUICK_MINUTES.map((min) => {
                        const isActive = tempMinute === min;
                        return (
                          <button
                            key={min}
                            type="button"
                            className={`${styles.scrollItem} ${
                              isActive ? styles.scrollItemActive : ""
                            }`}
                            onClick={() => {
                              setTempMinute(min);
                              emitValue(tempDate, tempHour, min, tempPeriod);
                            }}
                            aria-pressed={isActive}
                          >
                            {String(min).padStart(2, "0")}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AM / PM Column */}
                  <div className={styles.periodColumn}>
                    <button
                      type="button"
                      className={`${styles.periodButton} ${
                        tempPeriod === "AM" ? styles.periodButtonActive : ""
                      }`}
                      onClick={() => {
                        setTempPeriod("AM");
                        emitValue(tempDate, tempHour, tempMinute, "AM");
                      }}
                      aria-pressed={tempPeriod === "AM"}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={`${styles.periodButton} ${
                        tempPeriod === "PM" ? styles.periodButtonActive : ""
                      }`}
                      onClick={() => {
                        setTempPeriod("PM");
                        emitValue(tempDate, tempHour, tempMinute, "PM");
                      }}
                      aria-pressed={tempPeriod === "PM"}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bar */}
            <div className={styles.footer}>
              <div className={styles.footerSummary}>
                <span>Selected:</span>
                <span className={styles.footerSummaryBold}>
                  {formatCalendarDisplayDate(tempDate)} at {activeTimeFormatted}
                </span>
              </div>

              <div className={styles.footerActions}>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={handleClear}
                  aria-label="Clear date and time"
                >
                  {TASK_CREATE_STRINGS.dateTimePicker.actions.clear}
                </button>
                <button
                  type="button"
                  className={styles.nowBtn}
                  onClick={handleSetNow}
                  aria-label="Set to current date and time"
                >
                  {TASK_CREATE_STRINGS.dateTimePicker.actions.now}
                </button>
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={handleApply}
                  aria-label="Apply selection"
                >
                  {TASK_CREATE_STRINGS.dateTimePicker.actions.apply}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
