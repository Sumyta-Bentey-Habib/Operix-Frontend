import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker Component", () => {
  it("renders trigger button with placeholder or initial value", () => {
    render(
      <DatePicker
        range={{ startDate: "2026-06-29", endDate: "2026-08-29" }}
        mode="range"
      />,
    );

    expect(
      screen.getByText("29 Jun 2026 - 29 Aug 2026"),
    ).toBeInTheDocument();
  });

  it("opens calendar dropdown on trigger click", () => {
    render(
      <DatePicker
        range={{ startDate: "2026-06-29", endDate: "2026-08-29" }}
        mode="range"
      />,
    );

    const trigger = screen.getByRole("button", { name: /Select date or range/i });
    fireEvent.click(trigger);

    expect(screen.getByTestId("dynamic-calendar")).toBeInTheDocument();
  });

  it("closes calendar when clicking apply or pressing escape", () => {
    render(
      <DatePicker
        range={{ startDate: "2026-06-29", endDate: "2026-08-29" }}
        mode="range"
      />,
    );

    const trigger = screen.getByRole("button", { name: /Select date or range/i });
    fireEvent.click(trigger);
    expect(screen.getByTestId("dynamic-calendar")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("dynamic-calendar")).not.toBeInTheDocument();
  });

  it("calls onChangeRange when a preset or range is chosen", () => {
    const handleRangeChange = vi.fn();
    render(
      <DatePicker
        mode="range"
        onChangeRange={handleRangeChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Select date or range/i });
    fireEvent.click(trigger);

    const todayPreset = screen.getByTestId("preset-today");
    fireEvent.click(todayPreset);

    expect(handleRangeChange).toHaveBeenCalled();
  });
});
