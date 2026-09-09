"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CalendarIcon, ChevronDownIcon } from "@/components/icons";
import { Calendar } from "../Calendar";
import { DateRange, formatCalendarDisplayDate, formatCalendarRangeDisplay } from "@/utils/calendar";
import styles from "./DatePicker.module.css";

export interface DatePickerProps {
  mode?: "single" | "range";
  value?: string; // YYYY-MM-DD for single
  range?: DateRange; // for range mode
  onChangeDate?: (date: string) => void;
  onChangeRange?: (range: DateRange) => void;
  placeholder?: string;
  align?: "left" | "right";
  className?: string;
  triggerClassName?: string;
  showPresets?: boolean;
  minDate?: string;
  maxDate?: string;
  ariaLabel?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  mode = "range",
  value,
  range,
  onChangeDate,
  onChangeRange,
  placeholder = "Select Date",
  align = "right",
  className = "",
  triggerClassName = "",
  showPresets = mode === "range",
  minDate,
  maxDate,
  ariaLabel = "Select date or range",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [uncontrolledDate, setUncontrolledDate] = useState<string | undefined>(value);
  const [uncontrolledRange, setUncontrolledRange] = useState<DateRange | undefined>(range);

  const activeDate = value !== undefined ? value : uncontrolledDate;
  const activeRange = range !== undefined ? range : uncontrolledRange;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDropdown]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  const displayLabel = (() => {
    if (mode === "single") {
      return activeDate ? formatCalendarDisplayDate(activeDate) : placeholder;
    }
    if (activeRange?.startDate) {
      return formatCalendarRangeDisplay(
        activeRange.startDate,
        activeRange.endDate || activeRange.startDate,
      );
    }
    return placeholder;
  })();

  const handleSelectDate = (d: string) => {
    setUncontrolledDate(d);
    onChangeDate?.(d);
  };

  const handleSelectRange = (r: DateRange) => {
    setUncontrolledRange(r);
    onChangeRange?.(r);
  };

  const handleApply = (val: { date?: string; range?: DateRange }) => {
    if (mode === "single" && val.date) {
      handleSelectDate(val.date);
    } else if (mode === "range" && val.range) {
      handleSelectRange(val.range);
    }
    closeDropdown();
  };

  const handleClear = () => {
    setUncontrolledDate(undefined);
    setUncontrolledRange(undefined);
    if (mode === "single") {
      onChangeDate?.("");
    } else {
      onChangeRange?.({ startDate: "", endDate: "" });
    }
    closeDropdown();
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.datePickerContainer} ${className}`}
      data-testid="operix-datepicker"
    >
      <button
        type="button"
        className={`${styles.triggerButton} ${isOpen ? styles.triggerButtonOpen : ""} ${triggerClassName}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
      >
        <span className={styles.calendarIcon}>
          <CalendarIcon size={16} />
        </span>
        <span>{displayLabel}</span>
        <span className={`${styles.chevronIcon} ${isOpen ? styles.chevronIconRotated : ""}`}>
          <ChevronDownIcon size={14} />
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.mobileBackdrop} onClick={closeDropdown} role="presentation" />
          <div
            className={`${styles.popoverDropdown} ${
              align === "left" ? styles.popoverAlignLeft : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Calendar Selector"
          >
            <Calendar
              mode={mode}
              selectedDate={activeDate}
              selectedRange={activeRange}
              onSelectDate={handleSelectDate}
              onSelectRange={handleSelectRange}
              showPresets={showPresets}
              showFooter={true}
              onApply={handleApply}
              onClear={handleClear}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>
        </>
      )}
    </div>
  );
};
