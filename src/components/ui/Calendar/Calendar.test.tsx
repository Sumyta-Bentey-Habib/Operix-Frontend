import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar Component", () => {
  it("renders month and year header with navigation buttons", () => {
    render(<Calendar initialMonth={7} initialYear={2026} />);
    expect(screen.getByText(/August 2026/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Previous month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Next month/i)).toBeInTheDocument();
  });

  it("navigates to previous and next months", () => {
    render(<Calendar selectedDate="2026-08-29" mode="single" />);
    expect(screen.getByText(/August 2026/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Next month/i));
    expect(screen.getByText(/September 2026/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Previous month/i));
    expect(screen.getByText(/August 2026/i)).toBeInTheDocument();
  });

  it("calls onSelectDate when a day is clicked in single mode", () => {
    const handleSelect = vi.fn();
    render(
      <Calendar
        mode="single"
        selectedDate="2026-08-15"
        onSelectDate={handleSelect}
      />,
    );

    const dayBtn = screen.getByLabelText(/^2026-08-20/);
    fireEvent.click(dayBtn);
    expect(handleSelect).toHaveBeenCalledWith("2026-08-20");
  });

  it("handles range selection in range mode", () => {
    const handleSelectRange = vi.fn();
    render(
      <Calendar
        mode="range"
        selectedRange={{ startDate: "2026-08-01", endDate: "2026-08-10" }}
        onSelectRange={handleSelectRange}
      />,
    );

    // Click day 1
    const day1 = screen.getByLabelText(/^2026-08-05/);
    fireEvent.click(day1);

    // Click day 2 to complete range
    const day2 = screen.getByLabelText(/^2026-08-15/);
    fireEvent.click(day2);

    expect(handleSelectRange).toHaveBeenCalledWith({
      startDate: "2026-08-05",
      endDate: "2026-08-15",
    });
  });

  it("applies preset date ranges", () => {
    const handleSelectRange = vi.fn();
    render(
      <Calendar
        mode="range"
        showPresets={true}
        onSelectRange={handleSelectRange}
      />,
    );

    const todayBtn = screen.getByTestId("preset-today");
    fireEvent.click(todayBtn);
    expect(handleSelectRange).toHaveBeenCalled();
  });
});
