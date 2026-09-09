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
  placement?: "bottom" | "top" | "auto";
  className?: string;
  triggerClassName?: string;
  showPresets?: boolean;
  showFooter?: boolean;
  minDate?: string;
  maxDate?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  closeOnSelect?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  mode = "range",
  value,
  range,
  onChangeDate,
  onChangeRange,
  placeholder = "Select Date",
  align = "right",
  placement = "auto",
  className = "",
  triggerClassName = "",
  showPresets = mode === "range",
  showFooter = true,
  minDate,
  maxDate,
  ariaLabel = "Select date or range",
  id,
  disabled = false,
  fullWidth = false,
  closeOnSelect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoPlacement, setAutoPlacement] = useState<"top" | "bottom">("bottom");
  const resolvedPlacement = placement === "auto" ? autoPlacement : placement;

  const calculateAutoPlacement = useCallback((): "top" | "bottom" => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return "bottom";

    const dialog = containerRef.current?.closest("[role='dialog']");
    if (dialog) {
      const dialogRect = dialog.getBoundingClientRect();
      const spaceBelowInDialog = dialogRect.bottom - rect.bottom;
      const spaceAboveInDialog = rect.top - dialogRect.top;
      return spaceBelowInDialog < 340 && spaceAboveInDialog > spaceBelowInDialog
        ? "top"
        : "bottom";
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < 360 && spaceAbove > spaceBelow ? "top" : "bottom";
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && placement === "auto") {
      setAutoPlacement(calculateAutoPlacement());
    }
    setIsOpen((prev) => !prev);
  };

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

  const hasValue =
    mode === "single"
      ? Boolean(activeDate)
      : Boolean(activeRange?.startDate);

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
    if (closeOnSelect) {
      closeDropdown();
    }
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
      className={`${styles.datePickerContainer} ${fullWidth ? styles.fullWidth : ""} ${
        isOpen ? styles.datePickerContainerOpen : ""
      } ${className}`}
      data-testid="operix-datepicker"
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        className={`${styles.triggerButton} ${isOpen ? styles.triggerButtonOpen : ""} ${
          disabled ? styles.triggerDisabled : ""
        } ${fullWidth ? styles.fullWidthTrigger : ""} ${triggerClassName}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
      >
        <span className={styles.triggerContent}>
          <span className={styles.calendarIcon}>
            <CalendarIcon size={16} />
          </span>
          <span className={hasValue ? styles.displayValue : styles.placeholder}>
            {displayLabel}
          </span>
        </span>
        <span className={`${styles.chevronIcon} ${isOpen ? styles.chevronIconRotated : ""}`}>
          <ChevronDownIcon size={14} />
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.mobileBackdrop} onClick={closeDropdown} role="presentation" />
          <div
            className={`${styles.popoverDropdown} ${
              resolvedPlacement === "top" ? styles.popoverTop : styles.popoverBottom
            } ${align === "left" ? styles.popoverAlignLeft : styles.popoverAlignRight}`}
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
              showFooter={showFooter}
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
